#!/usr/bin/env python3
"""Score IPEDS institution eligibility and populate InstitutionCandidate rows."""

from __future__ import annotations

import argparse
import json
import os
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import psycopg2
from psycopg2.extras import Json, execute_values

from import_metadata_from_xlsx import DEFAULT_RELEASE_KEY, clean_database_url, load_env_file

TOOL_VERSION = "ipeds-eligibility-scoring-v1"
DEFAULT_REPORT_DIR = Path("memory/ipeds/import-runs")

US_STATES = {
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA",
    "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
    "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT",
    "VA", "WA", "WV", "WI", "WY", "DC",
}

US_MILITARY = {"AA", "AE", "AP"}

POLICY_PATH = Path("config/ipeds/eligibility-policy.v1.json")


def connect() -> Any:
    load_env_file(Path(".env"))
    database_url = os.environ.get("DATABASE_URL")
    if not database_url:
        raise RuntimeError("DATABASE_URL is required")
    return psycopg2.connect(clean_database_url(database_url))


def load_policy() -> dict[str, Any]:
    if not POLICY_PATH.exists():
        raise RuntimeError(f"Eligibility policy not found at {POLICY_PATH}")
    with open(POLICY_PATH) as f:
        return json.load(f)


def is_blocked(row: dict) -> list[str]:
    """Return list of blocking reason strings if any blocking rule fires."""
    blocks = []
    closedat = (row.get("closedat") or "").strip()
    # IPEDS uses -2 as a sentinel; real dates look like MM/DD/YYYY
    if closedat and closedat != "-2" and not closedat.startswith("-"):
        # Check if it looks like a real date
        if "/" in closedat:
            blocks.append("CLOSED: Institution is closed (CLOSEDAT={})".format(closedat))
    deathy = (row.get("deathy") or "").strip()
    # IPEDS -2 means not applicable; only real years (4-digit positive) count
    if deathy and deathy != "-2" and not deathy.startswith("-"):
        try:
            year = int(deathy)
            if 1900 <= year <= 2030:
                blocks.append("DECEASED: Institution year of death set (DEATHYR={})".format(year))
        except ValueError:
            pass
    if row.get("postsec") == 0:
        blocks.append("NOT_POSTSECONDARY: Not a postsecondary institution")
    if row.get("cyactive") == 0:
        blocks.append("INACTIVE: Not currently active")
    return blocks


def compute_weights(row: dict, bachelor_count: int, metric_count: int, weights: dict[str, int]) -> dict[str, Any]:
    """Score each dimension and return weighted total."""
    scores = {}
    # identityComplete
    has_identity = all([
        (row.get("instnm") or "").strip(),
        (row.get("city") or "").strip(),
        (row.get("stabbr") or "").strip(),
        row.get("control") is not None,
        row.get("sector") is not None,
    ])
    scores["identityComplete"] = 1 if has_identity else 0

    # fourYearDegreeGranting
    iclevel = row.get("iclevel")
    deggrant = row.get("deggrant")
    is_4yr = iclevel in (1, 2, 3) if iclevel is not None else False
    deggrant_str = str(deggrant or "")
    has_bachelor_or_higher = deggrant_str in ("17", "18", "19")
    scores["fourYearDegreeGranting"] = 1 if (is_4yr or has_bachelor_or_higher) else 0

    # activeStatus (already checked blocking, but score it)
    scores["activeStatus"] = 1

    # bachelorProgramsPresent
    scores["bachelorProgramsPresent"] = 1 if bachelor_count > 0 else 0

    # metricsComplete
    scores["metricsComplete"] = 1 if metric_count >= 2 else 0

    # geolocated
    try:
        lat = float(row.get("latitude") or 0)
        lon = float(row.get("longitud") or 0)
        scores["geolocated"] = 1 if (lat != 0 and lon != 0) else 0
    except (ValueError, TypeError):
        scores["geolocated"] = 0

    # websitePresent
    scores["websitePresent"] = 1 if (row.get("webaddr") or "").strip() else 0

    # accreditationFlag
    scores["accreditationFlag"] = 1 if row.get("opeflag") == 1 else 0

    # Weighted total
    total = sum(scores[k] * weights.get(k, 0) for k in scores)
    return {"scores": scores, "weightedTotal": total}


def compute_warnings(row: dict) -> list[str]:
    """Return list of warning strings."""
    warnings = []
    stabbr = (row.get("stabbr") or "").strip()
    if stabbr not in US_STATES and stabbr not in US_MILITARY:
        warnings.append("FOREIGN: Foreign or military location (STABBR={})".format(stabbr))
    if not (row.get("webaddr") or "").strip():
        warnings.append("NO_WEBSITE: No website URL provided")
    try:
        lat = float(row.get("latitude") or 0)
        lon = float(row.get("longitud") or 0)
        if lat == 0 or lon == 0:
            warnings.append("NO_GEO: No geolocation data")
    except (ValueError, TypeError):
        warnings.append("NO_GEO: No geolocation data")
    return warnings


