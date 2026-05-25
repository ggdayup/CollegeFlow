import os
from pathlib import Path

brain_dir = Path("/Users/ggdayup/.gemini/antigravity-cli/brain/64a7ee8f-d383-4ac5-8275-8151ac67d933")
print("Scanning:", brain_dir)
for root, dirs, files in os.walk(brain_dir):
    for f in files:
        if "task-112" in f or "112" in f:
            print("Found:", os.path.join(root, f))
