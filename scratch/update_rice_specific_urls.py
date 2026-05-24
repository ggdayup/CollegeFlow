#!/usr/bin/env python3
import os
import sys
from bs4 import BeautifulSoup

# Add backend directory to path
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), '../backend'))
from matcher import get_connection

def resolve_rice_specific_urls(dry_run=True):
    content_file = "/Users/ggdayup/.gemini/antigravity-cli/brain/5320baea-3c65-41a0-9ad8-a5f3fffa0e87/.system_generated/steps/1581/content.md"
    
    if not os.path.exists(content_file):
        print(f"❌ Content file not found at {content_file}")
        return
        
    with open(content_file, "r", encoding="utf-8") as f:
        html_content = f.read()
        
    soup = BeautifulSoup(html_content, "lxml")
    rows = soup.find_all("tr", role="row")
    
    # 1. Parse and index all undergraduate programs from official HTML
    # Key: normalized program name, Value: list of (degree_name, full_url)
    official_catalog = {}
    
    for row in rows:
        cells = row.find_all("td")
        if len(cells) < 4:
            continue
            
        program_span = cells[0].find("span", class_=None)
        if not program_span:
            program_name = cells[0].get_text(strip=True).replace("Program", "").strip()
        else:
            program_name = program_span.get_text(strip=True)
            
        if not program_name or program_name == "Program":
            continue
            
        # Get undergraduate degree links
        undergrad_cell = cells[3]
        links = undergrad_cell.find_all("a")
        
        deg_info = []
        for a in links:
            href = a.get("href")
            deg_text = a.get_text(strip=True)
            if href and "/programs-study/departments-programs/" in href:
                full_url = "https://ga.rice.edu" + href
                deg_info.append((deg_text, full_url))
                
        # Also grab department page link from cell 1
        dept_cell = cells[1]
        dept_link = dept_cell.find("a")
        dept_url = None
        if dept_link and dept_link.get("href"):
            dept_url = "https://ga.rice.edu" + dept_link.get("href")
            
        # Index under normalized name
        norm_name = program_name.lower().strip()
        
        # If we have degrees, or a department URL, save it
        if deg_info or dept_url:
            if norm_name in official_catalog:
                # Merge instead of overwriting
                official_catalog[norm_name]["degrees"].extend(deg_info)
                if dept_url and not official_catalog[norm_name]["dept_url"]:
                    official_catalog[norm_name]["dept_url"] = dept_url
            else:
                official_catalog[norm_name] = {
                    "official_name": program_name,
                    "degrees": deg_info,
                    "dept_url": dept_url
                }

    # 2. Fetch the 79 majors currently stored for Rice in the database
    conn = get_connection(register=False)
    db_majors = []
    try:
        with conn.cursor() as cur:
            cur.execute(
                '''
                SELECT "id", "customName", "customCode"
                FROM "UniversityMajorAssociation"
                WHERE "universityId" = 'rice'
                '''
            )
            db_majors = cur.fetchall()
    except Exception as e:
        print(f"❌ Failed to fetch custom majors from DB: {e}")
        conn.close()
        return

    print(f"Loaded {len(db_majors)} custom majors for Rice from the database.")
    print("Starting alignment with specific official catalog URLs...\n")

    aligned_count = 0
    unaligned = []
    
    # Track updates to commit
    updates_to_make = []

    def is_bachelors(deg_text):
        deg = deg_text.lower().strip()
        # Match any degree starting with 'b' (e.g. BA, BS, BSCS, BMus, BArch, BSChE, BSECE)
        # Exclude 'bus' or similar if present
        if deg.startswith("b") and not deg.startswith("bus"):
            return True
        return False

    for m_id, custom_name, custom_code in db_majors:
        norm_db = custom_name.lower().strip()
        
        # Strategies for finding the best match:
        target_url = None
        match_reason = ""
        
        # Strategy A: Exact Name Match
        if norm_db in official_catalog:
            info = official_catalog[norm_db]
            # Prioritize bachelor's degrees over minors/certificates
            degrees = info["degrees"]
            bachelor_degs = [d for d in degrees if is_bachelors(d[0])]
            if bachelor_degs:
                # Take the first bachelor's degree URL
                target_url = bachelor_degs[0][1]
                match_reason = f"Exact Match (Degree: {bachelor_degs[0][0]})"
            elif degrees:
                target_url = degrees[0][1]
                match_reason = f"Exact Match (Non-Bachelor Degree: {degrees[0][0]})"
            else:
                target_url = info["dept_url"]
                match_reason = "Exact Match (Department page)"
                
        # Strategy B: Keyword / Partial matches if not exact
        if not target_url:
            # Let's search for similar names
            for norm_off, info in official_catalog.items():
                # E.g. "Computer Science" vs "Computer Science"
                if norm_db in norm_off or norm_off in norm_db:
                    degrees = info["degrees"]
                    bachelor_degs = [d for d in degrees if is_bachelors(d[0])]
                    if bachelor_degs:
                        target_url = bachelor_degs[0][1]
                        match_reason = f"Partial Match on '{info['official_name']}' (Degree: {bachelor_degs[0][0]})"
                    elif degrees:
                        target_url = degrees[0][1]
                        match_reason = f"Partial Match on '{info['official_name']}' (Degree: {degrees[0][0]})"
                    else:
                        target_url = info["dept_url"]
                        match_reason = f"Partial Match on '{info['official_name']}' (Department page)"
                    break

        # Strategy C: Hardcoded fallback matching for specialized naming
        if not target_url:
            # Department overrides
            special_mappings = {
                "computational applied mathematics and operations research": "https://ga.rice.edu/programs-study/departments-programs/engineering/computational-applied-mathematics-operations-research/computational-applied-mathematics-ba/",
                "languages and intercultural communication": "https://ga.rice.edu/programs-study/departments-programs/humanities/languages-intercultural-communication/",
                "latin american and latinx studies": "https://ga.rice.edu/programs-study/departments-programs/humanities/latin-american-latinx-studies/",
                "medieval and early modern studies": "https://ga.rice.edu/programs-study/departments-programs/humanities/medieval-early-modern-studies/",
                "modern and classical languages, literatures, and cultures": "https://ga.rice.edu/programs-study/departments-programs/humanities/modern-and-classical-literatures-and-cultures/",
                "politics, law, and social thought": "https://ga.rice.edu/programs-study/departments-programs/humanities/politics-law-social-thought/",
                "study of women, gender and sexuality": "https://ga.rice.edu/programs-study/departments-programs/humanities/study-women-gender-sexuality/",
                "sports medicine and exercise physiology": "https://ga.rice.edu/programs-study/departments-programs/natural-sciences/sports-medicine-exercise-physiology/sports-medicine-exercise-physiology-ba/",
                "managerial economics and organizational sciences": "https://ga.rice.edu/programs-study/departments-programs/social-sciences/managerial-economics-organizational-sciences/managerial-economics-organizational-sciences-ba/",
                "mathematical economic analysis": "https://ga.rice.edu/programs-study/departments-programs/social-sciences/mathematical-economic-analysis/mathematical-economic-analysis-ba/",
                "social policy analysis": "https://ga.rice.edu/programs-study/departments-programs/social-sciences/social-policy-analysis/social-policy-analysis-ba/"
            }
            if norm_db in special_mappings:
                target_url = special_mappings[norm_db]
                match_reason = "Hardcoded Registrar Catalog Path"

        if target_url:
            aligned_count += 1
            updates_to_make.append((target_url, m_id))
            print(f"✅ Major: '{custom_name}' aligned to: \n   └─ URL: {target_url}\n   └─ Reason: {match_reason}\n")
        else:
            unaligned.append(custom_name)
            # Default to department page standard URL if no specific page is found
            fallback_url = "https://ga.rice.edu/programs-study/departments-programs/"
            updates_to_make.append((fallback_url, m_id))
            print(f"⚠️ Major: '{custom_name}' has no specific program page. Defaulting to general catalog directory.")

    print("================================================================================")
    print(f"Alignment Summary: {aligned_count} / {len(db_majors)} majors aligned to specific URLs.")
    if unaligned:
        print(f"Unaligned Custom Majors ({len(unaligned)}): {unaligned}")
        
    if not dry_run:
        print("\n💾 Committing specific URL updates to the Database...")
        try:
            with conn.cursor() as cur:
                for url, m_id in updates_to_make:
                    cur.execute(
                        '''
                        UPDATE "UniversityMajorAssociation"
                        SET "sourceUrl" = %s
                        WHERE "id" = %s
                        ''',
                        (url, m_id)
                    )
            conn.commit()
            print("🎉 Database successfully updated with specific, authentic official catalog URLs!")
        except Exception as e:
            conn.rollback()
            print(f"❌ Failed to update database: {e}")
    else:
        print("\n📝 Dry-run mode active. No database updates made.")

    conn.close()

if __name__ == "__main__":
    # If run with '--commit', save changes
    commit = "--commit" in sys.argv
    resolve_rice_specific_urls(dry_run=not commit)
