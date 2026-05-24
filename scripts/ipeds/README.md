# IPEDS ETL

This folder contains the ADR-005 IPEDS ingestion pipeline.

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

The Access database remains the immutable source artifact. The raw import pipeline should extract per-table CSV files and a manifest under `data/ipeds/`, then load those files into `ipeds_raw` with PostgreSQL `COPY`.

Do not commit the Access database, extracted CSV files, or raw dumps.
