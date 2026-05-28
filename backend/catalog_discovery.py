#!/usr/bin/env python3
import os
import re
import sys
import copy
import uuid
import argparse
import requests
from bs4 import BeautifulSoup

# Add current directory to path so we can import from matcher
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from backend.matcher import get_connection, couple_custom_programs

def slugify(text):
    """
    Generates a clean slug from English text.
    """
    text = text.lower().strip()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return text.strip('-')

class BaseCatalogParser:
    def __init__(self, university_id, catalog_url):
        self.university_id = university_id
        self.catalog_url = catalog_url

    def parse(self, html_content):
        """
        Parses HTML content and returns a list of dictionaries:
        [
            {
                "program_name": "Computer Science",
                "school_name": "George R. Brown School of Engineering and Computing",
                "degrees": [
                    {
                        "deg_text": "BS",
                        "url": "https://ga.rice.edu/programs-study/departments-programs/engineering/computer-science/computer-science-bs/"
                    }
                ],
                "dept_url": "https://ga.rice.edu/programs-study/departments-programs/engineering/computer-science"
            }
        ]
        """
        raise NotImplementedError("Subclasses must implement the parse method.")


class RiceCatalogParser(BaseCatalogParser):
    def parse(self, html_content):
        soup = BeautifulSoup(html_content, "lxml")
        rows = soup.find_all("tr", role="row")
        
        extracted_programs = []
        current_school = "General Undergraduate Division"
        
        for row in rows:
            # 1. Check for School Header row
            # Rice table groups programs using tr.areaheader with a th span
            if "areaheader" in row.get("class", []):
                th = row.find("th")
                if th:
                    current_school = th.get_text(strip=True)
                continue
                
            # If row contains a th, it could also be a header
            th = row.find("th")
            if th and th.get("scope") == "col" and row.find("td") is None:
                current_school = th.get_text(strip=True)
                continue
                
def is_real_school(name):
    """
    Checks if the parsed header is a genuine university academic school division,
    filtering out degree titles, certificates, and minors.
    """
    n = name.lower()
    for ignore in ["bachelor of", "master of", "doctor of", "artist diploma", "diploma in", "certificate", "minor"]:
        if ignore in n:
            return False
    return True

class RiceCatalogParser(BaseCatalogParser):
    def parse(self, html_content):
        soup = BeautifulSoup(html_content, "lxml")
        rows = soup.find_all("tr", role="row")
        
        extracted_programs = []
        current_school = None
        
        for row in rows:
            # 1. Check for School Header row
            # Rice table groups programs using tr.areaheader with a th span
            if "areaheader" in row.get("class", []):
                th = row.find("th")
                if th:
                    header_name = th.get_text(strip=True)
                    if is_real_school(header_name):
                        current_school = header_name
                    else:
                        current_school = None
                continue
                
            # If row contains a th, it could also be a header
            th = row.find("th")
            if th and th.get("scope") == "col" and row.find("td") is None:
                header_name = th.get_text(strip=True)
                if is_real_school(header_name):
                    current_school = header_name
                else:
                    current_school = None
                continue
                
            # Skip rows if they fall under non-school categories (like degree types) or at the start
            if not current_school:
                continue
                
            # 2. Parse Standard Program Data row
            cells = row.find_all("td")
            if len(cells) < 3:
                continue
                
            program_name = None
            undergrad_links = []
            dept_url = None
            
            for cell in cells:
                header_span = cell.find("span", class_="table-header-text")
                header_text = header_span.get_text(strip=True).lower() if header_span else ""
                
                # Clone the cell and decompose the table header text to isolate content
                cell_copy = copy.copy(cell)
                h_span = cell_copy.find("span", class_="table-header-text")
                if h_span:
                    h_span.decompose()
                cell_content = cell_copy.get_text(" ", strip=True)
                
                if "program" in header_text:
                    program_name = cell_content.replace("Program", "").strip()
                elif "department" in header_text:
                    a_link = cell.find("a")
                    if a_link and a_link.get("href"):
                        href = a_link.get("href")
                        if href.startswith("/"):
                            dept_url = "https://ga.rice.edu" + href
                        else:
                            dept_url = href
                elif "undergraduate" in header_text:
                    a_links = cell.find_all("a")
                    for a in a_links:
                        href = a.get("href")
                        deg_text = a.get_text(strip=True)
                        if href:
                            if href.startswith("/"):
                                full_url = "https://ga.rice.edu" + href
                            else:
                                full_url = href
                            undergrad_links.append((deg_text, full_url))
            
            # Filter degrees for bachelor's degrees only (starts with 'b', excluding minors)
            if program_name and undergrad_links:
                bachelor_paths = []
                for deg_text, url in undergrad_links:
                    deg = deg_text.lower().strip()
                    # Starts with 'b' like BA, BS, BSCS, BArch, BMus and not 'bus'
                    if deg.startswith("b") and not deg.startswith("bus") and "minor" not in deg:
                        bachelor_paths.append({
                            "deg_text": deg_text,
                            "url": url
                        })
                        
                if bachelor_paths:
                    extracted_programs.append({
                        "program_name": program_name,
                        "school_name": current_school,
                        "degrees": bachelor_paths,
                        "dept_url": dept_url
                    })
                    
        return extracted_programs



# Global registry of university catalog parsers
PARSER_REGISTRY = {
    "rice": RiceCatalogParser
}

