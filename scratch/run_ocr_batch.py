#!/usr/bin/env python3
"""
run_ocr_batch.py — Sequential controller for local Ollama Vision OCR parsing.
Scans, extracts, normalizes, and loads university CDS documents starting from 18_dartmouth.
"""

import os
import sys
import json
import subprocess
import time
from pathlib import Path

# Workspace configurations
WORKSPACE_ROOT = Path(__file__).resolve().parents[1]
CDS_DATA_ROOT = WORKSPACE_ROOT / "data" / "cds" / "CollegeFlow_CDS"
CDS_DATA_DIR = CDS_DATA_ROOT / "cds_data"
OCR_PARSER_SCRIPT = CDS_DATA_ROOT / ".agents/skills/cds-ocr-parser" / "cds_ocr_parser.py"
NORMALIZE_SCRIPT = CDS_DATA_ROOT / "database" / "normalize_cds_json.py"
IMPORT_SCRIPT = CDS_DATA_ROOT / "database" / "import_to_pg.py"
PROGRESS_FILE = WORKSPACE_ROOT / "scratch" / "ocr_batch_progress.json"

def get_target_directories() -> list[Path]:
    """Get all digit-prefixed university directories starting from 18_dartmouth."""
    dirs = sorted([d for d in CDS_DATA_DIR.iterdir() if d.is_dir() and d.name[0].isdigit()])
    
    targets = []
    start = False
    for d in dirs:
        if d.name == "18_dartmouth":
            start = True
        if start:
            # Check if directory contains a PDF file
            pdfs = list(d.glob("*.pdf"))
            if pdfs:
                targets.append(d)
            else:
                print(f"⏩ Skipping {d.name}: No PDF source file found.")
    return targets

def load_progress() -> dict:
    """Load or initialize the progress tracker."""
    if PROGRESS_FILE.exists():
        try:
            with open(PROGRESS_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            pass
    return {}

def save_progress(progress: dict):
    """Save progress state."""
    PROGRESS_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(PROGRESS_FILE, 'w', encoding='utf-8') as f:
        json.dump(progress, f, indent=2, ensure_ascii=False)

def run_cmd(cmd: list[str], description: str) -> bool:
    """Run a terminal command and output to console in real-time."""
    print(f"\n🚀 Running: {' '.join(cmd)}")
    print(f"   Description: {description}")
    print("-" * 60)
    
    # Run process and stream stdout/stderr
    process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, bufsize=1)
    
    for line in process.stdout:
        print(line, end="")
        
    process.wait()
    print("-" * 60)
    
    if process.returncode != 0:
        print(f"❌ Command failed with exit code: {process.returncode}")
        return False
    print(f"✅ Command successful.")
    return True

def main():
    print("=" * 70)
    print("🎓 LIVE BATCH OLLAMA VISION OCR PIPELINE 🎓")
    print("=" * 70)
    
    if not OCR_PARSER_SCRIPT.exists():
        print(f"Error: OCR script not found at {OCR_PARSER_SCRIPT}", file=sys.stderr)
        sys.exit(1)
        
    targets = get_target_directories()
    progress = load_progress()
    
    print(f"Total target PDF universities in queue: {len(targets)}")
    for i, t in enumerate(targets):
        print(f"  {i+1:02d}. {t.name}")
        
    for idx, uni_dir in enumerate(targets):
        name = uni_dir.name
        print(f"\n\n{'#'*80}")
        print(f"📚 [{idx+1}/{len(targets)}] PROCESSING INSTITUTION: {name}")
        print(f"{'#'*80}")
        
        # Check if already successfully processed
        if progress.get(name, {}).get("completed", False):
            print(f"⏭️ Skipping {name}: already marked as completed in tracker.")
            continue
            
        pdfs = list(uni_dir.glob("*.pdf"))
        if not pdfs:
            print(f"⚠️ Skipping {name}: PDF disappeared!")
            continue
            
        pdf_path = pdfs[0]
        
        # 1. OCR Extraction Phase
        ocr_ok = run_cmd([
            "python3", str(OCR_PARSER_SCRIPT),
            "--input", str(pdf_path),
            "--university", name,
            "--workers", "1"
        ], f"OCR vision parsing for {name}")
        
        if not ocr_ok:
            print(f"❌ OCR Extraction failed for {name}. Stopping batch.")
            progress[name] = {"completed": False, "step": "ocr_failed", "timestamp": time.time()}
            save_progress(progress)
            sys.exit(1)
            
        # 2. Normalization Phase
        structured_json = uni_dir / "CDS_structured_corrected.json"
        norm_ok = run_cmd([
            "python3", str(NORMALIZE_SCRIPT),
            "--all", str(structured_json)
        ], f"Canonical schema normalization for {name}")
        
        if not norm_ok:
            print(f"❌ Normalization failed for {name}. Stopping batch.")
            progress[name] = {"completed": False, "step": "normalization_failed", "timestamp": time.time()}
            save_progress(progress)
            sys.exit(1)
            
        # 3. PostgreSQL Ingestion Phase
        ingest_ok = run_cmd([
            "python3", str(IMPORT_SCRIPT)
        ], f"PostgreSQL database ingestion for {name}")
        
        if not ingest_ok:
            print(f"❌ DB Ingestion failed for {name}. Stopping batch.")
            progress[name] = {"completed": False, "step": "ingestion_failed", "timestamp": time.time()}
            save_progress(progress)
            sys.exit(1)
            
        # 4. Mark success
        print(f"🏆 Successfully processed and database-loaded: {name}")
        progress[name] = {"completed": True, "step": "done", "timestamp": time.time()}
        save_progress(progress)
        
    print("\n" + "="*80)
    print("🎉 ALL TARGET UNIVERSITIES OCR PIPELINE PROCESSES FINISHED SUCCESSFULLY! 🎉")
    print("="*80)

if __name__ == "__main__":
    main()
