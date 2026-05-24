import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();
const localEnvPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: localEnvPath });

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const universities = await prisma.university.findMany({
    select: { id: true, nameEn: true, nameZh: true, scorecardUnitId: true, wikidataId: true },
    orderBy: { nameEn: 'asc' }
  });

  console.log(`🏫 Total universities in database: ${universities.length}`);
  universities.forEach((u, i) => {
    console.log(`[${i+1}] ID: ${u.id} | Name: ${u.nameEn} (${u.nameZh}) | IPEDS: ${u.scorecardUnitId || 'N/A'} | Wikidata: ${u.wikidataId || 'N/A'}`);
  });
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
