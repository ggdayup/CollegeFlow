import os
import psycopg2
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), "../../../../.env"))

def get_db_connection():
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        # Fallback if not found
        db_url = "postgresql://postgres:postgres@127.0.0.1:35432/college_major?schema=public"
    
    # Clean Prisma-specific parameters like ?schema=public before passing to psycopg2
    if "?" in db_url:
        db_url = db_url.split("?")[0]
        
    return psycopg2.connect(db_url)

def init_ipeds_db():
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        print("Dropping existing tables if necessary...")
        cur.execute("DROP TABLE IF EXISTS ipeds_values;")
        cur.execute("DROP TABLE IF EXISTS ipeds_dictionary;")

        print("Creating table: ipeds_values...")
        cur.execute("""
            CREATE TABLE ipeds_values (
                unitid VARCHAR(50),
                academic_year VARCHAR(20),
                source_table VARCHAR(100),
                row_index INTEGER,
                variable_name VARCHAR(100),
                value_text TEXT,
                value_numeric NUMERIC,
                PRIMARY KEY (unitid, academic_year, source_table, row_index, variable_name)
            );
        """)

        print("Creating index on unitid for faster lookups...")
        cur.execute("""
            CREATE INDEX IF NOT EXISTS idx_ipeds_values_unitid
            ON ipeds_values (unitid);
        """)

        print("Creating index on source_table and variable_name for faster metric extraction...")
        cur.execute("""
            CREATE INDEX IF NOT EXISTS idx_ipeds_values_table_var
            ON ipeds_values (source_table, variable_name);
        """)

        print("Creating table: ipeds_dictionary...")
        cur.execute("""
            CREATE TABLE IF NOT EXISTS ipeds_dictionary (
                source_table VARCHAR(100),
                variable_name VARCHAR(100),
                label TEXT,
                value_type VARCHAR(50),
                PRIMARY KEY (source_table, variable_name)
            );
        """)

        conn.commit()
        print("Successfully initialized IPEDS database tables.")
    except Exception as e:
        conn.rollback()
        print(f"Error initializing database: {e}")
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    init_ipeds_db()
