#!/usr/bin/env python3
import os
import sys
import psycopg2
from matcher import get_connection, couple_custom_programs

def run_integration_test():
    print("🧪 Running Integration Test for Automatic Coupling of Custom Programs...")
    
    # 1. Fetch a valid university and school from the database
    conn = get_connection(register=False)
    university_id = None
    school_id = None
    try:
        with conn.cursor() as cur:
            cur.execute('SELECT "id" FROM "University" LIMIT 1')
            row_univ = cur.fetchone()
            if not row_univ:
                print("❌ Error: No University found in the database. Please run prisma seeds first.")
                sys.exit(1)
            university_id = row_univ[0]
            
            cur.execute('SELECT "id" FROM "School" WHERE "universityId" = %s LIMIT 1', (university_id,))
            row_school = cur.fetchone()
            if row_school:
                school_id = row_school[0]
    finally:
        conn.close()

    print(f"Using University ID: {university_id}, School ID: {school_id}")

    # 2. Insert test custom majors that are not yet coupled (isValidated = False, mappingScore = 0.0)
    test_majors = [
        {"customName": "Advanced Computational Data Science & Machine Learning", "customCode": "TEST_CS_01"},
        {"customName": "Honors Electrical & Computer Systems Engineering", "customCode": "TEST_EE_02"},
        {"customName": "Bilingual Business Communication & Global Media Studies", "customCode": "TEST_COMMS_03"},
        {"customName": "应用数学与计算科学 (Applied Math & Computing)", "customCode": "TEST_AM_04"},
        {"customName": "临床医学与公共卫生管理 (Clinical Medicine & Health Administration)", "customCode": "TEST_MED_05"},
        {"customName": "Mundane Studies and Arcane Magic", "customCode": "TEST_NULL_06"}
    ]

    print("\nInserting test unvalidated custom programs...")
    conn = get_connection(register=False)
    inserted_ids = []
    try:
        with conn.cursor() as cur:
            # We need a temporary standardMajorId during insertion because of foreign key constraint.
            # Let's fetch one valid standard major ID to use as a temporary placeholder.
            cur.execute('SELECT "id" FROM "Major" LIMIT 1')
            placeholder_id = cur.fetchone()[0]
            
            for m in test_majors:
                cur.execute(
                    '''
                    INSERT INTO "UniversityMajorAssociation" 
                    ("id", "universityId", "schoolId", "customName", "customCode", "standardMajorId", "mappingScore", "isValidated")
                    VALUES (gen_random_uuid(), %s, %s, %s, %s, %s, 0.0, FALSE)
                    RETURNING "id"
                    ''',
                    (university_id, school_id, m["customName"], m["customCode"], placeholder_id)
                )
                inserted_ids.append(cur.fetchone()[0])
        conn.commit()
        print(f"Successfully inserted {len(inserted_ids)} unvalidated test custom programs.")
    except Exception as e:
        conn.rollback()
        print(f"❌ Error during test insertion: {e}")
        sys.exit(1)
    finally:
        conn.close()

    # 3. Execute Automatic Coupling
    print("\nRunning automatic coupling backend function...")
    try:
        couple_custom_programs()
        print("Automatic coupling executed successfully!")
    except Exception as e:
        print(f"❌ Error executing coupling: {e}")
        sys.exit(1)

    # 4. Verify results
    print("\nVerifying coupling results in the database...")
    conn = get_connection(register=False)
    try:
        with conn.cursor() as cur:
            cur.execute(
                '''
                SELECT a."customName", a."customCode", a."mappingScore", a."isValidated", m."nameEn", m."nameZh"
                FROM "UniversityMajorAssociation" a
                LEFT JOIN "Major" m ON a."standardMajorId" = m."id"
                WHERE a."id" = ANY(%s)
                ''',
                (inserted_ids,)
            )
            rows = cur.fetchall()
            
            print("\n" + "="*95)
            print(f"{'CUSTOM NAME':<40} | {'MAPPED STANDARD MAJOR':<30} | {'SCORE':<8} | {'AUDITED':<7}")
            print("="*95)
            null_count = 0
            for row in rows:
                custom_name, code, score, audited, std_en, std_zh = row
                std_display = std_en if std_en else "NULL (Unmapped)"
                print(f"{custom_name[:40]:<40} | {std_display[:30]:<30} | {score:.4f} | {str(audited):<7}")
                if not std_en:
                    null_count += 1
            print("="*95)
            
            # Assertions
            assert null_count >= 1, f"Error: Expected at least 1 program to be unmapped (< 0.85), got {null_count}"
            for row in rows:
                custom_name, code, score, audited, std_en, std_zh = row
                assert score > 0.0, f"Error: Score should be greater than 0.0, got {score}"
                assert audited is False, f"Error: Audited flag (isValidated) should be False, got {audited}"
                if code == "TEST_NULL_06":
                    assert std_en is None, f"Error: 'Mundane Studies and Arcane Magic' should have matched < 0.85 and saved standardMajorId = NULL, got: {std_en}"
            
            print("\n✅ Verification Successful: Unmappable program correctly saved with NULL standardMajorId, and highly similar majors coupled correctly!")
            
    except AssertionError as ae:
        print(f"\n❌ Assertion Failed: {ae}")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Verification Error: {e}")
        sys.exit(1)
    finally:
        # 5. Clean up test records
        print("\nCleaning up integration test records from the database...")
        try:
            with conn.cursor() as cur:
                cur.execute('DELETE FROM "UniversityMajorAssociation" WHERE "id" = ANY(%s)', (inserted_ids,))
            conn.commit()
            print("🧹 Cleanup completed. Database is clean!")
        except Exception as e:
            conn.rollback()
            print(f"⚠️ Error cleaning up records: {e}")
        conn.close()

if __name__ == '__main__':
    run_integration_test()
