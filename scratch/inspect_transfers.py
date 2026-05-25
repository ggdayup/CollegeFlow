import os
import psycopg2
from pathlib import Path
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).resolve().parents[1]
load_dotenv(ROOT_DIR / ".env")

DB_URL = os.getenv("DATABASE_URL").split('?')[0]

def inspect_transfers():
    conn = psycopg2.connect(DB_URL)
    cursor = conn.cursor()
    
    school_ids = [6, 12]
    for sid in school_ids:
        cursor.execute("SELECT name FROM institutions WHERE id = %s", (sid,))
        name = cursor.fetchone()[0]
        print(f"\n=== {name} ===")
        cursor.execute("""
            SELECT canonical_path, value_type, value_number, value_text, value_boolean
            FROM cds_values
            WHERE document_id = %s AND section_code = 'D_Transfers'
              AND (canonical_path LIKE '%%applicants%%' OR canonical_path LIKE '%%admitted%%' OR canonical_path LIKE '%%grade%%' OR canonical_path LIKE '%%max_credits%%' OR canonical_path LIKE '%%enroll%%')
            ORDER BY canonical_path
        """, (sid,))
        for row in cursor.fetchall():
            val = row[2] or row[3] or row[4]
            print(f"Path: {row[0]:<75} | Val: {val}")
            
    cursor.close()
    conn.close()

if __name__ == "__main__":
    inspect_transfers()
