import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🚀 Creating mock uningested university...");
  
  const uni = await prisma.university.upsert({
    where: { nameEn: "Gallaudet University" },
    update: {},
    create: {
      id: "gallaudet",
      nameEn: "Gallaudet University",
      nameZh: "加劳德特大学",
      nameZht: "加勞德特大學",
      countryEn: "United States",
      countryZh: "美国",
      rankingUsNews: 124,
      rankingQs: 999,
      wikidataId: "Q1417505",
      scorecardUnitId: "131450",
      averageCost: 18500,
      gradRate: 0.45,
      medianSalary: 42000
    }
  });

  console.log("✓ Successfully created mock uningested university:", uni);
}

main()
  .catch(err => console.error(err))
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
