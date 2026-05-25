# PRD-141: Employment and Labor Market Signals

Status: Draft

## Data Asset Contract

- Source Authority: Approved labor market or employment outcome sources defined by source governance.
- Product Value: Adds employment, demand, and risk context to major and program decisions.
- User-visible Fields: To be defined only after source review.
- Verification Requirement: Labor market claims must retain source, geography, occupation or major mapping, year, and limitation context.
- Freshness Requirement: To be defined by source release cycle.
- Versioning Rule: Time-series signals must distinguish period and methodology.
- Known Limitations: Major-to-career mappings are probabilistic and should not be presented as guarantees.
- Downstream Consumers: Major discovery, fit engine, ROI model, reports.

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
