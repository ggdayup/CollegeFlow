#!/usr/bin/env python3
import os
import sys
import psycopg2
from pathlib import Path
from dotenv import load_dotenv

# Load root .env file from four levels up
ROOT_DIR = Path(__file__).resolve().parents[1]
load_dotenv(ROOT_DIR / ".env")

DB_URL = os.getenv("DATABASE_URL")
if not DB_URL:
    print("Error: DATABASE_URL not found in environment.")
    sys.exit(1)

def clean_db_url(url: str) -> str:
    if '?' in url:
        url = url.split('?')[0]
    return url

CLEAN_DB_URL = clean_db_url(DB_URL)

def run_analysis():
    print(f"Connecting to database to analyze: {CLEAN_DB_URL}")
    try:
        conn = psycopg2.connect(CLEAN_DB_URL)
        cursor = conn.cursor()
        
        # 1. Total Overview
        cursor.execute("SELECT COUNT(*) FROM institutions")
        uni_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM cds_documents")
        doc_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM cds_values")
        fact_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM canonical_fields")
        dict_count = cursor.fetchone()[0]
        
        print("\n" + "=" * 60)
        print("CDS DATABASE CONTENT SUMMARY & OVERVIEW")
        print("=" * 60)
        print(f"Institutions:    {uni_count}")
        print(f"Documents:       {doc_count}")
        print(f"Total Fact Rows: {fact_count:,}")
        print(f"Standard Fields: {dict_count}")
        
        # 2. Section Coverage Analysis
        print("\n" + "=" * 60)
        print("SECTION COVERAGE ANALYSIS")
        print("=" * 60)
        cursor.execute("""
            SELECT 
                section_code,
                COUNT(*) as row_count,
                COUNT(DISTINCT document_id) as covered_docs,
                COUNT(DISTINCT canonical_path) as unique_paths
            FROM cds_values
            GROUP BY section_code
            ORDER BY row_count DESC
        """)
        print(f"{'Section Code':<20} {'Facts Count':<12} {'Docs Covered':<12} {'Unique Paths'}")
        print("-" * 60)
        for row in cursor.fetchall():
            sec, count, docs, paths = row
            print(f"{sec:<20} {count:<12} {docs:<12} {paths}")
            
        # 3. Value Type Distribution
        print("\n" + "=" * 60)
        print("VALUE TYPE DISTRIBUTION")
        print("=" * 60)
        cursor.execute("""
            SELECT 
                value_type,
                COUNT(*) as count,
                ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM cds_values), 2) as percentage
            FROM cds_values
            GROUP BY value_type
            ORDER BY count DESC
        """)
        print(f"{'Value Type':<15} {'Count':<15} {'Percentage'}")
        print("-" * 60)
        for row in cursor.fetchall():
            vt, cnt, pct = row
            print(f"{vt:<15} {cnt:<15,} {pct}%")
            
        # 4. Insightful Metrics: Elite Academics Overview (SAT Math 75th and Acceptance Rates)
        print("\n" + "=" * 60)
        print("ELITE ADMISSION & ACADEMIC OUTCOMES INSIGHTS")
        print("=" * 60)
        # We need to extract applicants, admitted, and SAT math 75th from cds_values.
        # Let's write queries targeting specific standard canonical paths!
        # SAT Math 75th: C_Admissions.C9_test_scores.sat_math_75th (or C9_test_scores.sat_math.75th_percentile)
        # Applicants: C_Admissions.C1_applications.applicants.total
        # Admitted: C_Admissions.C1_applications.admitted.total
        
        cursor.execute("""
            WITH applicants AS (
                SELECT document_id, value_number::int as app_cnt
                FROM cds_values
                WHERE canonical_path = 'C_Admissions.c1_applications.applicants.total'
            ),
            admitted AS (
                SELECT document_id, value_number::int as adm_cnt
                FROM cds_values
                WHERE canonical_path = 'C_Admissions.c1_applications.admitted.total'
            ),
            sat_math AS (
                SELECT document_id, MAX(value_number)::int as sat_m75
                FROM cds_values
                WHERE canonical_path IN (
                    'C_Admissions.c9_test_scores.sat_math.75th_percentile',
                    'C_Admissions.c9_sat_act_scores.percentiles.sat_math.75th_percentile',
                    'C_Admissions.c9_sat_act_scores.sat_math.75th_percentile',
                    'C_Admissions.c9_sat_act_scores.sat_math_75th_percentile',
                    'C_Admissions.c9_first_time_first_year_profile.percentiles.sat_math.75th_percentile'
                )
                GROUP BY document_id
            )
            SELECT 
                i.name,
                d.academic_year,
                app.app_cnt,
                adm.adm_cnt,
                ROUND(adm.adm_cnt * 100.0 / app.app_cnt, 2) as acceptance_rate,
                sat.sat_m75
            FROM cds_documents d
            JOIN institutions i ON d.institution_id = i.id
            LEFT JOIN applicants app ON app.document_id = d.id
            LEFT JOIN admitted adm ON adm.document_id = d.id
            LEFT JOIN sat_math sat ON sat.document_id = d.id
            WHERE app.app_cnt IS NOT NULL AND adm.adm_cnt IS NOT NULL
            ORDER BY acceptance_rate ASC
        """)
        
        print(f"{'Institution':<28} {'Year':<10} {'Applicants':<12} {'Admitted':<10} {'Accept %':<10} {'SAT Math 75th'}")
        print("-" * 75)
        for row in cursor.fetchall():
            name, year, apps, adms, rate, sat = row
            sat_display = str(sat) if sat else "N/A"
            print(f"{name[:26]:<28} {year:<10} {apps:<12,} {adms:<10,} {rate:<10}% {sat_display}")
            
    except Exception as e:
        print(f"Error analyzing database: {e}")
        import traceback
        traceback.print_exc()
    finally:
        if 'conn' in locals() and conn:
            cursor.close()
            conn.close()

if __name__ == "__main__":
    run_analysis()
