# IPEDS 2024-25 Provisional Full Pipeline Verification Report

- **Generated at**: 2026-05-24T14:30:00Z
- **Release key**: `ipeds-2024-25-provisional`
- **Pipeline status**: COMPLETE

## Pipeline Summary

| Stage | Status | Details |
|---|---|---|
| Phase 1: Metadata foundation | DONE | 52 tables, 2,599 vars, 12,143 value sets, 63 new vars |
| Phase 2: Access extraction | DONE | 52 CSVs extracted, manifest with hashes/row counts |
| Phase 3: Raw mirror import | DONE | 52 `ipeds_raw` tables, 3,483,395 total rows |
| Phase 4: Product schema | DONE | MetricDefinition, InstitutionMetric, CipCode, MajorCipMapping, InstitutionCandidate, InstitutionPublishDecision, InstitutionProgramField |
| Phase 5: Curated projections | DONE | 17,364 metrics (5 keys, 5,860 units), 81,872 program fields, 1,748 CIP codes |
| Phase 6: Eligibility scoring | DONE | 6,072 candidates scored (2,435 auto-publish, 3,541 review, 25 manual, 71 blocked), 2,435 publish decisions |
| Phase 7: Public navigator migration | DONE | Structured metrics in `/api/universities`, public IPEDS endpoint, program fields in UniversityNavigator |
| Final Verification | DONE | This report |

## Data Counts

| Entity | Count |
|---|---|
| Raw tables in `ipeds_raw` | 52 |
| HD2024 institution rows | 6,072 |
| Total raw rows (all tables) | 3,483,395 |
| Metric definitions (IPEDS) | 5 |
| Institution metric rows | 17,364 |
| Distinct metric keys | 5 |
| Distinct UNITIDs with metrics | 5,860 |
| Bachelor program fields | 81,872 |
| CIP taxonomy codes | 1,748 |
| Institution candidates | 6,072 |
| Publish decisions (AUTO_RECOMMENDED) | 2,435 |

## Eligibility Distribution

| Recommendation | Count | Percentage |
|---|---|---|
| AUTO_PUBLISH | 2,435 | 40.1% |
| REVIEW_RECOMMENDED | 3,541 | 58.3% |
| MANUAL_REVIEW | 25 | 0.4% |
| BLOCKED (closed/inactive) | 71 | 1.2% |

## Sample Institution Audit

| UNITID | Institution | State | Control | Score | Recommendation | Metrics | Programs |
|---|---|---|---|---|---|---|---|
| 166027 | Harvard University | MA | Private Nonprofit (2) | 80.0 | AUTO_PUBLISH | 5 | 105 |
| 166683 | MIT | MA | Private Nonprofit (2) | 80.0 | AUTO_PUBLISH | 5 | 42 |
| 170976 | UMich-Ann Arbor | MI | Public (1) | 80.0 | AUTO_PUBLISH | 5 | 137 |
| 110635 | UC Berkeley | CA | Public (1) | 80.0 | AUTO_PUBLISH | 5 | 107 |
| 100654 | Alabama A&M | AL | Public (1) | 80.0 | AUTO_PUBLISH | 5 | 39 |

## Metric Keys Implemented

| Key | Label | Source Table | Source Variable |
|---|---|---|---|
| admission_rate_total | Admission Rate (Total) | HD2024 | ADMSS_RATE |
| admissions_yield_total | Admissions Yield (Total) | HD2024 | FIRST-PROFRATE |
| fall_enrollment_total | Fall Enrollment (Total) | C2024_A | CTOTALT |
| graduation_rate_150 | Graduation Rate (150% time) | HD2024 | GRAD150_RATE |
| bachelor_programs_offered_count | Bachelor Programs Offered Count | C2024DEP | PBACHL |

## Verification Checks

| Check | Result |
|---|---|
| `npm run lint` | PASS |
| `npx tsc --noEmit` | PASS |
| 52 raw tables exist | PASS |
| 3,483,395 total raw rows | PASS |
| All metrics have definition + status + release key | PASS |
| All program fields have CIP code + source type | PASS |
| All candidates have score + recommendation | PASS |
| No raw CSV/Access artifacts in git | PASS |
| Admin audit UI renders per UNITID | PASS |
| Public API returns structured metrics | PASS |
| UniversityNavigator displays IPEDS program fields | PASS |

## Files Added/Modified (Phases 6-7)

| File | Action | Purpose |
|---|---|---|
| `config/ipeds/eligibility-policy.v1.json` | Added | Versioned eligibility policy config |
| `scripts/ipeds/score_eligibility.py` | Added | Eligibility scoring script |
| `server/server.ts` | Modified | Added admin endpoints + public IPEDS endpoints + structured metrics |
| `src/components/IPEDSAdminAudit.tsx` | Added | Admin audit UI component |
| `src/components/UniversityNavigator.tsx` | Modified | IPEDS program fields display |
| `src/App.tsx` | Modified | IPEDS Admin view tab |
| `memory/ipeds/import-runs/2024_25_provisional_eligibility_scoring.md` | Added | Eligibility scoring report |
| `memory/ipeds/import-runs/2024_25_provisional_eligibility_scoring.json` | Added | Eligibility scoring JSON |

## Known Limitations

1. **Metric coverage**: Only 5 direct metric keys implemented (admission, yield, enrollment, grad rate, bachelor program count). Additional metrics can be added by inserting MetricDefinition rows and extending `sync_curated_projection.py`.
2. **University mapping**: `scorecardUnitId` on University records not yet populated, so IPEDS metrics join on UNITID only. Existing 16 premium universities are not yet linked by UNITID.
3. **Admin auth**: Admin endpoints are not yet gated by authentication - suitable for local dev only.
4. **CIP mapping confidence**: MajorCipMapping rows with `status=AUTO_VALIDATED` are used for standard major linkage. Mapped confidence score thresholds may need manual review.
5. **Program field deduplication**: IPEDS-derived and catalog-derived program fields are presented separately internally but merged in the UI. Further dedup logic may be needed for production.

## Reproducibility

```bash
# Re-run full pipeline
cd /Users/ggdayup/ggdayup-syncthing/code/college_major
python3 scripts/ipeds/import_metadata_from_xlsx.py
python3 scripts/ipeds/extract_access_to_csv.py  # requires Docker/mdbtools
python3 scripts/ipeds/import_raw_to_postgres.py
python3 scripts/ipeds/import_metric_definitions.py
python3 scripts/ipeds/sync_curated_projection.py
python3 scripts/ipeds/score_eligibility.py
npm run lint
```

## Conclusion

The IPEDS 2024-25 Provisional pipeline is fully implemented and verified. All ADR-005 requirements are met:
- Raw data is reproducible from source artifacts
- Curated product metrics and program fields are provenance-backed
- Institution candidates are scored with explainable policies
- Admin audit surfaces can explain every IPEDS-derived field
- Public views use structured IPEDS data without technical lineage exposure
