#!/usr/bin/env python3
import os
import sys

sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), '../backend'))
from catalog_discovery import RiceCatalogParser

def inspect_schools():
    content_file = "/Users/ggdayup/.gemini/antigravity-cli/brain/5320baea-3c65-41a0-9ad8-a5f3fffa0e87/.system_generated/steps/1581/content.md"
    if not os.path.exists(content_file):
        print("❌ Cache not found!")
        return
        
    with open(content_file, "r", encoding="utf-8") as f:
        html = f.read()
        
    parser = RiceCatalogParser("rice", "https://ga.rice.edu/programs-study/departments-programs/")
    programs = parser.parse(html)
    
    print(f"Total parsed programs: {len(programs)}")
    
    # Check school distribution
    school_counts = {}
    for p in programs:
        s = p["school_name"]
        school_counts[s] = school_counts.get(s, 0) + 1
        
    print("\nSchool distributions in parsed programs:")
    for s, count in school_counts.items():
        print(f"🔹 School: '{s}' | Count: {count}")
        
    # Print the first 30 programs in detail
    print("\nFirst 30 programs detailed:")
    for idx, p in enumerate(programs[:30]):
        print(f"{idx+1}. Name: '{p['program_name']}' | School: '{p['school_name']}'")

if __name__ == "__main__":
    inspect_schools()
