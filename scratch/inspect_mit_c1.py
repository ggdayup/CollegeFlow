import os
import psycopg2
from pathlib import Path
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).resolve().parents[1]
load_dotenv(ROOT_DIR / ".env")

DB_URL = os.getenv("DATABASE_URL").split('?')[0]

def inspect_mit():
    conn = psycopg2.connect(DB_URL)
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT canonical_path, value_type, value_number, value_text, value_boolean
        FROM cds_values
        WHERE document_id = 2 AND section_code = 'C_Admissions'
          AND (canonical_path LIKE '%c1%' OR canonical_path LIKE '%application%' OR canonical_path LIKE '%admit%')
        ORDER BY canonical_path
    """)
    print("=== MIT SECTION C PATHS ===")
    for row in cursor.fetchall():
        val = row[2] or row[3] or row[4]
        print(f"Path: {row[0]:<75} | Val: {val}")
        
    cursor.close()
    conn.close()

if __name__ == "__main__":
    inspect_mit()
