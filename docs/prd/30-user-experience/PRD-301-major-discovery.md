# PRD-301: Major Discovery

Status: Draft

## Depends On

- Major ROI and salary outcomes
- Employment and labor market signals
- Major CIP mapping
- Decision Profile
- Confidence score and explainability

## Purpose

Help students move from "I don't know what I want to study" to a structured shortlist of majors they feel confident exploring — using real outcomes data, trade-off analysis, and explainable reasoning rather than generic recommendation lists.

## Problem

Students experience paralyzing uncertainty when choosing a major. The pressure to "just know" creates anxiety, social comparison, and second-guessing. Existing tools either dump raw data (College Scorecard) or focus only on application tracking — nothing helps students actually explore, compare, and narrow down with confidence. The core tension is **passion vs. money**: students want to wake up excited about their work, but they also want financial security. No existing tool helps them navigate this trade-off with data rather than fear.

Customer research confirms:
- *"The more they get asked 'What do you want to do?' the more panicked they feel."*
- *"I want to wake up in the morning and have something I look forward to"* vs. *"I wish I could do that, but I want money."*
- *"AI is replacing quite a few human jobs, so I want to choose fields where AI can't yet do it."*

## Product Principles

- **承认不确定性 (Normalize Uncertainty)**: "Undecided" is the default starting state, not a failure. The system should guide exploration without pressure.
- **数据驱动权衡 (Data-Driven Trade-offs)**: Show real salary, job growth, and AI-resistance data for each major. Help students make informed passion-vs-money decisions.
- **可解释推荐 (Explainable Recommendations)**: Every recommendation must answer "why" in plain language. No black-box algorithms.
- **渐进式探索 (Progressive Exploration)**: Guide users from broad interest areas → specific majors → program-level details, with visible decision readiness progress.

## Core User Stories

- **As an undecided student**, I can start by selecting general interest areas (e.g., "I like helping people," "I like building things") and receive a curated set of majors with real outcomes data.
- **As a student torn between two majors**, I can compare them side-by-side on salary, job growth, AI-resistance, and daily work reality — so I can make an informed trade-off.
- **As a parent**, I can see the financial outlook for any major (median salary, employment rate, debt-to-income ratio) without navigating technical academic details.
- **As a counselor**, I can recommend majors to students backed by data, not gut feeling, and export a summary for family meetings.

## Requirements

### 1. Exploration Starting Points (探索起点)

The major discovery experience should support multiple entry paths:

**A. Interest-Based Entry (兴趣导向)**
- User selects one or more interest prompts (e.g., "我喜欢解决问题" / "I like solving problems", "我想帮助他人" / "I want to help others", "我喜欢创造东西" / "I like building things")
- System maps interests to related major clusters using CIP-to-interest correlation data
- Each cluster shows: number of majors, median starting salary range, and a "Learn More" entry

**B. Outcome-Based Entry (结果导向)**
- User sets a target salary range (e.g., "$60K-$80K starting") or job security preference
- System shows majors that meet the criteria, ranked by fit with the user's Decision Profile
- Each result shows: median starting salary, 10-year salary growth, employment rate, and AI-resistance signal

**C. Anxiety-Mitigation Entry (" undecided " 路径)**
- A prominent "I'm not sure yet" option that normalizes uncertainty
- System presents a guided exploration: "Let's explore 5 interest areas together — no commitment"
- Each exploration step is optional and saveable

### 2. Major Detail View (专业详情)

Each major detail view must include:

**Outcomes Data (结果数据)**
- Median starting salary (source: College Scorecard, with audit code)
- Median prime-age salary (age 35-45)
- 40-year cumulative salary yield (for parent-facing view)
- Employment rate within 2 years of graduation
- Top 5 career paths taken by graduates of this major

**AI-Resistance Signal (AI 抵御指数)**
- A composite signal indicating how likely the typical careers for this major are to be impacted by AI automation in the next 10 years
- Must be explainable: "This major scores X because its top career paths involve [skill] which AI is [unlikely/likely] to automate"
- Source: labor market analysis + Bureau of Labor Statistics projections

**Daily Work Reality (日常工作实况)**
- What graduates of this major actually do day-to-day (sourced from O*NET and labor surveys)
- NOT what the major teaches — what the job actually looks like

**Major Change Flexibility (转专业灵活性)**
- How easy it is to switch into/out of this major at each school (percentage of students who change in/out)
- Average time-to-graduation impact if switching majors

**Decision Confidence Indicator (决策信心指标)**
- A simple 3-level indicator: "Strong data available" / "Partial data" / "Limited coverage"
- Links to source confidence and missing data details

### 3. Passion vs. Money Trade-off Framework (热情与回报权衡框架)

A dedicated comparison surface that helps students navigate the core tension:

- **Passion Axis**: How well the major aligns with the user's stated interests, strengths, and values (derived from Decision Profile weights)
- **Financial Security Axis**: Starting salary, 10-year growth, employment rate, and AI-resistance combined into a single "Financial Outlook" score
- **Quadrant Display**: Majors are plotted on a 2-axis chart (Passion × Financial Security)
  - Top-right: "Sweet spot" — high alignment on both
  - High passion, low financial: "Purpose-driven — understand the trade-offs"
  - Low passion, high financial: "Financially strong — consider if sustainability matters"
  - Low on both: "Consider exploring alternatives"
- The framework must NOT judge the user's preference. It presents trade-offs transparently.

### 4. Parent View (家长视图)

When the user role is Parent, the major discovery experience adapts:

- **Hidden**: Academic prerequisites, coursework details, CIP codes
- **Prominent**: 40-year cumulative salary yield, cost-of-attendance-adjusted ROI, debt-to-income ratio, employment rate
- **Language**: Uses family decision vocabulary ("年学费回报周期" / "Years to tuition payback", "长期职业稳定性" / "Long-term career stability")
- **Comparison**: Side-by-side major comparison focused on cost, outcomes, and risk

## Acceptance Criteria

- **Given** an undecided student lands on Major Discovery, **when** they select "I'm not sure yet", **then** they are guided through a 5-step interest exploration with no commitment required.
- **Given** a student compares two majors, **when** they view the comparison, **then** they see salary data, AI-resistance signal, daily work reality, and major change flexibility side-by-side with source citations.
- **Given** a student views the Passion vs. Money framework, **when** they adjust their weights, **then** the quadrant re-renders showing how each major shifts position.
- **Given** a parent views a major, **when** they see the detail view, **then** academic prerequisites are hidden and financial outcomes (40-year yield, debt-to-income) are prominently displayed.
- **Given** any major view, **when** data confidence is low, **then** a clear indicator is shown and the user is not presented with fabricated or interpolated values.

## Does Not Own

- Source truth rules for salary, employment, or labor market data
- CIP mapping or classification logic
- AI-resistance methodology or algorithm implementation
- Decision Profile scoring or weighting logic

