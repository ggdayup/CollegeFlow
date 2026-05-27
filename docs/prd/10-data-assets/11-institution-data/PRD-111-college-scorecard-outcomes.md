# PRD-111: College Scorecard Outcomes

Status: Draft

## Data Asset Contract

- Source Authority: U.S. College Scorecard (Department of Education) or equivalent official outcomes source.
- Product Value: Supports cost, outcome, and ROI-oriented decision making. College Scorecard is the most authoritative source for program-level earnings, debt, and completion data in the U.S.
- User-visible Fields: Median earnings (2-year, 5-year, 10-year post-enrollment), median debt, completion rate, transfer rate, average annual cost, net price by income bracket.
- Verification Requirement: Outcome claims must preserve source and release context.
- Freshness Requirement: Annual refresh aligned with College Scorecard release cycle.
- Versioning Rule: Historical outcome snapshots should not be overwritten without traceability.
- Known Limitations: College Scorecard data is institution-level and, for some fields, program-level (via CIP code mapping). Earnings data reflects students who received federal aid and may not represent all graduates. Earnings are measured for students who completed the program, not those who enrolled but did not graduate.
- Downstream Consumers: ROI model, university comparison, counselor reports, paywall value messaging.

## Product Boundary

This PRD owns product requirements for official outcomes data. It does not own salary model design or UI comparison layouts.

## Requirements

### 1. Earnings Data

**Fields**:
- Median earnings at 2 years post-enrollment
- Median earnings at 5 years post-enrollment (if available)
- Median earnings at 10 years post-enrollment (if available)
- Earnings percentile range (25th-75th percentile)

**Product Display**:
- "Median starting salary: $X (College Scorecard, [year])"
- 40-year ROI projection based on earnings trajectory
- Comparison to peer institutions and national program average

### 2. Debt and Cost Data

**Fields**:
- Median federal loan debt at graduation
- Debt-to-income ratio (median debt / median starting earnings)
- Average annual cost (tuition, fees, room, board)
- Net price by income bracket ($0-30K, $30-48K, $48-75K, $75-110K, $110K+)
- Percentage of students receiving federal aid

**Product Display**:
- "Median debt at graduation: $X. Typical monthly payment: $Y."
- "Net price for families earning $30K-$48K: $Z/year."
- Debt-to-income ratio with context: "A debt-to-income ratio above 2.0 is considered high risk."

### 3. Completion and Transfer Data

**Fields**:
- 6-year completion rate (graduation rate)
- 8-year completion rate (for non-traditional students)
- Transfer-out rate
- Retention rate (first-year to second-year)

**Product Display**:
- "6-year graduation rate: X%. This means Y out of 10 students who start at this school graduate within 6 years."

### 4. Program-Level Outcomes

When CIP code mapping is available:

- Earnings data by major/program
- Completion rate by major/program
- Debt levels by major/program
- **Limitation warning**: "Program-level data is available for [X]% of this institution's programs. Data may not reflect all majors."

## Data Gap Handling

- When College Scorecard data is unavailable for an institution or program, the system should not infer outcomes.
- Users should see: "Outcomes data is not available from College Scorecard for this [institution/program]."
- Demand vote integration: Users can request outcomes data coverage.

## Does Not Own

- College Scorecard data ingestion pipeline
- CIP code mapping implementation
- ROI calculation algorithm
- Database schema or API contracts
