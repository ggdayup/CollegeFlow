# PRD-206: School / Program Comparison

Status: Draft

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

School / Program Comparison is more commercially compelling than a generic direction comparison and more decision-relevant than a school ranking table. Customer research confirms that people currently build 13-tab Google Sheets workbooks because no single tool offers program-level comparison with outcomes data.

## Research-Informed Comparison Requirements

### Additional Lens 6: Lifestyle & Environment Lens (生活方式与环境)

**Answers**:

> What does daily life feel like at this school, and does it match the student's social and cultural preferences?

Research finding: *"My heart says UGA for the lifestyle, but my brain (and my parents) say Tech for the career prospects."* The lifestyle vs. prestige tension is a core decision driver that existing tools ignore.

The Lifestyle & Environment Lens may include:

- Campus culture descriptors (competitive vs. collaborative, social vs. academic focus)
- Location context (urban/suburban/rural, distance from major cities, climate)
- Student body composition (gender ratio, diversity, in-state vs. out-of-state)
- Social environment (Greek life presence, sports culture, arts scene)
- Housing and dining quality signals
- Student satisfaction and retention rates

### Additional Lens 7: Passion vs. Money Lens (热情与回报权衡)

**Answers**:

> How does this option balance the student's stated interests against financial security?

Research finding: *"I want to wake up in the morning and have something I look forward to"* vs. *"I wish I could do that, but I want money."* This is the #1 tension driving every college decision.

The Passion vs. Money Lens may include:

- **Passion Score**: Alignment with the student's stated interests, strengths, and values (derived from Decision Profile weights)
- **Financial Security Score**: Starting salary, 10-year growth, employment rate, and AI-resistance combined
- **Trade-off Summary**: "This option scores higher on passion alignment but lower on financial outlook. Here's what that means in practice..."
- Must NOT prescribe a "right" choice — present trade-offs transparently

## P0 User Flow

```text
Student completes profile
  -> Initial Workspace suggests or accepts target schools/programs
    -> User selects a small set of Decision Options (2-4 for P0)
      -> Full Workspace unlocks School / Program Comparison
        -> Comparison shows all 7 lenses, risks, uncertainty, and evidence
          -> Report and next steps are generated from comparison
```

The product should keep the first comparison set small enough to remain understandable. P0 limit: 2-4 Decision Options per comparison.

## P0 Comparison Lenses

### 1. Ranking Lens
Answers: How does this option appear in overall reputation and target-field reputation?

- Overall institution ranking
- Subject/program-specific ranking
- Source, year, category, and scope
- Contrast between overall and target-field ranking

### 2. Admissions Lens
Answers: How competitive or risky does this option appear for this student?

- Available admissions context (acceptance rate, GPA/SAT range)
- Competitiveness discussion with caution
- Missing CDS or admissions data warnings
- Must not predict individual admission outcomes

### 3. Program Fit Lens
Answers: Does this program or major direction fit what the student wants and is prepared to study?

- Official program name and department context
- Curriculum and prerequisite context
- Academic demand signals
- Fit with the student's Decision Profile

### 4. Outcomes / ROI Lens
Answers: What outcome, economics, or career signals are relevant to this option?

- Salary or earnings signals (starting, prime-age, 40-year cumulative)
- Employment rate within 2 years of graduation
- Debt, cost, or ROI context (debt-to-income ratio)
- Labor market demand and AI-resistance signal
- Must not present historical outcomes as guarantees

### 5. Confidence / Data Gap Lens
Answers: How much should the user trust this comparison, and what is missing?

- Source completeness, freshness, mapping confidence
- Missing, stale, or conflicting data warnings
- Non-comparable data warnings

### 6. Lifestyle & Environment Lens (新增)
Answers: What does daily life feel like at this school?

- Campus culture, location, social environment
- Student body composition and satisfaction
- Housing, dining, and quality-of-life signals

### 7. Passion vs. Money Lens (新增)
Answers: How does this option balance passion against financial security?

- Passion Score and Financial Security Score
- Trade-off summary in plain language
- No prescribed "right" choice

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
- best next-step candidate;
- **largest passion vs. money trade-off** (new from research).

The product should avoid declaring a universal best school or program. Conclusions should remain tied to the student's profile and available data.

## Role-Aware Comparison Views

### Student View
- All 7 lenses visible
- Passion vs. Money lens prominently displayed
- Lifestyle data (campus culture, social environment) emphasized

### Parent View
- Outcomes/ROI and Cost lenses prominently displayed
- Lifestyle lens simplified to safety and support services
- Passion vs. Money lens reframed as "Interest Alignment vs. Financial Outlook"

### Counselor View
- All 7 lenses visible with annotation capability
- Can add professional commentary alongside each lens
- Can generate comparison report for family meetings

## Product Rules

- Do not reduce School / Program Comparison to a school ranking table.
- Do not compare options unless identity, source lineage, mapping, and confidence context are adequate.
- Do not invent missing admissions, ranking, program, outcomes, or salary data.
- Do distinguish official facts from interpreted decision support.
- Do preserve ranking scope, including overall versus subject/program ranking.
- Do include both attractive signals and trust signals in paid comparisons.
- Do make comparison useful for self-guided users and guided counselor or institution workflows.
- **Do surface the passion vs. money trade-off as a first-class comparison dimension.**
- **Do surface lifestyle and environment factors alongside career outcomes.**

## Does Not Own

- Source-specific ranking definitions.
- Source-specific outcomes definitions.
- Program ingestion or curriculum parsing implementation.
- Pricing or revenue share.
- Database schema.

## Open Questions

- What is the ideal first comparison set size for paid users? (P0: 2-4)
- Which school/program inputs should be accepted before payment versus after unlock?
- Which comparison lens should appear first for parents versus students?
- How should counselor notes be visually and conceptually separated from source-backed comparison evidence?
