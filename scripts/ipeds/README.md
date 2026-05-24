# IPEDS ETL

This folder contains the ADR-005 IPEDS ingestion pipeline.

The authoritative data source is:

```text
/Users/ggdayup/Downloads/college/IPEDS_2024-25_Provisional/IPEDS202425.accdb
```

`IPEDS202425Tablesdoc.xlsx` is used only as the metadata/data-dictionary source for expected tables, variables, and value labels.

## Phase 1: Metadata

Apply the SQL migration, then import the IPEDS metadata workbook:

```sh
backend/venv/bin/python scripts/ipeds/import_metadata_from_xlsx.py
```

The script reads:

```text
/Users/ggdayup/Downloads/college/IPEDS_2024-25_Provisional/IPEDS202425Tablesdoc.xlsx
/Users/ggdayup/Downloads/college/IPEDS_2024-25_Provisional/ReadMe2024-25.docx
/Users/ggdayup/Downloads/college/IPEDS_2024-25_Provisional/IPEDS202425.accdb
```

It writes release metadata, table metadata, variable metadata, value sets, new variables, metadata definitions, and raw table manifests into `ipeds_meta`.

Import reports are written to:

```text
memory/ipeds/import-runs/
```

## Phase 2: Raw Data

The Access database remains the immutable source artifact and the only source for raw survey data. The raw import pipeline should extract per-table CSV files and a manifest under `data/ipeds/`, then load those files into `ipeds_raw` with PostgreSQL `COPY`.

Build the Dockerized mdbtools image when local `mdb-tables` / `mdb-export` are not installed:

```sh
docker build -f docker/ipeds-mdbtools.Dockerfile -t ipeds-mdbtools:latest .
```

Extract all documented IPEDS tables:

```sh
backend/venv/bin/python scripts/ipeds/extract_access_to_csv.py --mode docker
```

For dependency checks without exporting data:

```sh
backend/venv/bin/python scripts/ipeds/extract_access_to_csv.py --check-only
```

The extractor writes:

```text
data/ipeds/2024-25/provisional/manifest.json
memory/ipeds/import-runs/2024_25_provisional_access_extraction.md
memory/ipeds/import-runs/2024_25_provisional_access_extraction.json
```

Do not commit the Access database, extracted CSV files, or raw dumps.

## Phase 3: Raw PostgreSQL Import

Load the extracted CSV files into source-shaped `ipeds_raw` tables:

```sh
backend/venv/bin/python scripts/ipeds/import_raw_to_postgres.py
```

For a smoke test against one table:

```sh
backend/venv/bin/python scripts/ipeds/import_raw_to_postgres.py --tables HD2024
```

The raw importer creates one table per IPEDS source table, adds `_release_key` and `_imported_at`, preserves Access/CSV column names, and writes:

```text
memory/ipeds/import-runs/2024_25_provisional_raw_import.md
memory/ipeds/import-runs/2024_25_provisional_raw_import.json
```

## Metric Definitions

Sync the product metric whitelist into PostgreSQL:

```sh
backend/venv/bin/python scripts/ipeds/import_metric_definitions.py
```

## Phase 5: Curated Product Projection

After metadata, raw import, product migrations, and metric definitions are in place, sync first-scope curated projections into product tables:

```sh
backend/venv/bin/python scripts/ipeds/sync_curated_projection.py
```

This script creates SQL views under `ipeds_curated`, syncs existing university IPEDS identifiers, populates `InstitutionMetric`, imports CIP labels into `CipCode`, and writes bachelor-level IPEDS-derived program fields into `InstitutionProgramField`.

It writes:

```text
memory/ipeds/import-runs/2024_25_provisional_curated_projection.md
memory/ipeds/import-runs/2024_25_provisional_curated_projection.json
```
