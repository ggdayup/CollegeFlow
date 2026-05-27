# PRD-124: Niche Rankings

Status: Draft

## Data Asset Contract

- Source Authority: Niche published rankings and ratings (Best Colleges, Best Campus, student reviews).
- Product Value: Supports student-facing perception, fit, and qualitative comparison when appropriate. Niche provides student-sourced data on campus life, safety, diversity, and student satisfaction that complements official ranking sources.
- User-visible Fields: Overall grade/rating, category-specific ratings (campus life, safety, diversity, food, housing, professors), review count, rating year.
- Verification Requirement: Ranking or rating claims must retain source, category, year or release context.
- Freshness Requirement: Annual refresh aligned with Niche data availability.
- Versioning Rule: Source-specific rating and ranking changes must remain traceable.
- Known Limitations: Niche ratings are based on student reviews and surveys, which introduce self-selection bias. Review counts vary significantly by institution, and smaller schools may have insufficient data. Ratings are subjective and should not be treated as authoritative academic measures.
- Downstream Consumers: Discovery, fit explanation, reports.

## Source Context

**Coverage**: U.S. colleges and universities with significant student review data.

**Rating Categories**:
- Overall grade (A+ to F)
- Academics, Campus Life, Value, Professors, Diversity, Safety, Food, Housing
- Student review counts and sentiment

## Product Rules

- Niche ratings must be displayed as student-sourced data, not as authoritative academic rankings.
- Review count should be prominently displayed alongside ratings: "Based on X student reviews."
- Low review count warning: "This rating is based on fewer than X reviews and may not be representative."
- Niche ratings should not be compared directly with US News, QS, or THE rankings. They serve a different purpose (student perception vs. academic standing).
- When Niche data is used in fit explanations, it should be framed as: "Student perception data suggests..."

## Data Gap Handling

- When Niche data is unavailable for an institution, the system should not infer ratings.
- Users should see: "Student review data is not available for this institution."
- Demand vote integration: Users can request Niche coverage for institutions without review data.
