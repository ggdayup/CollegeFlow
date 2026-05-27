# PRD-102: Data Lineage, Verification, and Freshness

Status: Draft

## Depends On

- PRD-002: Data Trust and Citation Principles
- PRD-100: Data Asset Strategy
- PRD-101: Data Source Governance

## Purpose

Define the product expectation that data claims remain traceable, verifiable, and freshness-aware across user surfaces — so users can trust what they see and understand what they should question.

## Problem

Data flows from dozens of sources (CDS, IPEDS, College Scorecard, US News, QS, THE, Niche, program catalogs) through multiple processing steps before reaching users. Without explicit lineage, users cannot verify claims, operators cannot trace errors, and the platform cannot maintain its data trust guarantee.

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

## Lineage Model

Each data claim carries a lineage chain:

```
Source Authority → Ingestion → Normalization → Mapping → Display
```

**At each step, the following must be preserved:**

- **Source**: Original authority name and URL (e.g., "CDS 2025, Harvard University")
- **Ingestion timestamp**: When the data was last pulled
- **Normalization method**: Any transformation applied (e.g., percentile conversion for rankings)
- **Mapping confidence**: If the data was mapped to a standardized category (e.g., CIP code)
- **Display version**: The current state of the data as shown to users

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

## Source-Specific Freshness Cycles

| Source | Expected Cycle | Stale Threshold |
|--------|---------------|-----------------|
| CDS | Annual (August) | 2+ years old |
| IPEDS | Annual (December) | 2+ years old |
| College Scorecard | Annual (September) | 3+ years old |
| US News | Annual (September) | 2+ years old |
| QS | Annual (June) | 2+ years old |
| THE | Annual (October) | 2+ years old |
| Niche | Annual | 2+ years old |
| Program Catalogs | Academic year | 2+ catalog years old |
| BLS/O*NET | Annual | 3+ years old |

## Downstream Consumers

- Ranking and institution PRDs
- Decision Profile and fit engine PRDs
- Reports and shareable deliverables
- Admin and data quality operations
- Data Gap and Warning System (PRD-204)
