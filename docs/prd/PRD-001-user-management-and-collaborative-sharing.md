# PRD-001: User Management & Collaborative Sharing Platform

## 1. Executive Summary

This Product Requirements Document (PRD) outlines the specifications for the **User Management & Collaborative Sharing Platform** within the College Major ROI & Careers Selection Engine. The system facilitates role-based educational and financial pathways for students, parents, teachers, and counselors, while establishing a robust B2B2C subscription and shareability model.

---

## 2. Target Audience & Roles

The system supports four distinct user roles, each with specialized product needs and a customized workspace:

### 2.1 Student (🎓)
*   **Persona**: High school or college student evaluating target fields, major requirements, and future income potential.
*   **Workspace Requirements**:
    *   **Holland RIASEC Assessment**: Interactive questionnaire measuring Realistic, Investigative, Artistic, Social, Enterprising, and Conventional traits. Matches outcomes to the platform's 152 standard majors.
    *   **Academic Target Alignment**: Input fields for GPA, standardized scores, or international curriculum records to compare against university admissions bounds.
    *   **Bookmark Management**: Ability to favorite target majors and universities.

### 2.2 Parent (🏠)
*   **Persona**: Primary financial decision-maker concerned with tuition affordability, funding options, and long-term ROI.
*   **Workspace Requirements**:
    *   **Net Cost Calculator**: Financial panel that subtracts Expected Family Contribution (EFC) and financial aid estimates from institutional list pricing to forecast true out-of-pocket costs.
    *   **Affordability Bento**: A unified visualization juxtaposing projected student debt against early-career and prime-age median salaries.

### 2.3 Counselor / Educational Consultant (🗺️)
*   **Persona**: Private counselor or high school advisor managing portfolios of multiple student applications.
*   **Workspace Requirements**:
    *   **Student Portfolio Board**: Grid view of all connected student workspaces.
    *   **Admissions & Guidance Notebook**: Ability to leave qualitative feedback directly on a student's bookmarked universities and majors.
    *   **Custom Report Export**: Generate comprehensive multi-dimensional school/major selection reports in PDF/JSON formats.

### 2.4 Teacher (🍎)
*   **Persona**: Academic instructor mapping current coursework to advanced college requirements.
*   **Workspace Requirements**:
    *   **Course-to-Major Prerequisite Mapper**: Tool for linking local curriculum subjects to collegiate requirements in the interactive prerequisites tree.

---

## 3. Functional Requirements

### 3.1 SaaS Entitlement and Access Gating
To drive conversion from free to premium tiers, access to core data assets is gated based on the user's billing status.

| Functional Area | Free Tier | Pro Tier (Student/Parent) | Counselor Pro Tier |
| :--- | :--- | :--- | :--- |
| **Search Capabilities** | Restricted to **Top 10 highest-paying majors** & **Top 10 ranked universities**. Non-top items are masked/blocked. | **Full Search access** to all 152 majors and global university records. | **Full Search access** to all majors and global university records. |
| **Bookmarks Capacity** | Up to 8 items (`maxBookmarksCount: 8`). | Unlimited bookmarks. | Unlimited bookmarks. |
| **Bento Comparisons** | Side-by-side comparison of **up to 2** universities. | Matrix comparison of **up to 5** universities. | Matrix comparison of **up to 5** universities. |
| **Student Connections** | Capped at **3** associated students. | N/A | **Unlimited student connections**. |
| **Data Export Tools** | N/A | N/A | Full PDF/JSON export capability with built-in PII anonymization. |

### 3.2 Tri-Party Collaborative Shared Boards
*   **Sponsor Gating Penetration**: Paid `COUNSELOR_PRO` users can invite `FREE` students to collaborative shared boards. Inside that shared workspace, the counselor's premium credentials penetrate to the student, allowing the student to see blocked majors/universities on that board only, with a sponsor notice: *"Sponsored by Advisor [Name] (PRO Preview Enabled)"*.
*   **Unified Interface Merging**: When viewing a shared university card on a collaborative board, users see role-specific tabs:
    *   *Student Tab*: Subject interest ratings and checkbox checklists.
    *   *Counselor Tab*: Custom feedback, risk analysis, and target admissions windows.
    *   *Parent Tab*: Net cost budget metrics, expected student debt estimations.
*   **Caching & Synchronization**: Utilizes local optimistic updates (via React Query/SWR) to ensure fast inputs without relying on live WebSocket sockets.

---

## 4. Privacy, Security & Administrative Auditing

### 4.1 Secure invitation Handshake
*   Advisors cannot unilaterally associate student records.
*   Inviting a student requires generating a signed token that expires in 48 hours.
*   The student must explicitly click "Accept & Share Workspace" inside their dashboard. The student can revoke the connection at any time.

### 4.2 PII Scrubbing
*   When a Counselor exports JSON or PDF reports for internal school stats or sharing, they can toggle *"Anonymize Personally Identifiable Information"*.
*   This automatically strips out real student names, precise GPAs, and family budgets, replacing them with anonymous identifiers (e.g., *"Student A"*).

### 4.3 Database Audit Trails
*   Every manual administrative write action (verifying ranking data, modifying CIP mapping results, manually validating custom major tags) must record a tamper-evident audit record in the `AdminAuditLog` table containing operating user, action details, and full before/after JSON diffs.

---

## 5. Next Steps & Milestones

1.  **Phase 1: DB Schema Migration** - Enhance the PostgreSQL schema via Prisma migrations to support `BoardCollaboration` and `AdminAuditLog` models.
2.  **Phase 2: Entitlement Integration** - Connect BFF endpoints to parse the `useEntitlements()` boundaries (specifically limiting searches to Top 10 rows for FREE accounts).
3.  **Phase 3: Advisor Handshake & Sharing** - Build the invitation handshake flow and Counselor-sponsored boards.
4.  **Phase 4: Collaborative UI & Exporters** - Implement the tri-party UI layout, optimistic syncing, and PII-scrubbed exports.
