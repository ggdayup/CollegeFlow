# PRD-303: Program Comparison

Status: Draft

## Depends On

- University program catalogs
- Major CIP mapping
- Curriculum and prerequisites
- Outcomes data
- Fit engine

## Purpose

Help users compare specific university programs side-by-side while preserving official program identity and source-backed context — enabling informed decisions that weigh academic fit, career outcomes, cost, and lifestyle factors together.

## Problem

Students and parents need to compare specific programs (e.g., "Computer Science at UMich vs. Computer Science at Georgia Tech"), not just universities in general. Currently, they resort to building 13-tab Google Sheets workbooks because no single tool shows program-level comparison with outcomes data. Customer research confirms:

- A Medium post by an ex-counselor describes building a 13-tab Google Sheets workbook to hold all application data in one place.
- *"College info is everywhere! Websites, brochures, emails, social media – it's a flood of info for students to wade through."*
- Program-level outcomes (salary by major at a specific school) are the most valuable data point for ROI decisions, yet the hardest to find.

## Product Principles

- **程序级比较 (Program-Level Comparison)**: Compare specific programs, not just universities. "CS at UMich" is not the same as "CS at Georgia Tech."
- **权衡可见性 (Visible Trade-offs)**: Make trade-offs explicit. If Program A has higher salary but Program B has lower cost, show both clearly.
- **数据置信度 (Data Confidence)**: Show what data is strong, partial, or missing. Don't fabricate.
- **家庭可读 (Family-Readable)**: Comparison output must be understandable by parents, students, and counselors alike.

## Core User Stories

- **As a student**, I can compare 2-4 programs side-by-side and see salary, admissions, curriculum, and lifestyle factors in one view.
- **As a parent**, I can see the cost-to-ROI comparison between programs so I can evaluate financial trade-offs.
- **As a counselor**, I can generate a comparison report for a family meeting and annotate it with my professional recommendations.

## Requirements

### 1. Comparison Surface (比较界面)

**Decision Option Structure**
```
Decision Option = Institution + Program / Major Direction
```

**Comparison Dimensions (比较维度)**

| Dimension | Data Source | Student View | Parent View |
|-----------|-------------|--------------|-------------|
| Admissions fit | CDS, IPEDS | Acceptance rate, GPA/SAT range | Acceptance rate, competitiveness |
| Academic program | Program catalogs, CIP | Curriculum, prerequisites, flexibility | Program reputation |
| Outcome data | College Scorecard | Starting salary, top careers | 40-year yield, debt-to-income |
| Cost | IPEDS, CDS | Net price, aid availability | Total COA, financial aid, ROI |
| Lifestyle | NCES, CDS | Campus culture, location, vibe | Safety, support services |
| AI-resistance | Labor market analysis | AI-resistance score + explanation | Career stability outlook |

**Trade-off Highlighting (权衡高亮)**
- Automatically identify and surface key trade-offs: "Program A has 15% higher starting salary, but Program B costs 40% less in total cost of attendance"
- Use clear, non-judgmental language
- Link trade-offs to the user's Decision Profile weights

### 2. Scenario Comparison (场景比较)

Support three comparison types:

**A. Program vs. Program (专业对比)** — Same major, different schools. Most common use case.

**B. Direction vs. Direction (方向对比)** — Different majors, same school. For students deciding between interest areas.

**C. Strategy vs. Strategy (策略对比)** — Prestige-heavy vs. ROI-balanced approach. For families making fundamental strategy decisions.

### 3. Exportable Report (可导出报告)

- One-page comparison summary suitable for printing or sharing
- Includes all visible data with source citations
- Counselor annotation field for professional recommendations
- Available as PDF or shareable link

### 4. Parent View (家长视图)

When the user role is Parent:

- **Prominent**: Cost comparison, ROI comparison, debt-to-income ratio, graduation rate
- **Simplified**: Academic details reduced to program reputation and career paths
- **Language**: Family decision vocabulary ("哪个更划算" / "Which offers better value", "长期回报对比" / "Long-term return comparison")

## Acceptance Criteria

- **Given** a user selects 2-4 programs to compare, **when** they view the comparison, **then** they see all six dimensions side-by-side with source citations.
- **Given** a comparison is loaded, **when** there are significant trade-offs between programs, **then** they are automatically highlighted with clear, non-judgmental language.
- **Given** a parent views a comparison, **when** they see the results, **then** cost and ROI data are prominently displayed and academic details are simplified.
- **Given** a user exports a comparison report, **when** they download the PDF, **then** it includes all visible data, source citations, and space for counselor annotations.

## Does Not Own

- Source truth rules for program, outcome, or cost data
- CIP mapping or curriculum data
- Fit engine scoring or methodology
- Database schema or API contracts
