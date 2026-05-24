#!/usr/bin/env python3
"""Sync metric definition registry JSON into the product MetricDefinition table."""

from __future__ import annotations

import argparse
import json
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import psycopg2
from psycopg2.extras import Json, execute_values

from import_metadata_from_xlsx import clean_database_url, load_env_file


DEFAULT_REGISTRY = Path("config/ipeds/metric-definitions.v1.json")


def connect() -> Any:
    load_env_file(Path(".env"))
    database_url = os.environ.get("DATABASE_URL")
    if not database_url:
        raise RuntimeError("DATABASE_URL is required")
    return psycopg2.connect(clean_database_url(database_url))


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Import metric definition registry into PostgreSQL.")
    parser.add_argument("--registry", type=Path, default=DEFAULT_REGISTRY)
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    registry = json.loads(args.registry.read_text())
    version = registry["version"]
    now = datetime.now(timezone.utc)
    rows = []
    for item in registry["definitions"]:
        rows.append(
            (
                item["metricKey"],
                item["labelEn"],
                item.get("labelZh"),
                item.get("descriptionEn"),
                item.get("descriptionZh"),
                item["valueType"],
                item.get("unit"),
                item["displayFormat"],
                item.get("higherIsBetter"),
                item["sourceSystem"],
                item.get("sourceTable"),
                item.get("sourceVariable"),
                Json(item.get("requiredDimensions")) if item.get("requiredDimensions") is not None else None,
                item["missingValuePolicy"],
                bool(item.get("isPublicVisible")),
                version,
                now,
            )
        )

    conn = connect()
    try:
        with conn.cursor() as cur:
            execute_values(
                cur,
                """
                INSERT INTO "MetricDefinition" (
                    "metricKey", "labelEn", "labelZh", "descriptionEn", "descriptionZh",
                    "valueType", "unit", "displayFormat", "higherIsBetter",
                    "sourceSystem", "sourceTable", "sourceVariable", "requiredDimensions",
                    "missingValuePolicy", "isPublicVisible", "version", "updatedAt"
                )
                VALUES %s
                ON CONFLICT ("metricKey") DO UPDATE SET
                    "labelEn" = EXCLUDED."labelEn",
                    "labelZh" = EXCLUDED."labelZh",
                    "descriptionEn" = EXCLUDED."descriptionEn",
                    "descriptionZh" = EXCLUDED."descriptionZh",
                    "valueType" = EXCLUDED."valueType",
                    "unit" = EXCLUDED."unit",
                    "displayFormat" = EXCLUDED."displayFormat",
                    "higherIsBetter" = EXCLUDED."higherIsBetter",
                    "sourceSystem" = EXCLUDED."sourceSystem",
                    "sourceTable" = EXCLUDED."sourceTable",
                    "sourceVariable" = EXCLUDED."sourceVariable",
                    "requiredDimensions" = EXCLUDED."requiredDimensions",
                    "missingValuePolicy" = EXCLUDED."missingValuePolicy",
                    "isPublicVisible" = EXCLUDED."isPublicVisible",
                    "version" = EXCLUDED."version",
                    "updatedAt" = now()
                """,
                rows,
            )
        conn.commit()
    finally:
        conn.close()

    print(json.dumps({"version": version, "metricDefinitions": len(rows)}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
