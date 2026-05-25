import os
import sys
import json
from pathlib import Path
from dotenv import load_dotenv
from google.genai.types import Part

_PROJECT_ROOT = Path("/Users/ggdayup/ggdayup-syncthing/code/CollegeFlow/data/cds/CollegeFlow_CDS")
load_dotenv(_PROJECT_ROOT / ".env")

sys.path.insert(0, str(_PROJECT_ROOT))
from importlib import import_module
config = import_module("pdf-parse.config")

client = config.get_llm()
model = config.GEMINI_SUMMARY_MODEL
print("Model:", model)

pdf_path = _PROJECT_ROOT / "cds_data/18_dartmouth/CDS_2024-2025.pdf"
print("Reading PDF...")
file_bytes = pdf_path.read_bytes()
doc_part = Part.from_bytes(data=file_bytes, mime_type="application/pdf")

template = config.get_cds_prompt_template()
# Use a custom prompt for direct extraction
prompt = """
You are the CDS Universal Data Extractor.
Below is a Common Data Set (CDS) document.
Please extract 100% of the data from sections A-J into a single, nested JSON object.

## Rules
- Zero Loss: Do not summarize. Do not skip rows or sections.
- Normalization: Standardize field names and types.
- Booleans: Checkboxes [x] -> true. Keep importance levels as enum strings.
- Handling Gaps: Blank or 'Not Reported' -> null. Do not invent data.

## Output Format
Return ONLY valid JSON with these top-level keys:
_meta, A_General, B_Enrollment, C_Admissions, D_Transfers, E_AcademicOfferings, F_StudentLife, G_Expenses, H_FinancialAid, I_Faculty, J_Degrees

Return ONLY the JSON within a ```json code block.
"""

async def run():
    print("Sending request to Gemini...")
    try:
        response = await client.aio.models.generate_content(
            model=model,
            contents=[doc_part, prompt]
        )
        print("Response received!")
        text = response.text
        print("First 500 chars of response:")
        print(text[:500])
        
        # Try to extract JSON
        from pdf_parse.workflow import _extract_json
        json_str = _extract_json(text)
        if json_str:
            parsed = json.loads(json_str)
            print("Successfully parsed JSON! Top keys:", list(parsed.keys()))
        else:
            print("Could not find JSON block in response.")
    except Exception as e:
        print("Error:", e)

import asyncio
asyncio.run(run())
