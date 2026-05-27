# PRD-130: University Program Catalogs

Status: Draft

## Data Asset Contract

- Source Authority: Official university catalogs, schools, departments, or program pages.
- Product Value: Connects institution-level discovery to actual academic options available to students — so students can see what they would actually study, not just the institution's reputation.
- User-visible Fields: Program name, school/college/department, degree level (BA, BS, MA, PhD), catalog year, CIP code (if mapped), program description, available concentrations/tracks.
- Verification Requirement: Program claims must retain official source, institution, program name, and review date.
- Freshness Requirement: Annual refresh aligned with academic catalog cycle.
- Versioning Rule: Catalog-year differences should remain distinguishable when material to student decisions.
- Known Limitations: Universities may use inconsistent naming, school structures, and degree levels. Programs may be added, removed, or renamed between catalog years without public announcement.
- Downstream Consumers: Program discovery, major matching, fit engine, application planning, reports.

## Problem

Students need to understand what programs a school actually offers before deciding to apply. A school's reputation is meaningless if it doesn't offer the program the student wants. Research confirms:

- *"How can you proclaim what you're studying when you've never taken a university-level course on the subject?"* — Students have no visibility into actual program offerings before committing.

## Decision Questions

This data asset helps answer:

- What is the official program, major, school, college, department, or pathway?
- What would the student actually study?
- Which program or major direction should be compared under a Decision Option?
- Is the program's academic structure compatible with the student's interests, preparation, and goals?

## P0 Role

University program catalog data is the academic anchor for School / Program Comparison.

It prevents the product from comparing schools only at the institution level when the user's decision is really about a school/program combination.

## Product Rules

- Preserve official program names even when mapping them to standard majors or CIP-aligned categories.
- Program availability, school/department ownership, degree level, and catalog year should be clear where they affect decisions.
- Program claims should not be generalized from one university to another.
- When a program cannot be confidently mapped, it should be shown as uncertain rather than forced into a standard category.
- Catalog data should support comparison and fit, but should not imply admission availability or completion guarantee.

## Data Model

**Program Record**:
- `program_name`: Official name as published by the university
- `institution_id`: Linked to IPEDS identity record
- `school_college`: Parent academic unit (e.g., "College of Engineering")
- `department`: Specific department (e.g., "Department of Computer Science")
- `degree_level`: BA, BS, MA, MS, PhD, Certificate, etc.
- `catalog_year`: Academic year the catalog applies to (e.g., "2025-2026")
- `cip_code`: Mapped CIP code (if available, with confidence level)
- `concentrations`: Available tracks or specializations
- `source_url`: URL to official catalog page

## Catalog Year Awareness

- Display the catalog year prominently: "Program data from 2025-2026 catalog"
- Flag when programs have been added, removed, or renamed between catalog years
- Warn users: "Program requirements may change. Verify with the current catalog before applying."

## Data Gap Handling

- When program catalog data is unavailable for an institution, the system should not infer program offerings.
- Users should see: "Program catalog data is not available for this institution. Please verify with the university's official catalog."
- Demand vote integration: Users can request program catalog coverage for institutions without data.

## Downstream Consumers

- School / Program Comparison
- Program discovery
- Major matching
- Fit engine
- Application planning
- Reports
