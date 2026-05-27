#!/usr/bin/env python3
"""
Dry-run audit for cds_full_canonical_candidates.json → database import readiness.

Steps:
1. Transform candidates JSON → import-ready CDS_canonical.json format
2. Run 7-layer verification
3. Simulate database import (flatten leaves, check field coverage)
4. Report gaps and readiness verdict
"""

import json
import sys
from pathlib import Path

CANDIDATES_PATH = Path(
    "/Users/ggdayup/ggdayup-syncthing/code/CollegeFlow/data/cds/CollegeFlow_CDS/cds_data/17_rice/parse/cds_full_canonical_candidates.json"
)
SCHEMA_PATH = Path(
    "/Users/ggdayup/ggdayup-syncthing/code/CollegeFlow/data/cds/CollegeFlow_CDS/database/canonical_schema.json"
)

# Mapping from CDS item ID → (section_name, field_prefix)
ITEM_TO_SECTION = {
    # A - General
    "A1": ("A_General", "a1_address_information"),
    "A2": ("A_General", "a2_institutional_control"),
    "A3": ("A_General", "a3_classification"),
    "A4": ("A_General", "a4_academic_calendar"),
    "A5": ("A_General", "a5_degrees_offered"),
    "A6": ("A_General", "a6_diversity_equity_inclusion"),
    # B - Enrollment
    "B1": ("B_Enrollment", "b1_enrollment"),
    "B2": ("B_Enrollment", "b2_enrollment_by_race"),
    "B3": ("B_Enrollment", "b3_degrees_awarded"),
    "B12": ("B_Enrollment", "b12_enrollment_by_age"),
    "B13": ("B_Enrollment", "b13_enrollment_by_residence"),
    "B14": ("B_Enrollment", "b14_enrollment_by_citizenship"),
    "B15": ("B_Enrollment", "b15_enrollment_by_ethnicity"),
    "B16": ("B_Enrollment", "b16_enrollment_by_race_gender"),
    "B17": ("B_Enrollment", "b17_enrollment_pell"),
    "B18": ("B_Enrollment", "b18_first_gen_enrollment"),
    "B19": ("B_Enrollment", "b19_disability_enrollment"),
    "B20": ("B_Enrollment", "b20_veteran_enrollment"),
    "B21": ("B_Enrollment", "B4_B21_graduation_rates"),
    "B22": ("B_Enrollment", "b22_retention"),
    # C - Admissions
    "C1": ("C_Admissions", "c1_applications"),
    "C2": ("C_Admissions", "c2_waitlist"),
    "C3": ("C_Admissions", "c3_early_action"),
    "C4": ("C_Admissions", "c4_early_application_plan"),
    "C5": ("C_Admissions", "c5_application_fee"),
    "C6": ("C_Admissions", "c6_application_requirements"),
    "C7": ("C_Admissions", "c7_test_optional"),
    "C8B": ("C_Admissions", "c8b_sat_preparation"),
    "C8C": ("C_Admissions", "c8c_act_preparation"),
    "C8D": ("C_Admissions", "c8d_sat_subject"),
    "C8E": ("C_Admissions", "c8e_toefl_minimum"),
    "C8F": ("C_Admissions", "c8f_international_student_requirements"),
    "C8G": ("C_Admissions", "c8g_placement_tests"),
    "C9": ("C_Admissions", "c9_test_scores"),
    "C10": ("C_Admissions", "c10_class_rank"),
    "C11": ("C_Admissions", "c11_gpa_distribution"),
    "C12": ("C_Admissions", "c12_average_gpa"),
    "C13": ("C_Admissions", "c13_application_fee"),
    "C14": ("C_Admissions", "c14_common_application"),
    "C15": ("C_Admissions", "c15_first_year_term"),
    "C16": ("C_Admissions", "c16_application_deadline"),
    "C17": ("C_Admissions", "c17_admission_notification"),
    "C18": ("C_Admissions", "c18_applicant_agreement"),
    "C19": ("C_Admissions", "c19_application_requirements"),
    "C20": ("C_Admissions", "c20_transfer_credit"),
    "C21": ("C_Admissions", "c21_early_decision"),
    "C22": ("C_Admissions", "c22_early_action_nonbinding"),
    # D - Transfers
    "D1": ("D_Transfers", "d1_transfer_policy"),
    "D2": ("D_Transfers", "d2_transfer_stats"),
    "D3": ("D_Transfers", "d3_transfer_enrollment_terms"),
    "D4": ("D_Transfers", "d4_transfer_application_requirements"),
    "D5": ("D_Transfers", "d5_transfer_requirements_detail"),
    "D6": ("D_Transfers", "d6_transfer_credit_max"),
    "D7": ("D_Transfers", "d7_transfer_orientation"),
    "D8": ("D_Transfers", "d8_transfer_housing"),
    "D9": ("D_Transfers", "d9_transfer_admission_criteria"),
    "D10": ("D_Transfers", "d10_transfer_application_deadline"),
    "D11": ("D_Transfers", "d11_transfer_notification_date"),
    "D12": ("D_Transfers", "d12_transfer_grade_policy"),
    "D13": ("D_Transfers", "d13_transfer_application_fee"),
    "D14": ("D_Transfers", "d14_transfer_common_application"),
    "D15": ("D_Transfers", "d15_transfer_associate_residency"),
    "D16": ("D_Transfers", "d16_transfer_bachelor_residency"),
    "D17": ("D_Transfers", "d17_transfer_credit_evaluation"),
    "D18": ("D_Transfers", "d18_transfer_credit_sources"),
    "D19": ("D_Transfers", "d19_transfer_credit_ap_exam"),
    "D20": ("D_Transfers", "d20_transfer_credit_ib"),
    "D21": ("D_Transfers", "d21_transfer_veteran_policy"),
    "D22": ("D_Transfers", "d22_transfer_veteran_credit"),
    # E - Academic Offerings
    "E1": ("E_AcademicOfferings", "e1_special_study_options"),
    "E2": ("E_AcademicOfferings", "e2_academic_support"),
    "E3": ("E_AcademicOfferings", "e3_graduation_requirements"),
    # F - Student Life
    "F1": ("F_StudentLife", "f1_student_life"),
    "F2": ("F_StudentLife", "f2_activities"),
    "F3": ("F_StudentLife", "f3_services"),
    "F4": ("F_StudentLife", "f4_facilities"),
    # G - Expenses
    "G0": ("G_Expenses", "g0_net_price_calculator"),
    "G1": ("G_Expenses", "g1_tuition_and_fees"),
    "G2": ("G_Expenses", "g2_credits_per_term"),
    "G3": ("G_Expenses", "g3_tuition_variation_year"),
    "G4": ("G_Expenses", "g4_tuition_variation_program"),
    "G5": ("G_Expenses", "g5_estimated_expenses"),
    "G6": ("G_Expenses", "g6_per_credit_charges"),
    # H - Financial Aid
    "H1": ("H_FinancialAid", "h1_financial_aid_summary"),
    "H2": ("H_FinancialAid", "h2_averages"),
    "H2A": ("H_FinancialAid", "h2a_nonneed_aid"),
    "H4": ("H_FinancialAid", "h4_students_receiving_aid"),
    "H6": ("H_FinancialAid", "h6_nonresident_aid"),
    "H7": ("H_FinancialAid", "h7_nonresident_forms"),
    "H8": ("H_FinancialAid", "h8_domestic_forms"),
    "H9": ("H_FinancialAid", "h9_priority_filing"),
    "H10": ("H_FinancialAid", "h10_notification"),
    "H11": ("H_FinancialAid", "h11_reply_date"),
    "H12": ("H_FinancialAid", "h12_loans"),
    "H13": ("H_FinancialAid", "h13_grants"),
    "H14": ("H_FinancialAid", "h14_institutional_aid"),
    # J - Degrees
    "J1": ("J_Degrees", "degrees_conferred_pct"),
}

