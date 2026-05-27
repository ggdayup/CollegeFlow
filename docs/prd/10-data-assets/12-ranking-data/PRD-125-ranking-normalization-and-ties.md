# PRD-125: Ranking Normalization and Ties

Status: Draft

## Purpose

Define product requirements for comparing ranking sources without distorting source-specific meaning — so users can see how different sources evaluate the same institution without creating false equivalence.

## Problem

Students and parents see different rankings from US News, QS, and THE and want to understand what they mean together. However, each source uses different methodology, scope, and category definitions. Combining them without context creates misleading impressions.

## Product Rules

- Preserve original ranks and ties from each source.
- Do not invent ranks for missing institutions.
- Normalize only for comparison views that clearly label the normalized interpretation.
- Show source, year, category, and known limitation context for ranking-derived comparisons.
- Missing ranking data should remain missing rather than being inferred.

## Normalization Approach

### Percentile-Based Normalization (for comparison views only)

When displaying multiple ranking sources side-by-side:

- Convert each rank to a percentile within that source's cohort: `percentile = (1 - rank / total_ranked) * 100`
- Display the original rank alongside the percentile: "US News: #15 (Top 5%)"
- Percentile values enable visual comparison while preserving original rank meaning

### Tie Handling

- When a source publishes tied ranks (e.g., "ranked #15-20"), preserve the range.
- Percentile for tied ranks should use the midpoint of the range.
- Display: "US News: #15-20 (Tied)" — the tie status must be visible.

### Missing Data

- When a source has not ranked an institution, do not assign a percentile or inferred rank.
- Display: "Not ranked by [source]" — the absence of data is itself meaningful information.

### Methodology Change Warnings

- When a source has changed its methodology, rankings before and after the change should be flagged:
  - "US News methodology changed in 2025. Ranks from 2024 and 2025 may not be directly comparable."
- Users should not compare pre- and post-methodology-change ranks as if they measure the same thing.

## Comparison View Requirements

When the platform shows multiple ranking sources for the same institution:

1. Each source's original rank and year must be displayed
2. Percentile normalization may be used for visual comparison (e.g., radar charts, bar charts)
3. A methodology comparison link should be available: "Why do these rankings differ?"
4. No "average rank" or "combined score" should be computed across sources — this creates false precision

## Downstream Consumers

- Ranking comparison (PRD-120)
- University discovery (PRD-302)
- Fit engine (PRD-201)
- Reports and deliverables (PRD-402)
