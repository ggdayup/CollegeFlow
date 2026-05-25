import os
import psycopg2
from pathlib import Path
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).resolve().parents[1]
load_dotenv(ROOT_DIR / ".env")

DB_URL = os.getenv("DATABASE_URL").split('?')[0]

def list_unis():
    conn = psycopg2.connect(DB_URL)
    cursor = conn.cursor()
    cursor.execute("""
        SELECT i.id, i.name, d.academic_year, d.id as doc_id
        FROM institutions i
        LEFT JOIN cds_documents d ON d.institution_id = i.id
        ORDER BY i.name
    """)
    rows = cursor.fetchall()
    print("=== SEEDED INSTITUTIONS & CDS DOCUMENTS ===")
    for row in rows:
        print(f"ID: {row[0]:<3} | Name: {row[1]:<35} | Year: {row[2]:<10} | Doc ID: {row[3]}")
    cursor.close()
    conn.close()

if __name__ == "__main__":
    list_unis()
