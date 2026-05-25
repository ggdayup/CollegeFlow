# PRD-102: Data Lineage, Verification, and Freshness

Status: Draft

## Purpose

Define the product expectation that data claims remain traceable, verifiable, and freshness-aware across user surfaces.

## Product Rules

- Data claims must carry source lineage from original authority to user-facing display.
- Verification cues must be available where users make decisions from the claim.
- Stale, missing, conflicting, or low-confidence data must be signaled rather than hidden.
- Historical source versions must remain distinguishable when year-based datasets change.

## Claim States

Every user-visible data claim should be representable as one of these product states:

- **Verified**: source, year or version, authority, and interpretation are clear enough for decision use.
- **Verified with Limitations**: the claim can be shown, but its scope, coverage, freshness, or comparability limits must be visible.
- **Stale or Needs Review**: the claim may still be useful but should not be presented as current.
- **Conflicting**: multiple sources disagree or cannot be reconciled without explanation.
- **Missing**: the claim is unavailable and should not be inferred.
- **Mapped with Uncertainty**: the claim depends on a program, major, category, or outcome mapping that is not fully certain.

## Verification Cues

Where a data claim affects user decisions, the product should expose enough cueing to answer:

- What is the source?
- What year, release, or version does it represent?
- What category or scope does it apply to?
- Is the data complete, limited, stale, missing, or mapped?
- Is the claim an official fact, a mapped interpretation, or product-level decision support?

## Freshness Rules

- Freshness expectations should be source-specific.
- Older data may remain useful when the product clearly labels its year or release context.
- Missing current-year data should not cause the product to fabricate or silently substitute newer-looking values.
- Historical versions should be preserved when comparison across years may matter to decisions.

## Downstream Consumers

- Ranking and institution PRDs
- Decision Profile and fit engine PRDs
- Reports and shareable deliverables
- Admin and data quality operations
