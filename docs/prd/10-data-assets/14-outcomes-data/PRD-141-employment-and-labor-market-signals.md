# PRD-141: Employment and Labor Market Signals

Status: Draft

## Data Asset Contract

- Source Authority: Approved labor market or employment outcome sources defined by source governance (Bureau of Labor Statistics, O*NET, state labor departments, industry reports).
- Product Value: Adds employment, demand, and risk context to major and program decisions — helping students understand not just what they'll earn, but whether the field is growing, stable, or declining.
- User-visible Fields: Employment growth rate (10-year projection), total employment in occupation, median wage by occupation, AI-exposure risk score, top employers, geographic concentration.
- Verification Requirement: Labor market claims must retain source, geography, occupation or major mapping, year, and limitation context.
- Freshness Requirement: Annual refresh aligned with source release cycle.
- Versioning Rule: Time-series signals must distinguish period and methodology.
- Known Limitations: Major-to-career mappings are probabilistic and should not be presented as guarantees. BLS data is U.S.-focused. AI-exposure scores are estimates based on task analysis, not empirical evidence.
- Downstream Consumers: Major discovery, fit engine, ROI model, reports.

## Problem

Students want to know not just what they'll earn after graduation, but whether their chosen field will still exist and be in demand 10 years from now. Research confirms:

- *"AI is replacing quite a few human jobs, so I want to choose fields where AI can't yet do it."* — Students are actively thinking about career durability.

## Decision Questions

This data asset helps answer:

- Which career or labor market signals are relevant to a major or program direction?
- What demand, employment, or occupation-pathway context may affect a student's decision?
- Where is the major-to-career mapping broad, uncertain, or not comparable?

## Product Rules

- Labor market signals should support comparison and discussion, not promise individual career outcomes.
- Geographic and occupation-scope limitations should be visible when they affect interpretation.
- Major-to-career mappings should be treated as directional, not deterministic.
- Labor market data should be paired with fit, curriculum, admissions, ranking, and outcomes context.

## Required Labor Market Data Points

**Employment Outlook**:
- 10-year employment growth rate by occupation (BLS)
- Total employment in occupation
- Projected openings (replacement demand + growth demand)

**Wage Data**:
- Median annual wage by occupation (BLS)
- 10th-90th percentile wage range
- Wage by geography (state-level where available)

**AI-Exposure Risk**:
- Composite score indicating likelihood of automation impact (based on O*NET task analysis)
- Score explanation: "This occupation scores [X] because it involves [tasks] which are [highly/moderately/low] automatable"
- Caveat: "AI-exposure scores are estimates based on task analysis, not empirical evidence of job displacement"

**Career Pathways**:
- Top 5 careers associated with each major (via CIP-to-SOC mapping)
- Alternative career pathways for students who pivot

## Major-to-Career Mapping

- Map CIP codes (majors) to SOC codes (occupations) using BLS crosswalks
- Each major may map to multiple occupations with different confidence levels
- Display: "Graduates with this major commonly work as: [Occupation A] ([X]%), [Occupation B] ([Y]%), [Occupation C] ([Z]%)"
- Uncertain mappings should be labeled: "Some graduates also work in [field], but this connection is less direct"

## Data Gap Handling

- When labor market data is unavailable for an occupation or major, the system should not infer employment outlooks.
- Users should see: "Labor market data is not available for careers associated with this major."

## Does Not Own

- BLS/O*NET data ingestion pipeline
- CIP-to-SOC mapping implementation
- AI-exposure score calculation algorithm
- Database schema or API contracts
