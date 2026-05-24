# ADR-005: IPEDS Raw Mirror And Product Projection

*   **Status:** Accepted
*   **Scope:** Government Data Integration, Provenance, Institution Coverage
*   **Author:** Codex + Project Owner
*   **Date:** 2026-05-24

---

## Context

The project now has local NCES/IPEDS 2024-25 Provisional source files:

*   `ReadMe2024-25.docx`
*   `IPEDS202425Tablesdoc.xlsx`
*   `IPEDS202425.accdb`

The README describes the Access database as the 2024-25 IPEDS provisional release, containing survey component data, frequently used derived variables, metadata tables, variable definitions, and categorical value sets. The tables workbook documents more than 50 data tables, about 2,600 variables, and more than 12,000 value labels.

The current product already uses `University.scorecardUnitId` as an IPEDS UNITID anchor for U.S. schools, but only a few wide fields are populated from the College Scorecard API. That model is not sufficient for a full IPEDS integration because it loses release versioning, source table and variable lineage, missing-value semantics, and the distinction between raw government facts and product-facing views.

---

## Decision

We will integrate IPEDS as a full raw mirror plus curated product projection. IPEDS will become the primary large-scale source for U.S. institution facts and program-field coverage, while official catalog crawling remains a supplemental source for precise, fresh, school-specific catalog names, course requirements, school divisions, and newly launched programs.

### Source Layers

1.  **Raw mirror:** Preserve the IPEDS database as source-shaped PostgreSQL tables.
2.  **Metadata dictionary:** Preserve IPEDS table, variable, new-variable, and value-set metadata as runtime-queryable documentation.
3.  **Curated projection:** Build validated institution, metric, program-field, and eligibility projections from the raw mirror.
4.  **Product tables:** Sync only approved product-domain objects into Prisma-managed public tables.

Raw IPEDS data is an authoritative preservation layer, not the runtime application model.

### Database Layout

Use one PostgreSQL database with separate schemas:

*   `ipeds_raw`: source-shaped tables such as `hd2024`, `adm2024`, `c2024_a`, `c2024dep`, and `cost1_2024`.
*   `ipeds_meta`: releases, import runs, table metadata, variable metadata, value sets, and new variables.
*   `ipeds_curated`: views or materialized projections for institution profiles, metrics, CIP program facts, and eligibility scoring.
*   `public`: Prisma-managed application models.

IPEDS raw and metadata tables will not be modeled in Prisma. They will be managed by SQL migrations and ETL scripts. Prisma will manage only product-domain tables such as universities, identifiers, metrics, metric definitions, CIP taxonomy, CIP mappings, candidates, and publication decisions.

### Release Versioning

IPEDS provisional and final releases must coexist. A final release must not physically overwrite the provisional release.

Each release import records:

*   collection year
*   phase: `PROVISIONAL` or `FINAL`
*   release label and date when available
*   README, workbook, and Access database paths
*   SHA-256 hashes for all source files
*   import tool version
*   import timestamps

Each raw table row is associated with a release. Product projections select the highest trusted active release by rule: final first, provisional when final is unavailable.

### ETL Boundary

IPEDS ingestion is an independent ETL and SQL pipeline, not a frontend or runtime Prisma ingest script.

The Access database is treated as the immutable source artifact. The standard ETL input is an extracted CSV manifest:

```text
IPEDS202425.accdb
  -> extracted CSV files per table
  -> manifest.json
  -> PostgreSQL COPY into ipeds_raw
```

The first implementation may use CSV. Parquet can be added later. Large source files, extracted CSV files, and raw dumps must not be committed to git.

### Product Metrics

The old wide metrics on `University` are deprecated as product read/write targets:

*   `averageCost`
*   `gradRate`
*   `medianSalary`

They may remain physically during migration, but product code should move directly to structured metrics.

Introduce a metric definition registry. Only registered metrics may enter product surfaces. Each metric definition specifies labels, descriptions, units, display format, source system, source table, source variable, required dimensions, and missing-value policy.

Every metric value must store:

*   product metric key
*   UNITID and optional internal `universityId`
*   academic or collection year
*   source system
*   source table
*   source variable
*   release ID
*   verification ID
*   raw value
*   parsed value
*   value status
*   missing reason when applicable

