import os
import psycopg2
from pathlib import Path
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).resolve().parents[1]
load_dotenv(ROOT_DIR / ".env")

DB_URL = os.getenv("DATABASE_URL").split('?')[0]

def inspect_expenses():
    conn = psycopg2.connect(DB_URL)
    cursor = conn.cursor()
    
    school_ids = [1, 3, 8]
    for sid in school_ids:
        cursor.execute("SELECT name FROM institutions WHERE id = %s", (sid,))
        name = cursor.fetchone()[0]
        print(f"\n=== {name} ===")
        cursor.execute("""
            SELECT canonical_path, value_type, value_number, value_text
            FROM cds_values
            WHERE document_id = %s AND section_code = 'G_Expenses'
              AND (canonical_path LIKE '%%tuition%%' OR canonical_path LIKE '%%room%%' OR canonical_path LIKE '%%board%%' OR canonical_path LIKE '%%cost%%' OR canonical_path LIKE '%%fee%%')
            ORDER BY canonical_path
        """, (sid,))
        for row in cursor.fetchall():
            val = row[2] or row[3]
            print(f"Path: {row[0]:<75} | Val: {val}")
            
    cursor.close()
    conn.close()

if __name__ == "__main__":
    inspect_expenses()
