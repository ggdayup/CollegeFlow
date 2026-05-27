# PRD-401: Student, Parent, and Counselor Workspace

Status: Draft

## Depends On

- User segments and roles
- Application planning workspace
- Decision Profile
- Data trust principles

## Purpose

Support collaboration among students, parents, and counselors within a shared decision workspace while preserving role-appropriate visibility, decision accountability, and channel safety.

## Problem

The college decision process involves three distinct stakeholders with different needs, perspectives, and power dynamics. Research shows:

- **Family tension**: Parents want to support but often cross into controlling. Students want independence but need guidance. *"Don't make college admissions the currency of your relationship with your child!"*
- **Communication overload**: *"Drowning in hundreds of emails from students and parents every week."* No centralized communication channel.
- **Information asymmetry**: Parents care about ROI and cost; students care about campus vibe and social life. They speak different languages about the same decision.
- **Channel safety**: Counselors must not feel disintermediated by the platform. *"The platform should strengthen the channel's service relationship rather than replace it."*

## Product Principles

- **角色边界清晰 (Clear Role Boundaries)**: Each role sees and does different things. Students own decisions; parents advise; counselors guide. No role should feel excluded or overridden.
- **共享事实基础 (Shared Factual Ground)**: All roles see the same data-backed information (school stats, salary data, admissions rates). Opinions and annotations are role-specific.
- **沟通降噪 (Communication Noise Reduction)**: Replace email/WhatsApp chaos with structured, contextual communication within the workspace.
- **顾问不替代 (Counselor Non-Displacement)**: The workspace must strengthen, not replace, the counselor's relationship with families.

## Core User Stories

- **As a student**, I can share my decision progress with my parents without them taking over the process.
- **As a parent**, I can see my child's progress and cost information without editing or controlling their choices.
- **As a counselor**, I can manage multiple families in one workspace, add professional annotations, and maintain my advisory relationship.
- **As a counselor**, I can see when a student and parent disagree and facilitate a data-backed conversation.
- **As any user**, I receive communication in-context (tied to a specific school, application, or decision point) rather than in a chaotic email inbox.

## Requirements

### 1. Workspace Invitation & Onboarding (工作区邀请与加入)

**Invitation Flow**
- Counselor invites student via email or shareable link
- Student accepts invitation → creates account (or logs in) → enters workspace
- Student can optionally invite parent → parent creates account or joins as view-only guest
- Each user's role is set at invitation time and cannot be self-changed

**Role-Based Landing**
- Student lands on their personal Decision Workspace
- Parent lands on a "Family Overview" dashboard showing their child's progress
- Counselor lands on the multi-student CRM dashboard

### 2. Shared Decision Surface (共享决策界面)

**What All Roles See**
- Decision Options (school + program combinations) the student is exploring
- Comparison data (salary, admissions, cost, AI-resistance) with source citations
- Decision Readiness score and progress
- Application deadlines and task status

**What Only the Student Sees/Can Do**
- Edit Decision Profile weights and preferences
- Add/remove Decision Options from their shortlist
- Mark applications as submitted
- Private journal notes (optional reflection space)

**What Only the Parent Sees/Can Do**
- Cost overview and financial aid summary
- ROI comparison across Decision Options
- "Concerns & Questions" section to submit questions for counselor review
- Cannot edit any student data or Decision Profile

**What Only the Counselor Sees/Can Do**
- Private notes and annotations per student
- Professional recommendation field (visible to student and parent if shared)
- Bulk communication to multiple students/families
- Revenue share dashboard

### 3. In-Workspace Communication (工作区内沟通)

**Contextual Comments**
- Any user can add a comment to a specific Decision Option, comparison, or application task
- Comments are visible to all roles (unless marked private by counselor)
- Comment threads are organized by topic, not by timestamp

**Structured Questions**
- Parents can submit structured questions: "What is the total cost difference between Option A and Option B?"
- Counselor receives the question and can respond with data-backed answers
- Student sees the question and answer

**Notification Rules**
- Student: notified when counselor adds a recommendation or updates a task
- Parent: notified weekly with progress digest, and immediately when counselor shares a report
- Counselor: notified when student marks a task complete, when parent submits a question

### 4. Family Conversation Facilitation (家庭对话辅助)

**Decision Conversation Guide**
- When student and parent disagree on a Decision Option (e.g., student ranks UGA high, parent ranks it low), the system surfaces the disagreement and suggests a structured conversation:
  - "Student prioritizes: campus culture, social environment"
  - "Parent prioritizes: cost, employment rate"
  - "Here's how both factors compare across your options"

**Shared Summary Before Family Meetings**
- One-page summary combining student preferences, parent concerns, and counselor recommendations
- Available as PDF for in-person or video family meetings

## Acceptance Criteria

- **Given** a counselor invites a student, **when** the student accepts, **then** they enter a workspace with their role set to Student and can immediately begin exploring.
- **Given** a student invites a parent, **when** the parent joins, **then** they see the Family Overview dashboard with view-only access and cannot edit student data.
- **Given** a counselor adds a private note, **when** the student or parent views the workspace, **then** they cannot see the note unless the counselor explicitly shared it.
- **Given** a student and parent disagree on a Decision Option ranking, **when** they view the comparison, **then** the system surfaces the disagreement with a structured conversation guide showing both perspectives.
- **Given** a parent submits a structured question, **when** the counselor responds, **then** both the student and parent can see the answer.

## Does Not Own

- Source truth rules for decision data
- Payment or billing infrastructure
- Email delivery infrastructure
- Database schema or API contracts
