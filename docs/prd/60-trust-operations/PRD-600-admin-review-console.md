# PRD-600: Admin Review Console

Status: Draft

## Depends On

- Data source governance
- Data lineage, verification, and freshness
- Data gap and warning system
- Privacy, compliance, and audit

## Purpose

Define product requirements for operators to review data quality, source freshness, user trust issues, and commercial or collaboration exceptions — so CollegeFlow can maintain its data trust promise at scale.

## Problem

CollegeFlow's core differentiator is data authenticity. As the platform grows, operators need a centralized console to monitor data quality, respond to user demand votes, flag stale or conflicting data, and manage ingestion backlogs. Without this, the platform's trust guarantee degrades silently.

## Product Principles

- **Data Integrity First**: The console prioritizes data quality issues by severity and user impact.
- **Actionable Alerts**: Every alert should recommend a specific action (re-verify, re-ingest, flag as stale, etc.).
- **User Voice Integration**: Demand votes from users are visible and actionable in the console.
- **Audit Trail**: All operator actions are logged with timestamps, reasons, and outcomes.

## Requirements

### 1. Data Quality Dashboard (数据质量仪表板)

**Overview Metrics**:
- Total entities tracked (schools, programs, majors)
- Data freshness distribution: % refreshed within cycle, % 1-2 cycles old, % 3+ cycles old
- Conflict count: number of data points with source disagreements
- Missing data count: number of expected data fields with no source
- User demand votes: total votes, top-voted entities, threshold-reached alerts

**Alert Queue**:
- Prioritized list of data quality issues requiring attention
- Each alert includes: entity name, data field, issue type, severity, source context, recommended action
- Filters: by severity, by entity type, by issue type, by assigned operator

### 2. Demand Vote Management (用户需求投票管理)

**Vote Dashboard**:
- List of entities with user demand votes, sorted by vote count
- Each entry shows: entity name, requested data type, vote count, vote threshold status
- When vote threshold is reached, the entry is highlighted as "Ready for ingestion"

**Vote Threshold Configuration**:
- Operators can set thresholds per entity type (e.g., 50 votes for a school, 100 votes for a program)
- Thresholds can be adjusted based on ingestion capacity

**Notification Integration**:
- When an operator marks a demand vote as "in progress," voters are notified
- When data becomes available, voters are notified

### 3. Source Management (数据源管理)

**Source Registry**:
- List of all data sources (CDS, IPEDS, College Scorecard, US News, QS, THE, Niche, etc.)
- Each source shows: last refresh date, refresh cycle, coverage statistics, known issues
- Operators can trigger a manual refresh for any source

**Source Health**:
- Per-source health metrics: freshness, completeness, conflict rate
- Sources with declining health are flagged for review

### 4. User Trust Issue Review (用户信任问题审查)

**Issue Queue**:
- Users can flag data they believe is incorrect or outdated
- Each flag includes: entity name, data field, user's concern, source citation (if provided)
- Operators review each flag and respond: confirmed, rejected, or needs investigation

**Resolution Workflow**:
- Confirmed: data is flagged, source is re-verified, warning is displayed to users
- Rejected: user is notified with explanation
- Needs investigation: assigned to operator for deeper review

### 5. Audit Log (审计日志)

**All Operator Actions**:
- Data source refreshes, manual overrides, ingestion triggers
- User trust issue resolutions
- Demand vote threshold adjustments
- Warning configuration changes

**Log Format**:
- Timestamp, operator name, action type, entity affected, before/after values, reason

### 6. Commercial & Collaboration Exception Review

**Revenue Share Disputes**:
- Review and resolve disputes from counselors or institutions about attribution or revenue share calculations
- Log resolution decisions for audit

**Workspace Exceptions**:
- Review unusual workspace activity (e.g., mass student deletions, permission conflicts)
- Resolve role boundary issues between students, parents, and counselors

## Role and Permissions

- **Operator**: Full access to all console features
- **Data Analyst**: Read-only access to dashboards, can create demand vote entries and flag issues
- **Admin**: Full access plus configuration of thresholds, refresh cycles, and escalation rules

## Does Not Own

- Data ingestion pipeline implementation
- Source crawling or parsing logic
- Revenue share calculation engine
- Database schema or API contracts