Missing, suppressed, not applicable, not reported, not in universe, and parse-error states must not be collapsed into an undifferentiated `null`.

### Provenance

Every IPEDS-derived product field must have field-level provenance. Internal provenance must include source system, release, phase, table, variable, UNITID, optional CIP code, computed timestamp, and missing-value handling.

Front-end consumer views do not need to expose technical lineage such as table names, variable names, or CIP codes. Admin and audit views must expose that lineage.

Short verification IDs may be generated in the form:

```text
IPEDS-2024P-DRVADM2024-DVADM01-UNIT166027
IPEDS-2024P-C2024DEP-PBACHL-UNIT166027-CIP110701
```

### Institution Identity And Publishing

IPEDS UNITID is the primary external anchor for U.S. institutions. It does not replace the application's internal `University.id`, because the product also supports non-U.S. institutions and existing curated IDs.

Add or use an external identifier model for:

*   IPEDS UNITID
*   OPEID
*   Wikidata QID
*   QS ID
*   future identifiers such as ROR

IPEDS may generate institution candidates automatically. It must not silently publish all candidates to the front-end navigator.

Eligibility scoring is required for new IPEDS-discovered institutions. The scoring policy must be configuration-driven, explainable, and versioned. Each score records recommendation, reasons, warnings, blocking reasons, computed timestamp, and policy version.

Recommended output classes:

*   `AUTO_PUBLISH_RECOMMENDED`
*   `REVIEW_RECOMMENDED`
*   `HIDE_RECOMMENDED`
*   `EXCLUDE`

For the first implementation, automatic scoring recommends publication but does not silently publish. Existing curated premium universities are not automatically hidden by IPEDS eligibility. They receive audit results and warnings only.

### Program Fields, CIP, And Official Catalogs

IPEDS program data may determine front-end program-field coverage. This is a change from treating IPEDS only as auxiliary evidence.

Product surfaces may display IPEDS-derived program fields when the program field is supported by IPEDS data. Consumer UI should use natural student-facing names and does not need to expose CIP or source table details. Admin views must preserve source type and lineage.

There are two source classes:

*   `IPEDS_PROGRAM_FIELD`: derived from IPEDS CIP, award level, program offered, and completions facts.
*   `OFFICIAL_CATALOG_PROGRAM`: derived from official catalog crawlers or curated official catalog sources.

IPEDS-derived program fields should display mapped, student-friendly `Major` names when a validated CIP-to-major mapping exists. Otherwise, use cleaned CIP titles and keep the item out of standard major outcome linking until reviewed.

The existing `Major` taxonomy remains a product taxonomy. It must not be replaced by CIP. Add CIP taxonomy and mappings:

*   `CipCode`: CIP 2020 code, title, version, and level.
*   `MajorCipMapping`: one-to-many or many-to-one mappings with score, method, status, and provenance.

CIP-to-major mapping may be automatically validated for high-confidence cases. Ambiguous mappings enter review. Unmapped IPEDS program fields may still display, but they must not participate in standard major salary, demand, or ranking linkages.

First-phase program display defaults to bachelor-level fields. Other award levels are preserved and may be exposed later through filters.

For program existence, `C2024DEP` program-offered counts are the primary evidence. `C2024_A` completions are used for activity, scale, sorting, and review.

When IPEDS and official catalog data disagree, priority is field-specific:

*   Program-field existence at scale: IPEDS first.
*   Official program name, school division, course requirements, and catalog URL: catalog first.
*   New or renamed programs: catalog can supplement IPEDS until the next IPEDS release.
*   IPEDS present, catalog missing: display allowed; mark catalog coverage missing internally.
*   Catalog present, IPEDS missing: display allowed; mark IPEDS confirmation missing internally.

### First Curated Scope

Raw import is full. First product projection is intentionally limited to high-value surfaces:

