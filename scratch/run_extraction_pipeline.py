import os
import sys
import json
import time
import traceback
from pathlib import Path
from dotenv import load_dotenv
from google.genai.types import Part

# Load environment
CDS_ROOT = Path("/Users/ggdayup/ggdayup-syncthing/code/CollegeFlow/data/cds/CollegeFlow_CDS")
load_dotenv(CDS_ROOT / ".env")

sys.path.insert(0, str(CDS_ROOT))
from importlib import import_module
config = import_module("pdf-parse.config")
llm_mod = import_module("pdf-parse.llm_interface")

llm_client = llm_mod.LLMInterface()
MODEL = llm_client.model
LLAMAPARSE_MODEL = config.LLAMAPARSE_MODEL

print("="*60)
print(f"CDS BATCH PIPELINE RUNNER (LLM INTERFACE MODE)")
print(f"Provider: {llm_client.provider}")
print(f"Model: {MODEL}")
print(f"LlamaParse Model: {LLAMAPARSE_MODEL}")
print("="*60)

# Helper to find source file
def find_source_file(uni_dir: Path) -> Path | None:
    # Handle Amherst special case by merging first
    if "31_amherst" in uni_dir.name:
        from pypdf import PdfWriter
        writer = PdfWriter()
        sections = [
            "Section_A_General_Info.pdf",
            "Section_B_Enrollment.pdf",
            "Section_C_Admission.pdf",
            "Section_D_Transfer_Admission.pdf",
            "Section_E_Academic_Offerings.pdf",
            "Section_F_Student_Life.pdf",
            "Section_G_Annual_Expenses.pdf",
            "Section_H_Financial_Aid.pdf",
            "Section_I_Faculty.pdf",
            "Section_J_Degrees_Conferred.pdf",
            "Section_K_Definitions.pdf"
        ]
        merged_path = uni_dir / "CDS_2024-2025.pdf"
        if not merged_path.exists():
            print("Merging Amherst PDFs...")
            for section in sections:
                sec_path = uni_dir / section
                if sec_path.exists():
                    writer.append(str(sec_path))
            writer.write(str(merged_path))
            writer.close()
            print(f"Amherst PDFs merged successfully to {merged_path}")
        return merged_path

    # Standard check
    for p in uni_dir.glob("CDS_*.*"):
        if p.suffix.lower() in ['.pdf', '.xlsx', '.xls', '.docx', '.doc', '.html', '.htm']:
            return p
    for ext in ['.pdf', '.xlsx', '.xls']:
        for p in uni_dir.glob(f"*{ext}"):
            return p
    return None

# Helper to convert XLSX to CSV tables (renamed to keep calling code identical but uses high-efficiency CSV format)
def xlsx_to_markdown(file_path: Path) -> str:
    import pandas as pd
    xls = pd.ExcelFile(file_path)
    sheets_txt = []
    for sheet_name in xls.sheet_names:
        # Skip definition or glossary sheets to save huge token limits
        name_lower = sheet_name.lower()
        if any(k in name_lower for k in ["definition", "instruction", "toc", "intro", "glossary"]):
            continue
        try:
            df = pd.read_excel(file_path, sheet_name=sheet_name)
            # Clean dataframe by dropping empty rows and columns and filling NaNs
            df = df.dropna(how='all')
            df = df.dropna(axis=1, how='all')
            df = df.fillna("")
            csv_text = df.to_csv(index=False)
            sheets_txt.append(f"## Sheet: {sheet_name}\n\n{csv_text}")
        except Exception as e:
            sheets_txt.append(f"## Sheet: {sheet_name} (Failed to parse: {e})")
    return "\n\n".join(sheets_txt)

# Dynamic JSON block extractor
def extract_json_block(text: str) -> str | None:
    if "```json" in text:
        start = text.index("```json") + len("```json")
        end = text.index("```", start)
        return text[start:end].strip()
    if "```" in text:
        start = text.index("```") + len("```")
        end = text.index("```", start)
        candidate = text[start:end].strip()
        if candidate.startswith("{"):
            return candidate
    stripped = text.strip()
    if stripped.startswith("{"):
        return stripped
    return None

