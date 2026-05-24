#!/usr/bin/env python3
"""Load extracted IPEDS CSV files into the ipeds_raw PostgreSQL schema."""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import psycopg2
from psycopg2.extras import Json

from import_metadata_from_xlsx import DEFAULT_RELEASE_KEY, clean_database_url, load_env_file


TOOL_VERSION = "ipeds-raw-import-v1"
DEFAULT_MANIFEST = Path("data/ipeds/2024-25/provisional/manifest.json")
DEFAULT_REPORT_DIR = Path("memory/ipeds/import-runs")


def quote_ident(identifier: str) -> str:
    return '"' + identifier.replace('"', '""') + '"'


def raw_table_name(table_name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "_", table_name.lower()).strip("_")


def load_manifest(path: Path) -> dict[str, Any]:
    if not path.exists():
        raise FileNotFoundError(f"Manifest not found: {path}")
    return json.loads(path.read_text())


def connect() -> Any:
    load_env_file(Path(".env"))
    database_url = os.environ.get("DATABASE_URL")
    if not database_url:
        raise RuntimeError("DATABASE_URL is required")
    return psycopg2.connect(clean_database_url(database_url))


def create_import_run(cur: Any, release_key: str, manifest: dict[str, Any]) -> str:
    run_id = f"ipeds-raw-{datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')}"
    cur.execute(
        """
        INSERT INTO ipeds_meta.import_runs
            (id, release_key, run_type, status, tool_version, source_hashes, summary)
        VALUES (%s, %s, 'RAW_CSV', 'STARTED', %s, %s, %s)
        ON CONFLICT (id) DO UPDATE SET
            status = 'STARTED',
            started_at = now(),
            finished_at = NULL,
            error_message = NULL,
            source_hashes = EXCLUDED.source_hashes,
            summary = EXCLUDED.summary
        """,
        (
            run_id,
            release_key,
            TOOL_VERSION,
            Json({"accessDbSha256": manifest.get("source", {}).get("accessDbSha256")}),
            Json({"manifestPath": manifest.get("manifestPath"), "expectedTableCount": manifest.get("expectedTableCount")}),
        ),
    )
    return run_id


def copy_table(conn: Any, release_key: str, entry: dict[str, Any], *, replace: bool) -> dict[str, Any]:
    table_name = entry["tableName"]
    raw_name = raw_table_name(table_name)
    csv_path = Path(entry["csvPath"])
    header = entry.get("header") or []
    if entry.get("status") != "EXTRACTED":
        raise RuntimeError(f"{table_name} was not extracted successfully")
    if not csv_path.exists():
        raise FileNotFoundError(f"CSV file not found for {table_name}: {csv_path}")
    if not header:
        raise RuntimeError(f"CSV header missing for {table_name}")

    schema_table = f"ipeds_raw.{quote_ident(raw_name)}"
    temp_table = quote_ident(f"_tmp_{raw_name}")
    column_defs = ",\n        ".join(f"{quote_ident(col)} TEXT" for col in header)
    column_list = ", ".join(quote_ident(col) for col in header)

    with conn.cursor() as cur:
        if replace:
            cur.execute(f"DROP TABLE IF EXISTS {schema_table}")
        cur.execute(
            f"""
            CREATE TABLE IF NOT EXISTS {schema_table} (
                "_release_key" TEXT NOT NULL,
                "_imported_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
                {column_defs}
            )
            """
        )
        if not replace:
            cur.execute(f"DELETE FROM {schema_table} WHERE \"_release_key\" = %s", (release_key,))

        cur.execute(f"CREATE TEMP TABLE {temp_table} ({column_defs}) ON COMMIT DROP")
        with csv_path.open("r", newline="") as handle:
            cur.copy_expert(f"COPY {temp_table} ({column_list}) FROM STDIN WITH (FORMAT csv, HEADER true)", handle)
        cur.execute(
            f"""
            INSERT INTO {schema_table} ("_release_key", {column_list})
            SELECT %s, {column_list}
            FROM {temp_table}
            """,
            (release_key,),
        )
        cur.execute(f"SELECT COUNT(*) FROM {schema_table} WHERE \"_release_key\" = %s", (release_key,))
        imported_rows = int(cur.fetchone()[0])
        cur.execute(
            """
            UPDATE ipeds_meta.raw_table_manifests
            SET extracted_file_path = %s,
                extracted_file_sha256 = %s,
                imported_row_count = %s,
                status = %s,
                updated_at = now()
            WHERE release_key = %s
              AND lower(table_name) = lower(%s)
            """,
            (
                str(csv_path),
                entry.get("csvSha256"),
                imported_rows,
                "IMPORTED",
                release_key,
                table_name,
            ),
        )
    conn.commit()
    return {
        "tableName": table_name,
        "rawTableName": raw_name,
        "csvPath": str(csv_path),
        "csvRows": entry.get("rowCount"),
        "importedRows": imported_rows,
        "columnCount": len(header),
        "status": "IMPORTED",
    }