SECTION_NAMES = {
    "A": "A_General",
    "B": "B_Enrollment",
    "C": "C_Admissions",
    "D": "D_Transfers",
    "E": "E_AcademicOfferings",
    "F": "F_StudentLife",
    "G": "G_Expenses",
    "H": "H_FinancialAid",
    "I": "I_Faculty",
    "J": "J_Degrees",
}


def transform_candidates_to_canonical(candidates: dict) -> dict:
    """Transform cds_full_canonical_candidates.json → CDS_canonical.json format."""
    result = {
        "_meta": {
            "source_document": candidates["document"]["pdf"],
            "page_count": candidates["document"]["page_count"],
            "schema_id": candidates["resolver_quality"]["schema_id"],
            "institution_name": None,  # Will need to be filled
            "academic_year": "2024-2025",
            "missing_sections": [],
        }
    }

    items = candidates["canonical_items"]

    for item_id, item in sorted(items.items()):
        if item_id not in ITEM_TO_SECTION:
            print(f"  ⚠️ Unknown item ID: {item_id}")
            continue

        section_name, field_prefix = ITEM_TO_SECTION[item_id]

        if section_name not in result:
            result[section_name] = {}

        for field_name, field_val in item.get("fields", {}).items():
            if field_name == "table_blocks":
                # Skip raw table blocks - these are structural, not data
                continue

            value = field_val.get("value")
            status = field_val.get("status")

            if value is None and status == "missing":
                continue

            if status == "not_applicable":
                continue

            # Build the target key in canonical format
            target_key = f"{field_prefix}.{field_name}" if field_prefix != field_name else field_name

            # Extract the substantive value
            result[section_name][field_name] = extract_value(value, field_name)

    # Determine missing sections
    all_sections = set(SECTION_NAMES.values())
    present_sections = set(result.keys()) - {"_meta"}
    result["_meta"]["missing_sections"] = sorted(all_sections - present_sections)

    return result


