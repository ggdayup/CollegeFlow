#!/usr/bin/env python3
import os
from bs4 import BeautifulSoup

def list_headers():
    content_file = "/Users/ggdayup/.gemini/antigravity-cli/brain/5320baea-3c65-41a0-9ad8-a5f3fffa0e87/.system_generated/steps/1581/content.md"
    if not os.path.exists(content_file):
        print("❌ Cache not found!")
        return
        
    with open(content_file, "r", encoding="utf-8") as f:
        html = f.read()
        
    soup = BeautifulSoup(html, "lxml")
    area_rows = soup.find_all("tr", class_="areaheader")
    
    print(f"Total areaheader rows: {len(area_rows)}")
    for idx, row in enumerate(area_rows):
        th = row.find("th")
        if th:
            print(f"Header {idx}: '{th.get_text(strip=True)}'")

if __name__ == "__main__":
    list_headers()
