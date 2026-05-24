#!/usr/bin/env python3
"""Sync first-scope IPEDS curated metrics and program fields into product tables."""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import psycopg2
from psycopg2.extras import Json, execute_values

from import_metadata_from_xlsx import DEFAULT_RELEASE_KEY, clean_database_url, load_env_file


TOOL_VERSION = "ipeds-curated-projection-v1"
DEFAULT_REPORT_DIR = Path("memory/ipeds/import-runs")
ACADEMIC_YEAR = "2024-25"
DIRECT_METRIC_KEYS = {
    "admission_rate_total",
    "admissions_yield_total",
    "fall_enrollment_total",
    "graduation_rate_150",
}
DERIVED_METRIC_KEY = "bachelor_programs_offered_count"


def quote_ident(identifier: str) -> str:
    return '"' + identifier.replace('"', '""') + '"'


def raw_table_name(table_name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "_", table_name.lower()).strip("_")


def connect() -> Any:
    load_env_file(Path(".env"))
    database_url = os.environ.get("DATABASE_URL")
    if not database_url:
        raise RuntimeError("DATABASE_URL is required")
    return psycopg2.connect(clean_database_url(database_url))


def parse_number(raw: Any) -> float | None:
    if raw is None:
        return None
    value = str(raw).strip()
    if not value:
        return None
    try:
        return float(value)
    except ValueError:
        return None


def value_status(raw: Any, missing_reason: str | None = None) -> tuple[str, float | None, str | None]:
    number = parse_number(raw)
    if number is None:
        return "NOT_REPORTED", None, missing_reason or "Blank value"
    if number < 0:
        reason = missing_reason or f"IPEDS special value {raw}"
        normalized = reason.lower()
        if "not applicable" in normalized:
            return "NOT_APPLICABLE", None, reason
        if "not reported" in normalized:
            return "NOT_REPORTED", None, reason
        if "suppressed" in normalized:
            return "SUPPRESSED", None, reason
        if "not in universe" in normalized:
            return "NOT_IN_UNIVERSE", None, reason
        return "ERROR", None, reason
    if number == 0:
        return "ZERO", number, None
    return "REPORTED", number, None


def cip_level(code: str) -> str:
    digits = re.sub(r"\D", "", code)
    if "." not in code and len(digits) == 2:
        return "2_DIGIT"
    if len(digits) == 4:
        return "4_DIGIT"
    return "6_DIGIT"


def parent_cip(code: str) -> str | None:
    if "." not in code:
        return None
    family = code.split(".", 1)[0]
    return family if family else None


def verification_prefix(release_key: str) -> str:
    if release_key == DEFAULT_RELEASE_KEY:
        return "IPEDS-2024P"
    return "IPEDS-" + re.sub(r"[^A-Za-z0-9]+", "-", release_key).strip("-").upper()


def create_curated_views(cur: Any, release_key: str) -> None:
    cur.execute("CREATE SCHEMA IF NOT EXISTS ipeds_curated")
    cur.execute(
        """
        CREATE OR REPLACE VIEW ipeds_curated.institution_identity AS
        SELECT
            "_release_key" AS release_key,
            "UNITID" AS unit_id,
            "INSTNM" AS name_en,
            "STABBR" AS state,
            "CONTROL" AS control_code,
            "SECTOR" AS sector_code,
            "ICLEVEL" AS level_code,
            "WEBADDR" AS website,
            "LONGITUD" AS longitude,
            "LATITUDE" AS latitude
        FROM ipeds_raw.hd2024
        """
    )
    cur.execute(
        """
        CREATE OR REPLACE VIEW ipeds_curated.bachelor_program_fields AS
        SELECT
            c."_release_key" AS release_key,
            c."UNITID" AS unit_id,
            c."CIPCODE" AS cip_code,
            c."PBACHL" AS program_offered_raw,
            COALESCE(a.completions_total, 0) AS completions_total
        FROM ipeds_raw.c2024dep c
        LEFT JOIN (
            SELECT
                "_release_key",
                "unitid" AS unit_id,
                "CIPCODE" AS cip_code,
                SUM(NULLIF("CTOTALT", '')::numeric)::integer AS completions_total
            FROM ipeds_raw.c2024_a
            WHERE "_release_key" = %s
              AND "AWLEVEL" = '5'
              AND NULLIF("CTOTALT", '') IS NOT NULL
            GROUP BY "_release_key", "unitid", "CIPCODE"
        ) a
          ON a."_release_key" = c."_release_key"
         AND a.unit_id = c."UNITID"
         AND a.cip_code = c."CIPCODE"
        WHERE c."_release_key" = %s
          AND c."CIPCODE" <> '99'
          AND c."CIPCODE" LIKE '%%.%%'
          AND NULLIF(c."PBACHL", '')::numeric > 0
        """,
        (release_key, release_key),
    )