def recommendation_from_score(score: float, thresholds: dict[str, int]) -> str:
    if score >= thresholds.get("autoPublish", 80):
        return "AUTO_PUBLISH"
    if score >= thresholds.get("reviewRecommended", 50):
        return "REVIEW_RECOMMENDED"
    return "MANUAL_REVIEW"


def score_institutions(cur: Any, release_key: str, policy: dict[str, Any]) -> dict[str, int]:
    weights = policy["scoring"]["weights"]
    thresholds = policy["scoring"]["thresholds"]

    # Load bachelor program counts per UNITID
    cur.execute(
        """
        SELECT c."UNITID", COUNT(*)::integer
        FROM ipeds_raw.c2024dep c
        WHERE c."_release_key" = %s
          AND c."CIPCODE" <> '99'
          AND c."CIPCODE" LIKE '%%.%%'
          AND NULLIF(c."PBACHL", '')::numeric > 0
        GROUP BY c."UNITID"
        """,
        (release_key,),
    )
    bachelor_counts = {str(row[0]): int(row[1]) for row in cur.fetchall()}

    # Load metric counts per UNITID
    cur.execute(
        """
        SELECT "unitId", COUNT(*)::integer
        FROM "InstitutionMetric"
        WHERE "releaseKey" = %s
        GROUP BY "unitId"
        """,
        (release_key,),
    )
    metric_counts = {row[0]: int(row[1]) for row in cur.fetchall()}

    # Load all HD2024 rows
    cur.execute(
        """
        SELECT
            "UNITID", "INSTNM", "STABBR", "CONTROL", "SECTOR", "ICLEVEL",
            "DEGGRANT", "CYACTIVE", "POSTSEC", "CLOSEDAT", "DEATHYR",
            "WEBADDR", "LONGITUD", "LATITUDE", "OPEFLAG",
            "CITY", "ADDR"
        FROM ipeds_raw.hd2024
        WHERE "_release_key" = %s
        """,
        (release_key,),
    )

    columns = ["unitid", "instnm", "stabbr", "control", "sector", "iclevel",
               "deggrant", "cyactive", "postsec", "closedat", "deathy",
               "webaddr", "longitud", "latitude", "opeflag",
               "city", "addr"]

    rows = [dict(zip(columns, r)) for r in cur.fetchall()]

    # Clear existing candidates for this release
    cur.execute(
        """
        DELETE FROM "InstitutionPublishDecision"
        WHERE "candidateId" IN (SELECT id FROM "InstitutionCandidate" WHERE "releaseKey" = %s)
        """,
        (release_key,),
    )
    cur.execute('DELETE FROM "InstitutionCandidate" WHERE "releaseKey" = %s', (release_key,))

    candidate_rows = []
    decision_rows = []
    counters = {
        "total": 0, "blocked": 0, "auto_publish": 0,
        "review_recommended": 0, "manual_review": 0,
        "existing_premium_audited": 0,
    }

    for row in rows:
        counters["total"] += 1
        unit_id = str(row["unitid"])
        name_en = (row.get("instnm") or "").strip()
        if not name_en:
            continue

        # Check blocking rules
        blocks = is_blocked(row)
        if blocks:
            counters["blocked"] += 1
            candidate_rows.append((
                str(uuid.uuid4()), unit_id, None, name_en,
                (row.get("stabbr") or "").strip() or None,
                str(row.get("control")) if row.get("control") is not None else None,
                str(row.get("sector")) if row.get("sector") is not None else None,
                str(row.get("iclevel")) if row.get("iclevel") is not None else None,
                None, None, Json([]), Json([]), Json(blocks),
                policy["policyVersion"], release_key, datetime.now(timezone.utc),
            ))
            continue

        # Compute weighted score
        bachelor_count = bachelor_counts.get(unit_id, 0)
        metric_count = metric_counts.get(unit_id, 0)
        result = compute_weights(row, bachelor_count, metric_count, weights)
        score = result["weightedTotal"]

        # Compute warnings
        warnings = compute_warnings(row)

        # Determine recommendation
        recommendation = recommendation_from_score(score, thresholds)

        # Build reasons list
        reasons = []
        for dim, val in result["scores"].items():
            status = "PASS" if val == 1 else "MISS"
            reasons.append(f"{dim}: {status} (weight={weights.get(dim, 0)})")

        candidate_id = str(uuid.uuid4())
        counters[recommendation.lower()] = counters.get(recommendation.lower(), 0) + 1

        candidate_rows.append((
            candidate_id, unit_id, None, name_en,
            (row.get("stabbr") or "").strip() or None,
            str(row.get("control")) if row.get("control") is not None else None,
            str(row.get("sector")) if row.get("sector") is not None else None,
            str(row.get("iclevel")) if row.get("iclevel") is not None else None,
            float(score), recommendation, Json(reasons), Json(warnings), Json([]),
            policy["policyVersion"], release_key, datetime.now(timezone.utc),
        ))

        # Create publish decisions for auto-publish candidates
        if recommendation == "AUTO_PUBLISH":
            decision_rows.append((
                str(uuid.uuid4()), candidate_id, None,
                "AUTO_RECOMMENDED", None, None,
                "Auto-recommended by eligibility policy {}".format(policy["policyVersion"]),
            ))

    # Bulk insert candidates
    if candidate_rows:
        execute_values(
            cur,
            """
            INSERT INTO "InstitutionCandidate" (
                "id", "unitId", "universityId", "nameEn", "state", "control",
                "sector", "level", "eligibilityScore", "recommendation",
                "reasons", "warnings", "blockingReasons",
                "policyVersion", "releaseKey", "updatedAt"
            )
            VALUES %s
            """,
            candidate_rows,
            page_size=5000,
        )

    # Bulk insert decisions
    if decision_rows:
        execute_values(
            cur,
            """
            INSERT INTO "InstitutionPublishDecision" (
                "id", "candidateId", "universityId", "status",
                "decidedBy", "decidedAt", "reason"
            )
            VALUES %s
            """,
            decision_rows,
            page_size=5000,
        )

    counters["publish_decisions_created"] = len(decision_rows)
    return counters


