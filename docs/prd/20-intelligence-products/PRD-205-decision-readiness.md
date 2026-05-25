# PRD-205: Decision Readiness

Status: Draft

## Purpose

Define the product outcome that the Full Decision Workspace must deliver after paid unlock.

The product is not selling more data for its own sake. It is selling a user's movement from uncertainty toward decision readiness.

## Depends On

- [PRD-000: Commercial Thesis](../00-charter/PRD-000-commercial-thesis.md)
- [PRD-100: Data Asset Strategy](../10-data-assets/10-overview/PRD-100-data-asset-strategy.md)
- [PRD-200: Decision Profile](PRD-200-decision-profile.md)
- [PRD-203: Confidence Score and Explainability](PRD-203-confidence-score-and-explainability.md)
- [PRD-204: Data Gap and Warning System](PRD-204-data-gap-and-warning-system.md)
- [PRD-206: School / Program Comparison](PRD-206-school-program-comparison.md)

## Core Product Outcome

Decision Readiness means the user can understand:

- what directions are most worth exploring;
- why those directions are plausible;
- how the directions compare using trusted data;
- what risks, gaps, and uncertainties remain;
- what should happen next.

The product should not claim to produce a single guaranteed answer. It should help students, parents, counselors, and institutions make a more structured, evidence-backed decision.

## MVP Priority

Decision Readiness MVP should prioritize outcomes in this order:

1. **Direction Clarity**
2. **Data-backed Comparison**
3. **Risk Awareness**
4. **Parent-readable Report**
5. **Action Readiness**

## Outcome 1: Direction Clarity

Direction Clarity helps the user move from many vague possibilities to a smaller set of explainable school, major, or program directions.

### Product Rules

- Direction clarity should come before data volume.
- The user should not be overwhelmed with undifferentiated lists.
- Directions should be explainable in plain language.
- Direction clarity should preserve uncertainty when the user's profile or source data is incomplete.

## Outcome 2: Data-backed Comparison

Data-backed Comparison is the primary paid proof of data value.

The Full Decision Workspace must make comparison the main way users experience the value of admissions, ranking, institution, academic, outcome, and labor market data.

For P0, the first Data-backed Comparison experience should be School / Program Comparison. Direction Clarity should help the user form meaningful Decision Options; Data-backed Comparison should compare those Decision Options.

## P0 Comparison Object

P0 comparison should center on Decision Options:

```text
Decision Option = Institution + Program / Major Direction
```

This keeps the product focused on real admissions decisions rather than generic school rankings or abstract major exploration.

### Comparison Types

The product may support:

- school / program comparison, such as one Decision Option versus another;
- direction comparison, such as major path versus major path;
- scenario comparison, such as prestige-heavy versus ROI-balanced strategies.

P0 should prioritize school / program comparison. Direction comparison remains valuable, but its P0 role is to help users select and understand comparable Decision Options.

### Comparison Dimensions

Comparisons may include:

- fit with the user's Decision Profile;
- admissions context;
- academic program and curriculum context;
- ranking context;
- outcome, salary, ROI, or labor market context;
- cost, geography, or school environment context;
- source confidence, missing data, and non-comparable data warnings.

### Product Rules

- Comparison should make trade-offs visible.
- Comparison should not invent missing data.
- Comparison should preserve source context and confidence cues.
- Comparison should distinguish official facts from interpreted decision support.
- Comparison should provide enough structure for a parent, student, or counselor to discuss next steps.
- Comparison should not reduce School / Program Comparison to a school ranking table.

## Outcome 3: Risk Awareness

Risk Awareness helps users understand what could make a direction weaker, uncertain, or unsuitable.

### Product Rules

- Risks should derive from the user's profile, source-backed data, comparison results, and missing or stale data.
- Risk should not be used as fear-based paywall pressure.
- Risk should lead to clearer next steps.

## Outcome 4: Parent-readable Report

The parent-readable report converts workspace analysis into a tangible decision artifact.

### Product Rules

- The report should explain direction, comparison, evidence, risks, and next steps in language a parent can understand.
- The report should preserve data confidence and source limitations.
- The report should support both self-guided and counselor-guided usage.

## Outcome 5: Action Readiness

Action Readiness turns the analysis into concrete next steps.

### Product Rules

- Next steps should follow from direction clarity, comparison, and risk awareness.
- The user should know what information to add, what options to research, and what questions to discuss.
- Next steps should support self-guided progress and guided collaboration.

## Decision Readiness Flow

```text
Direction Clarity
  -> Data-backed Comparison
    -> Risk Awareness
      -> Parent-readable Report
        -> Action Readiness
```

For P0, Data-backed Comparison should make the following visible for each Decision Option:

- what looks strong;
- what looks risky;
- what is uncertain;
- what data supports the comparison;
- what next question should be answered.

## Does Not Own

- Data source truth rules.
- Revenue share rules.
- Paywall pricing.
- Technical scoring or algorithm implementation.
- Database schema.

## Open Questions

- How many directions should be shown before the workspace feels clear but not overconfident?
- Which comparison dimensions are required for MVP versus later tiers?
- How should counselor notes appear alongside data-backed comparison without confusing source-backed facts and professional judgment?
