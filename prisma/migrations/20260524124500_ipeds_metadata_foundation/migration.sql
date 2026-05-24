-- IPEDS ADR-005 foundation: preserve source metadata separately from product models.
CREATE SCHEMA IF NOT EXISTS ipeds_meta;
CREATE SCHEMA IF NOT EXISTS ipeds_raw;
CREATE SCHEMA IF NOT EXISTS ipeds_curated;

CREATE TABLE IF NOT EXISTS ipeds_meta.releases (
    release_key TEXT PRIMARY KEY,
    collection_year TEXT NOT NULL,
    phase TEXT NOT NULL CHECK (phase IN ('PROVISIONAL', 'FINAL')),
    source_label TEXT NOT NULL,
    readme_path TEXT,
    readme_sha256 TEXT,
    tables_doc_path TEXT,
    tables_doc_sha256 TEXT,
    access_db_path TEXT,
    access_db_sha256 TEXT,
    import_tool_version TEXT NOT NULL,
    imported_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_active_for_product BOOLEAN NOT NULL DEFAULT false,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS ipeds_meta.import_runs (
    id TEXT PRIMARY KEY,
    release_key TEXT NOT NULL REFERENCES ipeds_meta.releases(release_key) ON DELETE CASCADE,
    run_type TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('STARTED', 'SUCCEEDED', 'FAILED')),
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    finished_at TIMESTAMPTZ,
    tool_version TEXT NOT NULL,
    source_hashes JSONB NOT NULL DEFAULT '{}'::jsonb,
    summary JSONB NOT NULL DEFAULT '{}'::jsonb,
    report_path TEXT,
    error_message TEXT
);

CREATE TABLE IF NOT EXISTS ipeds_meta.tables24 (
    release_key TEXT NOT NULL REFERENCES ipeds_meta.releases(release_key) ON DELETE CASCADE,
    survey_order INTEGER,
    survey_number INTEGER,
    survey TEXT,
    year_coverage TEXT,
    table_name TEXT NOT NULL,
    table_number INTEGER,
    table_title TEXT,
    description TEXT,
    release TEXT,
    release_date TEXT,
    PRIMARY KEY (release_key, table_name)
);

CREATE TABLE IF NOT EXISTS ipeds_meta.var_table24 (
    release_key TEXT NOT NULL REFERENCES ipeds_meta.releases(release_key) ON DELETE CASCADE,
    survey_order INTEGER,
    survey_number INTEGER,
    survey TEXT,
    table_number INTEGER,
    table_name TEXT NOT NULL,
    table_title TEXT,
    var_number INTEGER,
    var_order INTEGER,
    var_name TEXT NOT NULL,
    imputation_var TEXT,
    var_title TEXT,
    data_type TEXT,
    field_width INTEGER,
    format TEXT,
    multi_record INTEGER,
    has_rv TEXT,
    file_number INTEGER,
    section_number INTEGER,
    long_description TEXT,
    var_source TEXT,
    file_title TEXT,
    section_title TEXT,
    PRIMARY KEY (release_key, table_name, var_name)
);

CREATE TABLE IF NOT EXISTS ipeds_meta.value_sets24 (
    release_key TEXT NOT NULL REFERENCES ipeds_meta.releases(release_key) ON DELETE CASCADE,
    survey_order INTEGER,
    table_number INTEGER,
    table_name TEXT NOT NULL,
    var_number INTEGER,
    var_order INTEGER,
    var_name TEXT NOT NULL,
    code_value TEXT NOT NULL,
    frequency NUMERIC,
    percent NUMERIC,
    value_order INTEGER,
    value_label TEXT,
    var_title TEXT,
    PRIMARY KEY (release_key, table_name, var_name, code_value)
);

CREATE TABLE IF NOT EXISTS ipeds_meta.new_variables24 (
    release_key TEXT NOT NULL REFERENCES ipeds_meta.releases(release_key) ON DELETE CASCADE,
    survey_order INTEGER,
    survey_number INTEGER,
    survey TEXT,
    table_name TEXT NOT NULL,
    var_number INTEGER,
    var_name TEXT NOT NULL,
    var_title TEXT,
    file_number INTEGER,
    section_number INTEGER,
    PRIMARY KEY (release_key, table_name, var_name)
);

CREATE TABLE IF NOT EXISTS ipeds_meta.metadata_definitions24 (
    release_key TEXT NOT NULL REFERENCES ipeds_meta.releases(release_key) ON DELETE CASCADE,
    source_table TEXT NOT NULL,
    metadata_variable TEXT NOT NULL,
    description TEXT,
    PRIMARY KEY (release_key, source_table, metadata_variable)
);

CREATE TABLE IF NOT EXISTS ipeds_meta.raw_table_manifests (
    release_key TEXT NOT NULL REFERENCES ipeds_meta.releases(release_key) ON DELETE CASCADE,
    table_name TEXT NOT NULL,
    expected_column_count INTEGER,
    expected_variable_count INTEGER,
    extracted_file_path TEXT,
    extracted_file_sha256 TEXT,
    imported_row_count INTEGER,
    schema_hash TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (release_key, table_name)
);

CREATE INDEX IF NOT EXISTS idx_ipeds_meta_var_table24_table
    ON ipeds_meta.var_table24 (release_key, table_name, var_order);

CREATE INDEX IF NOT EXISTS idx_ipeds_meta_value_sets24_variable
    ON ipeds_meta.value_sets24 (release_key, table_name, var_name, value_order);

CREATE INDEX IF NOT EXISTS idx_ipeds_meta_new_variables24_table
    ON ipeds_meta.new_variables24 (release_key, table_name);
