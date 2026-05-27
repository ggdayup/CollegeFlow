#!/usr/bin/env python3
import os
import sys
import json
import psycopg2
from pathlib import Path
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).resolve().parents[4]
load_dotenv(ROOT_DIR / ".env")

DB_URL = os.getenv("DATABASE_URL")
if not DB_URL:
    print(json.dumps({"error": "DATABASE_URL not found in environment"}, indent=2))
    sys.exit(1)

CLEAN_DB_URL = DB_URL.split("?")[0] if "?" in DB_URL else DB_URL

def run_assessment(university_name: str):
    result = {"university": university_name, "prisma_db": {}, "cds_db": {}}

    try:
        conn = psycopg2.connect(CLEAN_DB_URL)
        cur = conn.cursor()

        cur.execute(
            'SELECT id, "nameEn", "nameZh", "countryEn", "rankingQs", "rankingUsNews", '
            '"scorecardUnitId", "averageCost", "gradRate", "medianSalary", "wikidataId", '
            'latitude, longitude FROM "University" WHERE "nameEn" ILIKE %s',
            (f"%{university_name}%",),
        )
        row = cur.fetchone()
        if not row:
            result["prisma_db"]["error"] = f"No University record found matching '{university_name}'"
            conn.close()
            return result

        cols = [
            "id", "nameEn", "nameZh", "countryEn", "rankingQs", "rankingUsNews",
            "scorecardUnitId", "averageCost", "gradRate", "medianSalary", "wikidataId",
            "latitude", "longitude",
        ]
        uni = dict(zip(cols, row))
        uni_id = uni["id"]
        result["prisma_db"]["university"] = {k: (v if v is not None else None) for k, v in uni.items()}

        null_fields = [k for k, v in uni.items() if v is None and k != "id"]
        filled_fields = [k for k, v in uni.items() if v is not None and k != "id"]
        result["prisma_db"]["university_completeness"] = {
            "total_fields": len(cols) - 1,
            "filled": len(filled_fields),
            "null": len(null_fields),
            "null_fields": null_fields,
            "completeness_pct": round(len(filled_fields) / (len(cols) - 1) * 100, 1),
        }

        cur.execute('SELECT id, "nameEn", "nameZh" FROM "School" WHERE "universityId" = %s', (uni_id,))
        schools = [{"id": r[0], "nameEn": r[1], "nameZh": r[2]} for r in cur.fetchall()]
        result["prisma_db"]["schools"] = {"count": len(schools), "items": schools}

        cur.execute(
            'SELECT "customName", "degreeLevel", "mappingScore", "isValidated", '
            '"standardMajorId", "sourceUrl" FROM "UniversityMajorAssociation" '
            'WHERE "universityId" = %s', (uni_id,),
        )
        majors = []
        for r in cur.fetchall():
            majors.append({
                "customName": r[0], "degreeLevel": r[1], "mappingScore": float(r[2]) if r[2] else 0,
                "isValidated": r[3], "standardMajorId": r[4], "hasSourceUrl": r[5] is not None,
            })
        validated_count = sum(1 for m in majors if m["isValidated"])
        result["prisma_db"]["majors"] = {
            "count": len(majors),
            "validated": validated_count,
            "unvalidated": len(majors) - validated_count,
            "items": majors,
        }

        cur.execute(
            'SELECT "rankInteger", year, source, "isGlobal", "tieCount", "isVerified", "verifiedBy" '
            'FROM "UniversityRankingLineage" WHERE "universityId" = %s', (uni_id,),
        )
        lineages = [{"rank": r[0], "year": r[1], "source": r[2], "isGlobal": r[3], "tieCount": r[4], "isVerified": r[5], "verifiedBy": r[6]} for r in cur.fetchall()]
        result["prisma_db"]["ranking_lineages"] = {"count": len(lineages), "items": lineages}

        cur.execute(
            'SELECT "identifierType", "identifierValue", "sourceSystem", "verificationId" '
            'FROM "UniversityExternalIdentifier" WHERE "universityId" = %s', (uni_id,),
        )
        ext_ids = [{"type": r[0], "value": r[1], "source": r[2], "verificationId": r[3]} for r in cur.fetchall()]
        result["prisma_db"]["external_identifiers"] = {"count": len(ext_ids), "items": ext_ids}

        cur.execute(
            'SELECT "metricKey", "valueNumeric", "valueText", "valueStatus", "academicYear", "sourceSystem" '
            'FROM "InstitutionMetric" WHERE "universityId" = %s', (uni_id,),
        )
        metrics = [{"key": r[0], "numeric": float(r[1]) if r[1] else None, "text": r[2], "status": r[3], "year": r[4], "source": r[5]} for r in cur.fetchall()]
        result["prisma_db"]["institution_metrics"] = {"count": len(metrics), "items": metrics}

        cur.execute(
            'SELECT mr."rankInteger", mr.year, mr.source, mr."verificationId", m."nameEn" '
            'FROM "MajorRanking" mr JOIN "Major" m ON mr."standardMajorId" = m.id '
            'WHERE mr."universityId" = %s', (uni_id,),
        )
        major_ranks = [{"rank": r[0], "year": r[1], "source": r[2], "verificationId": r[3], "major": r[4]} for r in cur.fetchall()]
        result["prisma_db"]["major_rankings"] = {"count": len(major_ranks), "items": major_ranks}

        cur.execute(
            'SELECT "unitId", "cipCode", "displayTitle", "degreeLevel", "sourceType", '
            '"programOffered", "completionsTotal", "activityStatus", "valueStatus" '
            'FROM "InstitutionProgramField" WHERE "universityId" = %s', (uni_id,),
        )
        programs = [{"unitId": r[0], "cipCode": r[1], "title": r[2], "level": r[3], "sourceType": r[4], "offered": r[5], "completions": r[6], "activity": r[7], "valueStatus": r[8]} for r in cur.fetchall()]
        result["prisma_db"]["program_fields"] = {"count": len(programs), "items": programs}

        cur.execute(
            'SELECT ic."unitId", ic."nameEn", ic.state, ic."eligibilityScore", ic.recommendation '
            'FROM "InstitutionCandidate" ic WHERE ic."universityId" = %s', (uni_id,),
        )
        candidates = [{"unitId": r[0], "name": r[1], "state": r[2], "eligibility": float(r[3]) if r[3] else None, "recommendation": r[4]} for r in cur.fetchall()]
        result["prisma_db"]["candidates"] = {"count": len(candidates), "items": candidates}

        cur.execute(
            'SELECT mcm."majorId", m."nameEn", mcm."cipCode", mcm."mappingScore", mcm.status '
            'FROM "MajorCipMapping" mcm JOIN "Major" m ON mcm."majorId" = m.id '
            'WHERE mcm."majorId" IN (SELECT "standardMajorId" FROM "UniversityMajorAssociation" '
            'WHERE "universityId" = %s AND "standardMajorId" IS NOT NULL)', (uni_id,),
        )
        cip_maps = [{"majorId": r[0], "majorName": r[1], "cipCode": r[2], "score": float(r[3]) if r[3] else 0, "status": r[4]} for r in cur.fetchall()]
        result["prisma_db"]["cip_mappings"] = {"count": len(cip_maps), "items": cip_maps}

        cur.execute("SELECT code, name FROM institutions WHERE code ILIKE %s OR name ILIKE %s", (f"%{university_name}%", f"%{university_name}%"))
        inst_row = cur.fetchone()
        if inst_row:
            inst_id = inst_row[0]
            result["cds_db"]["institution"] = {"code": inst_row[0], "name": inst_row[1]}

            cur.execute(
                'SELECT d.academic_year, d.source_dir, d.canonical_sha256, d.schema_version, d.ingested_at '
                'FROM cds_documents d JOIN institutions i ON d.institution_id = i.id WHERE i.code = %s', (inst_id,),
            )
            docs = [{"year": r[0], "sourceDir": r[1], "sha256": r[2], "schemaVersion": r[3], "ingestedAt": str(r[4])} for r in cur.fetchall()]
            result["cds_db"]["documents"] = {"count": len(docs), "items": docs}

            cur.execute(
                'SELECT a.canonical_leaf_count, a.stored_value_count, a.missing_value_count, '
                'a.unknown_field_count, a.status, a.details_json '
                'FROM cds_import_audit a JOIN cds_documents d ON a.document_id = d.id '
                'JOIN institutions i ON d.institution_id = i.id WHERE i.code = %s', (inst_id,),
            )
            audits = []
            for r in cur.fetchall():
                audit = {"leafCount": r[0], "storedCount": r[1], "missingCount": r[2], "unknownCount": r[3], "status": r[4]}
                if r[5]:
                    try:
                        audit["details"] = json.loads(r[5]) if isinstance(r[5], str) else r[5]
                    except Exception:
                        audit["details"] = str(r[5])
                audits.append(audit)
            result["cds_db"]["audits"] = {"count": len(audits), "items": audits}

            cur.execute(
                'SELECT cv."section_code", COUNT(*) as value_count '
                'FROM cds_values cv JOIN cds_documents d ON cv.document_id = d.id '
                'JOIN institutions i ON d.institution_id = i.id WHERE i.code = %s '
                'GROUP BY cv."section_code" ORDER BY cv."section_code"', (inst_id,),
            )
            value_sections = [{"section": r[0], "count": r[1]} for r in cur.fetchall()]
            result["cds_db"]["value_distribution"] = value_sections
        else:
            result["cds_db"]["institution"] = None
            result["cds_db"]["note"] = "No CDS institution record found in database"

        conn.close()

    except Exception as e:
        result["prisma_db"]["error"] = str(e)

    return result


if __name__ == "__main__":
    name = sys.argv[1] if len(sys.argv) > 1 else "dartmouth"
    output = run_assessment(name)
    print(json.dumps(output, indent=2, ensure_ascii=False, default=str))
