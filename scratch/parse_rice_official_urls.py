#!/usr/bin/env python3
import os
import sys
from bs4 import BeautifulSoup

def parse_official_urls():
    content_file = "/Users/ggdayup/.gemini/antigravity-cli/brain/5320baea-3c65-41a0-9ad8-a5f3fffa0e87/.system_generated/steps/1581/content.md"
    
    if not os.path.exists(content_file):
        print(f"❌ Content file not found at {content_file}")
        return
        
    with open(content_file, "r", encoding="utf-8") as f:
        html_content = f.read()
        
    soup = BeautifulSoup(html_content, "lxml")
    
    # Let's find all rows in the grid
    rows = soup.find_all("tr", role="row")
    print(f"Found {len(rows)} table rows in the catalog HTML.\n")
    
    extracted_programs = []
    
    for row in rows:
        cells = row.find_all("td")
        if len(cells) < 4:
            continue
            
        # Cell 0: Program Name
        program_span = cells[0].find("span", class_=None)
        if not program_span:
            # Let's try getting text and stripping out 'Program' prefix if in mobile view
            program_name = cells[0].get_text(strip=True).replace("Program", "").strip()
        else:
            program_name = program_span.get_text(strip=True)
            
        if not program_name or program_name == "Program":
            continue
            
        # Cell 3: Undergraduate Degrees
        undergrad_cell = cells[3]
        links = undergrad_cell.find_all("a")
        
        deg_info = []
        for a in links:
            href = a.get("href")
            deg_text = a.get_text(strip=True)
            if href and "/programs-study/departments-programs/" in href:
                # Resolve relative URL
                full_url = "https://ga.rice.edu" + href
                deg_info.append((deg_text, full_url))
                
        if deg_info:
            extracted_programs.append({
                "name": program_name,
                "degrees": deg_info
            })
            
    print(f"Successfully extracted {len(extracted_programs)} undergraduate program entries from official HTML:")
    for prog in extracted_programs[:15]:
        print(f"🔹 Program: '{prog['name']}'")
        for deg, url in prog["degrees"]:
            print(f"   └─ Degree: {deg} | URL: {url}")
            
if __name__ == "__main__":
    parse_official_urls()
