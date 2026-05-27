# PRD-122: QS Rankings

Status: Draft

## Data Asset Contract

- Source Authority: QS (Quacquarelli Symonds) published rankings (World University Rankings, subject rankings, and regional rankings).
- Product Value: Supports global comparison and international-facing university discovery. QS is the most widely recognized ranking source for international students.
- User-visible Fields: Overall rank, subject rank, regional rank (where available), rank year, rank category, score, methodology scope.
- Verification Requirement: Ranking claims must retain source, category, year, rank, and tie context.
- Freshness Requirement: Annual refresh aligned with QS publication cycle.
- Versioning Rule: Annual rankings must remain year-specific. Historical ranks are preserved for trend comparison.
- Known Limitations: QS methodology differs significantly from US News and THE. QS places heavier weight on international faculty and student ratios, which may favor institutions with diverse international populations. Subject rankings may have limited coverage outside major disciplines.
- Downstream Consumers: Ranking comparison, university discovery, reports.

## Source Context

**Coverage**: Global universities across 100+ countries. Strongest coverage in Europe, Asia-Pacific, and North America.

**Ranking Categories**:
- World University Rankings (overall)
- Subject Rankings (by academic discipline)
- Regional Rankings (Asia, Latin America, etc.)
- Specialty Rankings (employability, sustainability, etc.)

**Methodology Notes**:
- QS methodology includes academic reputation, employer reputation, faculty/student ratio, citations per faculty, international faculty ratio, and international student ratio.
- Subject rankings use different methodology focused on academic and employer reputation in the specific field.

## Product Rules

- QS rankings must be displayed with the year and category clearly labeled.
- QS and US News rankings should be shown side-by-side when both are available, with a note that methodologies differ.
- Missing ranking: If an institution is not ranked by QS, this should be shown as "Not ranked by QS."
- QS rankings should not be combined or averaged with other ranking sources without clear labeling.

## Data Gap Handling

- When QS data is unavailable for an institution, the system should not infer or estimate a rank.
- Users should see: "QS has not published a ranking for this institution in [category/year]."
- Demand vote integration: Users can request QS coverage for unranked institutions.
