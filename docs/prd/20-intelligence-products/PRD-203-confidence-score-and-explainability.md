# PRD-203: Confidence Score and Explainability

Status: Draft

## Purpose

Define product requirements for explaining confidence in data-backed recommendations, comparisons, and warnings — so users understand what to trust, what to question, and why.

## Problem

Users make life-altering decisions based on the platform's data and recommendations. If they cannot understand why confidence is high or low, they either blindly trust or dismiss everything. Research confirms:

- *"What if the data is wrong?"* — The universal trust concern across all user groups.
- *"Do not fabricate admissions, ranking, school, program, salary, outcome, or source data."* — PRD-010 principle.
- Parents need to feel confident enough to invest $50K-$300K+ based on the platform's guidance.

## Product Rules

- Confidence should reflect source quality, freshness, completeness, and conflict level.
- Users should be able to understand why confidence is high, medium, low, or unavailable.
- Confidence should never be used to hide missing data.

## Confidence Score Components

The confidence score is a composite of four dimensions:

### 1. Source Quality (数据源质量)

| Level | Criteria |
|-------|----------|
| High | Data from 2+ authoritative sources that agree |
| Medium | Data from 1 authoritative source, no conflicts |
| Low | Data from non-authoritative or user-contributed source |
| Unavailable | No source available |

### 2. Freshness (数据时效)

| Level | Criteria |
|-------|----------|
| High | Data refreshed within expected cycle (CDS: annual, salary: 2-year) |
| Medium | Data 1-2 cycles old |
| Low | Data 3+ cycles old |
| Unavailable | No refresh date recorded |

### 3. Completeness (数据完整度)

| Level | Criteria |
|-------|----------|
| High | All expected data fields present |
| Medium | Core fields present, some optional fields missing |
| Low | Only a few core fields available |
| Unavailable | No data available |

### 4. Conflict Level (数据一致性)

| Level | Criteria |
|-------|----------|
| High | All sources agree within acceptable margin |
| Medium | Minor disagreement between sources (within 10%) |
| Low | Significant disagreement between sources (>10%) |
| Unavailable | No comparison possible |

## Overall Confidence Display

| Overall | Composite | Visual |
|---------|-----------|--------|
| **High Confidence** | All dimensions high/medium | Green badge |
| **Partial Confidence** | Any dimension low | Amber badge |
| **Low Confidence** | Multiple dimensions low or unavailable | Red badge |
| **No Data** | All dimensions unavailable | Grey badge |

## Explainability Requirements

Every confidence score must be explainable:

**Click/tap to expand details**:
```
Confidence: Partial Confidence
  - Source Quality: High (2 authoritative sources agree)
  - Freshness: Medium (CDS data from 2024, expected annual refresh)
  - Completeness: High (all core fields present)
  - Conflict Level: Low (acceptance rate differs by 15% between sources)
```

**Plain language explanation**:
"Confidence is partial because two authoritative sources disagree on the acceptance rate (12% vs. 18%). We recommend reviewing both values before making decisions."

## Confidence in Recommendations

When the platform recommends a school, major, or program:

- The recommendation must include the confidence level
- The confidence level must explain which dimensions drove the score
- Low-confidence recommendations should include explicit caveats: "This recommendation is based on limited data. Consider verifying with additional research."

## Confidence in Comparisons

When comparing Decision Options:

- Each option's confidence score is shown alongside comparison dimensions
- If options have significantly different confidence levels, a warning is shown: "Option A has high-confidence data while Option B has limited data. This comparison may not be balanced."
- Non-comparable data warnings appear when methodology differences prevent fair comparison

## Role-Specific Confidence Views

### Student View
- Sees overall confidence badge and plain-language explanation
- Can expand to see dimension details if interested

### Parent View
- Sees confidence prominently displayed alongside financial data
- Emphasis on: "How much can I trust this ROI/salary number?"

### Counselor View
- Sees full confidence breakdown with source citations
- Can use confidence information to guide family conversations
- Can flag data quality issues for Operator review

## Does Not Own

- Source truth or verification methodology
- Confidence score calculation algorithm
- Database schema or API contracts
