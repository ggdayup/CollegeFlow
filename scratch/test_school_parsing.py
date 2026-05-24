#!/usr/bin/env python3
import os
from bs4 import BeautifulSoup

def diagnose():
    content_file = "/Users/ggdayup/.gemini/antigravity-cli/brain/5320baea-3c65-41a0-9ad8-a5f3fffa0e87/.system_generated/steps/1581/content.md"
    if not os.path.exists(content_file):
        print("❌ Cache not found!")
        return
        
    with open(content_file, "r", encoding="utf-8") as f:
        html = f.read()
        
    soup = BeautifulSoup(html, "lxml")
    rows = soup.find_all("tr")
    
    print(f"Total rows: {len(rows)}")
    
    # Print the first 20 rows that have 'class' or contain 'th'
    headers_found = 0
    for idx, row in enumerate(rows):
        th = row.find("th")
        classes = row.get("class", [])
        if th or classes:
            print(f"Row {idx}: classes={classes} | has_th={th is not None}")
            if th:
                print(f"  └─ th text: '{th.get_text(strip=True)}' | attrs: {th.attrs}")
            headers_found += 1
            if headers_found >= 20:
                break

if __name__ == "__main__":
    diagnose()