# Perform direct Gemini extraction
def direct_gemini_extract(source_path: Path) -> str:
    mime_type = config.get_mime_type(str(source_path))
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

    if mime_type == "application/pdf":
        print(f"  [Direct Mode] Reading PDF directly...")
        file_bytes = source_path.read_bytes()
        doc_part = Part.from_bytes(data=file_bytes, mime_type=mime_type)
        contents = [doc_part, prompt]
    elif mime_type in ("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.ms-excel"):
        print(f"  [Direct Mode] Converting Excel to Markdown tables...")
        md_text = xlsx_to_markdown(source_path)
        source_path.parent.joinpath("llamaparse_extracted.md").write_text(md_text, encoding="utf-8")
        contents = [md_text, prompt]
    elif mime_type == "text/html":
        print(f"  [Direct Mode] Reading HTML directly...")
        html_text = source_path.read_text(encoding="utf-8")
        source_path.parent.joinpath("llamaparse_extracted.md").write_text(html_text, encoding="utf-8")
        contents = [html_text, prompt]
    else:
        print(f"  [Direct Mode] Reading raw file directly...")
        raw_text = source_path.read_text(encoding="utf-8")
        source_path.parent.joinpath("llamaparse_extracted.md").write_text(raw_text, encoding="utf-8")
        contents = [raw_text, prompt]

    max_retries = 5
    retry_delays = [15, 45, 90, 180, 300]
    
    for attempt in range(max_retries):
        try:
            print(f"  [LLM] Sending content to {MODEL} via {llm_client.provider} (Attempt {attempt+1}/{max_retries})...")
            res_text = llm_client.generate_content(contents=contents)
            return res_text
        except Exception as e:
            err_msg = str(e)
            print(f"  ❌ Gemini Error on attempt {attempt+1}: {err_msg}")
            if "429" in err_msg or "RESOURCE_EXHAUSTED" in err_msg or "503" in err_msg or "UNAVAILABLE" in err_msg or "500" in err_msg or "timeout" in err_msg.lower() or "time out" in err_msg.lower():
                if attempt < max_retries - 1:
                    delay = retry_delays[attempt]
                    print(f"  ⏳ Rate limit/Server/Timeout error encountered. Backing off for {delay} seconds...")
                    time.sleep(delay)
                    continue
            raise e
    raise RuntimeError("Max retries exceeded for Gemini extraction")

# Subprocess runner helper
def run_command(cmd, cwd=None):
    import subprocess
    print(f"  Running: {' '.join(cmd)}")
    res = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True)
    if res.returncode != 0:
        print(f"  ❌ Command failed with exit code {res.returncode}")
        print(f"  Stdout: {res.stdout}")
        print(f"  Stderr: {res.stderr}")
        return False, res.stderr
    return True, res.stdout

