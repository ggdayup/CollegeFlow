# PRD-305: Search Entry Experience

Status: Draft

## Downstream Consumers

- Onboarding
- Major Discovery
- University Discovery
- Program Comparison
- Initial and Full Workspace Boundary

## Purpose

Make the website entry feel like a simple search engine so new users can begin with the lowest possible activation cost by typing a country, school, major, program direction, or mixed natural-language intent.

## Problem

CollegeFlow has rich school, program, ranking, outcomes, and decision data, but a first-time user may not know which product surface to open first. If the entry experience asks users to choose a workflow before they have formed a clear question, the product creates unnecessary friction.

The entry should let users start from the words already in their head, then guide them toward trusted, source-backed information and decision surfaces.

## Product Principles

- The first screen should prioritize one clear search action over explanation-heavy navigation.
- Search should accept imperfect intent, including countries, universities, majors, school names, program areas, and mixed queries.
- Results should help users decide the next action, not merely display a long index.
- Every academic, ranking, admissions, salary, or outcomes claim shown from search must preserve CollegeFlow's data trust and citation principles.
- When CollegeFlow has incomplete coverage, the experience should show a responsible gap state instead of pretending to have an answer.

## Core User Stories

- As a student, I can type a country, school, or major and quickly find the most relevant CollegeFlow information without learning the site's navigation first.
- As a parent, I can start with a broad question such as a country plus major direction and see credible options or gaps.
- As a counselor, I can use the search entry as a fast way to reach a school, major, program comparison, or decision workspace during a conversation.

## Requirements

### Unified Entry

The public entry experience should center on a single prominent search input with minimal surrounding decisions.

The entry should support queries that mention:

- Countries or regions
- Universities or schools
- Majors, fields, and program directions
- Combined school and major intent
- Exploratory phrases that imply comparison or fit questions

### Result Intent Routing

Search results should organize likely intent into useful next steps, such as:

- Explore a university
- Explore a major
- Compare school or program options
- Review outcomes, admissions, rankings, or curriculum context
- Continue into a decision workspace when the user is ready

### Trust And Coverage

Search results must distinguish verified information, limited information, and missing coverage. If a user searches for a school, program, or geography that is not covered, the product should explain the coverage state and offer adjacent useful actions without fabricating data.

### Progressive Depth

The search entry should be useful before account creation, while deeper decision workflows may follow the entitlement and workspace rules defined by commercial PRDs.

## Acceptance Criteria

- Given a new user lands on the site, when they view the first screen, then the primary action is a simple search input rather than a multi-step form.
- Given a user searches for a known university, when results are shown, then the user can continue to the university discovery surface.
- Given a user searches for a known major or field, when results are shown, then the user can continue to major discovery.
- Given a user searches for a combined school and major intent, when results are shown, then the product can route toward program comparison or a decision option view.
- Given a search result includes academic, ranking, admissions, salary, or outcomes information, when the user sees it, then source and verification cues are preserved according to data trust principles.
- Given CollegeFlow lacks responsible coverage for a query, when results are shown, then the product displays a gap or limitation state instead of unverified claims.

## Depends On

- Product Charter
- User Segments and Roles
- Data Trust and Citation Principles
- Decision Profile
- School / Program Comparison
- Major Discovery
- University Discovery
- Entitlement Model
- Initial and Full Workspace Boundary

## Does Not Own

- Source truth rules for schools, programs, rankings, admissions, salary, or outcomes
- Ranking methodology or data verification policy
- Search implementation, indexing, matching, or API contracts
- Paywall and subscription rules

## Open Questions

- Should the first entry search be fully anonymous, or should some saved-search behavior require account creation?
- Should the default empty state suggest example searches, recent popular intents, or curated decision paths?
- How much comparison value should be visible from search before the paid workspace boundary appears?
