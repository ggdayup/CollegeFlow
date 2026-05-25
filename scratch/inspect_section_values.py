import os
import psycopg2
from pathlib import Path
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).resolve().parents[1]
load_dotenv(ROOT_DIR / ".env")

DB_URL = os.getenv("DATABASE_URL").split('?')[0]

def inspect_values():
    conn = psycopg2.connect(DB_URL)
    cursor = conn.cursor()
    
    # Check Section G (Expenses) for Harvard (ID: 3) and Princeton (ID: 1)
    print("=== HARVARD (ID: 3) SECTION G (EXPENSES) ===")
    cursor.execute("""
        SELECT canonical_path, value_type, value_text, value_number, value_boolean
        FROM cds_values
        WHERE document_id = 3 AND section_code = 'G_Expenses'
        ORDER BY canonical_path
    """)
    for row in cursor.fetchall():
        val = row[2] or row[3] or row[4]
        print(f"Path: {row[0]:<70} | Type: {row[1]:<8} | Val: {val}")
        
    print("\n=== PRINCETON (ID: 1) SECTION G (EXPENSES) ===")
    cursor.execute("""
        SELECT canonical_path, value_type, value_text, value_number, value_boolean
        FROM cds_values
        WHERE document_id = 1 AND section_code = 'G_Expenses'
        ORDER BY canonical_path
    """)
    for row in cursor.fetchall():
        val = row[2] or row[3] or row[4]
        print(f"Path: {row[0]:<70} | Type: {row[1]:<8} | Val: {val}")

    # Check Section H (Financial Aid) for Harvard
    print("\n=== HARVARD (ID: 3) SECTION H (FINANCIAL AID) - SELECTED PATHS ===")
    cursor.execute("""
        SELECT canonical_path, value_type, value_number, value_text
        FROM cds_values
        WHERE document_id = 3 AND section_code = 'H_FinancialAid' 
          AND (canonical_path LIKE '%need%' OR canonical_path LIKE '%scholarship%' OR canonical_path LIKE '%average%')
        ORDER BY canonical_path
        LIMIT 25
    """)
    for row in cursor.fetchall():
        val = row[2] or row[3]
        print(f"Path: {row[0]:<70} | Type: {row[1]:<8} | Val: {val}")

    # Check Section D (Transfers) for UPenn (ID: 6)
    print("\n=== UPENN (ID: 6) SECTION D (TRANSFERS) - SELECTED PATHS ===")
    cursor.execute("""
        SELECT canonical_path, value_type, value_number, value_text
        FROM cds_values
        WHERE document_id = 6 AND section_code = 'D_Transfers'
        ORDER BY canonical_path
        LIMIT 25
    """)
    for row in cursor.fetchall():
        val = row[2] or row[3]
        print(f"Path: {row[0]:<70} | Type: {row[1]:<8} | Val: {val}")

    cursor.close()
    conn.close()

if __name__ == "__main__":
    inspect_values()