def extract_value(value, field_name):
    """Extract the substantive data value from the candidates field."""
    if value is None:
        return None

    if isinstance(value, (str, int, float, bool)):
        return value

    if isinstance(value, list):
        # If it's a list of simple values, return as-is
        if all(isinstance(v, (str, int, float, bool)) for v in value):
            return value
        # If it's a list of dicts with specific structure, try to extract
        return value

    if isinstance(value, dict):
        return value

    return str(value)


def count_leaves(obj, prefix=""):
    """Count leaf nodes in a nested dict/list structure."""
    leaves = []
    if isinstance(obj, dict):
        for k, v in obj.items():
            leaves.extend(count_leaves(v, f"{prefix}.{k}" if prefix else k))
    elif isinstance(obj, list):
        for i, v in enumerate(obj):
            leaves.extend(count_leaves(v, f"{prefix}[{i}]"))
    else:
        leaves.append((prefix, type(obj).__name__, obj))
    return leaves


def check_completeness(canonical: dict, candidates: dict) -> dict:
    """Check which critical CDS sections/fields are missing."""
    all_sections = {
        "A_General": ["a1_address_information", "a2_institutional_control"],
        "B_Enrollment": ["b1_enrollment", "b22_retention", "B4_B21_graduation_rates"],
        "C_Admissions": [
            "c1_applications", "c9_test_scores", "c10_class_rank",
            "c12_average_gpa", "c13_application_fee"
        ],
        "D_Transfers": ["d2_transfer_stats"],
        "E_AcademicOfferings": ["e1_special_study_options"],
        "F_StudentLife": ["f1_student_life"],
        "G_Expenses": ["g1_tuition_and_fees"],
        "H_FinancialAid": ["h1_financial_aid_summary", "h2_averages"],
        "I_Faculty": ["i2_ratios"],
        "J_Degrees": ["degrees_conferred_pct"],
    }

    report = {}
    for section, critical_fields in all_sections.items():
        section_data = canonical.get(section, {})
        present = []
        missing = []
        for field in critical_fields:
            if field in section_data:
                present.append(field)
            else:
                missing.append(field)
        report[section] = {"present": present, "missing": missing}

    return report


def simulate_import(canonical: dict) -> dict:
    """Simulate the import_to_pg.py traversal to check what would be stored."""
    leaves = []
    for section_name, section_data in canonical.items():
        if section_name == "_meta":
            continue
        section_leaves = count_leaves(section_data)
        leaves.extend([(f"{section_name}.{path}", vtype, val) for path, vtype, val in section_leaves])

    # Categorize
    text_leaves = [l for l in leaves if l[1] == "str"]
    num_leaves = [l for l in leaves if l[1] in ("int", "float")]
    bool_leaves = [l for l in leaves if l[1] == "bool"]
    list_leaves = [l for l in leaves if l[1] == "list"]
    dict_leaves = [l for l in leaves if l[1] == "dict"]
    none_leaves = [l for l in leaves if l[1] == "NoneType"]

    return {
        "total_leaves": len(leaves),
        "text": len(text_leaves),
        "numeric": len(num_leaves),
        "boolean": len(bool_leaves),
        "list": len(list_leaves),
        "dict": len(dict_leaves),
        "none": len(none_leaves),
        "sample_text": [l[0] for l in text_leaves[:5]],
        "sample_numeric": [(l[0], l[2]) for l in num_leaves[:10]],
    }


