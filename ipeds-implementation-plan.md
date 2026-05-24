# IPEDS Implementation Plan

## Goal

Turn ADR-005 into a working IPEDS pipeline: extract the authoritative 2024-25 Provisional Access database (`IPEDS202425.accdb`), load a full raw mirror, build curated institution/program/metric projections, and migrate the product to IPEDS-backed coverage with admin auditability.

## Current Baseline

- [x] ADR-005 accepted and indexed.
- [x] `ipeds_meta`, `ipeds_raw`, and `ipeds_curated` schemas exist.
- [x] IPEDS metadata workbook imported: `tables24=52`, `varTable24=2599`, `valueSets24=12143`, `newVariables24=63`, `rawTableManifests=52`.
- [x] Source file hashes and metadata import report exist at `memory/ipeds/import-runs/2024_25_provisional_metadata.md`.

## Critical Path

1. **Access extraction path**: choose and document a repeatable `IPEDS202425.accdb -> CSV` toolchain, preferably Dockerized `mdbtools` so local machines do not need fragile desktop dependencies.  
   Verify: `data/ipeds/2024-25/provisional/manifest.json` lists all 52 expected tables with CSV paths, hashes, row counts, and column counts.

2. **Raw table generation and COPY import**: generate `ipeds_raw` tables from `ipeds_meta.var_table24`, load extracted CSVs with PostgreSQL `COPY`, and update `ipeds_meta.raw_table_manifests`.  
   Verify: every imported raw table has a matching manifest row, row counts are nonzero where expected, `UNITID` exists where documented, and import reports include failures/warnings.

3. **Product schema for metrics and identifiers**: add Prisma-managed public models for metric definitions, institution metrics, external identifiers, CIP taxonomy, CIP mappings, institution candidates, and publish decisions.  
   Verify: `npx prisma migrate deploy`, generated Prisma client, and seed/import smoke tests pass without using old wide metric fields as product targets.

4. **Curated institution and metric projections**: build `ipeds_curated` views/materialized views for identity, admissions, cost, aid, enrollment, graduation, and first-scope metric records.  
   Verify: sample UNITIDs resolve to clean metric rows with `valueStatus`, `missingReason`, `sourceTable`, `sourceVariable`, `releaseKey`, and `verificationId`.

5. **CIP/program-field projection**: import CIP taxonomy, derive bachelor-level IPEDS program fields from `C2024DEP` and activity signals from `C2024_A`, then map high-confidence CIP codes to existing `Major` records.  
   Verify: mapped program fields link to standard majors; unmapped fields retain cleaned CIP titles and do not link to salary/demand outcomes.

6. **Eligibility scoring and candidate workflow**: implement versioned institution eligibility policy with score, recommendation, reasons, warnings, and blocking reasons.  
   Verify: existing premium schools are audited but not hidden; new IPEDS institutions enter candidate/publish-decision states rather than silently publishing.

7. **Admin IPEDS audit API and view**: expose internal endpoints and UI for release status, table dictionary, variable/value labels, institution metrics, program fields, candidate decisions, and lineage inspection.  
   Verify: an admin can inspect one institution by UNITID and see identity, metrics, program fields, source type, and dictionary definitions.

8. **Public product migration**: migrate BFF/frontend university data from `averageCost`, `gradRate`, and `medianSalary` to structured metrics, and display IPEDS-derived program fields naturally without technical source clutter.  
   Verify: `UniversityNavigator` renders IPEDS-backed program fields and metrics for validated samples, while technical provenance remains admin-only.

9. **Final verification and report**: run full import, curated projection, eligibility scoring, audit UI checks, and public UI smoke tests; generate final implementation report under `memory/ipeds/import-runs/`.  
   Verify: `npm run lint`, migration status, row-count checks, metric registry checks, sample institution audits, and frontend smoke tests all pass.

## Phase Issues

- `IPEDS Phase 2: Access extraction manifest and raw CSV toolchain`
- `IPEDS Phase 3: Raw mirror import into ipeds_raw`
- `IPEDS Phase 4: Product schema for metrics, identifiers, CIP, and candidates`
- `IPEDS Phase 5: Curated institution metrics and program-field projections`
- `IPEDS Phase 6: Eligibility scoring and admin audit surface`
- `IPEDS Phase 7: Public navigator migration to structured IPEDS data`
- `IPEDS Final Verification: Full pipeline audit and release report`

## Risks

- Access extraction tooling may be platform-sensitive; prefer a Dockerized path and record exact tool versions.
- IPEDS special missing values must not become ordinary numeric values.
- Value sets can contain duplicate or blank code rows; preserve metadata rows and resolve display labels carefully.
- IPEDS-derived program fields may improve coverage quickly, but standard-major linkage must remain gated by mapping confidence.
- Existing dirty/generated files in the workspace must not be reverted or mixed into IPEDS implementation commits.

## Done When

- [ ] Raw IPEDS data is fully loaded and reproducible from source artifacts.
- [ ] Curated product metrics and program fields are provenance-backed and validated.
- [ ] Institution candidates are scored and publishable through an explicit workflow.
- [ ] Admin audit surfaces can explain every IPEDS-derived product field.
- [ ] Public university/program views use structured IPEDS data without exposing technical lineage to users.
