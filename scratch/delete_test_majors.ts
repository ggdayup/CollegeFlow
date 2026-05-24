import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🧹 Cleaning up leaked test majors from the failed matcher test run...');
  
  const result = await prisma.universityMajorAssociation.deleteMany({
    where: {
      customCode: {
        startsWith: 'TEST_'
      }
    }
  });
  
  console.log(`✅ Successfully deleted ${result.count} test major records.`);
}

main()
  .catch((e) => {
    console.error('❌ Error during cleanup:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
