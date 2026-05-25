import os
import sys
from pathlib import Path
from dotenv import load_dotenv

_PROJECT_ROOT = Path("/Users/ggdayup/ggdayup-syncthing/code/CollegeFlow/data/cds/CollegeFlow_CDS")
load_dotenv(_PROJECT_ROOT / ".env")

sys.path.insert(0, str(_PROJECT_ROOT))
from importlib import import_module
config = import_module("pdf-parse.config")

client = config.get_llm()

models = [
    "gemini-3.5-flash",
    "gemini-3.1-pro-preview",
    "gemini-2.5-pro",
    "gemini-2.5-flash",
    "gemini-1.5-pro",
    "gemini-1.5-flash",
]

for m in models:
    try:
        response = client.models.generate_content(
            model=m,
            contents="Say 'Ok'"
        )
        print(f"✅ Model '{m}' is accessible! Response: {response.text.strip()}")
    except Exception as e:
        print(f"❌ Model '{m}' failed: {e}")
