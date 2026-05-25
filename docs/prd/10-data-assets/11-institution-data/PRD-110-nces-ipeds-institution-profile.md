# PRD-110: NCES IPEDS Institution Profile

Status: Draft

## Data Asset Contract

- Source Authority: NCES IPEDS or equivalent official institution identity source.
- Product Value: Provides trusted institution identity and baseline school attributes.
- User-visible Fields: To be defined only after source review.
- Verification Requirement: Institution records must retain source identity and version cues.
- Freshness Requirement: To be defined by source release cycle.
- Versioning Rule: Year or release-specific data must remain distinguishable.
- Known Limitations: To be documented during source review.
- Downstream Consumers: University discovery, institution comparison, rankings, fit engine, reports.

## Product Boundary

This PRD owns institution identity and baseline profile requirements. It does not own ranking methodology, program catalogs, or commercial access rules.

## Decision Questions

This data asset helps answer:

- Are all claims referring to the same institution?
- What is the institution's official baseline identity?
- What school-level attributes are safe to use as comparison context?
- Which external source identifiers should be mapped to the same school identity?

## Product Rules

- Institution identity is the anchor for ranking, CDS, Scorecard, program catalog, outcomes, and report claims.
- Institution aliases should not replace the canonical identity, but they may support search and matching.
- Identity conflicts must be resolved or flagged before downstream comparison.
- User-facing comparison should not merge two institutions only because their names appear similar.
- Source-specific IDs should be treated as traceability cues, not as user-facing marketing copy unless helpful for verification.

## P0 Role

Institution identity is a trust foundation asset for P0 School / Program Comparison.

It enables the product to connect a Decision Option to the correct school record before applying ranking, admissions, program, or outcomes signals.
