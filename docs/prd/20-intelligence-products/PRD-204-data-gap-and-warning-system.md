# PRD-204: Data Gap and Warning System

Status: Draft

## Purpose

Define product requirements for warning users when data is missing, stale, conflicting, low-confidence, or not comparable — so users can trust what they see and understand what they don't.

## Problem

Users make high-stakes decisions based on the data shown. If data is incomplete or outdated, the product must surface that transparently rather than silently filling gaps. Research confirms:

- *"What if the data is wrong?"* — Students, parents, and counselors all express trust concerns.
- *"Do not fabricate admissions, ranking, school, program, salary, outcome, or source data."* — PRD-010 non-negotiable principle.
- When users encounter a gap, they should not leave the platform to verify — the product should provide next-best guidance.

## Product Rules

- Warnings should be visible where they affect decisions.
- Warnings should distinguish missing, stale, conflicting, low-confidence, and non-comparable data.
- Warnings should provide next-best product guidance without redirecting users away from the platform as a verification shortcut.
- Warnings must never be dismissible permanently — they should remain visible until the underlying data issue is resolved.
- Warnings must not fabricate data to fill gaps.

## Warning Types

### 1. Missing Data (数据暂缺)

**When**: A data field that should exist for this entity is not available in any source.

**Display**: Inline indicator with tooltip: "This data is not currently available from any authoritative source."

**Example**: "Median starting salary data is not available for this specific program. University-level data is shown instead."

### 2. Stale Data (数据可能过期)

**When**: A data source is older than the expected refresh cycle (e.g., CDS from 3+ years ago, salary data from 5+ years ago).

**Display**: Inline indicator with tooltip: "This data was last updated in {year} and may not reflect current conditions."

**Example**: "Admissions data sourced from 2022 CDS. More recent data has not been published."

### 3. Conflicting Data (数据冲突)

**When**: Two or more authoritative sources report different values for the same data point.

**Display**: Inline indicator showing the range and sources: "Sources disagree: US News reports X, College Scorecard reports Y."

**Example**: "Acceptance rate: 12% (US News 2026) vs. 18% (CDS 2024). We show the most recent verified value."

### 4. Low Confidence (置信度低)

**When**: Data exists but comes from a single source, has not been recently verified, or has known quality issues.

**Display**: Inline indicator: "This data has limited verification. View source details."

### 5. Non-Comparable Data (不可比较)

**When**: Data points that appear similar but use different methodologies, scopes, or definitions and should not be directly compared.

**Display**: Warning banner in comparison views: "These values use different methodologies and may not be directly comparable."

**Example**: "US News ranking methodology changed in 2025. Rankings before and after are not directly comparable."

## Warning Placement

- **In-line**: Small icon or badge next to the specific data point
- **Section-level**: Banner at the top of a section when multiple items share a warning
- **Comparison-level**: Highlighted in the comparison output when comparing options with different data confidence levels

## Warning Severity Levels

| Severity | Visual | Behavior |
|----------|--------|----------|
| **Info** | Blue icon | Shown for missing data that doesn't block decision-making |
| **Warning** | Amber icon | Shown for stale or low-confidence data — user should be aware |
| **Critical** | Red icon | Shown for conflicting data — user should not rely on this value alone |

## Next-Best Guidance

Every warning should include actionable guidance:

| Warning Type | Guidance |
|-------------|----------|
| Missing data | "You can view similar programs that have complete data" or "Vote to prioritize data ingestion" |
| Stale data | "We refresh this source on [schedule]. Last verified: [date]" |
| Conflicting data | "We recommend using the most recent verified value. View all source values." |
| Low confidence | "This data comes from a single source. Consider verifying with [alternative source]" |
| Non-comparable | "Consider comparing within the same ranking source or methodology" |

## Demand Vote Integration

When users encounter missing data for a specific entity (school, major, program):

- A "Vote for Data Ingestion" button allows users to request coverage
- Vote counts are visible to all users
- When vote threshold is reached, an alert is sent to the Operator for ingestion prioritization
- Users who voted are notified when the data becomes available

## Does Not Own

- Data ingestion or refresh pipeline implementation
- Source verification methodology
- Database schema or API contracts
