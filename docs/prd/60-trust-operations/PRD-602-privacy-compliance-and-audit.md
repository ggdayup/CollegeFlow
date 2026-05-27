# PRD-602: Privacy, Compliance, and Audit

Status: Draft

## Depends On

- User segments and roles
- Student, parent, and counselor workspace
- Sponsored access
- Reports and shareable deliverables
- Counselor CRM

## Purpose

Define product requirements for protecting user data, preserving auditability, and enforcing trust boundaries across collaboration and commercial workflows — so users can trust CollegeFlow with their sensitive decision-making data.

## Problem

The college decision process involves deeply personal information: financial status, academic records, family dynamics, counselor notes, and decision preferences. If users cannot trust the platform to protect this data, they will not engage honestly.

## Product Rules

- User privacy expectations must be clear in collaborative contexts.
- Sensitive user decisions and access changes should be auditable.
- Reports and share links should avoid unnecessary personal data exposure.

## Requirements

### 1. Data Boundaries

**Role-Based Data Visibility**:
- Students see their own Decision Profile, preferences, and workspace data
- Parents see shared workspace data but not counselor private notes
- Counselors see all data for their students, but private notes are only visible to the counselor unless explicitly shared
- Institutions see aggregate data but not individual student Decision Profiles without consent

**Counselor Note Privacy**:
- Counselor notes are tagged with visibility settings: private, shared-with-student, shared-with-parent
- Students and parents are notified when a counselor shares a note with them
- Counselors can see which notes have been shared and with whom

### 2. Audit Trail

**All Sensitive Actions Are Logged**:
- Role changes (student invites parent, counselor attaches to student)
- Data access (counselor views student profile, parent views workspace)
- Data sharing (counselor shares note, student shares report)
- Payment and sponsorship changes (student upgrades, sponsor pays)
- Data exports (counselor generates report, data downloaded)

**Audit Log Format**:
- Timestamp, actor (user ID and role), action type, target entity, outcome
- Logs are immutable and retained for [X] years
- Logs are accessible to operators for dispute resolution

### 3. Report Privacy

**Data Minimization in Reports**:
- Reports include only data necessary for the report's purpose
- Personal identifiers are included only when the report is intended for external sharing
- Financial data in reports is limited to totals and ratios, not detailed breakdowns
- Counselor private notes are never included in reports unless explicitly added by the counselor

**Share Link Controls**:
- Share links have configurable expiration dates (default: 30 days)
- Share links can be password-protected
- Share links can be revoked at any time
- Viewers of share links are tracked (who viewed, when, for how long)

### 4. Compliance Requirements

**Data Protection**:
- All user data is encrypted at rest and in transit
- Users can request deletion of their data (subject to audit log retention)
- Users can export their data in a portable format

**Age Restrictions**:
- Users under 18 require parental consent for data processing (COPPA compliance)
- Age is collected during onboarding
- Age-appropriate data handling is enforced

**Counselor-Student Relationship Protection**:
- The platform must not disintermediate counselors from their students
- When a counselor-student relationship ends, the student retains their data
- The counselor retains aggregate outcome data (anonymized) for marketing purposes

### 5. Sponsored Access Privacy

- Sponsors (counselors, institutions) can see workspace progress but not private student data
- Students are informed of what sponsors can and cannot see
- Students can opt out of sponsored access without losing their data
- Institutions receive aggregate usage metrics (not individual student data)

## Does Not Own

- Encryption implementation or key management
- COPPA compliance legal review
- Database schema or API contracts
