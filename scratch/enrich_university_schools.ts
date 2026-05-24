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

// Helper to determine university academic type
function getUniversityType(name: string): 'TECH' | 'ART' | 'BUSINESS' | 'NURSING' | 'GENERAL' {
  const n = name.toLowerCase();
  if (n.includes('technology') || n.includes('polytechnic') || n.includes('tech') || n.includes('science and technology')) {
    return 'TECH';
  }
  if (/\barts?\b/.test(n) || n.includes('music') || n.includes('design') || n.includes('conservatory') || n.includes('fine arts')) {
    return 'ART';
  }
  if (n.includes('business') || n.includes('finance') || n.includes('economics')) {
    return 'BUSINESS';
  }
  if (n.includes('nursing') || n.includes('health') || n.includes('medical') || n.includes('pharmacy')) {
    return 'NURSING';
  }
  return 'GENERAL';
}

// Major routing classifications
interface RoutingResult {
  schoolId: string;
  schoolNameEn: string;
  schoolNameZh: string;
  schoolCode: string;
}

function getRouteForMajor(
  uniId: string,
  uniType: 'TECH' | 'ART' | 'BUSINESS' | 'NURSING' | 'GENERAL',
  majorId: string,
  majorNameEn: string,
  broadFieldId: string
): RoutingResult {
  const m = majorNameEn.toLowerCase();
  
  // Is it Engineering or Computer Science?
  const isEngineering = m.includes('engineering') || m.includes('computer') || m.includes('software') || m.includes('technology') || broadFieldId === 'engineering';
  
  // Is it Business, Management, or Economics?
  const isBusiness = m.includes('business') || m.includes('management') || m.includes('marketing') || m.includes('finance') || m.includes('accounting') || m.includes('economics') || m.includes('actuarial');
  
  // Is it Health, Clinical, or Nursing?
  const isHealth = m.includes('nursing') || m.includes('health') || m.includes('medical') || m.includes('clinical') || m.includes('pharmacy');

  // Is it Art, Design, or Music?
  const isArt = m.includes('art') || m.includes('music') || m.includes('drama') || m.includes('design') || m.includes('creative');

  // 1. Premium Elite Universities Routing Rules (Fully aligns with hand-seeded configurations)
  if (uniId === 'harvard') {
    if (isEngineering) {
      return { schoolId: 'harvard-seas', schoolNameEn: 'John A. Paulson School of Engineering and Applied Sciences', schoolNameZh: '保尔森工程与应用科学学院', schoolCode: 'SEAS' };
    } else {
      return { schoolId: 'harvard-college', schoolNameEn: 'Harvard College of Arts & Sciences', schoolNameZh: '哈佛文理学院', schoolCode: 'HC' };
    }
  }

  if (uniId === 'mit') {
    if (isEngineering) {
      return { schoolId: 'mit-eng', schoolNameEn: 'MIT School of Engineering', schoolNameZh: '麻省理工工程学院', schoolCode: 'ENG' };
    } else {
      return { schoolId: 'mit-sc', schoolNameEn: 'MIT School of Science', schoolNameZh: '麻省理工理学院', schoolCode: 'SCI' };
    }
  }

  if (uniId === 'stanford') {
    if (isEngineering) {
      return { schoolId: 'stanford-eng', schoolNameEn: 'Stanford School of Engineering', schoolNameZh: '斯坦福工程学院', schoolCode: 'SoE' };
    } else {
      return { schoolId: 'stanford-hss', schoolNameEn: 'School of Humanities and Sciences', schoolNameZh: '人文与科学学院', schoolCode: 'H&S' };
    }
  }

  if (uniId === 'berkeley') {
    if (isEngineering) {
      return { schoolId: 'ucb-eng', schoolNameEn: 'U.C. Berkeley College of Engineering', schoolNameZh: '伯克利工学院', schoolCode: 'CoE' };
    } else {
      return { schoolId: 'ucb-ls', schoolNameEn: 'College of Letters and Science', schoolNameZh: '文理学院', schoolCode: 'L&S' };
    }
  }

  if (uniId === 'princeton') {
    if (isEngineering) {
      return { schoolId: 'princeton-eng', schoolNameEn: 'School of Engineering and Applied Science', schoolNameZh: '工程与应用科学学院', schoolCode: 'SEAS' };
    } else {
      return { schoolId: 'princeton-ab', schoolNameEn: 'Princeton College AB Program', schoolNameZh: '普林斯顿文学士核心学部', schoolCode: 'AB' };
    }
  }

  if (uniId === 'yale') {
    if (isEngineering) {
      return { schoolId: 'yale-eng', schoolNameEn: 'Yale School of Engineering & Applied Science', schoolNameZh: '耶鲁工程与应用科学学院', schoolCode: 'SEAS' };
    } else {
      return { schoolId: 'yale-college', schoolNameEn: 'Yale College (Humanities & Social Sciences)', schoolNameZh: '耶鲁学院 (人文学科与社会科学部)', schoolCode: 'YCP' };
    }
  }

  if (uniId === 'upenn') {
    if (isBusiness) {
      return { schoolId: 'upenn-wharton', schoolNameEn: 'The Wharton School', schoolNameZh: '沃顿商学院', schoolCode: 'Wharton' };
    } else {
      return { schoolId: 'upenn-eng', schoolNameEn: 'Penn Engineering', schoolNameZh: '工程与应用科学学院', schoolCode: 'PennEng' };
    }
  }

  if (uniId === 'caltech') {
    if (isEngineering) {
      return { schoolId: 'caltech-eas', schoolNameEn: 'Division of Engineering and Applied Science', schoolNameZh: '工程与应用科学部', schoolCode: 'EAS' };
    } else {
      return { schoolId: 'caltech-pma', schoolNameEn: 'Division of Physics, Mathematics and Astronomy', schoolNameZh: '物理、数学与天文学部', schoolCode: 'PMA' };
    }
  }

  if (uniId === 'columbia') {
    if (isEngineering) {
      return { schoolId: 'columbia-seas', schoolNameEn: 'Fu Foundation School of Engineering and Applied Science', schoolNameZh: '傅氏基金工程与应用科学学院', schoolCode: 'SEAS' };
    } else {
      return { schoolId: 'columbia-college', schoolNameEn: 'Columbia College of Arts', schoolNameZh: '哥伦比亚学院 (文理核心院)', schoolCode: 'CC' };
    }
  }

  if (uniId === 'chicago') {
    return { schoolId: 'uchicago-college', schoolNameEn: 'The College of the University of Chicago', schoolNameZh: '芝加哥大学本科生院', schoolCode: 'COLL' };
  }

  if (uniId === 'umich') {
    if (isBusiness) {
      return { schoolId: 'ross', schoolNameEn: 'Stephen M. Ross School of Business', schoolNameZh: '罗斯商学院', schoolCode: 'Ross' };
    } else if (isEngineering) {
      return { schoolId: 'coe', schoolNameEn: 'College of Engineering', schoolNameZh: '工学院', schoolCode: 'CoE' };
    } else {
      return { schoolId: 'lsa', schoolNameEn: 'College of Literature, Science, and the Arts', schoolNameZh: '文理学院', schoolCode: 'LSA' };
    }
  }

  // 2. Generic Classification Routing Rules for all other universities
  if (uniType === 'TECH') {
    if (isEngineering) {
      return { schoolId: `${uniId}-eng`, schoolNameEn: 'School of Engineering', schoolNameZh: '工学院', schoolCode: 'ENG' };
    }
    return { schoolId: `${uniId}-sci`, schoolNameEn: 'School of Science', schoolNameZh: '理学院', schoolCode: 'SCI' };
  }

  if (uniType === 'BUSINESS') {
    return { schoolId: `${uniId}-bus`, schoolNameEn: 'School of Business & Economics', schoolNameZh: '商学与金融学院', schoolCode: 'BUS' };
  }

  if (uniType === 'ART') {
    return { schoolId: `${uniId}-art`, schoolNameEn: 'School of Fine Arts & Design', schoolNameZh: '美术与设计学院', schoolCode: 'ART' };
  }

  if (uniType === 'NURSING') {
    if (isHealth) {
      return { schoolId: `${uniId}-health`, schoolNameEn: 'School of Nursing & Health Sciences', schoolNameZh: '护理与健康科学学院', schoolCode: 'HLTH' };
    }
    return { schoolId: `${uniId}-sci`, schoolNameEn: 'School of Science & Biology', schoolNameZh: '科学与生物学部', schoolCode: 'SCI' };
  }

  // GENERAL standard comprehensive university
  if (isEngineering) {
    return { schoolId: `${uniId}-eng`, schoolNameEn: 'School of Engineering & Applied Sciences', schoolNameZh: '工程与应用科学学院', schoolCode: 'SEAS' };
  }
  if (isBusiness) {
    return { schoolId: `${uniId}-bus`, schoolNameEn: 'School of Business Administration', schoolNameZh: '工商管理学院', schoolCode: 'BUS' };
  }
  return { schoolId: `${uniId}-cas`, schoolNameEn: 'College of Liberal Arts & Sciences', schoolNameZh: '文理学院', schoolCode: 'CAS' };
}

