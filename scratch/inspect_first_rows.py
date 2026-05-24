#!/usr/bin/env python3
import os
import copy
from bs4 import BeautifulSoup

def inspect_first():
    content_file = "/Users/ggdayup/.gemini/antigravity-cli/brain/5320baea-3c65-41a0-9ad8-a5f3fffa0e87/.system_generated/steps/1581/content.md"
    if not os.path.exists(content_file):
        print("❌ Cache not found!")
        return
        
    with open(content_file, "r", encoding="utf-8") as f:
        html = f.read()
        
    soup = BeautifulSoup(html, "lxml")
    rows = soup.find_all("tr")
    
    print(f"Total rows: {len(rows)}")
    
    for idx in range(150):
        if idx >= len(rows):
            break
        row = rows[idx]
        cells = row.find_all("td")
        if not cells:
            print(f"Row {idx}: [No cells] class={row.get('class', [])}")
            th = row.find("th")
            if th:
                print(f"  └─ th text: '{th.get_text(strip=True)}'")
            continue
            
        # Print cell 0 and cell 2/3 text
        cell0 = cells[0].get_text(strip=True)
        print(f"Row {idx}: cell0='{cell0}' | cell_count={len(cells)}")

if __name__ == "__main__":
    inspect_first()
