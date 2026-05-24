#!/usr/bin/env python3
import os
from bs4 import BeautifulSoup

def find_george():
    content_file = "/Users/ggdayup/.gemini/antigravity-cli/brain/5320baea-3c65-41a0-9ad8-a5f3fffa0e87/.system_generated/steps/1581/content.md"
    if not os.path.exists(content_file):
        print("❌ Cache not found!")
        return
        
    with open(content_file, "r", encoding="utf-8") as f:
        html = f.read()
        
    soup = BeautifulSoup(html, "lxml")
    
    # Let's search for the text "George R. Brown" inside the whole parsed tree
    elements = soup.find_all(text=lambda text: text and "George R. Brown" in text)
    print(f"Found {len(elements)} elements containing 'George R. Brown':")
    for el in elements:
        parent = el.parent
        print(f"Text: '{el.strip()}' | Parent tag: '{parent.name}' | Parent attrs: {parent.attrs}")
        # Print grandparent if row or table
        gp = parent.parent
        if gp:
            print(f"  Grandparent tag: '{gp.name}' | Grandparent attrs: {gp.attrs}")

if __name__ == "__main__":
    find_george()
