---
name: university-major-seeding
description: Complete, update, and seed authentic undergraduate major lists for top universities in universitiesData.ts and sync them into PostgreSQL database using Prisma. Use when the user requests completing university majors, seeding new programs, or resolving missing school departments.
---

# University Major Seeding Skill

This skill provides step-by-step processes to comprehensively expand and synchronize authentic university majors (concentrations/programs) in the database with **100% data authenticity and zero hallucinations**.

## Quick Start

### 1. Structure of Major Association in `src/data/universitiesData.ts`
Each school under a university has a flat list of `majors` conforming to `MajorLink` type:
```typescript
{
  id: 'harv-hist',                    // Unique id within the university
  nameEn: 'History',                  // English official name
  nameZh: '历史学',                   // Chinese official name
  nationalMajorId: '63'               // Mapped standard major ID (1-152) from majorsData.ts
}
```

### 2. Synchronization Pipeline
Always run the following commands sequentially after editing data:
```bash
# 1. Type validation
npm run lint

# 2. Synchronize database tables
npx prisma db seed
```

---

## Workflows

### Phase 1: Sourcing (来源可靠)
1. Do NOT guess or fabricate majors. Locate the target university's official undergraduate catalog (e.g. **Yale Bluebook**, **Harvard OUE Fields of Concentration**, **MIT Course Catalog**).
2. Gather the exact list of official majors/concentrations currently offered.
3. Record a unique verification audit ID for the task (e.g. `YALE-OUE-2026-UG-ALL`).

### Phase 2: Standard Major Mapping (通用标准对齐)
1. Map each official local major to the closest general category from the 152 standard majors defined in `src/data/majorsData.ts`.
2. Do not create new standard national majors unless explicitly authorized. Map with high fidelity (e.g. map "Government" to `85` Political science and government, "Course 6-3" to `138` Computer science).

### Phase 3: File Injection (数据注入)
1. Open `src/data/universitiesData.ts` and locate the university's record by `id`.
2. Locate the corresponding undergraduate school (e.g. `yale-college`) and expand its `majors` array.
3. Keep entries ordered consistently. Use the exact types, ensuring both English and Chinese translations are present.

### Phase 4: Database Sync & Validation (类型与物理双向同步)
1. Run `npm run lint` (`tsc --noEmit`) to verify that the TypeScript compiler passes without errors.
2. Run `npx prisma db seed` to clean up old database states and synchronize these new associations into PostgreSQL tables via `prisma/seed.ts`.
3. If seeding fails, ensure that `nationalMajorId` exists in `majorsData.ts` and that no duplicate keys are used in `universitiesData.ts`.