def load_special_value_labels(cur: Any, release_key: str) -> dict[tuple[str, str], dict[str, str]]:
    cur.execute(
        """
        SELECT table_name, var_name, code_value, value_label
        FROM ipeds_meta.value_sets24
        WHERE release_key = %s
          AND code_value LIKE '-%%'
        """,
        (release_key,),
    )
    labels: dict[tuple[str, str], dict[str, str]] = {}
    for table_name, var_name, code_value, value_label in cur.fetchall():
        labels.setdefault((table_name.upper(), var_name.upper()), {})[code_value] = value_label
    return labels


def load_metric_definitions(cur: Any) -> list[dict[str, Any]]:
    cur.execute(
        """
        SELECT "metricKey", "sourceTable", "sourceVariable"
        FROM "MetricDefinition"
        WHERE "sourceSystem" = 'IPEDS'
        ORDER BY "metricKey"
        """
    )
    return [{"metricKey": row[0], "sourceTable": row[1], "sourceVariable": row[2]} for row in cur.fetchall()]


def sync_external_identifiers(cur: Any, release_key: str) -> int:
    prefix = verification_prefix(release_key)
    cur.execute(
        """
        SELECT id, "scorecardUnitId"
        FROM "University"
        WHERE "scorecardUnitId" IS NOT NULL
        """
    )
    rows = [
        (
            str(uuid.uuid4()),
            university_id,
            "IPEDS_UNITID",
            unit_id,
            "IPEDS",
            f"{prefix}-HD2024-UNITID-UNIT{unit_id}",
        )
        for university_id, unit_id in cur.fetchall()
    ]
    if not rows:
        return 0
    execute_values(
        cur,
        """
        INSERT INTO "UniversityExternalIdentifier" (
            "id", "universityId", "identifierType", "identifierValue", "sourceSystem", "verificationId"
        )
        VALUES %s
        ON CONFLICT ("identifierType", "identifierValue") DO UPDATE SET
            "universityId" = EXCLUDED."universityId",
            "sourceSystem" = EXCLUDED."sourceSystem",
            "verificationId" = EXCLUDED."verificationId"
        """,
        rows,
    )
    return len(rows)


def sync_direct_metrics(cur: Any, release_key: str, definitions: list[dict[str, Any]], labels: dict[tuple[str, str], dict[str, str]]) -> int:
    prefix = verification_prefix(release_key)
    rows = []
    direct_definitions = [item for item in definitions if item["metricKey"] in DIRECT_METRIC_KEYS]
    for item in direct_definitions:
        raw_table = raw_table_name(item["sourceTable"])
        source_table = item["sourceTable"].upper()
        source_variable = item["sourceVariable"].upper()
        unit_column = "unitid" if raw_table == "c2024_a" else "UNITID"
        cur.execute(
            f"""
            SELECT r.{quote_ident(unit_column)}, r.{quote_ident(source_variable)}, u.id
            FROM ipeds_raw.{quote_ident(raw_table)} r
            LEFT JOIN "University" u ON u."scorecardUnitId" = r.{quote_ident(unit_column)}
            WHERE r."_release_key" = %s
            """,
            (release_key,),
        )
        special_labels = labels.get((source_table, source_variable), {})
        for unit_id, raw_value, university_id in cur.fetchall():
            status, number, reason = value_status(raw_value, special_labels.get(str(raw_value).strip()))
            rows.append(
                (
                    str(uuid.uuid4()),
                    item["metricKey"],
                    university_id,
                    str(unit_id),
                    number,
                    None,
                    status,
                    reason,
                    str(raw_value).strip() if raw_value is not None else None,
                    None,
                    None,
                    ACADEMIC_YEAR,
                    "IPEDS",
                    source_table,
                    source_variable,
                    release_key,
                    f"{prefix}-{source_table}-{source_variable}-UNIT{unit_id}",
                )
            )
    return insert_metrics(cur, release_key, [item["metricKey"] for item in direct_definitions], rows)


