# PRD-100: Data Asset Strategy

Status: Draft

## Purpose

Treat admissions-related data as a first-class product asset with clear source ownership, product value, verification, and downstream usage.

## Data Asset Families

- Institution identity data
- Admissions and profile data
- Ranking and reputation data
- Academic program and curriculum data
- Outcomes and economics data
- Source lineage and freshness metadata
- Mapping and normalization data
- User-generated decision workspace data

## P0 Data Asset Loop

P0 is not the easiest data loop to build. P0 is the smallest paid data loop that can make the Full Decision Workspace feel valuable enough to unlock.

See [PRD-103: P0 Data Asset Loop](PRD-103-p0-data-asset-loop.md) for the authoritative P0 loop.

The first paid workspace experience must include both trust foundation assets and attractive decision signals:

### Trust Foundation

- **Institution Identity**: ensures that facts from different sources refer to the same school.
- **Source Lineage and Freshness**: ensures users know where a claim came from, which year or version it represents, and whether it may be stale.
- **Mapping and Normalization**: ensures rankings, programs, majors, outcomes, and institution records can be compared responsibly.

### Paid Attraction Signals

- **Ranking and Reputation**: provides overall and target-field reputation context that users and parents naturally care about.
- **Outcomes and Economics**: provides salary, employment, ROI, cost, debt, or labor-market context where available.

### Decision Fit Signals

- **Admissions and Profile**: provides admissions competitiveness and applicant/profile context where available.
- **Academic Program and Curriculum**: provides official program, school, department, curriculum, prerequisite, and major/CIP context where available.

## Data-backed Comparison Formula

Data-backed Comparison requires more than two visible data points.

```text
Data-backed Comparison =
  Institution Identity
  + Source Lineage and Freshness
  + Mapping and Normalization
  + at least two comparable decision signals
```

Comparable decision signals may include ranking, admissions, program fit, outcomes, cost, student-fit, confidence, or data-gap signals.

## Product Priority Rule

Ranking and outcomes must be present in the first paid value loop because they are primary user attraction signals. They should appear with source context, confidence, and limitations rather than being treated as absolute truth or personal guarantees.

## Data Asset Contract

Every data asset PRD should define:

- Source authority
- Product value
- User-visible claims
- Verification requirement
- Freshness requirement
- Versioning rule
- Known limitations
- Downstream consumers

## Product Rules

- Data asset PRDs own the meaning and acceptable use of their data.
- Experience PRDs may request data, but must not redefine source truth.
- Intelligence PRDs must cite the data assets they combine.
- Commercial PRDs may define access tiers but not weaken data trust requirements.
- P0 data assets must support School / Program Decision Option comparison, not only standalone data browsing.
- Ranking and outcomes should be treated as paid attraction signals that require trust cues, not as standalone conclusions.
- Data assets should be evaluated by whether they help users answer a decision question, not by whether they are interesting to collect.
