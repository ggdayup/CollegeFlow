import os
import csv
import psycopg2
import psycopg2.extras
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), "../../../../.env"))

def get_db_connection():
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        db_url = "postgresql://postgres:postgres@127.0.0.1:35432/college_major?schema=public"
    if "?" in db_url:
        db_url = db_url.split("?")[0]
    return psycopg2.connect(db_url)

def safe_float(val):
    try:
        if val.strip() == '':
            return None
        return float(val)
    except ValueError:
        return None

def ingest_directory(conn, dir_path, academic_year):
    path = Path(dir_path)
    if not path.exists():
        print(f"Directory {dir_path} does not exist, skipping.")
        return

    csv_files = list(path.glob("*.csv"))
    print(f"Found {len(csv_files)} CSV files in {dir_path}")

    cur = conn.cursor()
    
    # We will use execute_values for fast batch inserts
    insert_query = """
        INSERT INTO ipeds_values 
        (unitid, academic_year, source_table, row_index, variable_name, value_text, value_numeric)
        VALUES %s
        ON CONFLICT (unitid, academic_year, source_table, row_index, variable_name) DO NOTHING;
    """

    for csv_file in csv_files:
        source_table = csv_file.stem.lower()
        
        # Skip dictionary tables if they happen to be exported
        if source_table in ['tables23', 'tables24', 'vartable23', 'vartable24', 'valuesets23', 'valuesets24', 'newvariables23', 'newvariables24']:
            continue
            
        print(f"Ingesting {source_table} for {academic_year}...")
        
        batch = []
        batch_size = 10000
        
        # To avoid decoding issues with ISO-8859-1 or Windows-1252 used by IPEDS
        with open(csv_file, 'r', encoding='ISO-8859-1') as f:
            reader = csv.DictReader(f)
            
            # Normalize field names to deal with case changes
            fieldnames = reader.fieldnames
            unitid_col = None
            for fn in fieldnames:
                if fn.lower() == 'unitid':
                    unitid_col = fn
                    break
            
            if not unitid_col:
                print(f"Warning: No UNITID column found in {source_table}. Skipping.")
                continue

            row_index = 0
            for row in reader:
                unitid = row.get(unitid_col)
                if not unitid or str(unitid).strip() == '':
                    continue
                
                unitid = str(unitid).strip()
                row_index += 1
                
                for var_name, var_value in row.items():
                    if var_name == unitid_col or var_name is None:
                        continue
                        
                    var_name_clean = var_name.upper().strip()
                    if var_value is None:
                        continue
                    var_value_str = str(var_value).strip()
                    
                    if var_value_str == '':
                        continue
                        
                    val_num = safe_float(var_value_str)
                    val_text = None if val_num is not None else var_value_str
                    
                    batch.append((
                        unitid,
                        academic_year,
                        source_table,
                        row_index,
                        var_name_clean,
                        val_text,
                        val_num
                    ))
                    
                    if len(batch) >= batch_size:
                        psycopg2.extras.execute_values(cur, insert_query, batch)
                        conn.commit()
                        batch.clear()
            
            # Insert remaining
            if batch:
                psycopg2.extras.execute_values(cur, insert_query, batch)
                conn.commit()
                batch.clear()

        print(f"Finished {source_table}.")

    cur.close()

if __name__ == "__main__":
    conn = get_db_connection()
    try:
        # Resolve absolute paths from this file's location
        base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../../"))
        
        dir_2024 = os.path.join(base_dir, "data", "ipeds", "2024-25", "provisional")
        dir_2023 = os.path.join(base_dir, "data", "ipeds", "2023-24", "final")
        
        # Ingest 2024-25
        ingest_directory(conn, dir_2024, "2024-25")
        # Ingest 2023-24
        ingest_directory(conn, dir_2023, "2023-24")
        
        print("All IPEDS ingestion tasks completed successfully.")
    except Exception as e:
        print(f"An error occurred: {e}")
        conn.rollback()
    finally:
        conn.close()
