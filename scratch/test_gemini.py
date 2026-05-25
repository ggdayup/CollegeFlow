import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Load env from CollegeFlow_CDS
_PROJECT_ROOT = Path("/Users/ggdayup/ggdayup-syncthing/code/CollegeFlow/data/cds/CollegeFlow_CDS")
load_dotenv(_PROJECT_ROOT / ".env")

sys.path.insert(0, str(_PROJECT_ROOT))
from importlib import import_module
config = import_module("pdf-parse.config")

print("USE_VERTEX_AI:", config.USE_VERTEX_AI)
print("GEMINI_API_KEY:", config.GEMINI_API_KEY[:10] + "..." if config.GEMINI_API_KEY else "None")
print("GEMINI_SUMMARY_MODEL:", config.GEMINI_SUMMARY_MODEL)

client = config.get_llm()
try:
    response = client.models.generate_content(
        model=config.GEMINI_SUMMARY_MODEL,
        contents="Hello! Say 'Gemini is ready' if you hear me."
    )
    print("Response:", response.text)
except Exception as e:
    print("❌ Error calling Gemini:", e)