/**
 * ⚠️ DEPRECATED & DEACTIVATED - DO NOT RUN
 * Reason: This script heuristically simulates and fabricates university-school-major associations.
 * To enforce strict data authenticity (no imagined majors), all university program and school directories
 * must reside in curated static premium lists (universitiesData.ts) or be crawled directly from real registrar pages.
 */

async function main() {
  throw new Error(
    "⚠️ enrich_university_schools.ts is DEACTIVATED to prevent programmatic school/major fabrication. " +
    "University programs must come from authentic sources only."
  );
  console.log('🏁 Starting Database School-Major Association Enrichment Pipeline...\n');

  // Load all standard majors & universities
  console.log('🔍 Loading standard majors and universities from database...');
  const allMajors = await prisma.major.findMany({ select: { id: true, nameEn: true, nameZh: true, broadFieldId: true } });
  const allUnis = await prisma.university.findMany({ select: { id: true, nameEn: true, nameZh: true } });
  const majorsMap = new Map(allMajors.map(m => [m.id, m]));
  console.log(`   ✓ Loaded ${allMajors.length} majors, ${allUnis.length} universities.`);

  // Load existing schools to prevent duplicates
  const existingSchools = await prisma.school.findMany();
  const existingSchoolIds = new Set(existingSchools.map(s => s.id));
  console.log(`   ✓ Found ${existingSchoolIds.size} existing schools in the database.\n`);

  // Map to collect schools to create
  const schoolsToCreate = new Map<string, { id: string; nameEn: string; nameZh: string; universityId: string }>();

  // Map to store school routing for quick lookup during association update
  const associationUpdates: { id: string; schoolId: string }[] = [];

  console.log('🧬 Analyzing all university-major associations and planning school routing...');
  
  // Find all associations in database
  const associations = await prisma.universityMajorAssociation.findMany({
    select: { id: true, universityId: true, standardMajorId: true, schoolId: true }
  });

  console.log(`   ✓ Found ${associations.length} university-major associations.`);

  // Group associations by university for routing
  const associationsByUni = new Map<string, typeof associations>();
  for (const assoc of associations) {
    if (!associationsByUni.has(assoc.universityId)) {
      associationsByUni.set(assoc.universityId, []);
    }
    associationsByUni.get(assoc.universityId)!.push(assoc);
  }

  for (const uni of allUnis) {
    const uniType = getUniversityType(uni.nameEn);
    const uniAssocs = associationsByUni.get(uni.id) || [];
    
    for (const assoc of uniAssocs) {
      // If association already has a valid schoolId, preserve it (e.g. hand-seeded elite ones)
      if (assoc.schoolId && existingSchoolIds.has(assoc.schoolId)) {
        continue;
      }

      const major = majorsMap.get(assoc.standardMajorId);
      if (!major) continue;

      const routing = getRouteForMajor(uni.id, uniType, major.id, major.nameEn, major.broadFieldId);
      
      // Register school for creation if it doesn't exist
      if (!existingSchoolIds.has(routing.schoolId) && !schoolsToCreate.has(routing.schoolId)) {
        schoolsToCreate.set(routing.schoolId, {
          id: routing.schoolId,
          nameEn: routing.schoolNameEn,
          nameZh: routing.schoolNameZh,
          universityId: uni.id
        });
      }

      associationUpdates.push({
        id: assoc.id,
        schoolId: routing.schoolId
      });
    }
  }

  // 1. Create Schools in Batches
  if (schoolsToCreate.size > 0) {
    const schoolsList = Array.from(schoolsToCreate.values());
    console.log(`\n🏫 Seeding ${schoolsList.length} standard collegiate Schools/Colleges into database...`);
    const BATCH_SIZE = 500;
    for (let i = 0; i < schoolsList.length; i += BATCH_SIZE) {
      const batch = schoolsList.slice(i, i + BATCH_SIZE);
      await prisma.school.createMany({
        data: batch,
        skipDuplicates: true
      });
      console.log(`   └─ ✅ Created school batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(schoolsList.length / BATCH_SIZE)} (${batch.length} rows)`);
    }
  } else {
    console.log('\n🏫 All required schools are already present in the database.');
  }

  // 2. Perform Association schoolId Updates in Optimized Transaction Batches
  if (associationUpdates.size > 0 || associationUpdates.length > 0) {
    console.log(`\n📥 Commencing optimized update of ${associationUpdates.length} associations with their correct school mappings...`);
    
    // To execute extremely fast, we will chunk updates.
    // Since Prisma update cannot batch-update multiple entities with different values in a single query natively,
    // we will run custom UPDATE SQL queries in parallel batches or group them by (universityId, standardMajorId) -> schoolId!
    // Grouping updates by schoolId is extremely clean and fast!
    const updatesBySchool = new Map<string, string[]>();
    for (const update of associationUpdates) {
      if (!updatesBySchool.has(update.schoolId)) {
        updatesBySchool.set(update.schoolId, []);
      }
      updatesBySchool.get(update.schoolId)!.push(update.id);
    }

    console.log(`   ✓ Grouped updates into ${updatesBySchool.size} distinct school destination cohorts.`);
    
    let updatedCount = 0;
    const schoolIds = Array.from(updatesBySchool.keys());
    for (let i = 0; i < schoolIds.length; i++) {
      const schoolId = schoolIds[i];
      const ids = updatesBySchool.get(schoolId)!;
      
      // Update in chunks of 5000 IDs to avoid statement parameter length limits in PostgreSQL
      const CHUNK_SIZE = 5000;
      for (let j = 0; j < ids.length; j += CHUNK_SIZE) {
        const chunk = ids.slice(j, j + CHUNK_SIZE);
        await prisma.universityMajorAssociation.updateMany({
          where: {
            id: { in: chunk }
          },
          data: {
            schoolId: schoolId
          }
        });
        updatedCount += chunk.length;
      }
      
      if ((i + 1) % 50 === 0 || i === schoolIds.length - 1) {
        console.log(`   └─ 💾 Progress: Mapped ${updatedCount}/${associationUpdates.length} associations.`);
      }
    }
  }

  console.log('\n🎉 Database school and major mapping enrichment complete successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error executing schools enrichment script:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
