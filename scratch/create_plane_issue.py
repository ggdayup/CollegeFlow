import json
import subprocess
import os

payload = {
    "name": "CDS Extraction and Normalization Pipeline Execution for all universities",
    "state": "c7701ec6-17bc-4b40-a72f-2970f96cdc9e",
    "priority": "high",
    "description_html": "<div><p>Running the end-to-end Common Data Set (CDS) extraction and normalization pipeline for all remaining universities, handling Gemini rate limits with exponential backoff.</p></div>"
}

temp_file = "scratch/temp_payload.json"
with open(temp_file, "w") as f:
    json.dump(payload, f)

try:
    cmd = [
        "node",
        "/Users/ggdayup/.agents/skills/plane-api/scripts/plane-api.js",
        "create-issue",
        "sheenvita",
        "15c381fa-d6ad-4f10-8c47-2b04a3a342b5",
        temp_file
    ]
    res = subprocess.run(cmd, capture_output=True, text=True, check=True)
    print("Output:", res.stdout)
except Exception as e:
    print("Error:", e)
finally:
    if os.path.exists(temp_file):
        os.remove(temp_file)
