# PRD-302: University Discovery

Status: Draft

## Depends On

- NCES IPEDS institution profile
- Common Data Set
- Ranking product strategy
- University program catalogs
- Decision Profile
- Data gap and warning system

## Purpose

Help users explore universities through trusted institution data, ranking context, admissions data, program availability, decision fit, and **lifestyle/environment factors** — so students can weigh both "heart" and "brain" considerations when choosing a school.

## Problem

Students making school choices face a deeply emotional conflict between campus vibe/lifestyle and career prospects/prestige. Existing tools show rankings and admissions data but ignore the lifestyle factors that actually influence student satisfaction and retention. Customer research confirms:

- *"My heart says UGA for the lifestyle, but my brain (and my parents) say Tech for the career prospects."*
- Students need to see both campus culture AND career outcomes side-by-side, not in separate tools.
- Parents care about outcomes; students care about fit. Both need to see the same data to have productive conversations.

## Product Principles

- **双重视角 (Dual Perspective)**: Show both lifestyle/campus factors AND career/outcome factors together. Don't force users to choose one lens.
- **数据真实性 (Data Authenticity)**: All institutional data must be sourced, cited, and auditable. No fabricated or interpolated values.
- **家庭对话工具 (Family Conversation Tool)**: Present data in a way that enables students and parents to discuss trade-offs using shared information.
- **可比较性 (Comparability)**: Universities should be comparable across dimensions that matter to different stakeholders.

## Core User Stories

- **As a student**, I can see not just a university's rankings and admissions stats, but also its campus culture, location, social environment, and student life — so I can evaluate the "feel" alongside the data.
- **As a parent**, I can see the same university with cost, ROI, and safety factors prominently displayed.
- **As a student choosing between two schools**, I can see a structured comparison that shows what each school is strong at and where they differ.
- **As a counselor**, I can quickly pull up university profiles during family meetings and export key data for reports.

## Requirements

### 1. University Profile Anatomy (大学画像架构)

Each university profile must include:

**Academic & Admissions Context (学术与招生背景)**
- Acceptance rate, GPA range, test score percentiles (CDS-sourced)
- Program availability by major (which majors are offered, which are competitive-entry)
- Average class size, student-faculty ratio

**Outcome Data (结果数据)**
- Median graduate salary by major (College Scorecard-sourced)
- 6-year graduation rate
- Post-graduation employment rate
- Top employers of graduates

**Lifestyle & Environment (生活方式与环境)**
- Location type (urban/suburban/rural), distance from major cities
- Campus size, housing availability, Greek life presence
- Sports culture, music/arts scene, social vibe descriptors
- Student body composition (gender ratio, diversity metrics)
- Climate and weather data

**Cost & Financial Aid (成本与资助)**
- Tuition, room & board, total cost of attendance
- Average financial aid package, percentage of students receiving aid
- Net price by income bracket
- Average graduate debt load

### 2. Heart vs. Brain Framework (感性 vs. 理性决策框架)

A structured view that helps students navigate the lifestyle vs. prestige tension:

- **Heart Score**: Campus culture, location appeal, social environment, student life satisfaction
- **Brain Score**: Career outcomes, ranking prestige, ROI, academic rigor
- **Combined Display**: Shows both scores with a brief explanation of what drives each
- **Trade-off Prompts**: "This school scores high on lifestyle but moderate on career outcomes. Is this acceptable for your goals?"
- The framework must NOT prescribe a "right" choice. It surfaces the trade-off for discussion.

### 3. Family Conversation Mode (家庭对话模式)

When a student and parent are viewing the same university profile together:

- Split view showing student-facing data (left: lifestyle, academic fit, campus culture) and parent-facing data (right: cost, ROI, employment outcomes)
- Shared summary at the bottom: "Here's what this school offers for both of you"
- Exportable one-page summary suitable for family meetings

### 4. Parent View (家长视图)

When the user role is Parent, the university discovery experience adapts:

- **Hidden**: Detailed academic prerequisites, campus social descriptions
- **Prominent**: Total cost of attendance, net price by income bracket, graduate salary data, graduation rate, average debt load
- **Language**: Uses family decision vocabulary ("年学费预算匹配" / "Tuition budget match", "毕业6年回报率" / "6-year post-graduation return")

## Acceptance Criteria

- **Given** a student views a university profile, **when** they scroll to the Lifestyle section, **then** they see campus culture, location, social environment, and student life data with source citations where available.
- **Given** a student views the Heart vs. Brain framework, **when** they view the combined display, **then** both scores are shown with explanations and trade-off prompts.
- **Given** a parent views a university profile, **when** they see the detail view, **then** financial data (total COA, net price, graduate salary, debt load) is prominently displayed and academic details are simplified.
- **Given** a counselor exports a university profile, **when** they generate a report, **then** it includes all visible data in a clean, family-meeting-ready format.

## Does Not Own

- Source truth rules for institutional, ranking, or admissions data
- Ranking methodology or normalization logic
- Database schema or API contracts
- Cost calculation or financial aid methodology
