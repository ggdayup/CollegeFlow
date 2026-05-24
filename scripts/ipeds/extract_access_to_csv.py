#!/usr/bin/env python3
"""Extract IPEDS Access tables to CSV and write a reproducible manifest."""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import psycopg2

from import_metadata_from_xlsx import (
    DEFAULT_ACCDB,
    DEFAULT_RELEASE_KEY,
    DEFAULT_XLSX,
    clean_database_url,
    load_env_file,
    read_workbook,
    text,
    get,
)


TOOL_VERSION = "ipeds-access-extract-v1"
DEFAULT_OUTPUT_DIR = Path("data/ipeds/2024-25/provisional")
DEFAULT_REPORT_DIR = Path("memory/ipeds/import-runs")
DEFAULT_DOCKER_IMAGE = "ipeds-mdbtools:latest"


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def safe_filename(table_name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "_", table_name.lower()).strip("_") + ".csv"


def load_expected_tables_from_db(release_key: str) -> list[str]:
    database_url = os.environ.get("DATABASE_URL")
    if not database_url:
        return []
    try:
        conn = psycopg2.connect(clean_database_url(database_url))
    except Exception:
        return []
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT table_name
                FROM ipeds_meta.tables24
                WHERE release_key = %s
                ORDER BY table_number NULLS LAST, table_name
                """,
                (release_key,),
            )
            return [row[0] for row in cur.fetchall()]
    finally:
        conn.close()


def load_expected_tables_from_xlsx(xlsx: Path) -> list[str]:
    workbook = read_workbook(xlsx)
    rows = workbook.get("tables24", [])
    names = [text(get(row, "TableName")) for row in rows]
    return [name for name in names if name]


def run_command(command: list[str], *, stdout_path: Path | None = None) -> subprocess.CompletedProcess[str]:
    if stdout_path:
        with stdout_path.open("w", newline="") as out:
            return subprocess.run(command, text=True, stdout=out, stderr=subprocess.PIPE, check=False)
    return subprocess.run(command, text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False)


class MdbRunner:
    def __init__(self, mode: str, accdb: Path, docker_image: str) -> None:
        self.mode = mode
        self.accdb = accdb.resolve()
        self.docker_image = docker_image

    def available(self) -> tuple[bool, str]:
        if self.mode == "local":
            missing = [cmd for cmd in ["mdb-tables", "mdb-export"] if not shutil.which(cmd)]
            if missing:
                return False, f"Missing local mdbtools commands: {', '.join(missing)}"
            return True, "local mdbtools"
        if not shutil.which("docker"):
            return False, "Docker command not found"
        check = run_command(["docker", "image", "inspect", self.docker_image])
        if check.returncode != 0:
            return False, f"Docker image not found: {self.docker_image}. Build it with: docker build -f docker/ipeds-mdbtools.Dockerfile -t {self.docker_image} ."
        return True, f"docker image {self.docker_image}"

    def command(self, tool: str, *args: str) -> list[str]:
        if self.mode == "local":
            return [tool, *args]
        input_dir = str(self.accdb.parent)
        accdb_inside = f"/input/{self.accdb.name}"
        translated_args = [accdb_inside if arg == str(self.accdb) else arg for arg in args]
        return [
            "docker",
            "run",
            "--rm",
            "-v",
            f"{input_dir}:/input:ro",
            self.docker_image,
            tool,
            *translated_args,
        ]

    def list_tables(self) -> list[str]:
        result = run_command(self.command("mdb-tables", "-1", str(self.accdb)))
        if result.returncode != 0:
            raise RuntimeError(result.stderr.strip() or "mdb-tables failed")
        return [line.strip() for line in result.stdout.splitlines() if line.strip()]

    def export_table(self, table_name: str, output_path: Path) -> None:
        result = run_command(self.command("mdb-export", str(self.accdb), table_name), stdout_path=output_path)
        if result.returncode != 0:
            output_path.unlink(missing_ok=True)
            raise RuntimeError(result.stderr.strip() or f"mdb-export failed for {table_name}")


def inspect_csv(path: Path) -> dict[str, Any]:
    with path.open(newline="") as handle:
        reader = csv.reader(handle)
        try:
            header = next(reader)
        except StopIteration:
            return {"rowCount": 0, "columnCount": 0, "header": []}
        count = sum(1 for _ in reader)
    return {"rowCount": count, "columnCount": len(header), "header": header}


def write_reports(manifest: dict[str, Any], report_dir: Path) -> tuple[Path, Path]:
    report_dir.mkdir(parents=True, exist_ok=True)
    stem = "2024_25_provisional_access_extraction"
    json_path = report_dir / f"{stem}.json"
    md_path = report_dir / f"{stem}.md"
    json_path.write_text(json.dumps(manifest, indent=2, sort_keys=True) + "\n")

    status_counts: dict[str, int] = {}
    for table in manifest["tables"]:
        status_counts[table["status"]] = status_counts.get(table["status"], 0) + 1
    status_rows = "\n".join(f"| {status} | {count} |" for status, count in sorted(status_counts.items()))
    md_path.write_text(
        "\n".join(
            [
                "# IPEDS 2024-25 Provisional Access Extraction",
                "",
                f"- Generated at: `{manifest['generatedAt']}`",
                f"- Tool version: `{manifest['toolVersion']}`",
                f"- Extraction mode: `{manifest['extractionMode']}`",
                f"- Access DB SHA-256: `{manifest['source']['accessDbSha256']}`",
                f"- Manifest path: `{manifest['manifestPath']}`",
                "",
                "## Status Counts",
                "",
                "| Status | Count |",
                "|---|---:|",
                status_rows,
                "",
                "## Notes",
                "",
                "CSV files are local data artifacts under `data/ipeds/` and must not be committed.",
                "",
            ]
        )
    )
    return md_path, json_path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Extract IPEDS Access tables to CSV and generate manifest.json.")
    parser.add_argument("--accdb", type=Path, default=DEFAULT_ACCDB)
    parser.add_argument("--xlsx", type=Path, default=DEFAULT_XLSX)
    parser.add_argument("--release-key", default=DEFAULT_RELEASE_KEY)
    parser.add_argument("--output-dir", type=Path, default=DEFAULT_OUTPUT_DIR)
    parser.add_argument("--report-dir", type=Path, default=DEFAULT_REPORT_DIR)
    parser.add_argument("--mode", choices=["auto", "local", "docker"], default="auto")
    parser.add_argument("--docker-image", default=DEFAULT_DOCKER_IMAGE)
    parser.add_argument("--tables", nargs="*", help="Optional subset of table names to extract.")
    parser.add_argument("--check-only", action="store_true", help="Validate tools and expected tables without exporting CSV files.")
    return parser.parse_args()


def choose_mode(args: argparse.Namespace) -> str:
    if args.mode != "auto":
        return args.mode
    if shutil.which("mdb-tables") and shutil.which("mdb-export"):
        return "local"
    return "docker"


def main() -> int:
    args = parse_args()
    load_env_file(Path(".env"))
    if not args.accdb.exists():
        print(f"Access database not found: {args.accdb}", file=sys.stderr)
        return 1

    expected_tables = load_expected_tables_from_db(args.release_key) or load_expected_tables_from_xlsx(args.xlsx)
    if args.tables:
        wanted = {table.upper() for table in args.tables}
        expected_tables = [table for table in expected_tables if table.upper() in wanted]
    if not expected_tables:
        print("No expected IPEDS tables found from DB or workbook.", file=sys.stderr)
        return 1

    mode = choose_mode(args)
    runner = MdbRunner(mode, args.accdb, args.docker_image)
    is_available, availability_message = runner.available()
    if not is_available:
        print(availability_message, file=sys.stderr)
        print("Use --check-only to verify expected table metadata without extraction tools.", file=sys.stderr)
        if args.check_only:
            print(json.dumps({"expectedTables": len(expected_tables), "toolAvailable": False, "message": availability_message}, indent=2))
            return 0
        return 1

    actual_tables = runner.list_tables() if not args.check_only else []
    actual_lookup = {table.upper(): table for table in actual_tables}
    args.output_dir.mkdir(parents=True, exist_ok=True)
    tables_manifest: list[dict[str, Any]] = []

    for table_name in expected_tables:
        actual_name = actual_lookup.get(table_name.upper(), table_name)
        output_path = args.output_dir / safe_filename(table_name)
        entry: dict[str, Any] = {
            "tableName": table_name,
            "actualTableName": actual_name,
            "csvPath": str(output_path),
            "status": "PENDING" if not args.check_only else "CHECKED",
        }
        if not args.check_only:
            try:
                if actual_tables and table_name.upper() not in actual_lookup:
                    raise RuntimeError("Expected table not found in Access database")
                runner.export_table(actual_name, output_path)
                csv_info = inspect_csv(output_path)
                entry.update(csv_info)
                entry["csvSha256"] = sha256_file(output_path)
                entry["status"] = "EXTRACTED"
            except Exception as exc:
                entry["status"] = "FAILED"
                entry["error"] = str(exc)
        tables_manifest.append(entry)

    generated_at = datetime.now(timezone.utc).isoformat()
    manifest_path = args.output_dir / "manifest.json"
    manifest: dict[str, Any] = {
        "generatedAt": generated_at,
        "toolVersion": TOOL_VERSION,
        "releaseKey": args.release_key,
        "extractionMode": mode,
        "tool": availability_message,
        "source": {
            "accessDbPath": str(args.accdb),
            "accessDbSha256": sha256_file(args.accdb),
        },
        "expectedTableCount": len(expected_tables),
        "actualTableCount": len(actual_tables) if actual_tables else None,
        "manifestPath": str(manifest_path),
        "tables": tables_manifest,
    }
    manifest_path.write_text(json.dumps(manifest, indent=2, sort_keys=True) + "\n")
    md_path, json_path = write_reports(manifest, args.report_dir)
    print(json.dumps({"manifest": str(manifest_path), "reports": [str(md_path), str(json_path)]}, indent=2, sort_keys=True))

    failed = [table for table in tables_manifest if table["status"] == "FAILED"]
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
