-- IPEDS value-set rows may repeat code values for the same table and variable.
-- Preserve every documented row instead of forcing a lossy natural key.
ALTER TABLE ipeds_meta.value_sets24
    DROP CONSTRAINT IF EXISTS value_sets24_pkey;

ALTER TABLE ipeds_meta.value_sets24
    ADD COLUMN IF NOT EXISTS id BIGSERIAL;

ALTER TABLE ipeds_meta.value_sets24
    ADD CONSTRAINT value_sets24_pkey PRIMARY KEY (id);

CREATE INDEX IF NOT EXISTS idx_ipeds_meta_value_sets24_code
    ON ipeds_meta.value_sets24 (release_key, table_name, var_name, code_value);
