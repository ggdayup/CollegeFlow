# PRD-201: School-Major Fit Engine

Status: Draft

## Depends On

- Decision Profile
- Institution data
- Academic program data
- Outcomes data
- Ranking strategy where rankings are used as context

## Purpose

Define product requirements for explaining fit between a user, a major, a school, and an academic program — so students can understand why a school or program might be a good or poor match for their specific situation.

## Problem

Students need to understand not just whether a school is "good" in general, but whether it's good *for them*. A top-ranked school might be a terrible fit for a student's budget, interests, or academic preparation. Research confirms:

- *"My heart says UGA for the lifestyle, but my brain (and my parents) say Tech for the career prospects."* — Fit is multi-dimensional, not a single score.
- *"I don't know what I want to be"* — Students need guidance on which programs align with their (possibly vague) interests.
- *"Everyone else just seems to know"* — Fit should help students feel that there are structured ways to evaluate options, even when uncertain.

## Product Rules

- Fit must be explainable, not a black-box verdict.
- Fit should distinguish user preference fit, academic path fit, affordability or outcome fit, and admissions context.
- Unavailable data must be identified as unavailable.
- Fit scores should never claim to predict admission outcomes or guarantee satisfaction.

## Fit Dimensions

The fit engine evaluates four dimensions independently:

### 1. Preference Fit (偏好匹配)

**Answers**: Does this school/program align with what the student says they want?

**Inputs**: Decision Profile weights and preference signals
- Geographic preference match (region, urban/rural, distance from home)
- Campus size preference match (small liberal arts vs. large research university)
- Social environment match (Greek life, sports culture, arts scene)
- Career direction alignment (stable, high-growth, purpose-driven)

**Output**: "This school matches your preferences for [X, Y, Z] but does not match your preference for [W]."

### 2. Academic Path Fit (学术路径匹配)

**Answers**: Is the student academically prepared for this program, and does the program offer what they want to study?

**Inputs**: Academic Context from Decision Profile + Program data
- GPA vs. program's typical admitted range
- Coursework preparation (AP/IB alignment with program prerequisites)
- Major/field availability and program quality
- Curriculum flexibility (ability to explore, double major, or switch)

**Output**: "This program requires [prerequisites] which align with your current coursework" or "This program's curriculum is highly structured with limited exploration flexibility."

### 3. Affordability & Outcome Fit (经济可负担与回报匹配)

**Answers**: Can the student afford this school, and does the expected outcome justify the cost?

**Inputs**: Financial Constraints from Decision Profile + Outcomes data
- Total cost of attendance vs. student's budget
- Expected financial aid (where data available)
- Projected debt vs. expected starting salary
- 40-year cumulative salary yield vs. investment

**Output**: "This school's total cost ($65K/year) exceeds your budget ($50K/year). Expected starting salary ($78K) suggests a debt-to-income ratio of X."

### 4. Admissions Context (招生背景)

**Answers**: How competitive is this option for this student?

**Inputs**: Academic Context + CDS/IPEDS admissions data
- GPA/SAT relative to admitted student range
- Acceptance rate context
- Important: Must NOT predict admission outcomes

**Output**: "Your GPA of 3.8 falls within the middle 50% of admitted students (3.5-4.0). This school admits 18% of applicants."

## Overall Fit Display

The fit engine presents all four dimensions separately, not as a single composite score:

```
Fit Summary: UMich — Computer Science
  Preference Fit: Strong match (urban campus, strong CS reputation, social environment)
  Academic Path Fit: Strong match (your GPA within admitted range, prerequisites aligned)
  Affordability Fit: Partial match (COA exceeds budget by $15K/yr, but strong aid available)
  Admissions Context: Competitive but plausible (GPA in middle 50%)
```

## Explainability

Every fit dimension must include:

- **Why it matches**: Specific factors that drove the assessment
- **Why it doesn't**: Specific factors that reduced the fit
- **Data confidence**: How confident the system is in this assessment (links to PRD-203)

## Role-Specific Fit Views

### Student View
- All four dimensions visible
- Preference Fit and Academic Path Fit emphasized
- Can adjust Decision Profile weights and see real-time fit changes

### Parent View
- Affordability & Outcome Fit prominently displayed
- Preference Fit simplified to lifestyle and safety factors
- Can see total cost and debt projections clearly

### Counselor View
- All four dimensions visible with annotation capability
- Can adjust fit weights for specific students
- Can export fit summary for family meetings

## Does Not Own

- Source truth for admissions, program, or outcomes data
- Fit scoring algorithm implementation
- Database schema or API contracts
