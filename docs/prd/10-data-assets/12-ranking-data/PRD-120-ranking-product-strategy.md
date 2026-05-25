# PRD-120: Ranking Product Strategy

Status: Draft

## Purpose

Define how third-party rankings function as product evidence without becoming the sole decision authority.

## Ranking Roles

Ranking serves four product roles:

1. **Attraction Signal**: ranking is a primary reason students and parents become curious enough to compare options.
2. **Comparison Lens**: ranking helps compare schools, subjects, programs, and reputation context inside the Full Decision Workspace.
3. **Explanation Trigger**: ranking differences create useful explanations for reports and counselor discussions.
4. **Trust Test**: ranking claims are easy to challenge, so source, year, category, scope, tie, and missing-data context must be explicit.

## Ranking Layers

Ranking and reputation data must distinguish:

- **Institution-level ranking**: overall school reputation or broad institutional standing.
- **Subject / discipline ranking**: ranking for a broad academic field.
- **Program / major-related ranking**: ranking related to a student's intended program, major, or pathway.
- **Regional / country ranking**: ranking within a country, region, state, or market.
- **Reputation / review-style signal**: student perception, campus experience, or review-style signals when the source supports them.

Overall ranking and subject/program ranking are different signals. A school can be generally prestigious without being strongest in the student's target field, and a school can be less prominent overall while being highly relevant in a target field.

## P0 Ranking Lens

The first paid comparison experience should support:

- overall institution ranking where available;
- subject, discipline, program, or major-related ranking where available;
- ranking source;
- ranking year;
- ranking category;
- ranking scope;
- tie handling;
- missing, unranked, or unavailable states;
- contrast between overall ranking and target-field ranking.

The contrast between overall reputation and target-field strength is a P0 product value because it helps users avoid treating prestige as a single undifferentiated signal.

## Product Rules

- Rankings must be source-specific and year-specific.
- Ties must be preserved when the source publishes ties.
- Ranking category definitions must be visible or explainable when users compare sources.
- Conflicting rankings should be treated as signal diversity, not automatically resolved into a single truth.
- Rankings may support discovery, filtering, comparison, and reporting, but should not override verified institution or program facts.
- Ranking claims must not mix institution-level, subject-level, program-level, regional, and review-style signals without labeling their scope.
- Missing ranking data must not be treated as proof that an option is weak.
- Ranking is one decision lens, not the decision.

## Product Examples

Ranking explanations may highlight patterns such as:

- an option has stronger overall reputation than target-field evidence;
- an option has stronger target-field relevance than its overall ranking suggests;
- sources disagree or cover different scopes;
- one source ranks an option while another source lacks comparable coverage.

These explanations should be source-backed and should not invent ranking conclusions when source data is missing.

## Downstream Consumers

- University discovery
- Program comparison
- Fit engine
- Counselor reports
- Commercial packaging
