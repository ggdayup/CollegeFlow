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

## Decision Questions

This data asset helps answer:

- What does the institution disclose about admissions, enrollment, student profile, and institutional context?
- What admissions or profile signals are relevant to the student's Decision Option?
- Which CDS year is being used, and how current is it?
- Which fields are unavailable, incompatible, or not comparable across institutions?

## P0 Role

CDS is a primary admissions and profile data asset for School / Program Comparison.

It should support admissions context and risk awareness without claiming to predict individual admission results.

## Product Rules

- CDS-derived claims must preserve institution, year, section, and source context.
- CDS data should be treated as institution-level disclosure unless a section clearly supports a narrower interpretation.
- Missing CDS fields should remain missing and should not be inferred from other schools.
- CDS year differences must be visible when they affect comparison.
- Admissions context must be framed as decision support, not admission probability.
- CDS should be combined with profile, ranking, program, outcomes, and confidence signals rather than used as a single decision authority.

## User-visible Value

CDS can help users and counselors discuss:

- admissions competitiveness;
- student profile fit where disclosed and comparable;
- application risk;
- institution-level transparency;
- data gaps that require counselor or user review.
