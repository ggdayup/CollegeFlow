import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🔍 Listing all universities stored in the database...');
  
  const unis = await prisma.university.findMany({
    select: {
      id: true,
      nameEn: true,
      nameZh: true,
      countryEn: true,
      rankingQs: true,
      rankingUsNews: true
    }
  });
  
  console.log(`Total universities in database: ${unis.length}`);
  console.table(unis);
}

main()
  .catch((e) => {
    console.error('❌ Error listing universities:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
