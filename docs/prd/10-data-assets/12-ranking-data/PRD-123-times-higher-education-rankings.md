# PRD-123: Times Higher Education Rankings

Status: Draft

## Data Asset Contract

- Source Authority: Times Higher Education (THE) published rankings (World University Rankings, subject rankings, and regional rankings).
- Product Value: Supports global comparison and source-diverse ranking context. THE is a major global ranking source with methodology distinct from US News and QS.
- User-visible Fields: Overall rank, subject rank, rank year, rank category, score, methodology scope.
- Verification Requirement: Ranking claims must retain source, category, year, rank, and tie context.
- Freshness Requirement: Annual refresh aligned with THE publication cycle.
- Versioning Rule: Annual rankings must remain year-specific. Historical ranks are preserved for trend comparison.
- Known Limitations: THE methodology emphasizes research output and citations, which may favor research-intensive institutions over teaching-focused colleges. Subject rankings have limited coverage for smaller disciplines. THE coverage is strongest for European and UK institutions.
- Downstream Consumers: Ranking comparison, university discovery, reports.

## Source Context

**Coverage**: Global universities, with strongest coverage in Europe, UK, and select Asia-Pacific institutions.

**Ranking Categories**:
- World University Rankings (overall)
- Subject Rankings (by academic discipline)
- Impact Rankings (SDG-aligned)
- Regional Rankings (Asia, Latin America, etc.)

**Methodology Notes**:
- THE methodology includes teaching, research environment, research quality, industry income, and international outlook.
- Subject rankings use discipline-specific weightings for research and teaching metrics.

## Product Rules

- THE rankings must be displayed with the year and category clearly labeled.
- When all three major ranking sources (US News, QS, THE) are available for an institution, a summary view should show all three ranks side-by-side with methodology notes.
- Missing ranking: If an institution is not ranked by THE, this should be shown as "Not ranked by THE."
- THE rankings should not be combined or averaged with other ranking sources without clear labeling.

## Data Gap Handling

- When THE data is unavailable for an institution, the system should not infer or estimate a rank.
- Users should see: "THE has not published a ranking for this institution in [category/year]."
- Demand vote integration: Users can request THE coverage for unranked institutions.
