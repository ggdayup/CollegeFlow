# PRD-132: Curriculum and Prerequisites

Status: Draft

## Data Asset Contract

- Source Authority: Official university curriculum, bulletin, catalog, department, or advising pages.
- Product Value: Helps students understand academic path, preparation demands, prerequisites, and feasibility — so they can evaluate whether they are prepared for and interested in a program's actual coursework.
- User-visible Fields: Program name, required courses, prerequisite courses, credit hours, program structure (core vs. electives), catalog year, source URL.
- Verification Requirement: Requirement claims must retain source, institution, program, catalog year, and review context.
- Freshness Requirement: Annual refresh aligned with academic catalog cycle.
- Versioning Rule: Requirement changes must be year-specific when they affect student planning.
- Known Limitations: Course requirements may be nested, conditional, or advisor-dependent. Some programs have tracks or concentrations with different requirements. Curriculum data may change between catalog years without public announcement.
- Downstream Consumers: Application planning, prerequisite flow, fit engine, reports.

## Problem

Students need to understand what they will actually study in a program — not just the program name or salary outcomes. Research confirms:

- *"How can you proclaim what you're studying when you've never taken a university-level course on the subject?"* — Students have no visibility into actual program content before committing.

## Requirements

### 1. Curriculum Data Model

For each program, the system should capture:

**Core Requirements**
- Required courses (course code, title, credit hours)
- Prerequisite chains (e.g., "CS 101 → CS 201 → CS 301")
- Total credit hours for the major
- GPA requirements for major declaration and continuation

**Elective Requirements**
- Number of elective credits required
- Elective categories or tracks (if applicable)
- Cross-disciplinary options (double major, minor compatibility)

**Program Structure**
- Years to completion (typical)
- Capstone/thesis requirements
- Internship or practicum requirements

### 2. Prerequisite Chain Visualization

- Visual representation of prerequisite dependencies
- Students can see the full path from introductory to advanced courses
- Bottleneck courses (high failure rate, limited seats) should be flagged
- Missing prerequisites should be highlighted: "You need [course] before you can take [advanced course]"

### 3. Preparation Assessment

Based on the student's Decision Profile (academic context):

- Compare student's completed coursework with program prerequisites
- Identify gaps: "This program requires AP Calculus. You have not indicated completion of equivalent coursework."
- Suggest preparation steps: "Consider completing [course] before applying to this program."

### 4. Catalog Year Awareness

- Display the catalog year for all curriculum data
- Flag when requirements have changed between catalog years
- Warn students: "Requirements for [program] changed in catalog year [X]. Verify with the current catalog before applying."

## Data Gap Handling

- When curriculum data is unavailable for a program, the system should not infer requirements.
- Users should see: "Curriculum data is not available for this program. Please verify with the university's official catalog."
- Demand vote integration: Users can request curriculum data for programs without coverage.

## Does Not Own

- Curriculum scraping or parsing implementation
- Course catalog data ingestion
- Database schema or API contracts
