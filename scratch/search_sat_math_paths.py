#!/usr/bin/env python3
import os
import sys
import psycopg2
from pathlib import Path
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).resolve().parents[1]
load_dotenv(ROOT_DIR / ".env")

DB_URL = os.getenv("DATABASE_URL")
if not DB_URL:
    print("Error: DATABASE_URL not found.")
    sys.exit(1)

def clean_db_url(url: str) -> str:
    if '?' in url:
        url = url.split('?')[0]
    return url

CLEAN_DB_URL = clean_db_url(DB_URL)

def search_paths():
    conn = psycopg2.connect(CLEAN_DB_URL)
    cursor = conn.cursor()
    
    # Let's search unique canonical_paths containing 'sat' and 'math' in cds_values
    cursor.execute("""
        SELECT DISTINCT canonical_path, COUNT(*)
        FROM cds_values
        WHERE canonical_path ILIKE '%sat%math%'
        GROUP BY canonical_path
        ORDER BY canonical_path
    """)
    print("=== Distinct Paths Mapped to SAT and Math ===")
    for row in cursor.fetchall():
        print(f"Path: {row[0]:<70} Count: {row[1]}")
        
    conn.close()

if __name__ == "__main__":
    search_paths()