def sync_bachelor_program_metric(cur: Any, release_key: str, definitions: list[dict[str, Any]]) -> int:
    if not any(item["metricKey"] == DERIVED_METRIC_KEY for item in definitions):
        return 0
    prefix = verification_prefix(release_key)
    cur.execute(
        """
        SELECT c."UNITID", COUNT(*)::integer, u.id
        FROM ipeds_raw.c2024dep c
        LEFT JOIN "University" u ON u."scorecardUnitId" = c."UNITID"
        WHERE c."_release_key" = %s
          AND c."CIPCODE" <> '99'
          AND c."CIPCODE" LIKE '%%.%%'
          AND NULLIF(c."PBACHL", '')::numeric > 0
        GROUP BY c."UNITID", u.id
        """,
        (release_key,),
    )
    rows = []
    for unit_id, count, university_id in cur.fetchall():
        status = "ZERO" if int(count) == 0 else "REPORTED"
        rows.append(
            (
                str(uuid.uuid4()),
                DERIVED_METRIC_KEY,
                university_id,
                str(unit_id),
                float(count),
                None,
                status,
                None,
                str(count),
                None,
                "BACHELOR",
                ACADEMIC_YEAR,
                "IPEDS",
                "C2024DEP",
                "PBACHL",
                release_key,
                f"{prefix}-C2024DEP-PBACHL-BACHELOR-COUNT-UNIT{unit_id}",
            )
        )
    return insert_metrics(cur, release_key, [DERIVED_METRIC_KEY], rows)


def insert_metrics(cur: Any, release_key: str, metric_keys: list[str], rows: list[tuple[Any, ...]]) -> int:
    if not metric_keys:
        return 0
    cur.execute(
        'DELETE FROM "InstitutionMetric" WHERE "releaseKey" = %s AND "metricKey" = ANY(%s)',
        (release_key, metric_keys),
    )
    if not rows:
        return 0
    execute_values(
        cur,
        """
        INSERT INTO "InstitutionMetric" (
            "id", "metricKey", "universityId", "unitId", "valueNumeric", "valueText",
            "valueStatus", "missingReason", "rawValue", "denominator", "cohort",
            "academicYear", "sourceSystem", "sourceTable", "sourceVariable",
            "releaseKey", "verificationId"
        )
        VALUES %s
        """,
        rows,
        page_size=5000,
    )
    return len(rows)


def load_cip_titles(cur: Any, release_key: str) -> dict[str, str]:
    cur.execute(
        """
        SELECT code_value, value_label
        FROM ipeds_meta.value_sets24
        WHERE release_key = %s
          AND table_name = 'C2024DEP'
          AND var_name = 'CIPCODE'
          AND code_value <> '99'
          AND value_label IS NOT NULL
        """,
        (release_key,),
    )
    return {code: label for code, label in cur.fetchall()}


def sync_cip_codes(cur: Any, cip_titles: dict[str, str]) -> int:
    rows = [
        (code, title, "CIP2020", cip_level(code), parent_cip(code))
        for code, title in sorted(cip_titles.items())
    ]
    if not rows:
        return 0
    execute_values(
        cur,
        """
        INSERT INTO "CipCode" ("code", "title", "version", "level", "parentCode")
        VALUES %s
        ON CONFLICT ("code") DO UPDATE SET
            "title" = EXCLUDED."title",
            "version" = EXCLUDED."version",
            "level" = EXCLUDED."level",
            "parentCode" = EXCLUDED."parentCode"
        """,
        rows,
        page_size=5000,
    )
    return len(rows)


