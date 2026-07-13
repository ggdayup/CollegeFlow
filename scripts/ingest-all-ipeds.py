#!/usr/bin/env python3
"""
Comprehensive IPEDS 2024-25 Provisional Data Ingestion
Imports ALL 52 CSV tables for ALL ~6072 universities into PostgreSQL.
"""

import csv
import os
import time
import psycopg2
import psycopg2.extras
from collections import defaultdict
import hashlib

# ─── Config ──────────────────────────────────────────────────────────────
DB_URL = os.environ.get("DATABASE_URL", "postgresql://postgres:postgres@127.0.0.1:35432/college_major")
DATA_DIR = "/Users/ggdayup/ggdayup-syncthing/code/CollegeFlow/data/ipeds/2024-25/provisional"
RELEASE_KEY = "ipeds-2024-25-provisional"
BATCH_SIZE = 5000

# ─── CSV Parser ──────────────────────────────────────────────────────────
def count_rows(filepath):
    with open(filepath, 'r', errors='replace') as f:
        return sum(1 for _ in f) - 1  # minus header

def read_csv_chunks(filepath, chunk_size=50000):
    """Generator that yields chunks of rows from a CSV."""
    with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
        reader = csv.DictReader(f)
        headers = reader.fieldnames
        chunk = []
        for row in reader:
            chunk.append(row)
            if len(chunk) >= chunk_size:
                yield headers, chunk
                chunk = []
        if chunk:
            yield headers, chunk

