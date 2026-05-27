# PRD-304: Application Planning Workspace

Status: Draft

## Depends On

- Decision Profile
- Admissions competitiveness
- Program comparison
- Data gap and warning system
- Collaboration PRDs (PRD-400, PRD-401, PRD-402)

## Purpose

Help users organize their school/program shortlist, track application progress, monitor readiness gaps, and collaborate with counselors and parents — replacing the spreadsheet chaos that currently dominates this workflow.

## Problem

The application planning process is the most fragmented part of the college decision journey. Students and counselors currently manage applications across 15+ disconnected tools: Google Sheets, Notion, email, WhatsApp, calendar apps, and "the inside of their head." Customer research confirms:

- **Counselors**: *"I was drowning in spreadsheets. Now I can see the status of all 350+ applications across 35 students in one glance. The tracker saved me at least 15 hours per week."*
- **Students**: *"Most kids I worked with had their work live in fifteen different places — three Google Docs, a Notion page, a WhatsApp thread, their mum's calendar, the inside of their head."*
- **Scale**: Managing 30+ students with 10-15 colleges each = 300-750 applications. One missed deadline can derail a student's entire strategy.
- **Burnout**: 80% of public school counselors have experienced burnout in the past 4 years, largely driven by administrative burden.

## Product Principles

- **替代而非叠加 (Replace, Don't Add)**: The workspace should replace the spreadsheet stack, not add another tool on top of it. Migration from existing spreadsheets must be seamless.
- **自动化守护 (Automated Guardianship)**: Automated deadline alerts, missing document reminders, and progress tracking. Never let a deadline slip.
- **角色协同 (Role-Based Collaboration)**: Students, parents, and counselors see and do different things in the same workspace, with clear permission boundaries.
- **数据驱动进展 (Data-Driven Progress)**: Progress is not just "submitted" or "not submitted." It includes decision readiness scoring, document completion, and financial aid tracking.

## Core User Stories

- **As a student**, I can see all my target schools, their deadlines, my progress on each application, and what I still need to do — without checking 5 different tools.
- **As a parent**, I can see my child's application progress without constantly asking "Where are you in the process?"
- **As a counselor**, I can see the status of all my students' applications in one dashboard, identify who needs attention, and never miss a deadline.
- **As a counselor**, I can import my existing Google Sheets data into the workspace without starting from scratch.

## Requirements

### 1. Application Dashboard (申请仪表盘)

**Student View (学生视图)**
- List of target schools with status indicators (Researching, In Progress, Submitted, Accepted, Declined)
- Upcoming deadlines with countdown timers
- Task checklist per school (essay, transcript, recommendation, test scores, supplemental materials)
- Progress bar per school showing percentage complete
- "What's due this week" section with priority ordering

**Counselor Dashboard (顾问仪表板)**
- Multi-student overview showing all students' application status at a glance
- Filter by: students with deadlines in next 7 days, students falling behind, students on track
- Quick stats: "X students with upcoming deadlines, Y applications submitted, Z acceptances received"
- Attention flags: students who haven't updated their progress in 2+ weeks
- Bulk actions: send deadline reminders to multiple students, export progress reports

### 2. Deadline & Task Management (截止日期与任务管理)

- Automated deadline alerts (2 weeks out, 3 days out, day of) via email and in-app notification
- Task dependencies: "Transcript must be submitted before application can be submitted"
- Custom task creation for counselor-specific requirements
- Student can mark tasks complete; counselor receives update
- Activity history: full audit trail of status changes with timestamps

### 3. Spreadsheet Migration (电子表格迁移)

- Import existing Google Sheets / Excel / CSV data
- Auto-map columns to workspace fields (school name, deadline, status, notes)
- Preview and confirm mapping before import
- Preserve custom columns as custom fields
- Import history: track when data was imported and from which source

### 4. Counselor Notes & Annotations (顾问批注)

- Counselor can add private notes per student per application
- Notes can be tagged: "Essay feedback," "Interview prep," "Financial aid question"
- Notes are searchable and filterable by tag
- Students cannot see counselor notes unless explicitly shared
- Notes appear alongside data-backed information but are clearly distinguished from source-backed facts

### 5. Parent Visibility (家长可见性)

- Parent view shows application progress without sensitive counselor notes
- Weekly email digest: "Your child has X applications in progress, Y deadlines this week"
- Parent can see which documents are complete, which are pending, and which are overdue
- Parent cannot edit application data (prevents accidental changes)

### 6. Post-Submission Tracking (提交后跟踪)

- Track acceptance/decline/waitlist outcomes per school
- Record scholarship offers and financial aid awards
- Track final decision (which school the student will attend)
- Alumni outcome tracking (for counselors): college persistence, graduation rate

## Acceptance Criteria

- **Given** a counselor has an existing Google Sheets tracker, **when** they import it into the workspace, **then** their school names, deadlines, and statuses are auto-mapped and visible in the dashboard.
- **Given** a student has upcoming deadlines, **when** a deadline is within 2 weeks, **then** they receive an in-app notification and email reminder.
- **Given** a counselor views their dashboard, **when** they look at the overview, **then** they can see all students' application status, upcoming deadlines, and attention flags in one view.
- **Given** a parent views their child's workspace, **when** they see the progress view, **then** they can see application status, upcoming deadlines, and pending documents without seeing counselor notes.
- **Given** a student marks a task complete, **when** they update the status, **then** the counselor receives an update and the activity history records the change with a timestamp.

## Does Not Own

- Source truth rules for application requirements or deadlines
- Email notification delivery infrastructure
- Spreadsheet import parsing algorithm
- Database schema or API contracts
