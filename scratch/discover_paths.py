import os
import psycopg2
from pathlib import Path
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).resolve().parents[1]
load_dotenv(ROOT_DIR / ".env")

DB_URL = os.getenv("DATABASE_URL").split('?')[0]

def discover():
    conn = psycopg2.connect(DB_URL)
    cursor = conn.cursor()
    
    # 1. Search for SAT/ACT paths
    print("=== SEARCH FOR SAT/ACT PATHS ===")
    cursor.execute("""
        SELECT section_code, canonical_path, value_kind
        FROM canonical_fields
        WHERE canonical_path LIKE '%sat_%' OR canonical_path LIKE '%test_scores%' OR canonical_path LIKE '%percentile%'
        ORDER BY canonical_path
        LIMIT 25
    """)
    for row in cursor.fetchall():
        print(f"Sec: {row[0]:<15} | Path: {row[1]:<70} | Kind: {row[2]}")

    # 2. Search for Financial Aid / Tuition paths
    print("\n=== SEARCH FOR TUITION / EXPENSES / FINANCIAL AID PATHS ===")
    cursor.execute("""
        SELECT section_code, canonical_path, value_kind
        FROM canonical_fields
        WHERE canonical_path LIKE '%tuition%' OR canonical_path LIKE '%room%' OR canonical_path LIKE '%financial%' OR canonical_path LIKE '%need_based%'
        ORDER BY canonical_path
        LIMIT 25
    """)
    for row in cursor.fetchall():
        print(f"Sec: {row[0]:<15} | Path: {row[1]:<70} | Kind: {row[2]}")

    # 3. Search for Transfer paths
    print("\n=== SEARCH FOR TRANSFER PATHS ===")
    cursor.execute("""
        SELECT section_code, canonical_path, value_kind
        FROM canonical_fields
        WHERE canonical_path LIKE '%transfer%'
        ORDER BY canonical_path
        LIMIT 25
    """)
    for row in cursor.fetchall():
        print(f"Sec: {row[0]:<15} | Path: {row[1]:<70} | Kind: {row[2]}")

    cursor.close()
    conn.close()

if __name__ == "__main__":
    discover()