# ─── Table Configuration ─────────────────────────────────────────────────
# For tables with multiple rows per UNITID, specify the key columns that distinguish rows
TABLE_CONFIGS = {
    # Core tables (unit-level or single row per unit)
    'hd2024':         {'unit_col': 'UNITID', 'row_keys': [], 'priority': 'high'},
    'ic2024':         {'unit_col': 'UNITID', 'row_keys': [], 'priority': 'high'},
    'cost1_2024':     {'unit_col': 'UNITID', 'row_keys': [], 'priority': 'high'},
    'ic2024mission':  {'unit_col': 'UNITID', 'row_keys': [], 'priority': 'low'},
    'flags2024':      {'unit_col': 'UNITID', 'row_keys': [], 'priority': 'low'},

    # Tables with multiple rows per UNITID (need row_keys for verificationId)
    'ef2024':         {'unit_col': 'UNITID', 'row_keys': ['EFLEVEL'], 'priority': 'high'},
    'ef2024a':        {'unit_col': 'UNITID', 'row_keys': ['EFLEVEL'], 'priority': 'medium'},
    'ef2024b':        {'unit_col': 'UNITID', 'row_keys': ['EFLEVEL'], 'priority': 'medium'},
    'ef2024c':        {'unit_col': 'UNITID', 'row_keys': ['EFLEVEL'], 'priority': 'medium'},
    'ef2024cp':       {'unit_col': 'UNITID', 'row_keys': ['EFLEVEL'], 'priority': 'medium'},
    'effy2024':       {'unit_col': 'UNITID', 'row_keys': ['EFLEVEL'], 'priority': 'medium'},

    'gr2024':         {'unit_col': 'UNITID', 'row_keys': ['GRTYPE', 'CHRTSTAT', 'SECTION', 'COHORT', 'LINE'], 'priority': 'high'},
    'gr200_24':       {'unit_col': 'UNITID', 'row_keys': ['GRTYPE', 'CHRTSTAT', 'SECTION', 'COHORT', 'LINE'], 'priority': 'low'},
    'gr2024_pell_ssl':{'unit_col': 'UNITID', 'row_keys': ['GRTYPE', 'PELLGRP', 'SECTION', 'COHORT', 'LINE'], 'priority': 'low'},
    'gr2024_l2':      {'unit_col': 'UNITID', 'row_keys': ['GRTYPE', 'CHRTSTAT', 'SECTION', 'COHORT', 'LINE'], 'priority': 'low'},

    'om2024':         {'unit_col': 'UNITID', 'row_keys': ['OM_COHORT', 'OM_DEFN', 'OM_DEGTH', 'OM_STCAT', 'OM_INCOM', 'OM_RACET'], 'priority': 'high'},

    'adm2024':        {'unit_col': 'UNITID', 'row_keys': [], 'priority': 'high'},
    'drvadm2024':     {'unit_col': 'UNITID', 'row_keys': [], 'priority': 'low'},

    # Completions (goes to InstitutionProgramField)
    'c2024_a':        {'unit_col': 'unitid', 'row_keys': ['CIPCODE', 'MAJORNUM', 'AWLEVEL'], 'priority': 'program'},
    'c2024_b':        {'unit_col': 'unitid', 'row_keys': ['CIPCODE', 'AWLEVEL'], 'priority': 'program'},
    'c2024_c':        {'unit_col': 'unitid', 'row_keys': ['CIPCODE', 'AWLEVEL'], 'priority': 'program'},
    'c2024dep':       {'unit_col': 'unitid', 'row_keys': ['CIPCODE', 'AWLEVEL'], 'priority': 'program'},

    # Student financial aid
    'cost2_2024_financialaid': {'unit_col': 'UNITID', 'row_keys': [], 'priority': 'medium'},
    'cost2_2024_netprice':     {'unit_col': 'UNITID', 'row_keys': [], 'priority': 'medium'},
    'sfa2324':                 {'unit_col': 'UNITID', 'row_keys': [], 'priority': 'medium'},
    'sfav2324':                {'unit_col': 'UNITID', 'row_keys': [], 'priority': 'low'},

    # Student demographics
    's2024_is':   {'unit_col': 'UNITID', 'row_keys': ['RACEETH', 'SEX', 'STULEVEL'], 'priority': 'medium'},
    's2024_nh':   {'unit_col': 'UNITID', 'row_keys': ['RACEETH', 'SEX', 'STULEVEL'], 'priority': 'medium'},
    's2024_oc':   {'unit_col': 'UNITID', 'row_keys': ['RACEETH', 'SEX', 'STULEVEL'], 'priority': 'medium'},
    's2024_sis':  {'unit_col': 'UNITID', 'row_keys': ['RACEETH', 'SEX', 'STULEVEL'], 'priority': 'medium'},

    # Early assessment
    'eap2024': {'unit_col': 'UNITID', 'row_keys': [], 'priority': 'medium'},

    # Faculty salaries
    'sal2024_is':  {'unit_col': 'UNITID', 'row_keys': ['RACEETH', 'SEX', 'INSTRFAC'], 'priority': 'medium'},
    'sal2024_nis': {'unit_col': 'UNITID', 'row_keys': ['INSTRFAC'], 'priority': 'medium'},

    # Finance
    'f2324_f1a': {'unit_col': 'UNITID', 'row_keys': [], 'priority': 'medium'},
    'f2324_f2':  {'unit_col': 'UNITID', 'row_keys': [], 'priority': 'medium'},
    'f2324_f3':  {'unit_col': 'UNITID', 'row_keys': [], 'priority': 'medium'},

    # Derived values
    'drvc2024':   {'unit_col': 'UNITID', 'row_keys': [], 'priority': 'low'},
    'drvcost2024':{'unit_col': 'UNITID', 'row_keys': [], 'priority': 'low'},
    'drvef2024':  {'unit_col': 'UNITID', 'row_keys': ['EFLEVEL'], 'priority': 'low'},
    'drvef122024':{'unit_col': 'UNITID', 'row_keys': [], 'priority': 'low'},
    'drvf2024':   {'unit_col': 'UNITID', 'row_keys': [], 'priority': 'low'},
    'drvgr2024':  {'unit_col': 'UNITID', 'row_keys': [], 'priority': 'low'},
    'drvhr2024':  {'unit_col': 'UNITID', 'row_keys': [], 'priority': 'low'},
    'drvom2024':  {'unit_col': 'UNITID', 'row_keys': [], 'priority': 'low'},
    'drval2024':  {'unit_col': 'UNITID', 'row_keys': [], 'priority': 'low'},

    # Other
    'al2024':             {'unit_col': 'UNITID', 'row_keys': [], 'priority': 'low'},
    'customcgids2024':    {'unit_col': 'UNITID', 'row_keys': [], 'priority': 'skip'},  # skip - internal mapping
}

