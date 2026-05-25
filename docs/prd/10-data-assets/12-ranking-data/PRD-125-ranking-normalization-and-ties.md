# PRD-125: Ranking Normalization and Ties

Status: Draft

## Purpose

Define product requirements for comparing ranking sources without distorting source-specific meaning.

## Product Rules

- Preserve original ranks and ties from each source.
- Do not invent ranks for missing institutions.
- Normalize only for comparison views that clearly label the normalized interpretation.
- Show source, year, category, and known limitation context for ranking-derived comparisons.
- Missing ranking data should remain missing rather than being inferred.

## Downstream Consumers

- Ranking comparison
- University discovery
- Fit engine
- Reports

