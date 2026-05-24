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

// Structured demands model
interface Demands {
  math: 'H' | 'M' | 'L';
  physics: 'H' | 'M' | 'L';
  chemistry: 'H' | 'M' | 'L';
  biology: 'H' | 'M' | 'L';
  humanities: 'H' | 'M' | 'L';
}

// Map BroadField to baseline demands to establish programmatic scientific roots
function getBaselineDemands(broadFieldId: string): Demands {
  const bId = broadFieldId.toLowerCase();
  
  if (bId.includes('engineering')) {
    return { math: 'H', physics: 'H', chemistry: 'M', biology: 'L', humanities: 'L' };
  }
  if (bId.includes('computers') || bId.includes('mathematics') || bId.includes('math')) {
    return { math: 'H', physics: 'M', chemistry: 'L', biology: 'L', humanities: 'L' };
  }
  if (bId.includes('physical') || bId.includes('science')) {
    return { math: 'H', physics: 'H', chemistry: 'H', biology: 'M', humanities: 'L' };
  }
  if (bId.includes('biology') || bId.includes('life')) {
    return { math: 'M', physics: 'M', chemistry: 'H', biology: 'H', humanities: 'L' };
  }
  if (bId.includes('business')) {
    return { math: 'M', physics: 'L', chemistry: 'L', biology: 'L', humanities: 'M' };
  }
  if (bId.includes('humanities') || bId.includes('arts') || bId.includes('liberal') || bId.includes('language')) {
    return { math: 'L', physics: 'L', chemistry: 'L', biology: 'L', humanities: 'H' };
  }
  if (bId.includes('social') || bId.includes('psychology')) {
    return { math: 'M', physics: 'L', chemistry: 'L', biology: 'M', humanities: 'H' };
  }
  if (bId.includes('health') || bId.includes('medical') || bId.includes('nursing')) {
    return { math: 'M', physics: 'L', chemistry: 'H', biology: 'H', humanities: 'M' };
  }
  
  // Default fallback demands
  return { math: 'M', physics: 'M', chemistry: 'M', biology: 'L', humanities: 'M' };
}

// Refine demands using NLP Keyword Heuristics for extreme precision
function refineDemands(name: string, base: Demands): Demands {
  const n = name.toLowerCase();
  const refined = { ...base };

  // 1. Math refinements
  if (n.includes('statistics') || n.includes('actuarial') || n.includes('mathematics') || n.includes('data science') || n.includes('quantitative')) {
    refined.math = 'H';
  }
  if (n.includes('history') || n.includes('literature') || n.includes('art') || n.includes('drama') || n.includes('english') || n.includes('philosophy') || n.includes('theology')) {
    refined.math = 'L';
  }

  // 2. Physics refinements
  if (n.includes('physics') || n.includes('astronomy') || n.includes('mechanical') || n.includes('aerospace') || n.includes('civil engineering')) {
    refined.physics = 'H';
  }
  if (n.includes('business') || n.includes('marketing') || n.includes('accounting') || n.includes('history') || n.includes('language')) {
    refined.physics = 'L';
  }

  // 3. Chemistry refinements
  if (n.includes('chemical') || n.includes('chemistry') || n.includes('biochemistry') || n.includes('materials science') || n.includes('metallurgical')) {
    refined.chemistry = 'H';
  }
  if (n.includes('computer') || n.includes('software') || n.includes('mathematics') || n.includes('economics') || n.includes('history')) {
    refined.chemistry = 'L';
  }

  // 4. Biology refinements
  if (n.includes('biology') || n.includes('biological') || n.includes('biomedical') || n.includes('botany') || n.includes('zoology') || n.includes('genetics') || n.includes('microbiology') || n.includes('physiology') || n.includes('neuroscience') || n.includes('biochemical') || n.includes('agriculture') || n.includes('plant science') || n.includes('ecology') || n.includes('environmental science')) {
    refined.biology = 'H';
  }
  if (n.includes('mechanical') || n.includes('electrical') || n.includes('computer science') || n.includes('software') || n.includes('finance') || n.includes('accounting') || n.includes('history') || n.includes('literature')) {
    refined.biology = 'L';
  }

  // 5. Humanities refinements
  if (n.includes('history') || n.includes('philosophy') || n.includes('literature') || n.includes('political') || n.includes('english') || n.includes('international relations') || n.includes('sociology') || n.includes('linguistics')) {
    refined.humanities = 'H';
  }
  if (n.includes('mechanical engineering') || n.includes('electrical engineering') || n.includes('computer science') || n.includes('chemistry') || n.includes('physics')) {
    refined.humanities = 'L';
  }

  return refined;
}

async function main() {
  console.log('🏁 Starting Standard Majors Academic Demands Enrichment Engine...\n');

  // 1. Load standard majors
  console.log('🔍 Loading all standard majors from database...');
  const majors = await prisma.major.findMany({
    include: { broadField: true }
  });
  console.log(`- Loaded ${majors.length} majors to process.\n`);

  // 2. Process and update each major row
  console.log('🧬 Evaluating academic demands (Math, Physics, Chemistry, Humanities)...');
  let updatedCount = 0;

  for (const major of majors) {
    const base = getBaselineDemands(major.broadFieldId);
    const refined = refineDemands(major.nameEn, base);
    
    console.log(`   * Major: "${major.nameEn}" [BroadField: ${major.broadField.nameEn}]`);
    console.log(`     └─ Demands: Math [${refined.math}] | Physics [${refined.physics}] | Chemistry [${refined.chemistry}] | Biology [${refined.biology}] | Humanities [${refined.humanities}]`);

    // Update standard major row
    await prisma.major.update({
      where: { id: major.id },
      data: {
        mathDemand: refined.math,
        physicsDemand: refined.physics,
        chemistryDemand: refined.chemistry,
        biologyDemand: refined.biology,
        humanitiesDemand: refined.humanities
      }
    });

    updatedCount++;
  }

  console.log(`\n🎉 Success! Academic demands successfully enriched for ${updatedCount}/${majors.length} standard majors in database.`);
}

main()
  .catch((e) => {
    console.error('❌ Error executing demands enrichment:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
