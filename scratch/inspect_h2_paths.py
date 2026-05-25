import os
import psycopg2
from pathlib import Path
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).resolve().parents[1]
load_dotenv(ROOT_DIR / ".env")

DB_URL = os.getenv("DATABASE_URL").split('?')[0]

def inspect_h2():
    conn = psycopg2.connect(DB_URL)
    cursor = conn.cursor()
    
    # Query paths in H that have "average" in the path or name
    cursor.execute("""
        SELECT canonical_path, count(*), AVG(value_number)
        FROM cds_values
        WHERE section_code = 'H_FinancialAid' AND (canonical_path LIKE '%average%' OR canonical_path LIKE '%avg%')
        GROUP BY canonical_path
        ORDER BY count(*) DESC
    """)
    print("=== POPULAR SECTION H AVERAGE AID PATHS ===")
    for row in cursor.fetchall():
        print(f"Path: {row[0]:<85} | Count: {row[1]:<3} | Avg Val: {row[2]}")
        
    cursor.close()
    conn.close()

if __name__ == "__main__":
    inspect_h2()
