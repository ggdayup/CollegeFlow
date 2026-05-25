# PRD-112: Common Data Set

Status: Draft

## Data Asset Contract

- Source Authority: University-published Common Data Set documents.
- Product Value: Supports admissions selectivity, applicant profile, financial aid, class profile, and institutional transparency use cases.
- User-visible Fields: To be defined per verified CDS section and product priority.
- Verification Requirement: Each CDS-derived claim must retain institution, year, section, and source citation context.
- Freshness Requirement: CDS year availability must be visible when current-year data is unavailable.
- Versioning Rule: CDS data should be year-specific and comparable across years only when definitions are compatible.
- Known Limitations: Institutions may publish PDFs, web pages, missing years, or inconsistent formatting.
- Downstream Consumers: Admissions competitiveness, university discovery, Decision Profile, counselor reports.

## Product Boundary

This PRD owns product meaning and acceptable use of CDS data. It does not own PDF parsing or extraction implementation.

