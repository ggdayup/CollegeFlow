# PRD-002: Data Trust and Citation Principles

Status: Draft

## Purpose

Define the product rules for trusted admissions, ranking, institution, academic, and outcomes data — so every claim shown to users is source-backed, verifiable, and transparent about limitations.

## Problem

College decisions are high-stakes and data-dependent. If users cannot trust the numbers they see — acceptance rates, salaries, rankings, costs — the entire platform loses credibility. Research confirms:

- *"What if the data is wrong?"* — The universal trust concern across all user groups.
- *"They saved, scrimped and borrowed... then watched the return on that investment evaporate."* — Parents make financial decisions based on data accuracy.
- *"Do not fabricate admissions, ranking, school, program, salary, outcome, or source data."* — PRD-010 non-negotiable principle.

## Product Principles

- **No Fabrication**: Missing data is shown as missing. Never inferred, estimated, or silently substituted.
- **Source Transparency**: Every data point traces back to an authoritative source with year, version, and methodology context.
- **Conflict Honesty**: When sources disagree, all values are shown with explanations — not averaged or resolved into a false single truth.
- **Freshness Awareness**: Users see when data was last updated and whether it may be stale.
- **Interpretation Labels**: Distinguish between official facts, mapped interpretations, and product-level decision support.

## Product Rules

- Every factual academic, admissions, ranking, salary, institution, or outcome claim must trace to an authoritative source.
- Data shown to users must include enough citation context for users to understand source, year or version, and confidence.
- Missing data should be shown as missing or unavailable, not guessed.
- Source conflicts should be surfaced as conflicts or handled by an approved normalization PRD.
- Data freshness expectations must be explicit for each data asset.

## Claim State Machine

Every user-visible data claim exists in one of these states:

| State | Meaning | User Display |
|-------|---------|--------------|
| **Verified** | Single authoritative source, current, complete | Value with source badge |
| **Verified with Limitations** | Source exists but has scope/methodology limits | Value with source badge + limitation note |
| **Conflicting** | Multiple sources disagree beyond acceptable margin | All values shown with "Sources disagree" warning |
| **Stale** | Data exceeds expected refresh cycle | Value with "Last updated [year]" warning |
| **Missing** | No authoritative source available | "Data not available" with demand vote option |
| **Mapped with Uncertainty** | Value depends on program/major mapping that is not fully certain | Value with "Mapped — may not be precise" note |

## Verification Cue Requirements

Where a data claim affects user decisions, the product must expose:

1. **Source name**: "College Scorecard", "US News 2026", "CDS 2025"
2. **Year/version**: "2025", "2024-2025 academic year"
3. **Scope**: "Institution-level", "Program-level (Computer Science)", "National median"
4. **State**: Verified, Conflicting, Stale, Missing, or Mapped
5. **Link to details**: Expandable view showing full source citation, methodology notes, and limitations

## Data Hierarchy

Data assets are organized in a trust hierarchy:

| Tier | Assets | Trust Level |
|------|--------|-------------|
| **Tier 1: Identity** | Institution identity (IPEDS, CDS) | Highest — anchor for all other data |
| **Tier 2: Official Facts** | Admissions rates, costs, completion (CDS, IPEDS) | High — government or institutional sources |
| **Tier 3: Rankings** | US News, QS, THE, Niche | Medium — methodology-dependent |
| **Tier 4: Outcomes** | Salary, employment, debt (College Scorecard, BLS) | Medium — population-level, not individual |
| **Tier 5: Interpretations** | Fit scores, competitiveness, ROI projections | Lower — derived from Tier 1-4 data |

Higher-tier data should never be overridden by lower-tier data. Interpretations must always cite their underlying facts.

## Source Conflict Resolution

When two sources disagree on the same data point:

1. **Both values are shown** with source labels
2. **A conflict warning is displayed**: "Sources disagree: [Source A] reports X, [Source B] reports Y"
3. **No averaging or reconciliation** unless an approved normalization PRD defines the method
4. **Users can see both values** and make their own judgment

## Does Not Own

- Source-specific field definitions.
- Ranking-specific normalization.
- User interface presentation rules.
- Engineering ingestion design.

## Downstream Consumers

- All `10-data-assets/` PRDs
- All `20-intelligence-products/` PRDs
- Reports, sharing, and commercial PRDs