def run_pipeline():
    progress_file = CDS_ROOT / ".agents/skills/cds-extraction-pipeline/progress_tracker.json"
    with open(progress_file) as f:
        tracker = json.load(f)

    print(f"Loaded {len(tracker)} universities from tracker.")
    
    # Track metrics
    successful_extractions = 0
    successful_normalizations = 0
    
    for uni in tracker:
        uni_id = uni["id"]
        directory = uni["directory"]
        uni_dir = CDS_ROOT / "cds_data" / directory
        
        # Skip empty directories
        if uni.get("source_type") == "None":
            print(f"\n[{uni_id}_{directory}] Skipping - empty directory.")
            continue
            
        is_extracted = uni["extracted"]
        is_normalized = uni["normalized"]
        
        if is_extracted and is_normalized:
            continue
            
        print(f"\n{'='*70}")
        print(f"Processing: {directory} (ID: {uni_id})")
        print(f"{'='*70}")
        
        source_path = find_source_file(uni_dir)
        if not source_path:
            print(f"❌ Error: No source file found in {uni_dir}")
            uni["notes"] = "No source file found"
            # Save progress tracker
            with open(progress_file, "w") as f:
                json.dump(tracker, f, indent=2)
            continue
            
        print(f"Found source document: {source_path.relative_to(CDS_ROOT)}")
        
        # --- Phase 1: Extraction ---
        if not is_extracted:
            try:
                # 1. Direct Gemini Multimodal Extraction
                raw_text = direct_gemini_extract(source_path)
                json_str = extract_json_block(raw_text)
                
                if not json_str:
                    print("❌ Error: Failed to extract valid JSON code block from Gemini response")
                    continue
                    
                # Save raw json output file
                out_name = f"CDS_llamaparse_{LLAMAPARSE_MODEL}_{MODEL}.json"
                json_path = uni_dir / out_name
                parsed_json = json.loads(json_str)
                json_path.write_text(json.dumps(parsed_json, indent=2, ensure_ascii=False), encoding="utf-8")
                print(f"  ✅ Saved raw extraction: {json_path.relative_to(CDS_ROOT)}")
                
                # Write placeholder llamaparse_extracted.md if it doesn't exist
                md_path = uni_dir / "llamaparse_extracted.md"
                if not md_path.exists():
                    md_path.write_text(f"# Extracted Content for {directory}\n\nProcessed via direct Gemini multimodal path.", encoding="utf-8")
                
                # 2. Native Multimodal Audit
                print("  [Audit] Running native multimodal audit...")
                audit_cmd = [
                    str(CDS_ROOT / "pdf-parse/.venv/bin/python3"),
                    "pdf-parse/audit_json.py",
                    str(source_path)
                ]
                ok, err = run_command(audit_cmd, cwd=str(CDS_ROOT))
                if not ok:
                    print("  ⚠️ Audit command failed. Retrying...")
                    time.sleep(5)
                    ok, err = run_command(audit_cmd, cwd=str(CDS_ROOT))
                    if not ok:
                        raise RuntimeError(f"Audit step failed: {err}")
                print("  ✅ Audit report generated.")
                
                # 3. Automated Correction
                print("  [Correction] Running automated correction...")
                correct_cmd = [
                    str(CDS_ROOT / "pdf-parse/.venv/bin/python3"),
                    "pdf-parse/correct_json.py",
                    str(source_path)
                ]
                ok, err = run_command(correct_cmd, cwd=str(CDS_ROOT))
                if not ok:
                    print("  ⚠️ Correction command failed. Retrying...")
                    time.sleep(5)
                    ok, err = run_command(correct_cmd, cwd=str(CDS_ROOT))
                    if not ok:
                        raise RuntimeError(f"Correction step failed: {err}")
                print("  ✅ Corrected JSON generated.")
                
                # Save extracted status
                uni["extracted"] = True
                is_extracted = True
                successful_extractions += 1
                with open(progress_file, "w") as f:
                    json.dump(tracker, f, indent=2)
                print(f"🏆 Extraction complete for {directory}!")
                
            except Exception as e:
                print(f"❌ Error extracting {directory}: {e}")
                traceback.print_exc()
                uni["notes"] = f"Extraction failed: {str(e)}"
                with open(progress_file, "w") as f:
                    json.dump(tracker, f, indent=2)
                continue
                
        # --- Phase 2: Normalization ---
        if is_extracted and not is_normalized:
            try:
                # 4. Schema Discovery (Merge)
                print("  [Discovery] Running schema discovery with merge...")
                discovery_cmd = [
                    str(CDS_ROOT / "pdf-parse/.venv/bin/python3"),
                    "database/discover_schema.py",
                    "--merge",
                    "--dir",
                    str(uni_dir)
                ]
                ok, err = run_command(discovery_cmd, cwd=str(CDS_ROOT))
                if not ok:
                    print("  ⚠️ Discovery command failed. Retrying...")
                    time.sleep(5)
                    ok, err = run_command(discovery_cmd, cwd=str(CDS_ROOT))
                    if not ok:
                        raise RuntimeError(f"Discovery step failed: {err}")
                print("  ✅ Schema discovery completed.")
                
                # 5. Normalization (Apply)
                print("  [Normalization] Normalizing raw JSON...")
                normalize_cmd = [
                    str(CDS_ROOT / "pdf-parse/.venv/bin/python3"),
                    "database/normalize_cds_json.py",
                    "--all",
                    str(uni_dir)
                ]
                ok, err = run_command(normalize_cmd, cwd=str(CDS_ROOT))
                if not ok:
                    print("  ⚠️ Normalization command failed. Retrying...")
                    time.sleep(5)
                    ok, err = run_command(normalize_cmd, cwd=str(CDS_ROOT))
                    if not ok:
                        raise RuntimeError(f"Normalization step failed: {err}")
                print("  ✅ Normalization completed.")
                
                # Verify canonical JSON
                canonical_path = uni_dir / "CDS_canonical.json"
                if not canonical_path.exists():
                    raise RuntimeError("CDS_canonical.json was not created")
                
                with open(canonical_path) as cf:
                    canon_data = json.load(cf)
                print(f"  ✅ Verification passed: CDS_canonical.json is valid with {len(canon_data)} sections.")
                
                # Save normalized status
                uni["normalized"] = True
                successful_normalizations += 1
                uni["notes"] = "Successfully extracted and normalized!"
                with open(progress_file, "w") as f:
                    json.dump(tracker, f, indent=2)
                print(f"🏆 Normalization complete for {directory}!")
                
            except Exception as e:
                print(f"❌ Error normalizing {directory}: {e}")
                traceback.print_exc()
                uni["notes"] = f"Normalization failed: {str(e)}"
                with open(progress_file, "w") as f:
                    json.dump(tracker, f, indent=2)
                continue
                
    print("\n" + "="*60)
    print("BATCH RUN COMPLETE SUMMARY")
    print(f"Successful extractions: {successful_extractions}")
    print(f"Successful normalizations: {successful_normalizations}")
    print("="*60)

if __name__ == "__main__":
    run_pipeline()
