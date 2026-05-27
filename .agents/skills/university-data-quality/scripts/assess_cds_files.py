#!/usr/bin/env python3
import json
import sys
from pathlib import Path

CDS_DATA_DIR = Path(__file__).resolve().parents[4] / "data" / "cds" / "CollegeFlow_CDS" / "cds_data"

CANONICAL_SECTIONS = [
    "A_General", "B_Enrollment", "C_Admissions", "D_Transfers",
    "E_Academic", "F_Life", "G_Expenses", "H_Financial", "I_Faculty", "J_Degrees",
]

SECTION_ALIASES = {
    "E_AcademicOfferings": "E_Academic",
    "E_Academic Offerings": "E_Academic",
    "F_StudentLife": "F_Life",
    "F_Student Life": "F_Life",
    "H_FinancialAid": "H_Financial",
    "H_Financial Aid": "H_Financial",
    "J_DegreesConferred": "J_Degrees",
    "J_Degrees Conferred": "J_Degrees",
}


def count_leaves(obj):
    if isinstance(obj, dict):
        return sum(count_leaves(v) for v in obj.values())
    elif isinstance(obj, list):
        return sum(count_leaves(item) for item in obj)
    else:
        return 1


def find_university_dir(university_name: str):
    name_lower = university_name.lower().replace(" ", "_")
    for d in sorted(CDS_DATA_DIR.iterdir()):
        if not d.is_dir():
            continue
        if name_lower in d.name.lower() or d.name.lower().endswith(name_lower):
            return d
    for d in sorted(CDS_DATA_DIR.iterdir()):
        if not d.is_dir():
            continue
        if university_name.lower() in d.name.lower():
            return d
    return None


def assess_canonical(uni_dir: Path):
    canonical_path = uni_dir / "CDS_canonical.json"
    if not canonical_path.exists():
        return {"exists": False, "error": "CDS_canonical.json not found"}

    with open(canonical_path) as f:
        data = json.load(f)

    meta = data.get("_meta", {})
    sections = {}
    for sec in CANONICAL_SECTIONS:
        content = data.get(sec, {})
        if content is None:
            content = {}
        leaf_count = count_leaves(content)
        sections[sec] = {"leaf_count": leaf_count, "status": "OK" if leaf_count > 0 else "EMPTY"}

    total_leaves = sum(s["leaf_count"] for s in sections.values())
    empty_sections = [s for s, v in sections.items() if v["leaf_count"] == 0]

    return {
        "exists": True,
        "meta": meta,
        "sections": sections,
        "total_leaf_count": total_leaves,
        "empty_sections": empty_sections,
        "empty_section_count": len(empty_sections),
        "canonical_status": "CRITICAL" if total_leaves == 0 else ("WARNING" if empty_sections else "OK"),
    }


def assess_structured(uni_dir: Path):
    structured_path = uni_dir / "CDS_structured_corrected.json"
    if not structured_path.exists():
        return {"exists": False, "error": "CDS_structured_corrected.json not found"}

    with open(structured_path) as f:
        data = json.load(f)

    sections = {}
    for key, content in data.items():
        if key in ("_meta", "OCR_Errors"):
            continue
        leaf_count = count_leaves(content)
        canonical_name = SECTION_ALIASES.get(key, key)
        sections[key] = {"leaf_count": leaf_count, "canonical_name": canonical_name}

    unknown = data.get("Unknown_Unassigned", {})
    unknown_leaves = count_leaves(unknown)
    unknown_h_keys = [k for k in unknown if "financial" in k.lower() or "aid" in k.lower()]
    unknown_j_keys = [k for k in unknown if "degree" in k.lower()]

    ocr_errors = data.get("OCR_Errors", {})
    ocr_error_pages = list(ocr_errors.keys())

    return {
        "exists": True,
        "sections": sections,
        "unknown_unassigned": {
            "leaf_count": unknown_leaves,
            "h_financial_keys": len(unknown_h_keys),
            "j_degrees_keys": len(unknown_j_keys),
            "sample_h_keys": unknown_h_keys[:5],
            "sample_j_keys": unknown_j_keys[:5],
        },
        "ocr_errors": {
            "page_count": len(ocr_error_pages),
            "pages": ocr_error_pages,
        },
    }


def assess_key_mapping(uni_dir: Path):
    km_path = uni_dir / "key_mapping.json"
    if not km_path.exists():
        return {"exists": False, "error": "key_mapping.json not found"}

    with open(km_path) as f:
        data = json.load(f)

    sections = {}
    for sec, mappings in data.items():
        if sec == "_meta":
            continue
        sections[sec] = {"mapping_count": len(mappings)}

    covered_canonical = set()
    for sec in sections:
        canonical = SECTION_ALIASES.get(sec, sec)
        covered_canonical.add(canonical)

    missing_sections = [s for s in CANONICAL_SECTIONS if s not in covered_canonical]

    return {
        "exists": True,
        "sections": sections,
        "total_mappings": sum(s["mapping_count"] for s in sections.values()),
        "missing_canonical_sections": missing_sections,
    }


def assess_raw_ocr(uni_dir: Path):
    ocr_path = uni_dir / "CDS_raw_pages_ocr.json"
    if not ocr_path.exists():
        return {"exists": False}

    with open(ocr_path) as f:
        data = json.load(f)

    page_count = len(data)
    return {"exists": True, "page_count": page_count}


def run_assessment(university_name: str):
    uni_dir = find_university_dir(university_name)
    if not uni_dir:
        return {"error": f"No CDS data directory found for '{university_name}'", "searched_dir": str(CDS_DATA_DIR)}

    result = {
        "university": university_name,
        "data_dir": uni_dir.name,
        "canonical": assess_canonical(uni_dir),
        "structured": assess_structured(uni_dir),
        "key_mapping": assess_key_mapping(uni_dir),
        "raw_ocr": assess_raw_ocr(uni_dir),
    }

    issues = []
    if result["canonical"]["exists"] and result["canonical"]["empty_section_count"] > 0:
        issues.append({
            "severity": "CRITICAL",
            "area": "CDS_canonical.json",
            "message": f"{result['canonical']['empty_section_count']} of 10 CDS sections are empty",
            "empty_sections": result["canonical"]["empty_sections"],
        })

    if result["structured"]["exists"]:
        unknown = result["structured"]["unknown_unassigned"]
        if unknown["leaf_count"] > 50:
            issues.append({
                "severity": "WARNING",
                "area": "CDS_structured_corrected.json",
                "message": f"{unknown['leaf_count']} leaf values in Unknown_Unassigned",
                "h_keys_in_unknown": unknown["h_financial_keys"],
                "j_keys_in_unknown": unknown["j_degrees_keys"],
            })
        if result["structured"]["ocr_errors"]["page_count"] > 0:
            issues.append({
                "severity": "WARNING",
                "area": "OCR_Errors",
                "message": f"{result['structured']['ocr_errors']['page_count']} pages with OCR errors",
                "pages": result["structured"]["ocr_errors"]["pages"],
            })

    if result["key_mapping"]["exists"] and result["key_mapping"]["missing_canonical_sections"]:
        issues.append({
            "severity": "WARNING",
            "area": "key_mapping.json",
            "message": f"Missing key mappings for: {result['key_mapping']['missing_canonical_sections']}",
        })

    result["issues"] = issues
    return result


if __name__ == "__main__":
    name = sys.argv[1] if len(sys.argv) > 1 else "dartmouth"
    output = run_assessment(name)
    print(json.dumps(output, indent=2, ensure_ascii=False))
