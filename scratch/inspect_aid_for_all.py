import os
import psycopg2
from pathlib import Path
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).resolve().parents[1]
load_dotenv(ROOT_DIR / ".env")

DB_URL = os.getenv("DATABASE_URL").split('?')[0]

def inspect_aid():
    conn = psycopg2.connect(DB_URL)
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT i.name, cv.canonical_path, cv.value_number, cv.value_text
        FROM cds_values cv
        JOIN cds_documents cd ON cv.document_id = cd.id
        JOIN institutions i ON cd.institution_id = i.id
        WHERE cv.section_code = 'H_FinancialAid'
          AND (cv.canonical_path LIKE '%average%' OR cv.canonical_path LIKE '%avg%')
          AND cv.value_number IS NOT NULL AND cv.value_number > 0
        ORDER BY i.name, cv.canonical_path
    """)
    print("=== POPULATED FINANCIAL AID METRICS BY UNIVERSITY ===")
    for row in cursor.fetchall():
        print(f"Uni: {row[0]:<35} | Path: {row[1][:60]:<60} | Val: {row[2]}")
        
    cursor.close()
    conn.close()

if __name__ == "__main__":
    inspect_aid()
