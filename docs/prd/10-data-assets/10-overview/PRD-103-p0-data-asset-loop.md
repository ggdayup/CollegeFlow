# PRD-103: P0 Data Asset Loop

Status: Draft

## Purpose

Define the minimum data asset loop required for the first paid Full Decision Workspace experience.

P0 is the smallest paid data loop, not the easiest data loop. It must contain the assets needed to make School / Program Decision Option comparison valuable, trustworthy, and commercially attractive.

## Depends On

- [PRD-100: Data Asset Strategy](PRD-100-data-asset-strategy.md)
- [PRD-101: Data Source Governance](PRD-101-data-source-governance.md)
- [PRD-102: Data Lineage, Verification, and Freshness](PRD-102-data-lineage-verification-and-freshness.md)
- [PRD-206: School / Program Comparison](../../20-intelligence-products/PRD-206-school-program-comparison.md)

## P0 Data Asset Loop

The P0 paid comparison loop requires:

```text
Institution Identity
  + Source Lineage and Freshness
  + Mapping and Normalization
  + Admissions and Profile
  + Ranking and Reputation
  + Academic Program and Curriculum
  + Outcomes and Economics
```

## Why All Seven Are P0

### Institution Identity

Without a reliable institution identity layer, different source claims cannot be safely connected to the same school.

### Source Lineage and Freshness

Without lineage and freshness, the product cannot explain why users should trust a claim or whether the claim may be stale.

### Mapping and Normalization

Without mapping and normalization, the product cannot responsibly compare rankings, programs, majors, outcomes, and school records.

### Admissions and Profile

Admissions context gives families and counselors a practical sense of competitiveness and application risk.

### Ranking and Reputation

Ranking is a primary attraction signal. It must include both overall institution ranking and subject, discipline, program, or major-related ranking where available.

### Academic Program and Curriculum

Program and curriculum data connect a student's interest to what they would actually study.

### Outcomes and Economics

Outcomes, salary, employment, ROI, debt, cost, and labor-market signals are core parent-facing payment motivators, with appropriate limitations.

## P0 Comparison Requirement

Every P0 School / Program Comparison should try to answer:

- What looks strong?
- What looks risky?
- What is uncertain?
- What data supports this?
- What next question should be answered?

## Product Rules

- Do not ship a paid comparison that relies only on ranking.
- Do not ship a paid comparison that lacks source confidence or data-gap context.
- Do not treat outcomes as personal guarantees.
- Do not treat ranking absence as a negative conclusion.
- Do connect every user-visible comparison claim to at least one source-backed or user-profile-backed rationale.
- Do preserve the distinction between official facts, mapped interpretations, and product-level decision support.

## Open Questions

- Which P0 data asset can be partial at launch while still preserving trust?
- Which comparison lenses should be allowed to show limited, unavailable, or confidence-limited states?
- How should the product message a comparison when ranking is available but program or outcomes data is incomplete?

