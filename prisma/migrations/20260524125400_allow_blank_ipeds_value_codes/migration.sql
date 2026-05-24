-- Preserve value-set documentation rows even when IPEDS leaves Codevalue blank.
ALTER TABLE ipeds_meta.value_sets24
    ALTER COLUMN code_value DROP NOT NULL;