def parse_num(val):
    """Parse numeric value, return None for -2 (suppressed) or empty."""
    if not val or val.strip() == '' or val.strip() == '-2':
        return None
    try:
        return float(val.strip().replace('"', ''))
    except (ValueError, TypeError):
        return None

def make_verification_id(table, unit_id, col, row, config):
    """Generate unique verificationId for InstitutionMetric."""
    parts = [table, str(unit_id), col.lower()]
    for key in config.get('row_keys', []):
        val = row.get(key, '')
        if val:
            parts.append(val.strip())
    parts.append(RELEASE_KEY)
    raw = '_'.join(parts)
    if len(raw) > 250:
        # Hash if too long for VARCHAR
        h = hashlib.md5(raw.encode()).hexdigest()[:16]
        return f"{table}_{unit_id}_{col.lower()}_{h}_{RELEASE_KEY}"
    return raw

def get_row_suffix(row, config):
    """Get row key suffix for display/logging."""
    parts = []
    for key in config.get('row_keys', []):
        val = row.get(key, '')
        if val and val.strip() != '-2':
            parts.append(f"{key}={val.strip()}")
    return ','.join(parts)

# ─── Main Ingestion ──────────────────────────────────────────────────────
def main():
    start = time.time()
    conn = psycopg2.connect(DB_URL)
    conn.autocommit = False
    cur = conn.cursor()

    try:
        # Phase 1: Clear existing IPEDS data for clean re-ingest
        # ─────────────────────────────────────────────────────────────
        print("=" * 70)
        print("Phase 1: Clearing existing IPEDS data")
        print("=" * 70)

        cur.execute("DELETE FROM \"InstitutionProgramField\"")
        print(f"  Cleared {cur.rowcount} InstitutionProgramField records")

        cur.execute("DELETE FROM \"InstitutionMetric\"")
        print(f"  Cleared {cur.rowcount} InstitutionMetric records")

        cur.execute("DELETE FROM \"InstitutionCandidate\"")
        print(f"  Cleared {cur.rowcount} InstitutionCandidate records")
        conn.commit()

        # ─────────────────────────────────────────────────────────────
        # Phase 2: Create/update Universities + InstitutionCandidates
        # ─────────────────────────────────────────────────────────────
        print("\n" + "=" * 70)
        print("Phase 2: Creating Universities + InstitutionCandidates from hd2024.csv")
        print("=" * 70)

        # Build existing name -> id map
        cur.execute('SELECT id, "nameEn" FROM "University"')
        existing_unis = {name.lower().strip(): uid for uid, name in cur.fetchall()}

        # Additional name aliases for fuzzy matching (hd2024 name -> existing DB name)
        NAME_ALIASES = {
            'university of illinois urbana-champaign': 'university of illinois at urbana-champaign',
            'the university of texas at austin': 'university of texas at austin',
            'ohio state university-main campus': 'the ohio state university-main campus',
        }
        for alias, target in NAME_ALIASES.items():
            if target in existing_unis:
                existing_unis[alias] = existing_unis[target]

        # Map to track: unitId -> universityId
        unit_id_to_uni_id = {}

        # Also map: universityId -> unitId (for existing unis that need candidate created)
        uni_candidates = {}
        cur.execute('SELECT "universityId", "unitId" FROM "InstitutionCandidate"')
        for uid, tid in cur.fetchall():
            uni_candidates[uid] = tid

        hd_path = os.path.join(DATA_DIR, 'hd2024.csv')
        total_institutions = count_rows(hd_path)
        print(f"  hd2024.csv has {total_institutions} institutions")

        created_unis = 0
        created_candidates = 0
        updated_candidates = 0

        for headers, chunk in read_csv_chunks(hd_path):
            for row in chunk:
                unit_id = row['UNITID'].strip()
                name_en = row['INSTNM'].strip()
                state = row.get('STABBR', '').strip() or None
                control = row.get('SECTOR', '').strip()
                if control == '-2':
                    control = None
                iclevel = row.get('ICLEVEL', '').strip()
                if iclevel == '-2':
                    iclevel = None

                # Try to find existing university by name
                name_key = name_en.lower().strip()
                uni_id = existing_unis.get(name_key)

                if uni_id:
                    # Existing university - update/create candidate
                    unit_id_to_uni_id[unit_id] = uni_id
                    existing_tid = uni_candidates.get(uni_id)
                    if existing_tid:
                        cur.execute("""
                            UPDATE "InstitutionCandidate"
                            SET "nameEn"=%s, "state"=%s, "control"=%s, "level"=%s,
                                "sector"=%s, "releaseKey"=%s, "updatedAt"=now()
                            WHERE "unitId"=%s
                        """, (name_en, state, control, iclevel, control, RELEASE_KEY, unit_id))
                        updated_candidates += 1
                    else:
                        cur.execute("""
                            INSERT INTO "InstitutionCandidate"
                            ("id", "unitId", "universityId", "nameEn", "state", "control", "level", "sector",
                             "eligibilityScore", "recommendation", "releaseKey", "createdAt", "updatedAt")
                            VALUES (gen_random_uuid(), %s, %s, %s, %s, %s, %s, %s, 1, 'PUBLISH', %s, now(), now())
                        """, (unit_id, uni_id, name_en, state, control, iclevel, control, RELEASE_KEY))
                        created_candidates += 1
                else:
                    # Check if scorecardUnitId already maps to a university
                    cur.execute('SELECT id FROM "University" WHERE "scorecardUnitId" = %s', (unit_id,))
                    result = cur.fetchone()
                    if result:
                        uni_id = result[0]
                    else:
                        # Create new university
                        from uuid import uuid4
                        uni_id = str(uuid4())
                        country = 'United States'
                        try:
                            cur.execute("""
                                INSERT INTO "University"
                                ("id", "nameEn", "nameZh", "countryEn", "countryZh", "scorecardUnitId")
                                VALUES (%s, %s, NULL, %s, '美国', %s)
                            """, (uni_id, name_en, country, unit_id))
                            created_unis += 1
                        except psycopg2.errors.UniqueViolation:
                            conn.rollback()
                            cur.execute('SELECT id FROM "University" WHERE "nameEn" = %s', (name_en,))
                            result = cur.fetchone()
                            if result:
                                uni_id = result[0]
                            else:
                                continue  # Skip this institution

                    existing_unis[name_key] = uni_id
                    unit_id_to_uni_id[unit_id] = uni_id

                    # Create InstitutionCandidate
                    cur.execute("""
                        INSERT INTO "InstitutionCandidate"
                        ("id", "unitId", "universityId", "nameEn", "state", "control", "level", "sector",
                         "eligibilityScore", "recommendation", "releaseKey", "createdAt", "updatedAt")
                        VALUES (gen_random_uuid(), %s, %s, %s, %s, %s, %s, %s, 1, 'PUBLISH', %s, now(), now())
                    """, (unit_id, uni_id, name_en, state, control, iclevel, control, RELEASE_KEY))
                    created_candidates += 1

            conn.commit()

        print(f"  Created {created_unis} new universities")
        print(f"  Created {created_candidates} new InstitutionCandidates")
        print(f"  Updated {updated_candidates} existing InstitutionCandidates")
        print(f"  Total mapped: {len(unit_id_to_uni_id)} unitIds")

        # ─────────────────────────────────────────────────────────────
        # Phase 2b: Pre-create MetricDefinitions for ALL columns
        # ─────────────────────────────────────────────────────────────
        print("\n" + "=" * 70)
        print("Phase 2b: Creating MetricDefinitions")
        print("=" * 70)

        # Get existing metric definitions
        cur.execute('SELECT "metricKey", "sourceVariable" FROM "MetricDefinition"')
        existing_defs = {}
        for mk, sv in cur.fetchall():
            if sv:
                existing_defs[sv.lower()] = mk

        metric_defs_created = 0
        tables_to_process = []

        for csv_file in sorted(os.listdir(DATA_DIR)):
            if not csv_file.endswith('.csv'):
                continue
            table_name = csv_file.replace('.csv', '')
            config = TABLE_CONFIGS.get(table_name)
            if config and config.get('priority') == 'skip':
                continue
            if not config:
                # Auto-detect: must have UNITID or unitid column
                filepath = os.path.join(DATA_DIR, csv_file)
                with open(filepath, 'r', errors='replace') as f:
                    header_line = f.readline().strip()
                    headers = [h.strip().strip('"') for h in header_line.split(',')]
                    if 'UNITID' not in headers and 'unitid' not in headers:
                        continue
                    unit_col = 'UNITID' if 'UNITID' in headers else 'unitid'
                    config = {'unit_col': unit_col, 'row_keys': [], 'priority': 'low'}

            filepath = os.path.join(DATA_DIR, csv_file)
            with open(filepath, 'r', errors='replace') as f:
                reader = csv.DictReader(f)
                headers = [h.strip() for h in reader.fieldnames]
                unit_col = config['unit_col']
                row_keys = config.get('row_keys', [])

                for col in headers:
                    if col == unit_col or col in row_keys:
                        continue
                    key = col.lower()
                    if key in existing_defs:
                        continue

                    mk = f"{table_name}_{key}"
                    cur.execute("""
                        INSERT INTO "MetricDefinition"
                        ("metricKey", "labelEn", "labelZh", "valueType", "unit",
                         "displayFormat", "higherIsBetter", "sourceSystem", "sourceTable",
                         "sourceVariable", "missingValuePolicy", "isPublicVisible", "version",
                         "createdAt", "updatedAt")
                        VALUES (%s, %s, NULL, 'numeric', NULL, 'number', NULL,
                                'IPEDS', %s, %s, '-2 = suppressed/missing', true, %s,
                                now(), now())
                        ON CONFLICT DO NOTHING
                    """, (mk, col.replace('_', ' ').title(), table_name, col, RELEASE_KEY))
                    metric_defs_created += 1
                    existing_defs[key] = mk

            tables_to_process.append((csv_file, table_name, config))

        conn.commit()
        print(f"  Created {metric_defs_created} MetricDefinition records")
        print(f"  Tables to process: {len(tables_to_process)}")

        # Build metricKey lookup: table.column -> metricKey
        cur.execute('SELECT "metricKey", "sourceTable", "sourceVariable" FROM "MetricDefinition" WHERE "sourceSystem"=\'IPEDS\'')
        metric_key_lookup = {}
        for mk, st, sv in cur.fetchall():
            metric_key_lookup[(st.lower(), sv.lower())] = mk

        # ─────────────────────────────────────────────────────────────
        # Phase 3: Ingest InstitutionMetric
        # ─────────────────────────────────────────────────────────────
        print("\n" + "=" * 70)
        print("Phase 3: Ingesting InstitutionMetrics")
        print("=" * 70)

        total_metrics = 0

        for csv_file, table_name, config in tables_to_process:
            if config.get('priority') == 'program':
                continue  # Skip program tables, handle separately

            filepath = os.path.join(DATA_DIR, csv_file)
            total_rows = count_rows(filepath)
            unit_col = config['unit_col']

            print(f"\n  Processing {csv_file} ({total_rows:,} rows)...")

            batch = []
            table_metrics = 0

            for headers, chunk in read_csv_chunks(filepath, chunk_size=20000):
                for row in chunk:
                    unit_id = row.get(unit_col, '').strip()
                    if not unit_id or unit_id not in unit_id_to_uni_id:
                        continue

                    uni_id = unit_id_to_uni_id[unit_id]
                    row_suffix = get_row_suffix(row, config)

                    for col in headers:
                        if col == unit_col or col in config.get('row_keys', []):
                            continue

                        val = row[col]
                        num = parse_num(val)
                        if num is None and (not val or val.strip() == '' or val.strip() == '-2'):
                            continue

                        mk = metric_key_lookup.get((table_name, col.lower()))
                        if not mk:
                            continue

                        vid = make_verification_id(table_name, unit_id, col, row, config)
                        status = 'NUMERIC' if num is not None else 'TEXT'

                        batch.append((
                            mk, uni_id, unit_id, num, val, status,
                            'SUPPRESSED' if val.strip() == '-2' else None,
                            val, '2024', 'IPEDS', table_name, col,
                            RELEASE_KEY, vid
                        ))

                        if len(batch) >= BATCH_SIZE:
                            table_metrics += insert_metrics_batch(cur, batch)
                            batch = []

                conn.commit()

            if batch:
                table_metrics += insert_metrics_batch(cur, batch)
                batch = []
                conn.commit()

            total_metrics += table_metrics
            matched = sum(1 for r in [unit_id for unit_id in unit_id_to_uni_id])
            print(f"    -> {table_metrics:,} metrics inserted")

        print(f"\n  Total InstitutionMetrics: {total_metrics:,}")

        # ─────────────────────────────────────────────────────────────
        # Phase 4: Ingest InstitutionProgramField (c2024_*.csv)
        # ─────────────────────────────────────────────────────────────
        print("\n" + "=" * 70)
        print("Phase 4: Ingesting InstitutionProgramFields")
        print("=" * 70)

        # Ensure all CIP codes exist first
        cip_files = [(f, TABLE_CONFIGS[f.replace('.csv', '')]) for f in os.listdir(DATA_DIR)
                     if f.startswith('c2024') and f.endswith('.csv')
                     and TABLE_CONFIGS.get(f.replace('.csv', ''), {}).get('priority') == 'program']

        all_cip_codes = set()
        total_prog_rows = 0
        for csv_file, config in cip_files:
            filepath = os.path.join(DATA_DIR, csv_file)
            total_prog_rows += count_rows(filepath)

        print(f"  Total completion records: {total_prog_rows:,}")

        # Collect CIP codes
        for csv_file, config in cip_files:
            filepath = os.path.join(DATA_DIR, csv_file)
            with open(filepath, 'r', errors='replace') as f:
                reader = csv.DictReader(f)
                unit_col = config['unit_col']
                for row in reader:
                    cip = row.get('CIPCODE', '').strip()
                    if cip:
                        all_cip_codes.add(cip)

        print(f"  Unique CIP codes: {len(all_cip_codes)}")

        # Create missing CIP codes
        cur.execute("SELECT code FROM \"CipCode\"")
        existing_cips = {r[0] for r in cur.fetchall()}
        cip_created = 0
        for code in all_cip_codes:
            if code not in existing_cips:
                cur.execute("""
                    INSERT INTO "CipCode" ("code", "title", "version", "level")
                    VALUES (%s, %s, 'CIP2020', %s)
                """, (code, f"CIP {code}", 'PROGRAM' if '.' in code else '2-DIGIT'))
                cip_created += 1
        conn.commit()
        print(f"  Created {cip_created} new CIP codes")

        # Degree level mapping
        def awlevel_to_degree(aw):
            mapping = {
                '5': 'BACHELOR', '7': 'MASTER', '17': 'DOCTORAL',
                '8': 'ASSOCIATE', '2': 'CERTIFICATE', '3': 'CERTIFICATE',
                '12': 'CERTIFICATE', '13': 'CERTIFICATE', '14': 'CERTIFICATE',
                '15': 'CERTIFICATE',
            }
            return mapping.get(aw, 'OTHER')

        total_programs = 0

        for csv_file, config in cip_files:
            filepath = os.path.join(DATA_DIR, csv_file)
            total_rows = count_rows(filepath)
            unit_col = config['unit_col']
            table_name = csv_file.replace('.csv', '')
            print(f"\n  Processing {csv_file} ({total_rows:,} rows)...")

            batch = []
            table_progs = 0

            for headers, chunk in read_csv_chunks(filepath, chunk_size=20000):
                for row in chunk:
                    uid = row.get(unit_col, '').strip()
                    if not uid or uid not in unit_id_to_uni_id:
                        continue

                    uni_id = unit_id_to_uni_id[uid]
                    cip_code = row.get('CIPCODE', '').strip()
                    aw_level = row.get('AWLEVEL', '').strip()
                    c_total = parse_num(row.get('CTOTALT', ''))

                    if not cip_code or not aw_level:
                        continue

                    degree_level = awlevel_to_degree(aw_level)
                    vid = f"{table_name}_{uid}_{cip_code}_{aw_level}_{RELEASE_KEY}"

                    batch.append((
                        uni_id, uid, cip_code,
                        f"CIP {cip_code} / Level {aw_level}",
                        degree_level, 'COMPLETIONS',
                        int(c_total) if c_total is not None else None,
                        'ACTIVE', 'NUMERIC' if c_total is not None else 'MISSING',
                        'IPEDS', table_name, 'CTOTALT',
                        RELEASE_KEY, vid
                    ))

                    if len(batch) >= BATCH_SIZE:
                        insert_programs_batch(cur, batch)
                        table_progs += len(batch)
                        batch = []

                conn.commit()

            if batch:
                insert_programs_batch(cur, batch)
                table_progs += len(batch)
                batch = []
                conn.commit()

            total_programs += table_progs
            print(f"    -> {table_progs:,} program records")

        print(f"\n  Total InstitutionProgramFields: {total_programs:,}")

        # ─────────────────────────────────────────────────────────────
        # Final Summary
        # ─────────────────────────────────────────────────────────────
        print("\n" + "=" * 70)
        elapsed = time.time() - start
        print(f"IPEDS Ingestion Complete ({elapsed:.1f}s)")
        print("=" * 70)

        cur.execute('SELECT COUNT(*) FROM "University"')
        print(f"  Universities: {cur.fetchone()[0]:,}")

        cur.execute('SELECT COUNT(*) FROM "InstitutionCandidate"')
        print(f"  InstitutionCandidates: {cur.fetchone()[0]:,}")

        cur.execute('SELECT COUNT(*) FROM "MetricDefinition"')
        print(f"  MetricDefinitions: {cur.fetchone()[0]:,}")

        cur.execute('SELECT COUNT(*) FROM "InstitutionMetric"')
        print(f"  InstitutionMetrics: {cur.fetchone()[0]:,}")

        cur.execute('SELECT COUNT(*) FROM "InstitutionProgramField"')
        print(f"  InstitutionProgramFields: {cur.fetchone()[0]:,}")

        cur.execute('SELECT COUNT(*) FROM "CipCode"')
        print(f"  CIP Codes: {cur.fetchone()[0]:,}")

        cur.execute('SELECT COUNT(DISTINCT "universityId") FROM "InstitutionMetric" WHERE "universityId" IS NOT NULL')
        print(f"  Universities with metrics: {cur.fetchone()[0]:,}")

        cur.execute('SELECT COUNT(DISTINCT "universityId") FROM "InstitutionProgramField" WHERE "universityId" IS NOT NULL')
        print(f"  Universities with programs: {cur.fetchone()[0]:,}")

        conn.commit()

    except Exception as e:
        conn.rollback()
        print(f"\nERROR: {e}")
        import traceback
        traceback.print_exc()
    finally:
        cur.close()
        conn.close()


