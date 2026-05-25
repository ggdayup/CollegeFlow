# PRD-002: Data Trust and Citation Principles

Status: Draft

## Purpose

Define the product rules for trusted admissions, ranking, institution, academic, and outcomes data.

## Product Rules

- Every factual academic, admissions, ranking, salary, institution, or outcome claim must trace to an authoritative source.
- Data shown to users must include enough citation context for users to understand source, year or version, and confidence.
- Missing data should be shown as missing or unavailable, not guessed.
- Source conflicts should be surfaced as conflicts or handled by an approved normalization PRD.
- Data freshness expectations must be explicit for each data asset.

## Does Not Own

- Source-specific field definitions.
- Ranking-specific normalization.
- User interface presentation rules.
- Engineering ingestion design.

## Downstream Consumers

- All `10-data-assets/` PRDs
- All `20-intelligence-products/` PRDs
- Reports, sharing, and commercial PRDs