def discover_university_catalog(university_id, catalog_url, dry_run=False):
    """
    Main discovery and ingestion controller.
    Scrapes the catalog URL, parses undergraduate programs, registers schools and custom majors,
    and runs coupling maps.
    """
    print(f"📡 Initiating dynamic catalog discovery for '{university_id}' from URL: {catalog_url}")
    
    # 1. Resolve custom parser
    parser_class = PARSER_REGISTRY.get(university_id.lower())
    if not parser_class:
        # Fallback to Rice parser if university has similar layout or let users know
        print(f"⚠️ No custom parser registered for '{university_id}'. Falling back to Rice table parser.")
        parser_class = RiceCatalogParser
        
    # 2. Fetch the catalog page HTML
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    try:
        response = requests.get(catalog_url, headers=headers, timeout=30)
        response.raise_for_status()
        html_content = response.text
    except Exception as e:
        print(f"❌ Failed to fetch catalog page from {catalog_url}: {e}")
        return False
        
    # 3. Parse programs and schools
    parser = parser_class(university_id, catalog_url)
    programs = parser.parse(html_content)
    
    print(f"✅ Discovered {len(programs)} authentic undergraduate bachelor program listings.")
    
    if dry_run:
        print("\n🔍 DRY RUN: Displaying the first 10 discovered programs:")
        for idx, prog in enumerate(programs[:10]):
            print(f"{idx+1}. Major: '{prog['program_name']}'")
            print(f"   School: '{prog['school_name']}'")
            print(f"   Dept Page: '{prog['dept_url']}'")
            for deg in prog["degrees"]:
                print(f"   ├─ Degree: {deg['deg_text']} | URL: {deg['url']}")
        return True
        
    # 4. Integrate and write to PostgreSQL database
    conn = get_connection(register=False)
    try:
        with conn.cursor() as cur:
            # First, make sure the target university exists
            cur.execute('SELECT "id" FROM "University" WHERE "id" = %s', (university_id,))
            if not cur.fetchone():
                print(f"❌ University ID '{university_id}' not found in the database. Please seed it first.")
                return False
                
            # Load existing schools for this university to avoid duplicate ID insertions
            cur.execute('SELECT "id", "nameEn" FROM "School" WHERE "universityId" = %s', (university_id,))
            school_map = {row[1].lower().strip(): row[0] for row in cur.fetchall()}
            
            # Step A: Purge old custom majors for this university to do a clean ingestion
            print(f"🧹 Purging existing custom majors for '{university_id}' to ensure 100% catalog catalog alignment...")
            cur.execute('DELETE FROM "UniversityMajorAssociation" WHERE "universityId" = %s', (university_id,))
            
            # Step B: Insert schools and majors dynamically
            inserted_schools = set()
            inserted_majors_count = 0
            
            for prog in programs:
                school_name = prog["school_name"]
                school_norm = school_name.lower().strip()
                
                # Check if school already exists
                school_id = school_map.get(school_norm)
                if not school_id:
                    # Generate a new unique school ID
                    school_id = f"{university_id}-{slugify(school_name)}"
                    print(f"🏫 Dynamically creating school: '{school_name}' (ID: {school_id})")
                    
                    cur.execute(
                        '''
                        INSERT INTO "School" ("id", "nameEn", "nameZh", "universityId")
                        VALUES (%s, %s, %s, %s)
                        ON CONFLICT ("id") DO UPDATE SET "nameEn" = EXCLUDED."nameEn"
                        ''',
                        (school_id, school_name, school_name, university_id)
                    )
                    school_map[school_norm] = school_id
                    
                # Insert the custom major
                custom_name = prog["program_name"]
                custom_code = f"{university_id}-{slugify(custom_name)}"
                
                # Each program may offer multiple bachelor's paths (e.g. BA and BArch).
                # We save the primary bachelor degree catalog URL.
                primary_deg = prog["degrees"][0]
                primary_url = primary_deg["url"]
                
                major_uuid = str(uuid.uuid4())
                
                cur.execute(
                    '''
                    INSERT INTO "UniversityMajorAssociation" (
                        "id", "universityId", "schoolId", "customName", "customCode",
                        "degreeLevel", "sourceUrl", "mappingScore", "isValidated"
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ''',
                    (
                        major_uuid, university_id, school_id, custom_name, custom_code,
                        "BACHELOR", primary_url, 0.0, False
                    )
                )
                inserted_majors_count += 1
                
        conn.commit()
        print(f"🎉 Successfully ingested {inserted_majors_count} custom majors and their schools into database.")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Database ingestion failed: {e}")
        return False
    finally:
        conn.close()
        
    # 5. Run automatic coupling via the SentenceTransformers hybrid matcher
    print("🧠 Initiating hybrid coupling semantic matching maps...")
    try:
        couple_custom_programs()
        print("✅ Coupling maps successfully calculated.")
    except Exception as match_err:
        print(f"⚠️ Semantic coupling mapping ran with warning: {match_err}")
        
    return True

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Official-Catalog-First Dynamic Major Ingestion Engine")
    parser.add_argument("--uni-id", required=True, help="University ID in the database (e.g. 'rice')")
    parser.add_argument("--url", required=True, help="University catalog index page URL")
    parser.add_argument("--dry-run", action="store_true", help="Scrape and show output without writing to DB")
    
    args = parser.parse_args()
    
    discover_university_catalog(
        university_id=args.uni_id,
        catalog_url=args.url,
        dry_run=args.dry_run
    )
