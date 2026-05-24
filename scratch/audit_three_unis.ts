import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const targetUnis = ['rice', 'dartmouth', 'nus'];
  
  console.log('🛡️  Academic Major Source URL Audit for 3 Selected Universities 🛡️');
  
  for (const uniId of targetUnis) {
    const uni = await prisma.university.findUnique({
      where: { id: uniId },
      include: {
        schools: {
          include: {
            customMajors: true
          }
        }
      }
    });
    
    if (!uni) {
      console.error(`❌ University ${uniId} not found in the database.`);
      continue;
    }
    
    console.log(`\n================================================================================`);
    console.log(`🏛️  University: ${uni.nameEn} (${uni.nameZh || 'N/A'})`);
    console.log(`🏆 QS Rank: #${uni.rankingQs} | US News Rank: #${uni.rankingUsNews}`);
    
    let totalMajors = 0;
    const auditSample: any[] = [];
    
    for (const school of uni.schools) {
      console.log(`🏫 School: ${school.nameEn} (${school.nameZh || 'N/A'})`);
      for (const cm of school.customMajors) {
        totalMajors++;
        auditSample.push({
          customName: cm.customName,
          customCode: cm.customCode,
          sourceUrl: cm.sourceUrl
        });
      }
    }
    
    console.log(`📊 Total Seeded Majors: ${totalMajors}`);
    console.log(`📝 Audit Sample (First 5 majors):`);
    console.table(auditSample.slice(0, 5));
  }
}

main()
  .catch((e) => {
    console.error('❌ Error during audit:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
