# PRD-112: Common Data Set

Status: Review
Plane Issue: [c648aa17-2174-47d2-a88b-99c73515baaa](https://app.plane.so/sheenvita/projects/15c381fa-d6ad-4f10-8c47-2b04a3a342b5/issues/c648aa17-2174-47d2-a88b-99c73515baaa)
Latest Decision Issue: [d2e77a62-858e-448e-b461-ca00f3d9178b](https://app.plane.so/sheenvita/projects/15c381fa-d6ad-4f10-8c47-2b04a3a342b5/issues/d2e77a62-858e-448e-b461-ca00f3d9178b)

## Downstream Consumers

- [PRD-103: P0 Data Asset Loop](../10-overview/PRD-103-p0-data-asset-loop.md)
- [PRD-206: School / Program Comparison](../../20-intelligence-products/PRD-206-school-program-comparison.md)
- Admissions competitiveness
- University discovery
- Decision Profile
- Counselor reports

## Data Asset Contract

- Source Authority: University-published Common Data Set documents.
- Product Value: Supports admissions selectivity, applicant profile, financial aid, class profile, institutional transparency, and cross-school disclosure comparison use cases.
- User-visible Fields: Admissions and profile sections first.
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

CDS also functions as a scalable official-disclosure layer. The first 16 target universities establish the quality bar; future universities should be added without weakening completeness, provenance, or missing-data transparency.

For the first paid comparison, CDS should primarily act as data-gap evidence. Its most important job is to show what is known, what is missing, what is stale, and what cannot be responsibly compared across Decision Options.

## Product Rules

- CDS-derived claims must preserve institution, year, section, and source context.
- CDS data should be treated as institution-level disclosure unless a section clearly supports a narrower interpretation.
- Missing CDS fields should remain missing and should not be inferred from other schools.
- CDS year differences must be visible when they affect comparison.
- Admissions context must be framed as decision support, not admission probability.
- CDS should be combined with profile, ranking, program, outcomes, and confidence signals rather than used as a single decision authority.
- The product should preserve disclosed structure, empty disclosures, and explicit null or unavailable states so users can distinguish "not disclosed" from "not collected."
- Future university additions must meet the same verification and completeness bar as the initial target set before powering user-visible claims.
- Coverage growth should be treated as a product capability: the experience should show when a school is fully covered, partially covered, stale, or not yet covered.
- In the first paid comparison, CDS should prioritize data-gap explanation over trust marketing or risk scoring.
- The first user-visible CDS sections should focus on admissions and profile context.
- University expansion ordering is intentionally outside this PRD; the user will manage that prioritization separately.

## User-visible Value

CDS can help users and counselors discuss:

- admissions competitiveness;
- student profile fit where disclosed and comparable;
- application risk;
- institution-level transparency;
- data gaps that require counselor or user review.

## Product Value From CDS Analysis

CDS analysis can create value in five product layers:

1. **Trust foundation**: Users can see that admissions and profile statements come from official university disclosures, not scraped fragments or unsupported claims.
2. **Comparison clarity**: Families can compare Decision Options across shared disclosure categories while seeing where schools use different years, omit fields, or publish non-comparable details.
3. **Risk awareness**: Counselors and families can discuss selectivity, profile fit, enrollment context, financial aid context, and application uncertainty without turning those signals into false admission predictions.
4. **Data-gap intelligence**: Missing, stale, conflicting, or non-comparable CDS signals become part of the decision product instead of hidden data quality failures.
5. **Coverage expansion leverage**: Each newly added university increases the usefulness of School / Program Comparison, counselor reports, and parent-facing evidence summaries, as long as the product preserves the same provenance and completeness standard.

## First Paid Comparison Role

The first paid comparison should use CDS as the evidence layer for the Confidence / Data Gap Lens before expanding CDS into broader standalone admissions storytelling.

This means the CDS contribution should answer:

- Which admissions and profile facts are available for this Decision Option?
- Which admissions and profile facts are missing, stale, structurally unavailable, or not comparable?
- Does the comparison depend on uneven CDS coverage across schools?
- What should the user or counselor review next because CDS evidence is incomplete?

The product may still show verified admissions and profile facts, but the first-order paid value is explaining uncertainty and evidence quality.

## Initial User-visible Scope

The initial user-visible CDS scope is admissions and profile context.

Financial aid, class profile, enrollment, institutional context, and other CDS sections remain valid future candidates, but they should not distract from making the first admissions/profile data-gap experience clear, trustworthy, and useful.

## Coverage Expansion Requirements

As additional universities are added:

- the product must distinguish covered, partially covered, stale, unavailable, and under-review CDS states;
- users should not see unverified CDS-derived claims as if they were verified;
- comparisons should remain useful when one school has complete CDS coverage and another has partial or missing coverage;
- the product should prefer explicit limitation messages over silently hiding important gaps;
- coverage expansion must preserve the same verification and limitation language regardless of which universities are added next.

## Acceptance Criteria

- Given a verified CDS source is available for a university, when a CDS-derived claim is shown, then the product identifies the institution, year, source context, and relevant disclosure area.
- Given a CDS field is absent, explicitly unavailable, structurally empty, or not comparable, when the user views a comparison, then the product communicates the limitation instead of inferring or fabricating a value.
- Given two Decision Options rely on different CDS years, when the difference affects interpretation, then the comparison makes the year difference visible.
- Given a university has not yet passed CDS verification, when it appears in a paid comparison, then CDS-derived evidence is marked unavailable or under review rather than presented as verified.
- Given new universities are added to the CDS asset, when they power user-visible admissions or profile context, then they meet the same provenance, freshness, and completeness requirements as the initial target set.
- Given the first paid comparison uses CDS, when CDS evidence appears, then it primarily supports the Confidence / Data Gap Lens by explaining available, missing, stale, and non-comparable admissions/profile evidence.
- Given a CDS section is outside admissions/profile, when the first user-visible CDS experience is rendered, then the product does not require that section to be exposed unless a later PRD decision expands scope.

## Current Verification Note

The initial CDS asset has been verified for 16 target universities with complete preservation of disclosed values, empty structures, and explicit unavailable states. This verification establishes the product quality bar for future university expansion.

## Open Questions

- What coverage threshold is required before CDS becomes a default lens in School / Program Comparison?
