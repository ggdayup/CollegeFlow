# PRD-130: University Program Catalogs

Status: Draft

## Data Asset Contract

- Source Authority: Official university catalogs, schools, departments, or program pages.
- Product Value: Connects institution-level discovery to actual academic options available to students.
- User-visible Fields: To be defined by verified program source.
- Verification Requirement: Program claims must retain official source, institution, program name, and review date.
- Freshness Requirement: To be defined by catalog cycle.
- Versioning Rule: Catalog-year differences should remain distinguishable when material to student decisions.
- Known Limitations: Universities may use inconsistent naming, school structures, and degree levels.
- Downstream Consumers: Program discovery, major matching, fit engine, application planning, reports.

## Decision Questions

This data asset helps answer:

- What is the official program, major, school, college, department, or pathway?
- What would the student actually study?
- Which program or major direction should be compared under a Decision Option?
- Is the program's academic structure compatible with the student's interests, preparation, and goals?

## P0 Role

University program catalog data is the academic anchor for School / Program Comparison.

It prevents the product from comparing schools only at the institution level when the user's decision is really about a school/program combination.

## Product Rules

- Preserve official program names even when mapping them to standard majors or CIP-aligned categories.
- Program availability, school/department ownership, degree level, and catalog year should be clear where they affect decisions.
- Program claims should not be generalized from one university to another.
- When a program cannot be confidently mapped, it should be shown as uncertain rather than forced into a standard category.
- Catalog data should support comparison and fit, but should not imply admission availability or completion guarantee.

## Downstream Consumers

- School / Program Comparison
- Program discovery
- Major matching
- Fit engine
- Application planning
- Reports
