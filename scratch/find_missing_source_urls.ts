import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🔍 Checking UniversityMajorAssociation records for missing sourceUrl...');
  
  const missing = await prisma.universityMajorAssociation.findMany({
    where: {
      OR: [
        { sourceUrl: null },
        { sourceUrl: '' }
      ]
    },
    include: {
      university: true,
      school: true
    }
  });
  
  console.log(`Found ${missing.length} records missing sourceUrl.`);
  
  // Group by university
  const grouped: Record<string, any[]> = {};
  for (const m of missing) {
    const uniName = m.university.nameEn;
    if (!grouped[uniName]) {
      grouped[uniName] = [];
    }
    grouped[uniName].push({
      id: m.id,
      customName: m.customName,
      customCode: m.customCode,
      schoolName: m.school?.nameEn || 'N/A'
    });
  }
  
  for (const [uni, majors] of Object.entries(grouped)) {
    console.log(`\n🏛️  University: ${uni} (${majors.length} majors missing sourceUrl)`);
    console.table(majors.slice(0, 10));
    if (majors.length > 10) {
      console.log(`... and ${majors.length - 10} more`);
    }
  }
}

main()
  .catch((e) => {
    console.error('❌ Error checking database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