def sync_program_fields(cur: Any, release_key: str, cip_titles: dict[str, str]) -> dict[str, int]:
    prefix = verification_prefix(release_key)
    cur.execute(
        """
        SELECT
            b.unit_id,
            b.cip_code,
            b.program_offered_raw,
            b.completions_total,
            u.id AS university_id,
            m."majorId" AS standard_major_id
        FROM ipeds_curated.bachelor_program_fields b
        LEFT JOIN "University" u ON u."scorecardUnitId" = b.unit_id
        LEFT JOIN "MajorCipMapping" m
          ON m."cipCode" = b.cip_code
         AND m.status = 'AUTO_VALIDATED'
        WHERE b.release_key = %s
        """,
        (release_key,),
    )
    rows = []
    missing_titles = 0
    for unit_id, cip_code, offered_raw, completions_total, university_id, standard_major_id in cur.fetchall():
        title = cip_titles.get(cip_code)
        if not title:
            missing_titles += 1
            title = f"CIP {cip_code}"
        offered = int(parse_number(offered_raw) or 0)
        completions = int(completions_total or 0)
        rows.append(
            (
                str(uuid.uuid4()),
                university_id,
                str(unit_id),
                cip_code,
                title,
                standard_major_id,
                "BACHELOR",
                "IPEDS_PROGRAM_FIELD",
                offered,
                completions,
                "ACTIVE_WITH_COMPLETIONS" if completions > 0 else "OFFERED_NO_COMPLETIONS",
                "REPORTED",
                "IPEDS",
                "C2024DEP",
                "PBACHL",
                release_key,
                f"{prefix}-C2024DEP-PBACHL-UNIT{unit_id}-CIP{re.sub(r'[^0-9]', '', cip_code)}",
            )
        )
    cur.execute(
        """
        DELETE FROM "InstitutionProgramField"
        WHERE "releaseKey" = %s
          AND "sourceType" = 'IPEDS_PROGRAM_FIELD'
          AND "degreeLevel" = 'BACHELOR'
        """,
        (release_key,),
    )
    if rows:
        execute_values(
            cur,
            """
            INSERT INTO "InstitutionProgramField" (
                "id", "universityId", "unitId", "cipCode", "displayTitle", "standardMajorId",
                "degreeLevel", "sourceType", "programOffered", "completionsTotal",
                "activityStatus", "valueStatus", "sourceSystem", "sourceTable",
                "sourceVariable", "releaseKey", "verificationId"
            )
            VALUES %s
            """,
            rows,
            page_size=5000,
        )
    return {"programFields": len(rows), "missingCipTitles": missing_titles}


def write_reports(args: argparse.Namespace, summary: dict[str, Any]) -> tuple[Path, Path]:
    args.report_dir.mkdir(parents=True, exist_ok=True)
    stem = "2024_25_provisional_curated_projection"
    json_path = args.report_dir / f"{stem}.json"
    md_path = args.report_dir / f"{stem}.md"
    payload = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "toolVersion": TOOL_VERSION,
        "releaseKey": args.release_key,
        **summary,
    }
    json_path.write_text(json.dumps(payload, indent=2, sort_keys=True) + "\n")
    metric_rows = "\n".join(f"| {key} | {count} |" for key, count in sorted(summary["metricsByKey"].items()))
    sample_rows = "\n".join(f"| {row['unitId']} | {row['nameEn']} | {row['metrics']} | {row['programFields']} |" for row in summary["samples"])
    md_path.write_text(
        "\n".join(
            [
                "# IPEDS 2024-25 Provisional Curated Projection",
                "",
                f"- Generated at: `{payload['generatedAt']}`",
                f"- Tool version: `{TOOL_VERSION}`",
                f"- Release key: `{args.release_key}`",
                f"- External identifiers synced: `{summary['externalIdentifiers']}`",
                f"- CIP codes synced: `{summary['cipCodes']}`",
                f"- Institution metrics synced: `{summary['institutionMetrics']}`",
                f"- Bachelor program fields synced: `{summary['programFields']}`",
                f"- Missing CIP titles: `{summary['warnings']['missingCipTitles']}`",
                "",
                "## Metrics By Key",
                "",
                "| Metric key | Rows |",
                "|---|---:|",
                metric_rows,
                "",
                "## Sample Institutions",
                "",
                "| UNITID | Name | Metric rows | Bachelor program fields |",
                "|---|---|---:|---:|",
                sample_rows,
                "",
            ]
        )
    )
    return md_path, json_path


