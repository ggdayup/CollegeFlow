import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🔍 Direct DB Query: Fetching UniversityMajorAssociation custom majors with sourceUrl...');
  
  const associations = await prisma.universityMajorAssociation.findMany({
    take: 10,
    select: {
      id: true,
      customName: true,
      customCode: true,
      universityId: true,
      sourceUrl: true
    }
  });
  
  console.table(associations);
}

main()
  .catch((e) => {
    console.error('❌ Error querying database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