def write_reports(manifest: dict[str, Any], results: list[dict[str, Any]], args: argparse.Namespace, run_id: str) -> tuple[Path, Path]:
    args.report_dir.mkdir(parents=True, exist_ok=True)
    stem = "2024_25_provisional_raw_import"
    json_path = args.report_dir / f"{stem}.json"
    md_path = args.report_dir / f"{stem}.md"
    total_rows = sum(int(row.get("importedRows") or 0) for row in results)
    status_counts: dict[str, int] = {}
    for row in results:
        status_counts[row["status"]] = status_counts.get(row["status"], 0) + 1
    payload = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "toolVersion": TOOL_VERSION,
        "releaseKey": args.release_key,
        "importRunId": run_id,
        "manifestPath": str(args.manifest),
        "source": manifest.get("source"),
        "statusCounts": status_counts,
        "totalImportedRows": total_rows,
        "tables": results,
    }
    json_path.write_text(json.dumps(payload, indent=2, sort_keys=True) + "\n")

    status_rows = "\n".join(f"| {status} | {count} |" for status, count in sorted(status_counts.items()))
    md_path.write_text(
        "\n".join(
            [
                "# IPEDS 2024-25 Provisional Raw Import",
                "",
                f"- Generated at: `{payload['generatedAt']}`",
                f"- Tool version: `{TOOL_VERSION}`",
                f"- Import run: `{run_id}`",
                f"- Manifest: `{args.manifest}`",
                f"- Access DB SHA-256: `{manifest.get('source', {}).get('accessDbSha256')}`",
                f"- Total imported rows: `{total_rows}`",
                "",
                "## Status Counts",
                "",
                "| Status | Count |",
                "|---|---:|",
                status_rows,
                "",
            ]
        )
    )
    return md_path, json_path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Import extracted IPEDS CSV files into ipeds_raw.")
    parser.add_argument("--manifest", type=Path, default=DEFAULT_MANIFEST)
    parser.add_argument("--release-key", default=DEFAULT_RELEASE_KEY)
    parser.add_argument("--report-dir", type=Path, default=DEFAULT_REPORT_DIR)
    parser.add_argument("--tables", nargs="*", help="Optional subset of table names to import.")
    parser.add_argument("--no-replace", action="store_true", help="Delete rows for this release instead of dropping/recreating raw tables.")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    manifest = load_manifest(args.manifest)
    tables = manifest.get("tables", [])
    if args.tables:
        wanted = {table.upper() for table in args.tables}
        tables = [table for table in tables if table.get("tableName", "").upper() in wanted]
    if not tables:
        print("No tables selected for import.", file=sys.stderr)
        return 1

    conn = connect()
    results: list[dict[str, Any]] = []
    run_id = ""
    try:
        with conn.cursor() as cur:
            run_id = create_import_run(cur, args.release_key, manifest)
        conn.commit()

        for entry in tables:
            try:
                results.append(copy_table(conn, args.release_key, entry, replace=not args.no_replace))
            except Exception as exc:
                conn.rollback()
                results.append({
                    "tableName": entry.get("tableName"),
                    "status": "FAILED",
                    "error": str(exc),
                })

        md_path, json_path = write_reports(manifest, results, args, run_id)
        status = "FAILED" if any(row["status"] == "FAILED" for row in results) else "SUCCEEDED"
        total_rows = sum(int(row.get("importedRows") or 0) for row in results)
        with conn.cursor() as cur:
            cur.execute(
                """
                UPDATE ipeds_meta.import_runs
                SET status = %s,
                    finished_at = now(),
                    report_path = %s,
                    summary = %s,
                    error_message = %s
                WHERE id = %s
                """,
                (
                    status,
                    str(md_path),
                    Json({
                        "reports": [str(md_path), str(json_path)],
                        "statusCounts": {s: sum(1 for row in results if row["status"] == s) for s in {row["status"] for row in results}},
                        "totalImportedRows": total_rows,
                    }),
                    "One or more tables failed to import" if status == "FAILED" else None,
                    run_id,
                ),
            )
        conn.commit()
        print(json.dumps({"status": status, "runId": run_id, "reports": [str(md_path), str(json_path)], "totalImportedRows": total_rows}, indent=2))
        return 1 if status == "FAILED" else 0
    finally:
        conn.close()


if __name__ == "__main__":
    raise SystemExit(main())