*   institution identity from `HD2024`
*   institutional characteristics from `IC2024` and `IC2024MISSION`
*   admissions from `ADM2024` and `DRVADM2024`
*   cost and net price from `COST1_2024`, `COST2_2024_NetPrice`, and `DRVCOST2024`
*   student aid from `SFA2324`
*   enrollment from `EF2024`, `EF2024A`, and `DRVEF2024`
*   graduation from `GR2024`, `GR200_24`, and `DRVGR2024`
*   program fields from `C2024_A`, `C2024DEP`, and `DRVC2024`

Finance, human resources, academic libraries, and deep outcome-measures tables remain raw-preserved and may be productized later.

### UI Sequence

The first UI should be an internal IPEDS data audit view, not an immediate replacement of the public navigator.

The audit view should support:

*   institution lookup by UNITID and name
*   eligibility score, reasons, warnings, and blocking reasons
*   metrics with definitions and verification IDs
*   data dictionary lookup for tables, variables, and value labels
*   program-field facts and CIP mappings
*   source type inspection for IPEDS-derived versus catalog-derived programs

After sample validation, the public university navigator can use structured metrics and IPEDS-derived program fields while keeping technical provenance in the admin layer.

### Import Reports

Every IPEDS import creates a report under:

```text
memory/ipeds/import-runs/
```

Reports must include source file hashes, release metadata, imported table counts, validation results, curated projection counts, eligibility distribution, sample institutions checked, and diff summaries for reruns or final releases.

Plane issues should store only summary results and report paths, not long import logs.

---

## Validation Gates

Raw import gates:

*   source hashes are recorded
*   all expected tables are present
*   row counts and column counts are recorded
*   metadata rows are imported
*   UNITID presence is verified where applicable
*   imports are idempotent

Curated projection gates:

*   every metric has source table, source variable, release ID, and verification ID
*   every categorical code resolves to a value label or an explicit unknown state
*   UNITID joins to `HD2024`
*   numeric special codes are handled explicitly
*   provisional/final selection rules are applied

Product gates:

*   metric key exists in the metric registry
*   value status and missing reason are valid
*   institution eligibility has been computed
*   blocking reasons are honored
*   UI-facing labels and definitions exist
*   selected sample institutions pass audit review

---

## Implementation Roadmap

1.  **Architecture and metadata foundation**
    *   Add SQL schemas for `ipeds_meta`, `ipeds_raw`, and `ipeds_curated`.
    *   Import workbook metadata into `ipeds_meta`.
    *   Add runtime data dictionary endpoints or admin query helpers.
    *   Add the metric definition registry skeleton.

2.  **Access extraction and raw import**
    *   Define a containerized or documented Access-to-CSV extraction path.
    *   Generate extracted CSV files and `manifest.json`.
    *   Create raw tables from metadata.
    *   Load raw tables with PostgreSQL `COPY`.
    *   Generate import reports with source hashes and row counts.

3.  **Curated metrics and institution eligibility**
    *   Build first-scope projections for identity, admissions, cost, aid, enrollment, graduation, and bachelor-level program fields.
    *   Add structured `InstitutionMetric`, `MetricDefinition`, external identifiers, candidates, and eligibility scoring product tables.
    *   Implement the explainable eligibility policy.

4.  **CIP and program-field integration**
    *   Add CIP taxonomy and `MajorCipMapping`.
    *   Build high-confidence auto-validation rules and a review queue for ambiguous mappings.
    *   Generate IPEDS-derived bachelor-level program fields.
    *   Preserve source type distinctions for catalog-derived and IPEDS-derived programs.

5.  **Audit UI and public product migration**
    *   Build the internal IPEDS audit view.
    *   Validate selected institution archetypes, including existing premium schools, public universities, liberal arts colleges, community colleges, branch campuses, and specialty institutions.
    *   Migrate public navigator metrics away from old wide fields to structured metrics.
    *   Display IPEDS-derived program fields naturally in the front end while keeping technical provenance in admin views.

---

## Consequences

*   The system gains broad U.S. institution and program-field coverage without fabricating official catalog details.
*   IPEDS can drive front-end coverage while preserving backend source distinctions.
*   Release versioning and field-level provenance make provisional-to-final changes auditable.
*   The public UI stays readable because technical lineage remains in admin/audit surfaces.
*   ETL complexity is isolated from runtime app code.
*   The product model shifts from wide institution fields to registered, structured, provenance-backed metrics.