def insert_metrics_batch(cur, batch):
    """Batch insert InstitutionMetrics, de-duplicating by verificationId."""
    import uuid
    # De-duplicate by verificationId (last value wins, index 14 is verificationId)
    seen = {}
    for row in batch:
        vid = row[-1]  # verificationId is last field
        seen[vid] = row
    deduped = list(seen.values())

    rows_with_id = [(str(uuid.uuid4()),) + row for row in deduped]
    psycopg2.extras.execute_values(
        cur, """
            INSERT INTO "InstitutionMetric" (
                "id", "metricKey", "universityId", "unitId", "valueNumeric",
                "valueText", "valueStatus", "missingReason", "rawValue",
                "academicYear", "sourceSystem", "sourceTable", "sourceVariable",
                "releaseKey", "verificationId"
            ) VALUES %s
            ON CONFLICT ("verificationId") DO UPDATE SET
                "valueNumeric" = EXCLUDED."valueNumeric",
                "valueStatus" = EXCLUDED."valueStatus",
                "releaseKey" = EXCLUDED."releaseKey"
        """, rows_with_id, page_size=BATCH_SIZE
    )
    return len(deduped)


def insert_programs_batch(cur, batch):
    """Batch insert InstitutionProgramFields using upsert with gen_random_uuid()."""
    import uuid
    for row in batch:
        cur.execute("""
            INSERT INTO "InstitutionProgramField" (
                "id", "universityId", "unitId", "cipCode", "displayTitle",
                "degreeLevel", "sourceType", "completionsTotal",
                "activityStatus", "valueStatus", "sourceSystem",
                "sourceTable", "sourceVariable", "releaseKey", "verificationId"
            ) VALUES (gen_random_uuid(), %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT ("unitId", "cipCode", "degreeLevel", "releaseKey", "sourceType") DO UPDATE SET
                "completionsTotal" = EXCLUDED."completionsTotal",
                "valueStatus" = EXCLUDED."valueStatus"
        """, row)


if __name__ == '__main__':
    main()
