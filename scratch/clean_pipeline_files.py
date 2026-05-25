import json
import os
from pathlib import Path

CDS_ROOT = Path("/Users/ggdayup/ggdayup-syncthing/code/CollegeFlow/data/cds/CollegeFlow_CDS")
progress_file = CDS_ROOT / ".agents/skills/cds-extraction-pipeline/progress_tracker.json"

# Load progress tracker
with open(progress_file) as f:
    tracker = json.load(f)

# IDs to clean: 17 to 34
ids_to_clean = {str(i) for i in range(17, 35)}

cleaned_count = 0

for uni in tracker:
    uni_id = uni["id"]
    if uni_id in ids_to_clean:
        directory = uni["directory"]
        uni_dir = CDS_ROOT / "cds_data" / directory
        
        # Reset tracker entry
        uni["extracted"] = False
        uni["normalized"] = False
        uni["notes"] = ""
        
        # Clean generated files
        if uni_dir.exists():
            print(f"Cleaning files in {directory}...")
            # We want to remove:
            # 1. CDS_canonical.json
            # 2. key_mapping.json
            # 3. json_audit_report.md
            # 4. Any file matching CDS_llamaparse_*.json
            # 5. llamaparse_extracted.md
            files_to_remove = [
                uni_dir / "CDS_canonical.json",
                uni_dir / "key_mapping.json",
                uni_dir / "json_audit_report.md",
                uni_dir / "llamaparse_extracted.md"
            ]
            # Add matching CDS_llamaparse_*.json
            for p in uni_dir.glob("CDS_llamaparse_*.json"):
                files_to_remove.append(p)
                
            for file_path in files_to_remove:
                if file_path.exists():
                    print(f"  Removing {file_path.name}")
                    file_path.unlink()
            
            cleaned_count += 1

# Save progress tracker
with open(progress_file, "w") as f:
    json.dump(tracker, f, indent=2)

print(f"Successfully cleaned files and reset progress for {cleaned_count} universities (ID 17 to 34)!")
