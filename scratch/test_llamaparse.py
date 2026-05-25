import os
import sys
from pathlib import Path
from dotenv import load_dotenv

_PROJECT_ROOT = Path("/Users/ggdayup/ggdayup-syncthing/code/CollegeFlow/data/cds/CollegeFlow_CDS")
load_dotenv(_PROJECT_ROOT / ".env")

sys.path.insert(0, str(_PROJECT_ROOT))
from importlib import import_module
config = import_module("pdf-parse.config")

print("LLAMA_CLOUD_API_KEY:", config.LLAMA_CLOUD_API_KEY[:10] + "..." if config.LLAMA_CLOUD_API_KEY else "None")

from llama_cloud_services import LlamaParse
parser = config.get_llama_parse()

import asyncio

async def test():
    try:
        print("Parsing...")
        result = await parser.aparse(file_path="/Users/ggdayup/ggdayup-syncthing/code/CollegeFlow/data/cds/CollegeFlow_CDS/cds_data/18_dartmouth/CDS_2024-2025.pdf")
        print("Success! Result type:", type(result))
    except Exception as e:
        import traceback
        traceback.print_exc()

asyncio.run(test())
