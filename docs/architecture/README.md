# Architecture Documentation

CollegeFlow architecture docs explain how the system works, how modules are organized, and how to work with the codebase.

## Documents

| # | Document | Purpose |
|---|----------|---------|
| 01 | [System Overview](01-system-overview.md) | C4 architecture map — what the system is |
| 02 | [Module Architecture](02-module-architecture.md) | Code organization and extraction plan |
| 03 | [Data Architecture](03-data-architecture.md) | Data model domains, role vs userType resolved |
| 04 | [Auth & Security](04-auth-security-architecture.md) | Auth flow, session lifecycle, entitlement gaps |
| 05 | [API Contracts](05-api-contracts.md) | Route reference, error formats, proxy contract |
| 06 | [Deployment](06-deployment.md) | Dev setup, env vars, production checklist |
| 07 | [Developer Guide](07-developer-guide.md) | Onboarding, adding features, common pitfalls |

## Relationship to Other Docs

- **PRDs** (`docs/prd/`) describe *what* the product should do
- **ADRs** (`docs/adr/`) capture *why* decisions were made
- **Architecture docs** (this directory) explain *how* the system is built

Architecture docs reference ADRs; they do not duplicate them.

## Maintenance

When you change:

| Change | Update This Doc |
|--------|----------------|
| Add a new route | [05-api-contracts.md](05-api-contracts.md) |
| Add a new Prisma model | [03-data-architecture.md](03-data-architecture.md) |
| Change auth behavior | [04-auth-security-architecture.md](04-auth-security-architecture.md) |
| Add env var | [06-deployment.md](06-deployment.md) |
| Add a page | [07-developer-guide.md](07-developer-guide.md) |
