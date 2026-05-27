# PRD-400: Counselor CRM

Status: Draft

## Depends On

- User segments and roles
- Decision Profile
- Application planning workspace
- Reports and deliverables
- Entitlement model
- Channel partner and revenue share (PRD-504)

## Purpose

Help counselors manage student decision workflows, identify urgent actions, package evidence-backed recommendations, and scale their practice without burning out — replacing the spreadsheet chaos that currently dominates counselor workflows.

## Problem

Counselors manage 20-50+ students (or 300-500 in school settings), each with 10-15 college applications. Their entire workflow lives in spreadsheets, email, WhatsApp, and fragmented tools. Customer research confirms:

- *"I was drowning in spreadsheets before [platform]. Now I can see the status of all 350+ applications across 35 students in one glance. The tracker saved me at least 15 hours per week."*
- *"Most kids I worked with had their work live in fifteen different places — three Google Docs, a Notion page, a WhatsApp thread, their mum's calendar, the inside of their head."*
- *"Burnout — 80% of public school counselors have experienced in the past 4 years."*
- *"I spend more time fighting the system than actually connecting with students."*

## Product Principles

- **Channel Safety**: The CRM must strengthen the counselor's relationship with families, not replace it. Counselors should feel the platform protects their client relationship.
- **Replace the Spreadsheet Stack**: The CRM should import and replace existing Google Sheets/Excel workflows, not add another tool on top.
- **Automated Guardianship**: Never let a deadline slip. Automated alerts, status tracking, and attention flags.
- **Data-Backed Credibility**: Counselors should be able to recommend schools and programs with data citations, not gut feeling.

## Core User Stories

- **As a counselor**, I can see all my students' application status, upcoming deadlines, and attention flags in one dashboard.
- **As a counselor**, I can import my existing Google Sheets tracker without starting from scratch.
- **As a counselor**, I can add private notes and annotations to each student's profile that are not visible to the student or parent unless I choose to share.
- **As a counselor**, I can generate a family meeting report with data-backed school recommendations and my professional annotations.
- **As a counselor**, I can send deadline reminders to multiple students at once.
- **As a counselor**, I earn revenue share when families convert to paid workspace through my referral.

## Requirements

### 1. Counselor Dashboard (顾问仪表板)

**Multi-Student Overview**
- At-a-glance view of all students with:
  - Application progress bar per student
  - Upcoming deadlines (next 7/14/30 days)
  - Attention flags: students who haven't updated progress in 2+ weeks, students with missed tasks, students awaiting counselor review
- Quick filters: "Students with deadlines this week", "Students falling behind", "Students on track"
- Quick stats: total students, total applications, submission rate, acceptance count

**Student Detail View (学生详情)**
- Complete student profile: academic data, Decision Profile, school shortlist, application status
- Activity history: all status changes, document uploads, counselor notes with timestamps
- Counselor annotation panel: private notes tagged by type (Essay feedback, Interview prep, Financial aid, Strategy)
- Communication log: all messages sent to student and parent

### 2. Spreadsheet Migration (电子表格迁移)

- Import Google Sheets / Excel / CSV with auto-column mapping
- Preview mapping before import, allow manual override
- Preserve custom columns as custom fields
- Import validation report: "X rows imported, Y skipped (reasons listed)"
- Import history: track source file, date, and column mapping

### 3. Communication Tools (沟通工具)

**Bulk Deadline Reminders**
- Select multiple students → send customized deadline reminder
- Template system: "Your [School] application is due in [X] days. You still need: [missing items]"
- Channel: email + in-app notification
- Delivery confirmation: see who opened, who didn't

**Parent Updates**
- Generate weekly progress summary for parents
- Customizable content: what to include (progress, deadlines, counselor notes)
- Send via email or shareable link

### 4. Report Generation (报告生成)

**Family Meeting Report**
- One-page summary combining:
  - Student's Decision Profile and weights
  - Top recommended schools/programs with data citations
  - Comparison summary (Passion vs. Money, Heart vs. Brain)
  - Cost overview (total COA, expected aid, projected debt)
  - Counselor's professional annotations and recommendations
- Available as PDF or shareable link
- Branded with counselor's practice name/logo

**Outcome Analytics (for counselor marketing)**
- Track acceptance rates by school and year
- Track student outcomes (persistence, graduation — where available)
- Generate "practice results" page for marketing and client acquisition

### 5. Revenue Share Integration (收入分成集成)

- Dashboard showing: total families invited, conversion rate, revenue earned
- Per-student revenue tracking: which families converted, when, and how much
- Payout history and upcoming payments
- Referral link generation for counselor marketing

### 6. Team Collaboration (团队协作)

- Multi-counselor practices: assign students to specific counselors
- Shared student records with counselor-specific visibility
- Practice-wide dashboard for leadership: total caseload, acceptance rates, revenue
- Role-based permissions within the practice (admin, counselor, assistant)

## Acceptance Criteria

- **Given** a counselor has 30+ students, **when** they open the dashboard, **then** they can see all students' application status, upcoming deadlines, and attention flags in under 3 seconds of load time.
- **Given** a counselor imports a Google Sheets tracker, **when** they review the import preview, **then** they can see column mappings, fix mismatches, and confirm before data is committed.
- **Given** a counselor adds a private note to a student, **when** the student views their profile, **then** they cannot see the note unless the counselor has explicitly shared it.
- **Given** a counselor generates a family meeting report, **when** they download the PDF, **then** it includes student data, recommendations with source citations, counselor annotations, and practice branding.
- **Given** a counselor's referred family converts to paid, **when** they check the revenue dashboard, **then** they see the conversion, the revenue amount, and the expected payout date.

## Does Not Own

- Source truth rules for school, program, or outcome data
- Application submission to colleges (Common App integration is a separate PRD)
- Payment processing or billing infrastructure
- Database schema or API contracts
