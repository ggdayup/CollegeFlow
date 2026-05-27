# PRD-402: Reports and Shareable Deliverables

Status: Draft

## Depends On

- Data lineage, verification, and freshness
- Confidence score and explainability
- Decision Profile
- Counselor CRM
- Entitlement model

## Purpose

Allow counselors and users to package trusted, source-backed decision evidence into professional reports and controlled sharing experiences — replacing the manual PDF stitching and spreadsheet exports that currently serve as counselor deliverables.

## Problem

Counselors need to produce polished, data-backed reports for family meetings, client intake, and progress updates. Currently, they manually stitch together data from multiple sources (spreadsheets, college websites, ranking pages) into presentations that are time-consuming to produce and hard to keep updated. Research confirms:

- *"Drowning in hundreds of emails from students and parents every week."* — No structured report delivery mechanism.
- Counselors spend weekends "doing admin instead of actually counseling students" — report generation is a major time sink.
- Families need tangible artifacts to discuss: *"Have frank family conversations about money, expectations and contingency plans before committing to a costly degree."*

## Product Principles

- **数据可信 (Data Trust)**: Every claim in a report must include a source citation and audit code. No fabricated or unverified data.
- **一键生成 (One-Click Generation)**: Reports should be generated from workspace data with minimal manual input.
- **品牌化 (Branding)**: Counselors should be able to brand reports with their practice name, logo, and color scheme.
- **可分享 (Shareable)**: Reports should be shareable via link or PDF, with controlled access and expiration options.

## Core User Stories

- **As a counselor**, I can generate a family meeting report with one click, including my professional annotations, and share it as a branded PDF.
- **As a student**, I can share my decision progress with my parents via a read-only link.
- **As a parent**, I can receive a weekly progress digest via email showing my child's application status.
- **As a counselor**, I can track which families have viewed their reports and which haven't.

## Requirements

### 1. Report Types (报告类型)

**A. Family Meeting Report (家庭会议报告)**
- One-page summary combining:
  - Student's Decision Profile and weights
  - Top recommended schools/programs with data citations
  - Comparison summary (Passion vs. Money, Heart vs. Brain)
  - Cost overview (total COA, expected aid, projected debt-to-income)
  - Risk summary in family-friendly language
  - Counselor's professional annotations and recommendations
- Available as PDF or shareable link
- Branded with counselor's practice name/logo

**B. Decision Progress Report (决策进展报告)**
- Shows the student's exploration journey: what they've researched, compared, and decided
- Decision Readiness score and how it has changed over time
- Upcoming deadlines and task completion status
- Suitable for counselor check-in meetings

**C. Outcome Report (结果报告)**
- Post-decision summary: which school/program the student chose
- Comparison with other considered options
- Financial summary: total expected cost, aid received, projected debt
- For counselors: aggregate outcome data across all students (for marketing and practice analytics)

**D. Parent Weekly Digest (家长周报)**
- Automated weekly email digest:
  - "Your child has X applications in progress, Y deadlines this week"
  - Which documents are complete, pending, or overdue
  - Upcoming counselor meetings or action items
- Customizable: parent can choose what to include/exclude

### 2. Report Generation Flow (报告生成流程)

- User selects report type
- System auto-populates from workspace data
- User can add custom annotations or commentary
- Preview before generation
- Export as PDF, shareable link, or email
- Shareable link settings: password-protected, expiration date, view count tracking

### 3. Branding & Customization (品牌与定制)

- Counselor practice name and logo on all reports
- Custom color scheme (optional)
- Custom footer with contact information
- Template selection: "Concise" (1 page) vs. "Comprehensive" (3-5 pages)

### 4. Access Control & Tracking (访问控制与追踪)

- Shareable links can be: public, password-protected, or invitation-only
- Track who viewed the report, when, and for how long
- Notify counselor when a family views their report
- Expiration: links expire after configurable period (default: 30 days)

### 5. Entitlement Gating (权限门控)

- Free tier: basic text-only summary (no branding, no PDF export)
- Paid tier: branded PDF, shareable links, access tracking, weekly digest
- Counselor tier: all report types, branding, practice analytics

## Acceptance Criteria

- **Given** a counselor generates a Family Meeting Report, **when** they export it, **then** it includes student data, recommendations with source citations, counselor annotations, and practice branding.
- **Given** a student shares a report via link, **when** the recipient opens it, **then** they see a read-only view with all visible data and cannot edit anything.
- **Given** a parent subscribes to the weekly digest, **when** the digest is sent, **then** it includes application progress, upcoming deadlines, and pending documents.
- **Given** a counselor shares a report via link, **when** the family views it, **then** the counselor receives a notification with the viewer's identity and view timestamp.
- **Given** a free-tier user attempts to export a branded PDF, **when** they click export, **then** they see a prompt to upgrade with a clear explanation of what they would get.

## Does Not Own

- Source truth rules for data included in reports
- PDF rendering engine implementation
- Email delivery infrastructure
- Payment processing or subscription management
