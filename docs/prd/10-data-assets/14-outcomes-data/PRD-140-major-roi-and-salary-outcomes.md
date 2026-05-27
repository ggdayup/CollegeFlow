# PRD-140: Major ROI and Salary Outcomes

Status: Draft

## Data Asset Contract

- Source Authority: Approved official or credible outcomes sources defined by source governance (College Scorecard, BLS, state-level outcomes data, institution-reported outcomes).
- Product Value: Supports major ROI, financial trade-off, and career outcome decisions — the core data behind the passion vs. money tension.
- User-visible Fields: Median starting salary, median prime-age salary, earnings percentiles, debt at graduation, debt-to-income ratio, 40-year cumulative salary yield, net price by income bracket.
- Verification Requirement: Salary and ROI claims must retain source, population, year, and limitation context.
- Freshness Requirement: Annual refresh aligned with source release cycle.
- Versioning Rule: Historical salary and ROI snapshots should remain comparable by year and definition.
- Known Limitations: Outcomes vary by geography, institution, degree level, individual path, and source methodology. College Scorecard data reflects only federal aid recipients. Salary data is measured for completers, not all enrollees.
- Downstream Consumers: Major comparison, Decision Profile, fit engine, reports, commercial packaging.

## Problem

Students and parents need reliable outcomes data to evaluate whether a college investment is worth the cost. This is the #1 tension driving every decision. Research confirms:

- *"I want to wake up in the morning and have something I look forward to"* vs. *"I want money"* — The passion vs. money tension requires real earnings data, not estimates.
- *"They saved, scrimped and borrowed... then watched the return on that investment evaporate."* — Parents need verified outcomes data.

## Decision Questions

This data asset helps answer:

- What historical salary, earnings, debt, ROI, or economic signals are relevant to this major or program direction?
- How do outcomes compare across Decision Options?
- What economic trade-offs should a parent, student, or counselor discuss?
- Which outcomes signals are too broad, stale, incomplete, or uncertain to support a strong conclusion?

## P0 Role

Outcomes and economics data is a paid attraction signal for P0 School / Program Comparison. It should be present from the first paid value loop because parents and students strongly care about economic return, but it must be framed as historical or contextual signal rather than a personal guarantee.

## Product Rules

- Outcomes claims must preserve source, population, year, geography, degree level, and methodology limitations where relevant.
- Salary, earnings, ROI, and employment signals must not be presented as guarantees for an individual student.
- Outcomes should be connected to a program only when mapping confidence is high enough for responsible comparison.
- Broad-field outcomes may support direction-level context, but should not pretend to be precise program-level outcomes.
- Outcomes comparisons should show uncertainty and limitations alongside attractive signals.

## Required Outcomes Data Points

**Earnings**:
- Median earnings at 2 years post-enrollment (College Scorecard)
- Median earnings at 5-10 years (if available)
- 25th-75th percentile earnings range
- Comparison to national median for similar programs

**Debt**:
- Median federal loan debt at graduation
- Debt-to-income ratio
- Percentage of students with debt
- Average monthly payment estimate

**ROI Context**:
- 40-year cumulative salary yield (projected)
- Cost-of-attendance-adjusted ROI
- Break-even timeline (years to recover total investment)

**Program-Level Data**:
- When CIP code mapping is available, outcomes by specific major/program
- Limitation: "Program-level data available for [X]% of this institution's programs"

## User-visible Value

Outcomes data can help users discuss:

- financial trade-offs;
- career pathway expectations;
- ROI and debt concerns;
- parent-facing value of a school/program option;
- whether a higher-ranking or more expensive option appears economically justified.

## Data Gap Handling

- When outcomes data is unavailable for a program or institution, the system should not infer or estimate earnings.
- Users should see: "Outcomes data is not available from [source] for this [institution/program]."
- Demand vote integration: Users can request outcomes data coverage.

## Does Not Own

- College Scorecard data ingestion pipeline
- CIP code mapping implementation
- ROI calculation algorithm
- Database schema or API contracts
