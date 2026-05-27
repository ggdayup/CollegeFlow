# PRD-202: Admissions Competitiveness Model

Status: Draft

## Depends On

- Common Data Set
- Institution profile data
- Data lineage, verification, and freshness
- Decision Profile

## Purpose

Define product requirements for representing admissions competitiveness with appropriate caution and source transparency — helping students understand how selective a school is without predicting individual admission outcomes.

## Problem

Students need to understand how competitive a school or program is so they can build a balanced application list (reach, target, safety). However, no tool should claim to predict individual admission outcomes — too many factors are outside the data. Research confirms:

- *"I'm not smart enough for that school"* — Imposter syndrome drives students away from competitive schools they could get into.
- *"Everyone else just seems to know"* — Students need structured guidance on building a balanced list.
- The model must never overclaim: it provides context, not predictions.

## Product Rules

- Competitiveness should be framed as decision support, not prediction certainty.
- Source year and limitations must be clear where admissions data is shown.
- Missing, stale, or conflicting admissions data should trigger warnings.
- The model must never state "You will get in" or "You will not get in."

## Competitiveness Categories

The model categorizes each school/program option relative to the student's academic profile:

### Reach (冲刺)

**Criteria**: Student's GPA/SAT falls below the 25th percentile of admitted students, OR acceptance rate is below 15%.

**Display**: "Reach — Your academic profile is below the typical admitted student range. Admission is possible but not likely based on academic data alone."

### Target (匹配)

**Criteria**: Student's GPA/SAT falls within the 25th-75th percentile of admitted students, AND acceptance rate is 15-50%.

**Display**: "Target — Your academic profile falls within the typical admitted student range. Admission is plausible."

### Safety (保底)

**Criteria**: Student's GPA/SAT falls above the 75th percentile of admitted students, OR acceptance rate is above 50%.

**Display**: "Safety — Your academic profile is above the typical admitted student range. Admission is likely based on academic data."

## Important Caveats

Every competitiveness assessment must include:

- **This is not a prediction**: "This assessment is based on historical admissions data and your academic profile. It does not predict your individual outcome."
- **Holistic admissions**: "Many factors beyond GPA and test scores affect admissions decisions, including essays, extracurriculars, recommendations, and institutional priorities."
- **Data limitations**: "Admissions data may not reflect the most current cycle. Source: [CDS year], [IPEDS year]."

## Data Inputs

| Input | Source | Use |
|-------|--------|-----|
| Acceptance rate | CDS, IPEDS | Overall selectivity context |
| GPA range (25th-75th percentile) | CDS | Student profile comparison |
| SAT/ACT range (25th-75th percentile) | CDS | Student profile comparison |
| Application volume | CDS | Selectivity trend context |
| Enrollment yield | CDS, IPEDS | Demand indicator |

## Competitiveness Display

```
Admissions Context: UMich — Computer Science
  Target
  Acceptance rate: 18% (CDS 2025)
  Your GPA: 3.8 — within middle 50% (3.5-4.0)
  Your SAT: 1420 — within middle 50% (1350-1520)

  This is not an admission prediction. Many factors beyond academics affect outcomes.
  Data confidence: High (CDS 2025, verified)
```

## Balanced List Guidance

When a student has multiple Decision Options, the model evaluates list balance:

- **Too many reaches**: "Your list is heavy on Reach schools. Consider adding more Target or Safety options."
- **Too many safeties**: "Your list is heavy on Safety schools. Are you challenged enough?"
- **Well balanced**: "Your list has a good mix of Reach, Target, and Safety options."

## Missing Data Handling

When admissions data is unavailable:

- Display: "Admissions data is not available for this school. Consider reviewing similar schools with available data."
- Do NOT attempt to estimate or interpolate missing admissions data.
- Link to Data Gap and Warning System (PRD-204) for detailed warning context.

## Role-Specific Views

### Student View
- Sees competitiveness category with full caveats
- Can see balanced list guidance

### Parent View
- Sees competitiveness alongside cost and ROI data
- Framed as: "How selective is this school, and is it worth the investment risk?"

### Counselor View
- Sees full data breakdown with source citations
- Can override categorization with professional judgment (annotated as counselor opinion, not system assessment)
- Can export competitiveness summary for family meetings

## Does Not Own

- Source truth for admissions data (CDS, IPEDS)
- Admissions prediction algorithm (explicitly out of scope)
- Database schema or API contracts
