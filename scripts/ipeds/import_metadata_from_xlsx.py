#!/usr/bin/env python3
"""Import IPEDS table documentation metadata into PostgreSQL.

This script intentionally parses XLSX with Python's standard library so the
metadata foundation does not depend on desktop spreadsheet tools.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import os
import re
import sys
import uuid
import zipfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable
from xml.etree import ElementTree as ET

import psycopg2
from psycopg2.extras import Json, execute_values


TOOL_VERSION = "ipeds-metadata-import-v1"
DEFAULT_RELEASE_KEY = "ipeds-2024-25-provisional"
DEFAULT_BASE_DIR = Path("/Users/ggdayup/Downloads/college/IPEDS_2024-25_Provisional")
DEFAULT_XLSX = DEFAULT_BASE_DIR / "IPEDS202425Tablesdoc.xlsx"
DEFAULT_README = DEFAULT_BASE_DIR / "ReadMe2024-25.docx"
DEFAULT_ACCDB = DEFAULT_BASE_DIR / "IPEDS202425.accdb"
DEFAULT_REPORT_DIR = Path("memory/ipeds/import-runs")

NS = {
    "main": "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
    "rel": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
    "pkgrel": "http://schemas.openxmlformats.org/package/2006/relationships",
}


def sha256_file(path: Path | None) -> str | None:
    if not path or not path.exists():
        return None
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def load_env_file(path: Path) -> None:
    if not path.exists():
        return
    for line in path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        value = value.strip().strip('"').strip("'")
        os.environ.setdefault(key.strip(), value)


def clean_database_url(url: str) -> str:
    if "?" not in url:
        return url
    base, query = url.split("?", 1)
    params = [part for part in query.split("&") if not part.startswith("schema=")]
    return f"{base}?{'&'.join(params)}" if params else base


def column_index(cell_ref: str) -> int:
    letters = re.match(r"([A-Z]+)", cell_ref)
    if not letters:
        return 0
    index = 0
    for char in letters.group(1):
        index = index * 26 + (ord(char) - ord("A") + 1)
    return index - 1


def text_from_node(node: ET.Element | None) -> str:
    if node is None:
        return ""
    return "".join(node.itertext())


def load_shared_strings(zf: zipfile.ZipFile) -> list[str]:
    try:
        raw = zf.read("xl/sharedStrings.xml")
    except KeyError:
        return []
    root = ET.fromstring(raw)
    return [text_from_node(si) for si in root.findall("main:si", NS)]


def workbook_sheet_paths(zf: zipfile.ZipFile) -> dict[str, str]:
    workbook = ET.fromstring(zf.read("xl/workbook.xml"))
    rels = ET.fromstring(zf.read("xl/_rels/workbook.xml.rels"))
    rel_by_id = {
        rel.attrib["Id"]: rel.attrib["Target"]
        for rel in rels.findall("pkgrel:Relationship", NS)
    }
    paths: dict[str, str] = {}
    for sheet in workbook.findall("main:sheets/main:sheet", NS):
        name = sheet.attrib["name"]
        rel_id = sheet.attrib[f"{{{NS['rel']}}}id"]
        target = rel_by_id[rel_id]
        paths[name] = "xl/" + target.lstrip("/")
    return paths


def cell_value(cell: ET.Element, shared_strings: list[str]) -> Any:
    cell_type = cell.attrib.get("t")
    if cell_type == "inlineStr":
        return text_from_node(cell.find("main:is", NS))
    value_node = cell.find("main:v", NS)
    if value_node is None:
        return ""
    value = value_node.text or ""
    if cell_type == "s":
        try:
            return shared_strings[int(value)]
        except (ValueError, IndexError):
            return value
    return value


def read_sheet(zf: zipfile.ZipFile, sheet_path: str, shared_strings: list[str]) -> list[dict[str, Any]]:
    root = ET.fromstring(zf.read(sheet_path))
    rows: list[list[Any]] = []
    max_width = 0
    for row in root.findall(".//main:sheetData/main:row", NS):
        values: list[Any] = []
        for cell in row.findall("main:c", NS):
            ref = cell.attrib.get("r", "")
            index = column_index(ref)
            while len(values) <= index:
                values.append("")
            values[index] = cell_value(cell, shared_strings)
        if any(str(v).strip() for v in values):
            max_width = max(max_width, len(values))
            rows.append(values)
    if not rows:
        return []
    header = [str(v).strip() for v in rows[0]]
    records = []
    for row in rows[1:]:
        padded = row + [""] * (max_width - len(row))
        record = {}
        for idx, key in enumerate(header):
            if key:
                record[key] = padded[idx] if idx < len(padded) else ""
        if any(str(v).strip() for v in record.values()):
            records.append(record)
    return records


def read_workbook(path: Path) -> dict[str, list[dict[str, Any]]]:
    with zipfile.ZipFile(path) as zf:
        shared_strings = load_shared_strings(zf)
        sheets = workbook_sheet_paths(zf)
        return {
            name: read_sheet(zf, sheet_path, shared_strings)
            for name, sheet_path in sheets.items()
        }


def norm_key(value: str) -> str:
    return re.sub(r"[^a-z0-9]", "", value.lower())


def get(row: dict[str, Any], key: str) -> Any:
    normalized = {norm_key(k): v for k, v in row.items()}
    return normalized.get(norm_key(key), "")


def text(value: Any) -> str | None:
    if value is None:
        return None
    value = str(value).replace("_x000D_", "\n").strip()
    return value or None


def integer(value: Any) -> int | None:
    value = text(value)
    if value is None:
        return None
    try:
        return int(float(value))
    except ValueError:
        return None


def numeric(value: Any) -> float | None:
    value = text(value)
    if value is None:
        return None
    try:
        return float(value)
    except ValueError:
        return None


def upsert_release(cur: Any, args: argparse.Namespace, hashes: dict[str, str | None]) -> None:
    cur.execute(
        """
        INSERT INTO ipeds_meta.releases (
            release_key, collection_year, phase, source_label,
            readme_path, readme_sha256, tables_doc_path, tables_doc_sha256,
            access_db_path, access_db_sha256, import_tool_version,
            is_active_for_product, notes
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (release_key) DO UPDATE SET
            collection_year = EXCLUDED.collection_year,
            phase = EXCLUDED.phase,
            source_label = EXCLUDED.source_label,
            readme_path = EXCLUDED.readme_path,
            readme_sha256 = EXCLUDED.readme_sha256,
            tables_doc_path = EXCLUDED.tables_doc_path,
            tables_doc_sha256 = EXCLUDED.tables_doc_sha256,
            access_db_path = EXCLUDED.access_db_path,
            access_db_sha256 = EXCLUDED.access_db_sha256,
            import_tool_version = EXCLUDED.import_tool_version,
            notes = EXCLUDED.notes
        """,
        (
            args.release_key,
            args.collection_year,
            args.phase,
            args.source_label,
            str(args.readme) if args.readme else None,
            hashes["readme_sha256"],
            str(args.xlsx),
            hashes["tables_doc_sha256"],
            str(args.accdb) if args.accdb else None,
            hashes["access_db_sha256"],
            TOOL_VERSION,
            False,
            "Imported from IPEDS table documentation workbook.",
        ),
    )


def replace_rows(cur: Any, table: str, release_key: str, columns: list[str], rows: Iterable[tuple[Any, ...]]) -> int:
    cur.execute(f"DELETE FROM {table} WHERE release_key = %s", (release_key,))
    row_list = list(rows)
    if not row_list:
        return 0
    column_sql = ", ".join(columns)
    execute_values(
        cur,
        f"INSERT INTO {table} ({column_sql}) VALUES %s",
        row_list,
        page_size=1000,
    )
    return len(row_list)


def import_metadata(conn: Any, workbook: dict[str, list[dict[str, Any]]], args: argparse.Namespace, hashes: dict[str, str | None]) -> dict[str, int]:
    counts: dict[str, int] = {}
    with conn.cursor() as cur:
        run_id = f"ipeds-metadata-{datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')}-{uuid.uuid4().hex[:8]}"
        upsert_release(cur, args, hashes)
        cur.execute(
            """
            INSERT INTO ipeds_meta.import_runs
                (id, release_key, run_type, status, tool_version, source_hashes)
            VALUES (%s, %s, 'METADATA_XLSX', 'STARTED', %s, %s)
            """,
            (run_id, args.release_key, TOOL_VERSION, Json(hashes)),
        )
        try:
            tables = workbook.get("tables24", [])
            counts["tables24"] = replace_rows(
                cur,
                "ipeds_meta.tables24",
                args.release_key,
                [
                    "release_key", "survey_order", "survey_number", "survey", "year_coverage",
                    "table_name", "table_number", "table_title", "description", "release", "release_date",
                ],
                (
                    (
                        args.release_key,
                        integer(get(row, "Surveyorder")),
                        integer(get(row, "SurveyNumber")),
                        text(get(row, "Survey")),
                        text(get(row, "YearCoverage")),
                        text(get(row, "TableName")),
                        integer(get(row, "Tablenumber")),
                        text(get(row, "TableTitle")),
                        text(get(row, "Description")),
                        text(get(row, "Release")),
                        text(get(row, "Release_date")),
                    )
                    for row in tables
                    if text(get(row, "TableName"))
                ),
            )

            variables = workbook.get("varTable24", [])
            counts["varTable24"] = replace_rows(
                cur,
                "ipeds_meta.var_table24",
                args.release_key,
                [
                    "release_key", "survey_order", "survey_number", "survey", "table_number",
                    "table_name", "table_title", "var_number", "var_order", "var_name",
                    "imputation_var", "var_title", "data_type", "field_width", "format",
                    "multi_record", "has_rv", "file_number", "section_number",
                    "long_description", "var_source", "file_title", "section_title",
                ],
                (
                    (
                        args.release_key,
                        integer(get(row, "SurveyOrder")),
                        integer(get(row, "SurveyNumber")),
                        text(get(row, "Survey")),
                        integer(get(row, "TableNumber")),
                        text(get(row, "TableName")),
                        text(get(row, "TableTitle")),
                        integer(get(row, "VarNumber")),
                        integer(get(row, "VarOrder")),
                        text(get(row, "VarName")),
                        text(get(row, "ImputationVar")),
                        text(get(row, "VarTitle")),
                        text(get(row, "DataType")),
                        integer(get(row, "FieldWidth")),
                        text(get(row, "Format")),
                        integer(get(row, "MultiRecord")),
                        text(get(row, "HasRV")),
                        integer(get(row, "FileNumber")),
                        integer(get(row, "SectionNumber")),
                        text(get(row, "LongDescription")),
                        text(get(row, "VarSource")),
                        text(get(row, "FileTitle")),
                        text(get(row, "SectionTitle")),
                    )
                    for row in variables
                    if text(get(row, "TableName")) and text(get(row, "VarName"))
                ),
            )

            value_sets = workbook.get("valueSets24", [])
            counts["valueSets24"] = replace_rows(
                cur,
                "ipeds_meta.value_sets24",
                args.release_key,
                [
                    "release_key", "survey_order", "table_number", "table_name", "var_number",
                    "var_order", "var_name", "code_value", "frequency", "percent",
                    "value_order", "value_label", "var_title",
                ],
                (
                    (
                        args.release_key,
                        integer(get(row, "SurveyOrder")),
                        integer(get(row, "TableNumber")),
                        text(get(row, "TableName")),
                        integer(get(row, "VarNumber")),
                        integer(get(row, "VarOrder")),
                        text(get(row, "VarName")),
                        text(get(row, "Codevalue")),
                        numeric(get(row, "Frequency")),
                        numeric(get(row, "Percent")),
                        integer(get(row, "ValueOrder")),
                        text(get(row, "ValueLabel")),
                        text(get(row, "VarTitle")),
                    )
                    for row in value_sets
                    if text(get(row, "TableName")) and text(get(row, "VarName"))
                ),
            )

            new_variables = workbook.get("newVariables24", [])
            counts["newVariables24"] = replace_rows(
                cur,
                "ipeds_meta.new_variables24",
                args.release_key,
                [
                    "release_key", "survey_order", "survey_number", "survey", "table_name",
                    "var_number", "var_name", "var_title", "file_number", "section_number",
                ],
                (
                    (
                        args.release_key,
                        integer(get(row, "SurveyOrder")),
                        integer(get(row, "SurveyNumber")),
                        text(get(row, "Survey")),
                        text(get(row, "TableName")),
                        integer(get(row, "VarNumber")),
                        text(get(row, "VarName")),
                        text(get(row, "VarTitle")),
                        integer(get(row, "FileNumber")),
                        integer(get(row, "SectionNumber")),
                    )
                    for row in new_variables
                    if text(get(row, "TableName")) and text(get(row, "VarName"))
                ),
            )

            definitions = workbook.get("metadata_definitions24", [])
            counts["metadata_definitions24"] = replace_rows(
                cur,
                "ipeds_meta.metadata_definitions24",
                args.release_key,
                ["release_key", "source_table", "metadata_variable", "description"],
                (
                    (
                        args.release_key,
                        text(get(row, "Table")),
                        text(get(row, "Metadata_variable")),
                        text(get(row, "Description")),
                    )
                    for row in definitions
                    if text(get(row, "Table")) and text(get(row, "Metadata_variable"))
                ),
            )

            cur.execute(
                """
                INSERT INTO ipeds_meta.raw_table_manifests
                    (release_key, table_name, expected_column_count, expected_variable_count, status)
                SELECT release_key, table_name, COUNT(*), COUNT(*), 'PENDING'
                FROM ipeds_meta.var_table24
                WHERE release_key = %s
                GROUP BY release_key, table_name
                ON CONFLICT (release_key, table_name) DO UPDATE SET
                    expected_column_count = EXCLUDED.expected_column_count,
                    expected_variable_count = EXCLUDED.expected_variable_count,
                    updated_at = now()
                """,
                (args.release_key,),
            )
            counts["rawTableManifests"] = cur.rowcount

            cur.execute(
                """
                UPDATE ipeds_meta.import_runs
                SET status = 'SUCCEEDED',
                    finished_at = now(),
                    summary = %s
                WHERE id = %s
                """,
                (Json({"counts": counts}), run_id),
            )
        except Exception as exc:
            cur.execute(
                """
                UPDATE ipeds_meta.import_runs
                SET status = 'FAILED',
                    finished_at = now(),
                    error_message = %s
                WHERE id = %s
                """,
                (str(exc), run_id),
            )
            raise
    conn.commit()
    counts["importRunId"] = run_id  # type: ignore[assignment]
    return counts


def write_reports(args: argparse.Namespace, hashes: dict[str, str | None], counts: dict[str, Any]) -> tuple[Path, Path]:
    args.report_dir.mkdir(parents=True, exist_ok=True)
    stem = f"{args.collection_year.replace('-', '_')}_{args.phase.lower()}_metadata"
    json_path = args.report_dir / f"{stem}.json"
    md_path = args.report_dir / f"{stem}.md"
    generated_at = datetime.now(timezone.utc).isoformat()
    payload = {
        "generatedAt": generated_at,
        "releaseKey": args.release_key,
        "collectionYear": args.collection_year,
        "phase": args.phase,
        "sourceLabel": args.source_label,
        "toolVersion": TOOL_VERSION,
        "sourceFiles": {
            "readme": str(args.readme) if args.readme else None,
            "tablesDoc": str(args.xlsx),
            "accessDb": str(args.accdb) if args.accdb else None,
        },
        "hashes": hashes,
        "counts": counts,
    }
    json_path.write_text(json.dumps(payload, indent=2, sort_keys=True) + "\n")

    rows = "\n".join(f"| {key} | {value} |" for key, value in counts.items())
    md_path.write_text(
        "\n".join(
            [
                "# IPEDS 2024-25 Provisional Metadata Import",
                "",
                f"- Generated at: `{generated_at}`",
                f"- Release key: `{args.release_key}`",
                f"- Phase: `{args.phase}`",
                f"- Tool version: `{TOOL_VERSION}`",
                "",
                "## Source Hashes",
                "",
                f"- README SHA-256: `{hashes['readme_sha256'] or 'missing'}`",
                f"- Tables workbook SHA-256: `{hashes['tables_doc_sha256'] or 'missing'}`",
                f"- Access DB SHA-256: `{hashes['access_db_sha256'] or 'missing'}`",
                "",
                "## Imported Counts",
                "",
                "| Item | Count |",
                "|---|---:|",
                rows,
                "",
                "## Notes",
                "",
                "This report covers the IPEDS metadata workbook import only. Raw Access table extraction and CSV manifests are handled by the next ETL step.",
                "",
            ]
        )
    )
    return md_path, json_path


def update_report_path(database_url: str, import_run_id: str, md_path: Path, json_path: Path) -> None:
    conn = psycopg2.connect(clean_database_url(database_url))
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                UPDATE ipeds_meta.import_runs
                SET report_path = %s,
                    summary = jsonb_set(
                        summary,
                        '{reports}',
                        %s::jsonb,
                        true
                    )
                WHERE id = %s
                """,
                (str(md_path), json.dumps([str(md_path), str(json_path)]), import_run_id),
            )
        conn.commit()
    finally:
        conn.close()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Import IPEDS 2024-25 metadata workbook into PostgreSQL.")
    parser.add_argument("--xlsx", type=Path, default=DEFAULT_XLSX)
    parser.add_argument("--readme", type=Path, default=DEFAULT_README)
    parser.add_argument("--accdb", type=Path, default=DEFAULT_ACCDB)
    parser.add_argument("--release-key", default=DEFAULT_RELEASE_KEY)
    parser.add_argument("--collection-year", default="2024-25")
    parser.add_argument("--phase", choices=["PROVISIONAL", "FINAL"], default="PROVISIONAL")
    parser.add_argument("--source-label", default="IPEDS 2024-25 Provisional Access Database")
    parser.add_argument("--report-dir", type=Path, default=DEFAULT_REPORT_DIR)
    parser.add_argument("--dry-run", action="store_true")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    load_env_file(Path(".env"))
    database_url = os.environ.get("DATABASE_URL")
    if not database_url and not args.dry_run:
        print("DATABASE_URL is required. Set it in .env or the environment.", file=sys.stderr)
        return 1
    if not args.xlsx.exists():
        print(f"Metadata workbook not found: {args.xlsx}", file=sys.stderr)
        return 1

    hashes = {
        "readme_sha256": sha256_file(args.readme),
        "tables_doc_sha256": sha256_file(args.xlsx),
        "access_db_sha256": sha256_file(args.accdb),
    }
    workbook = read_workbook(args.xlsx)
    counts = {
        name: len(rows)
        for name, rows in workbook.items()
        if name in {"tables24", "varTable24", "valueSets24", "newVariables24", "metadata_definitions24"}
    }

    if not args.dry_run:
        conn = psycopg2.connect(clean_database_url(database_url or ""))
        try:
            counts = import_metadata(conn, workbook, args, hashes)
        finally:
            conn.close()

    md_path, json_path = write_reports(args, hashes, counts)
    if not args.dry_run and database_url and counts.get("importRunId"):
        update_report_path(database_url, str(counts["importRunId"]), md_path, json_path)
    print(json.dumps({"counts": counts, "reports": [str(md_path), str(json_path)]}, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
