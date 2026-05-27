# PRD-110: NCES IPEDS Institution Profile

Status: Draft

## Data Asset Contract

- Source Authority: NCES IPEDS (Integrated Postsecondary Education Data System) or equivalent official institution identity source.
- Product Value: Provides trusted institution identity and baseline school attributes — the anchor record that connects all other data assets (CDS, Scorecard, Rankings, Program Catalogs) to the correct school.
- User-visible Fields: Institution name, aliases, IPEDS unit ID, location (city, state, country), institution type (public, private nonprofit, private for-profit), control, campus setting (urban/suburban/rural), enrollment size, degrees offered.
- Verification Requirement: Institution records must retain source identity and version cues.
- Freshness Requirement: Annual refresh aligned with IPEDS release cycle.
- Versioning Rule: Year or release-specific data must remain distinguishable.
- Known Limitations: IPEDS covers U.S. institutions primarily. International institutions require alternative identity sources. Some institutions have multiple IPEDS unit IDs (branch campuses, merged institutions).
- Downstream Consumers: University discovery, institution comparison, rankings, fit engine, reports.

## Decision Questions

This data asset helps answer:

- Are all claims referring to the same institution?
- What is the institution's official baseline identity?
- What school-level attributes are safe to use as comparison context?
- Which external source identifiers should be mapped to the same school identity?

## Product Boundary

This PRD owns institution identity and baseline profile requirements. It does not own ranking methodology, program catalogs, or commercial access rules.

## Product Rules

- Institution identity is the anchor for ranking, CDS, Scorecard, program catalog, outcomes, and report claims.
- Institution aliases should not replace the canonical identity, but they may support search and matching.
- Identity conflicts must be resolved or flagged before downstream comparison.
- User-facing comparison should not merge two institutions only because their names appear similar.
- Source-specific IDs should be treated as traceability cues, not as user-facing marketing copy unless helpful for verification.

## Identity Resolution

**Primary Key**: IPEDS Unit ID (for U.S. institutions)

**International Institutions**: Use a synthetic ID based on country + institution name + location, with clear labeling that the identity is platform-assigned.

**Alias Management**:
- Store known aliases, former names, and common abbreviations
- Aliases support search but do not replace the canonical name
- When a student searches for "UMich", the system resolves to "University of Michigan--Ann Arbor" with a note: "You searched for 'UMich' — showing results for University of Michigan--Ann Arbor"

**Branch Campuses**:
- Each branch campus has a separate IPEDS Unit ID and identity record
- Users should see the specific campus, not the parent institution
- Example: "NYU Shanghai" is distinct from "New York University"

## P0 Role

Institution identity is a trust foundation asset for P0 School / Program Comparison.

It enables the product to connect a Decision Option to the correct school record before applying ranking, admissions, program, or outcomes signals.

## Data Gap Handling

- When IPEDS data is unavailable for an institution (e.g., international school), the system should not infer identity attributes.
- Users should see: "Identity data is from [alternative source]. This institution is not in the IPEDS database."
- Demand vote integration: Users can request IPEDS coverage for U.S. institutions without data.

## Does Not Own

- Program catalog ingestion
- Ranking normalization
- Admissions data collection
- Database schema or API contracts
