# PRD-131: Major CIP Mapping

Status: Draft

## Purpose

Define product requirements for mapping official university program names to standardized major and CIP-aligned concepts without losing the official program label.

## Decision Questions

This data asset helps answer:

- Which standardized major or field is most closely related to an official university program?
- Can outcomes, labor market, ranking, or comparison signals be responsibly connected to this program?
- How confident is the mapping?
- What should the product do when a mapping is ambiguous?

## Product Rules

- Preserve the official program name.
- Standardized mappings must be traceable and reviewable.
- Ambiguous mappings should be marked uncertain rather than forced.
- Mappings should support comparison, outcomes analysis, and recommendation while respecting source-specific program identity.
- Mapping confidence must be visible when it affects comparison quality.
- A mapped major is not a replacement for the official program name.
- Outcomes and labor market signals should not be attached to a program when mapping confidence is too low for responsible comparison.
- Mapping should preserve the difference between exact, close, broad-field, and uncertain matches.

## Mapping States

- **Exact or Direct Match**: the official program and standardized category are close enough for comparison use.
- **Close Match**: the mapping is likely useful but should retain limitations.
- **Broad-field Match**: the mapping supports high-level context but not precise program comparison.
- **Uncertain Match**: the mapping should be reviewed or shown as uncertain.
- **No Responsible Match**: the product should not attach standardized outcomes or comparison claims.

## Downstream Consumers

- Major discovery
- Program comparison
- Outcomes and ROI models
- Fit engine
- Counselor reports