def summarize(cur: Any, release_key: str, counts: dict[str, Any]) -> dict[str, Any]:
    cur.execute(
        """
        SELECT "metricKey", COUNT(*)
        FROM "InstitutionMetric"
        WHERE "releaseKey" = %s
        GROUP BY "metricKey"
        ORDER BY "metricKey"
        """,
        (release_key,),
    )
    metrics_by_key = {key: int(count) for key, count in cur.fetchall()}
    sample_unit_ids = ["166027", "166683", "170976", "110635", "100654"]
    cur.execute(
        """
        SELECT h.unit_id, h.name_en,
               COUNT(DISTINCT im.id) AS metrics,
               COUNT(DISTINCT pf.id) AS program_fields
        FROM ipeds_curated.institution_identity h
        LEFT JOIN "InstitutionMetric" im
          ON im."unitId" = h.unit_id
         AND im."releaseKey" = h.release_key
        LEFT JOIN "InstitutionProgramField" pf
          ON pf."unitId" = h.unit_id
         AND pf."releaseKey" = h.release_key
        WHERE h.release_key = %s
          AND h.unit_id = ANY(%s)
        GROUP BY h.unit_id, h.name_en
        ORDER BY h.unit_id
        """,
        (release_key, sample_unit_ids),
    )
    samples = [
        {"unitId": unit_id, "nameEn": name, "metrics": int(metrics), "programFields": int(program_fields)}
        for unit_id, name, metrics, program_fields in cur.fetchall()
    ]
    return {
        **counts,
        "metricsByKey": metrics_by_key,
        "samples": samples,
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Sync IPEDS curated projections into product tables.")
    parser.add_argument("--release-key", default=DEFAULT_RELEASE_KEY)
    parser.add_argument("--report-dir", type=Path, default=DEFAULT_REPORT_DIR)
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    conn = connect()
    try:
        with conn.cursor() as cur:
            create_curated_views(cur, args.release_key)
            labels = load_special_value_labels(cur, args.release_key)
            definitions = load_metric_definitions(cur)
            if not definitions:
                raise RuntimeError("No IPEDS MetricDefinition rows found. Run import_metric_definitions.py first.")
            external_identifiers = sync_external_identifiers(cur, args.release_key)
            direct_metrics = sync_direct_metrics(cur, args.release_key, definitions, labels)
            derived_metrics = sync_bachelor_program_metric(cur, args.release_key, definitions)
            cip_titles = load_cip_titles(cur, args.release_key)
            cip_codes = sync_cip_codes(cur, cip_titles)
            program_result = sync_program_fields(cur, args.release_key, cip_titles)
            counts = {
                "externalIdentifiers": external_identifiers,
                "cipCodes": cip_codes,
                "institutionMetrics": direct_metrics + derived_metrics,
                "programFields": program_result["programFields"],
                "warnings": {"missingCipTitles": program_result["missingCipTitles"]},
            }
            summary = summarize(cur, args.release_key, counts)
            md_path, json_path = write_reports(args, summary)
        conn.commit()
        print(json.dumps({"status": "SUCCEEDED", "reports": [str(md_path), str(json_path)], **summary}, indent=2))
        return 0
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


if __name__ == "__main__":
    raise SystemExit(main())