def audit_existing_premium(cur: Any, release_key: str) -> list[dict[str, Any]]:
    """Audit existing premium universities that have IPEDS UNITIDs."""
    cur.execute(
        """
        SELECT u.id, u."nameEn", u."scorecardUnitId", ic.recommendation, ic."eligibilityScore"
        FROM "University" u
        LEFT JOIN "InstitutionCandidate" ic ON ic."unitId" = u."scorecardUnitId" AND ic."releaseKey" = %s
        WHERE u."scorecardUnitId" IS NOT NULL
        """,
        (release_key,),
    )
    return [
        {
            "universityId": row[0],
            "nameEn": row[1],
            "scorecardUnitId": row[2],
            "recommendation": row[3],
            "eligibilityScore": row[4],
        }
        for row in cur.fetchall()
    ]


def write_reports(args: argparse.Namespace, summary: dict[str, Any], audits: list[dict[str, Any]]) -> tuple[Path, Path]:
    args.report_dir.mkdir(parents=True, exist_ok=True)
    stem = "2024_25_provisional_eligibility_scoring"
    json_path = args.report_dir / f"{stem}.json"
    md_path = args.report_dir / f"{stem}.md"

    payload = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "toolVersion": TOOL_VERSION,
        "releaseKey": args.release_key,
        "summary": summary,
        "audits": audits,
    }
    json_path.write_text(json.dumps(payload, indent=2, sort_keys=True) + "\n")

    dist = summary.get("distribution", {})
    audit_rows = "\n".join(
        f"| {a['nameEn']} | {a['scorecardUnitId']} | {a['recommendation'] or 'N/A'} | {a['eligibilityScore'] or 'N/A'} |"
        for a in audits
    ) if audits else "| _No existing premium universities with UNITID_ |"

    md_path.write_text(
        "\n".join([
            "# IPEDS 2024-25 Provisional Eligibility Scoring",
            "",
            f"- Generated at: `{payload['generatedAt']}`",
            f"- Tool version: `{TOOL_VERSION}`",
            f"- Release key: `{args.release_key}`",
            "",
            "## Distribution",
            "",
            "| Category | Count |",
            "|---|---:|",
            f"| Total institutions scored | `{dist.get('total', 0)}` |",
            f"| Blocked | `{dist.get('blocked', 0)}` |",
            f"| Auto-publish recommended | `{dist.get('auto_publish', 0)}` |",
            f"| Review recommended | `{dist.get('review_recommended', 0)}` |",
            f"| Manual review required | `{dist.get('manual_review', 0)}` |",
            f"| Publish decisions created | `{dist.get('publish_decisions_created', 0)}` |",
            "",
            "## Existing Premium University Audit",
            "",
            "| University | UNITID | Recommendation | Score |",
            "|---|---|---|---:|",
            audit_rows,
            "",
        ])
    )
    return md_path, json_path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Score IPEDS institution eligibility.")
    parser.add_argument("--release-key", default=DEFAULT_RELEASE_KEY)
    parser.add_argument("--report-dir", type=Path, default=DEFAULT_REPORT_DIR)
    parser.add_argument("--policy-path", type=Path, default=POLICY_PATH)
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    policy = load_policy()
    conn = connect()
    try:
        with conn.cursor() as cur:
            counters = score_institutions(cur, args.release_key, policy)
            audits = audit_existing_premium(cur, args.release_key)
            distribution = {
                "total": counters["total"],
                "blocked": counters["blocked"],
                "auto_publish": counters.get("auto_publish", 0),
                "review_recommended": counters.get("review_recommended", 0),
                "manual_review": counters.get("manual_review", 0),
                "publish_decisions_created": counters.get("publish_decisions_created", 0),
            }
            md_path, json_path = write_reports(args, {"distribution": distribution, "audits": audits}, audits)
        conn.commit()
        print(json.dumps({"status": "SUCCEEDED", "reports": [str(md_path), str(json_path)], "distribution": distribution}, indent=2))
        return 0
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


if __name__ == "__main__":
    raise SystemExit(main())
