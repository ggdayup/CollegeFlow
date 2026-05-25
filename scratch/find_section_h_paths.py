import os
import psycopg2
from pathlib import Path
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).resolve().parents[1]
load_dotenv(ROOT_DIR / ".env")

DB_URL = os.getenv("DATABASE_URL").split('?')[0]

def find_h_paths():
    conn = psycopg2.connect(DB_URL)
    cursor = conn.cursor()
    
    # Query all unique canonical paths in Section H that are populated in the database
    cursor.execute("""
        SELECT canonical_path, count(*), AVG(value_number)
        FROM cds_values
        WHERE section_code = 'H_FinancialAid'
        GROUP BY canonical_path
        ORDER BY count(*) DESC
        LIMIT 50
    """)
    print("=== POPULAR SECTION H PATHS ===")
    for row in cursor.fetchall():
        print(f"Path: {row[0]:<75} | Count: {row[1]:<3} | Avg Val: {row[2]}")
        
    cursor.close()
    conn.close()

if __name__ == "__main__":
    find_h_paths()
