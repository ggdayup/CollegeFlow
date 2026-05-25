# PRD-206: School / Program Comparison

Status: Draft

## Purpose

Define the first P0 Data-backed Comparison experience for the Full Decision Workspace.

The first paid comparison should compare school/program Decision Options, not only broad directions or standalone school rankings.

## Depends On

- [PRD-000: Commercial Thesis](../00-charter/PRD-000-commercial-thesis.md)
- [PRD-100: Data Asset Strategy](../10-data-assets/10-overview/PRD-100-data-asset-strategy.md)
- [PRD-120: Ranking Product Strategy](../10-data-assets/12-ranking-data/PRD-120-ranking-product-strategy.md)
- [PRD-200: Decision Profile](PRD-200-decision-profile.md)
- [PRD-203: Confidence Score and Explainability](PRD-203-confidence-score-and-explainability.md)
- [PRD-204: Data Gap and Warning System](PRD-204-data-gap-and-warning-system.md)
- [PRD-205: Decision Readiness](PRD-205-decision-readiness.md)

## Core Concept: Decision Option

A Decision Option is the unit of comparison for P0:

```text
Decision Option = Institution + Program / Major Direction
```

The institution anchors identity, admissions, rankings, costs, and context. The program or major direction anchors academic fit, target-field rankings, outcomes mapping, curriculum, and student relevance.

If a user does not yet have an official program selected, the product may use an intended field or major direction. The workspace should make the specificity level clear.

## Why School / Program First

Students and parents are most likely to pay for concrete comparisons that answer:

- Which school/program option is more relevant to this student?
- Which option looks stronger, riskier, or more uncertain?
- Which option has better ranking, admissions, program, and outcomes signals?
- Which option is worth researching or discussing next?

School / Program Comparison is more commercially compelling than a generic direction comparison and more decision-relevant than a school ranking table.

## P0 User Flow

```text
Student completes profile
  -> Initial Workspace suggests or accepts target schools/programs
    -> User selects a small set of Decision Options
      -> Full Workspace unlocks School / Program Comparison
        -> Comparison shows lenses, risks, uncertainty, and evidence
          -> Report and next steps are generated from comparison
```

The product should keep the first comparison set small enough to remain understandable. The exact limit is a product decision, but the experience should favor focused comparison over exhaustive lists.

## P0 Comparison Lenses

### 1. Ranking Lens

Answers:

> How does this option appear in overall reputation and target-field reputation?

The Ranking Lens may include:

- overall institution ranking;
- subject, discipline, program, or major-related ranking;
- source, year, category, and scope;
- tie, missing, unranked, or unavailable state;
- contrast between overall ranking and target-field ranking.

### 2. Admissions Lens

Answers:

> How competitive or risky does this option appear for this student, based on available admissions context?

The Admissions Lens may include:

- available admissions context;
- applicant or profile context where available;
- competitiveness discussion with caution;
- missing CDS or admissions data warnings.

It must not claim to predict individual admission outcomes.

### 3. Program Fit Lens

Answers:

> Does this program or major direction fit what the student wants and is prepared to study?

The Program Fit Lens may include:

- official program name where available;
- school, college, or department context;
- curriculum or prerequisite context;
- academic demand signals;
- major or CIP-aligned mapping context;
- fit with the student's Decision Profile.

### 4. Outcomes / ROI Lens

Answers:

> What outcome, economics, or career signals are relevant to this option?

The Outcomes / ROI Lens may include:

- salary or earnings signals;
- employment signals;
- debt, cost, or ROI context;
- labor market demand;
- career pathway context.

It must not present historical outcomes as guarantees of an individual student's future outcome.

### 5. Confidence / Data Gap Lens

Answers:

> How much should the user trust this comparison, and what is missing?

The Confidence / Data Gap Lens may include:

- source completeness;
- freshness;
- mapping confidence;
- missing data;
- stale data;
- conflicting data;
- non-comparable data warnings.

## Comparison Output

For each Decision Option, the comparison should make visible:

- what looks strong;
- what looks risky;
- what is uncertain;
- what data supports the comparison;
- what next question should be answered.

Across Decision Options, the comparison may identify:

- strongest fit under the current profile and available data;
- strongest ranking signal;
- strongest outcomes or ROI signal;
- highest admissions risk;
- most uncertain option;
- best next-step candidate.

The product should avoid declaring a universal best school or program. Conclusions should remain tied to the student's profile and available data.

## Product Rules

- Do not reduce School / Program Comparison to a school ranking table.
- Do not compare options unless identity, source lineage, mapping, and confidence context are adequate.
- Do not invent missing admissions, ranking, program, outcomes, or salary data.
- Do distinguish official facts from interpreted decision support.
- Do preserve ranking scope, including overall versus subject/program ranking.
- Do include both attractive signals and trust signals in paid comparisons.
- Do make comparison useful for self-guided users and guided counselor or institution workflows.

## Does Not Own

- Source-specific ranking definitions.
- Source-specific outcomes definitions.
- Program ingestion or curriculum parsing implementation.
- Pricing or revenue share.
- Database schema.

## Open Questions

- What is the ideal first comparison set size for paid users?
- Which school/program inputs should be accepted before payment versus after unlock?
- Which comparison lens should appear first for parents versus students?
- How should counselor notes be visually and conceptually separated from source-backed comparison evidence?

