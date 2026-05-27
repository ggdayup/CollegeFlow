# PRD-121: US News Rankings

Status: Draft

## Data Asset Contract

- Source Authority: US News & World Report published rankings (Best Colleges, Best Global Universities, and subject-specific rankings).
- Product Value: Supports U.S.-market discovery, comparison, and counselor-facing explanation. US News is the most widely recognized ranking source for U.S. families.
- User-visible Fields: Overall rank, subject/program rank (where available), rank year, rank category, tie status, methodology scope.
- Verification Requirement: Ranking claims must retain source, category, year, rank, and tie context.
- Freshness Requirement: Annual refresh aligned with US News publication cycle (typically September).
- Versioning Rule: Annual rankings must remain year-specific. Historical ranks are preserved for trend comparison.
- Known Limitations: US News methodology changed significantly in 2025 (increased weight on social mobility, decreased weight on alumni giving). Rankings before and after the methodology change are not directly comparable. Some international institutions are covered under separate global rankings with different methodology.
- Downstream Consumers: Ranking comparison, university discovery, reports, commercial packaging.

## Source Context

**Coverage**: U.S. national universities, liberal arts colleges, and select global institutions.

**Ranking Categories**:
- National Universities (overall)
- Liberal Arts Colleges (overall)
- Subject/program-specific rankings (engineering, business, computer science, etc.)
- Specialty rankings (best value, most innovative, etc.)

**Methodology Notes**:
- US News methodology includes factors such as graduation rates, social mobility, academic reputation, faculty resources, and financial resources.
- Methodology changes should be documented and users should be warned when comparing across methodology change years.

## Product Rules

- US News rankings must be displayed with the year and category clearly labeled.
- When methodology has changed, a warning should appear: "US News changed its ranking methodology in [year]. Rankings before and after may not be directly comparable."
- Tie handling: US News publishes tied ranks (e.g., "ranked #15-20"). These must be preserved as published, not resolved into a single rank.
- Missing ranking: If an institution is not ranked by US News, this should be shown as "Not ranked by US News" rather than left blank.
- US News rankings should not be combined or averaged with other ranking sources without clear labeling.

## Data Gap Handling

- When US News data is unavailable for an institution, the system should not infer or estimate a rank.
- Users should see: "US News has not published a ranking for this institution in [category/year]."
- Demand vote integration: Users can request US News coverage for unranked institutions.
