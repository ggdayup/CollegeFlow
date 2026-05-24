import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🔍 Querying Rice University Majors and their Standard Mappings...');

  const majors = await prisma.universityMajorAssociation.findMany({
    where: { universityId: 'rice' },
    include: {
      school: true,
      standardMajor: true,
    },
    orderBy: [
      { schoolId: 'asc' },
      { customName: 'asc' }
    ]
  });

  console.log(`Found ${majors.length} majors in the database for Rice University.\n`);

  let currentSchoolId = '';
  majors.forEach((m) => {
    const schoolName = m.school ? m.school.nameEn : 'No School';
    if (m.schoolId !== currentSchoolId) {
      console.log(`\n🏫 School: ${schoolName} (${m.schoolId})`);
      currentSchoolId = m.schoolId || '';
    }
    
    const mappingInfo = m.standardMajor 
      ? `✅ Mapped to: "${m.standardMajor.nameEn}" (Score: ${m.mappingScore.toFixed(4)})`
      : `❌ Unmapped (<0.85 Gated) (Best Score: ${m.mappingScore > 0 ? m.mappingScore.toFixed(4) : 'N/A'})`;
      
    console.log(`  - Major: "${m.customName}" [Code: ${m.customCode}]`);
    console.log(`    └─ ${mappingInfo}`);
    console.log(`    └─ Source URL: ${m.sourceUrl}`);
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
