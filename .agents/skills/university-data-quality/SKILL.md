---
name: university-data-quality
description: Assess data completeness and quality for a university across PostgreSQL (Prisma tables + CDS tables) and local CDS JSON files. Use when user asks to evaluate, audit, or check data quality for a specific university, or mentions "data quality", "completeness", "assess university data", "audit university".
---

# University Data Quality Assessment

## Quick start

Run both assessment scripts for a university (e.g. `dartmouth`):

```bash
# 1. Prisma DB + CDS DB assessment
python3 .agents/skills/university-data-quality/scripts/assess_db.py dartmouth

# 2. Local CDS file assessment
python3 .agents/skills/university-data-quality/scripts/assess_cds_files.py dartmouth
```

Both scripts output structured JSON. Combine the results to produce a quality report.

## Workflows

### Full assessment workflow

1. **Ensure PostgreSQL is running**: `docker compose up -d` (port 35432)
2. **Ensure schema is migrated**: `npx prisma migrate deploy`
3. **Ensure seed data is loaded**: `npx prisma db seed`
4. **Run DB assessment**: `python3 .agents/skills/university-data-quality/scripts/assess_db.py <university_name>`
5. **Run CDS file assessment**: `python3 .agents/skills/university-data-quality/scripts/assess_cds_files.py <university_name>`
6. **Synthesize report** from JSON outputs using the scoring rubric below

### Scoring rubric

| Dimension | Weight | Scoring criteria |
|-----------|--------|-----------------|
| University core fields | 15% | % of non-null fields in University record (scorecardUnitId, wikidataId, lat/lon, etc.) |
| Schools & majors | 15% | School count, major count, validation rate (isValidated), sourceUrl coverage |
| External identifiers | 10% | Presence of IPEDS UNITID, Wikidata QID, QS ID |
| Ranking lineage | 10% | Count of ranking records across years and sources |
| Institution metrics | 10% | Count of InstitutionMetric records |
| CDS DB ingestion | 15% | Institution registered, document ingested, audit status, value distribution by section |
| CDS canonical quality | 15% | Non-empty sections count, total leaf values, empty section list |
| CDS structured quality | 10% | Unknown_Unassigned leaf count, OCR error pages, key_mapping coverage |

### Report format

Produce a markdown report with these sections:

1. **Prisma DB assessment** — table-by-table row counts, null field analysis, completeness %
2. **CDS DB assessment** — institution registration, document ingestion, audit results
3. **CDS file assessment** — canonical emptiness, structured misclassification, key_mapping gaps, OCR errors
4. **Issues list** — severity-tagged (CRITICAL / WARNING / INFO) with specific remediation
5. **Priority fixes** — ordered P0/P1/P2 recommendations

### Common issues and fixes

| Issue | Severity | Fix |
|-------|----------|-----|
| CDS_canonical.json all sections empty | CRITICAL | Re-run structured→canonical conversion pipeline |
| H_Financial / J_Degrees in Unknown_Unassigned | WARNING | Add key_mapping entries for missing sections |
| OCR checkbox values all `true` | WARNING | Manual correction from PDF source |
| University missing scorecardUnitId / wikidataId | WARNING | Look up IPEDS UNITID and Wikidata QID, add to seed + external identifiers |
| No RankingLineage records | WARNING | Run ranking sync ingestion |
| CDS institution not in DB | CRITICAL | Run `import_to_pg.py` after canonical is fixed |
| OCR page JSON parse failure | INFO | Re-OCR the affected page |

## Script details

### assess_db.py

Connects to PostgreSQL via `DATABASE_URL` from project `.env`. Queries all Prisma tables and CDS tables for the given university. Outputs JSON with:

- `prisma_db.university` — field values + completeness analysis
- `prisma_db.schools` — school records
- `prisma_db.majors` — major associations with validation status
- `prisma_db.ranking_lineages` — ranking history
- `prisma_db.external_identifiers` — IPEDS/Wikidata/QS identifiers
- `prisma_db.institution_metrics` — Scorecard metrics
- `prisma_db.major_rankings` — discipline-specific rankings
- `prisma_db.program_fields` — IPEDS program completions
- `prisma_db.cip_mappings` — CIP code mappings
- `cds_db.*` — CDS institution, documents, audits, value distribution

### assess_cds_files.py

Reads local CDS JSON files from `data/cds/CollegeFlow_CDS/cds_data/<university_dir>/`. No database connection needed. Outputs JSON with:

- `canonical` — per-section leaf counts, empty section detection
- `structured` — section coverage, Unknown_Unassigned analysis, OCR errors
- `key_mapping` — mapping coverage, missing canonical sections
- `raw_ocr` — page count
- `issues` — auto-detected problems with severity tags
