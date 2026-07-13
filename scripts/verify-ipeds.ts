import dotenv from 'dotenv';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

dotenv.config();
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('=== IPEDS Data Completeness After Ingestion ===\n');

  const candidates = await prisma.institutionCandidate.findMany({
    include: { university: { select: { nameEn: true } } }
  });

  const metricsByUni: any[] = await prisma.$queryRaw`
    SELECT 
      u."nameEn",
      ic."unitId",
      (SELECT COUNT(*) FROM "InstitutionMetric" im WHERE im."universityId" = u."id") as metric_count,
      (SELECT COUNT(DISTINCT im."sourceTable") FROM "InstitutionMetric" im WHERE im."universityId" = u."id") as table_count,
      (SELECT COUNT(*) FROM "InstitutionProgramField" ipf WHERE ipf."universityId" = u."id") as program_count
    FROM "University" u
    JOIN "InstitutionCandidate" ic ON ic."universityId" = u."id"
    ORDER BY metric_count DESC, program_count DESC
  `;

  console.log('Per-university data completeness:');
  for (const row of metricsByUni) {
    console.log(`  ${row.nameEn} (${row.unitId}):`);
    console.log(`    metrics: ${row.metric_count} | tables: ${row.table_count} | programs: ${row.program_count}`);
  }

  // Metrics by source table
  const metricsByTable: any[] = await prisma.$queryRaw`
    SELECT "sourceTable", COUNT(*) as cnt, COUNT(DISTINCT "universityId") as uni_count
    FROM "InstitutionMetric"
    GROUP BY "sourceTable"
    ORDER BY cnt DESC
  `;
  console.log('\nMetrics by source table:');
  for (const row of metricsByTable) {
    console.log(`  ${row.sourceTable}: ${row.cnt} metrics, ${row.uni_count} universities`);
  }

  // Programs by degree level
  const programsByDegree: any[] = await prisma.$queryRaw`
    SELECT "degreeLevel", COUNT(*) as cnt, COUNT(DISTINCT "universityId") as uni_count
    FROM "InstitutionProgramField"
    GROUP BY "degreeLevel"
    ORDER BY cnt DESC
  `;
  console.log('\nPrograms by degree level:');
  for (const row of programsByDegree) {
    console.log(`  ${row.degreeLevel}: ${row.cnt} records, ${row.uni_count} universities`);
  }

  // Check which 8 universities have hd2024 data
  const hdMetrics: any[] = await prisma.$queryRaw`
    SELECT u."nameEn", ic."unitId", COUNT(*) as cnt
    FROM "InstitutionMetric" im
    JOIN "University" u ON u."id" = im."universityId"
    JOIN "InstitutionCandidate" ic ON ic."universityId" = u."id"
    WHERE im."sourceTable" = 'hd2024'
    GROUP BY u."nameEn", ic."unitId"
  `;
  console.log('\nUniversities with hd2024 data:');
  for (const row of hdMetrics) {
    console.log(`  ${row.nameEn} (${row.unitId}): ${row.cnt} metrics`);
  }

  // Show the 42 universities missing hd2024 data
  const allNames = metricsByUni.map(r => r.nameEn);
  const hdNames = hdMetrics.map(r => r.nameEn);
  const missingHd = allNames.filter(n => !hdNames.includes(n));
  console.log(`\nUniversities MISSING hd2024 data (${missingHd.length}):`);
  for (const name of missingHd) {
    console.log(`  - ${name}`);
  }
}

main().then(() => { prisma.$disconnect(); pool.end(); }).catch(console.error);
