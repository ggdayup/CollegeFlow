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
  console.log('🔍 Database Verification: Counting major listings for Rice, Dartmouth, and NUS...');
  
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
      console.log(`❌ University ${uniId} not found in database.`);
      continue;
    }
    
    let totalMajors = 0;
    uni.schools.forEach(s => {
      totalMajors += s.customMajors.length;
    });
    
    console.log(`🏛️  ${uni.nameEn} (${uni.nameZh})`);
    console.log(`   └─ Total Academic Schools: ${uni.schools.length}`);
    console.log(`   └─ Total Mapped Custom Majors in Database: ${totalMajors}`);
    uni.schools.forEach(s => {
      console.log(`      ├─ [School: ${s.nameEn}] holds ${s.customMajors.length} majors`);
    });
  }
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