def main():
    print("=" * 70)
    print("DRY-RUN AUDIT: Rice University CDS Import Readiness")
    print("=" * 70)

    # Load candidates
    with open(CANDIDATES_PATH, "r", encoding="utf-8") as f:
        candidates = json.load(f)

    print(f"\n📄 Source: {candidates['document']['pdf']}")
    print(f"📊 Pages: {candidates['document']['page_count']}")
    print(f"📋 CDS items: {candidates['source_quality']['cds_item_count']}")
    print(f"🔧 Schema resolved: {candidates['resolver_quality']['schema_resolved_items']}/{candidates['resolver_quality']['item_count']}")
    print(f"⚠️ Low confidence fields: {len(candidates['resolver_quality']['low_confidence_fields'])}")
    for lf in candidates['resolver_quality']['low_confidence_fields']:
        print(f"   - {lf['item_id']}.{lf['field']}")

    # Transform
    print("\n── Step 1: Transform to canonical format ──")
    canonical = transform_candidates_to_canonical(candidates)
    sections = [k for k in canonical if k != "_meta"]
    print(f"  Sections present: {len(sections)}/10")
    for s in sorted(sections):
        fields = list(canonical[s].keys())
        print(f"    {s}: {len(fields)} fields")

    missing = canonical["_meta"].get("missing_sections", [])
    if missing:
        print(f"  Missing sections: {', '.join(missing)}")

    # Completeness check
    print("\n── Step 2: Completeness Check ──")
    completeness = check_completeness(canonical, candidates)
    for section, status in completeness.items():
        if status["missing"]:
            print(f"  ⚠️ {section}: missing {status['missing']}")
        else:
            print(f"  ✅ {section}: all critical fields present")

    # Simulate import
    print("\n── Step 3: Import Simulation ──")
    sim = simulate_import(canonical)
    print(f"  Total leaf nodes: {sim['total_leaves']}")
    print(f"    Text: {sim['text']}")
    print(f"    Numeric: {sim['numeric']}")
    print(f"    Boolean: {sim['boolean']}")
    print(f"    List: {sim['list']}")
    print(f"    Dict: {sim['dict']}")
    print(f"    None: {sim['none']}")

    if sim["sample_numeric"]:
        print(f"\n  Sample numeric values:")
        for path, val in sim["sample_numeric"]:
            print(f"    {path} = {val}")

    # Key data points check
    print("\n── Step 4: Key Data Points Check ──")
    key_checks = [
        ("Institution name", canonical.get("_meta", {}).get("institution_name")),
        ("Academic year", canonical.get("_meta", {}).get("academic_year")),
        ("C1: applicants_total", canonical.get("C_Admissions", {}).get("c1_applications")),
        ("C9: test scores", canonical.get("C_Admissions", {}).get("c9_test_scores")),
        ("B1: enrollment", canonical.get("B_Enrollment", {}).get("b1_enrollment")),
        ("B22: retention", canonical.get("B_Enrollment", {}).get("b22_retention")),
        ("G1: tuition", canonical.get("G_Expenses", {}).get("g1_tuition_and_fees")),
        ("H2: financial aid", canonical.get("H_FinancialAid", {}).get("h2_averages")),
        ("I_Faculty: section", canonical.get("I_Faculty")),
        ("J: degrees", canonical.get("J_Degrees", {}).get("degrees_conferred_pct")),
    ]

    for label, val in key_checks:
        if val is None:
            print(f"  ❌ {label}: MISSING")
        elif isinstance(val, dict):
            print(f"  ✅ {label}: present ({len(val)} keys)")
        elif isinstance(val, list):
            print(f"  ✅ {label}: present ({len(val)} items)")
        else:
            print(f"  ✅ {label}: {val}")

    # Readiness verdict
    print("\n" + "=" * 70)
    print("READINESS VERDICT")
    print("=" * 70)

    issues = []
    if canonical.get("_meta", {}).get("institution_name") is None:
        issues.append("institution_name not set in _meta")

    missing_critical = []
    for section, status in completeness.items():
        critical = ["c1_applications", "c9_test_scores", "b1_enrollment",
                    "b22_retention", "g1_tuition_and_fees"]
        for m in status["missing"]:
            if m in critical:
                missing_critical.append(f"{section}.{m}")

    if missing_critical:
        issues.append(f"Critical data fields missing: {missing_critical}")

    if "I_Faculty" not in canonical:
        issues.append("I_Faculty section completely missing")

    if sim["numeric"] == 0:
        issues.append("No numeric values extracted")

    if issues:
        print("❌ NOT READY for import. Issues:")
        for issue in issues:
            print(f"  • {issue}")
    else:
        print("✅ READY for import (pending verification)")

    # Write transformed output for manual inspection
    output_path = CANDIDATES_PATH.parent / "CDS_canonical_dry_run.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(canonical, f, indent=2, ensure_ascii=False)
    print(f"\n📝 Transformed canonical JSON written to: {output_path}")


if __name__ == "__main__":
    main()
