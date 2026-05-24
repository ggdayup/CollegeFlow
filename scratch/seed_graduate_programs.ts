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

interface GraduateProgramSpec {
  customName: string;
  customCode: string;
  standardMajorId: string;
  degreeLevel: 'MASTER' | 'DOCTORATE';
}

interface GraduateSchoolSpec {
  id: string;
  code: string;
  nameEn: string;
  nameZh: string;
  programs: GraduateProgramSpec[];
}

async function main() {
  console.log('🌱 Starting Graduate and Doctoral Programs Seeding Pipeline...\n');

  // Query all standard majors and check valid IDs
  const allMajors = await prisma.major.findMany({ select: { id: true, nameEn: true } });
  const validMajorIds = new Set(allMajors.map(m => m.id));
  console.log(`🔍 Loaded ${validMajorIds.size} valid standard majors from database.`);

  // Let's define standard major mapping lookups safely
  // We know:
  // - '138': Computer Science
  // - '140': Mathematics
  // - '79': Economics (计量经济学)
  // - '152': Physics
  // - '102': Chemical Engineering
  // - '101': Bioengineering
  // - '104': Electrical Engineering
  // - '4': Finance / Business
  // - '83': Public Policy / Law
  // - '63': History
  const csId = validMajorIds.has('138') ? '138' : Array.from(validMajorIds)[0];
  const mathId = validMajorIds.has('140') ? '140' : Array.from(validMajorIds)[0];
  const econId = validMajorIds.has('79') ? '79' : Array.from(validMajorIds)[0];
  const physicsId = validMajorIds.has('152') ? '152' : Array.from(validMajorIds)[0];
  const chemEngId = validMajorIds.has('102') ? '102' : Array.from(validMajorIds)[0];
  const bioEngId = validMajorIds.has('101') ? '101' : Array.from(validMajorIds)[0];
  const eeId = validMajorIds.has('104') ? '104' : Array.from(validMajorIds)[0];
  const bizId = validMajorIds.has('4') ? '4' : Array.from(validMajorIds)[0];
  const lawId = validMajorIds.has('83') ? '83' : Array.from(validMajorIds)[0];
  const histId = validMajorIds.has('63') ? '63' : Array.from(validMajorIds)[0];

  // 1. Premium Elite Universities Graduate Schools Specs
  const premiumSchoolsSpecs: Record<string, GraduateSchoolSpec[]> = {
    harvard: [
      {
        id: 'harvard-hbs',
        code: 'HBS',
        nameEn: 'Harvard Business School',
        nameZh: '哈佛商学院',
        programs: [
          { customName: 'Master of Business Administration (MBA)', customCode: 'HBS-MBA', standardMajorId: bizId, degreeLevel: 'MASTER' },
          { customName: 'Doctor of Business Administration (DBA) in Finance', customCode: 'HBS-DBA-FIN', standardMajorId: bizId, degreeLevel: 'DOCTORATE' },
          { customName: 'PhD in Business Economics', customCode: 'HBS-PHD-BE', standardMajorId: econId, degreeLevel: 'DOCTORATE' }
        ]
      },
      {
        id: 'harvard-hls',
        code: 'HLS',
        nameEn: 'Harvard Law School',
        nameZh: '哈佛法学院',
        programs: [
          { customName: 'Master of Laws (LLM)', customCode: 'HLS-LLM', standardMajorId: lawId, degreeLevel: 'MASTER' },
          { customName: 'Juris Doctor (JD)', customCode: 'HLS-JD', standardMajorId: lawId, degreeLevel: 'DOCTORATE' },
          { customName: 'Doctor of Juridical Science (SJD)', customCode: 'HLS-SJD', standardMajorId: lawId, degreeLevel: 'DOCTORATE' }
        ]
      },
      {
        id: 'harvard-hms',
        code: 'HMS',
        nameEn: 'Harvard Medical School',
        nameZh: '哈佛医学院',
        programs: [
          { customName: 'Doctor of Medicine (MD)', customCode: 'HMS-MD', standardMajorId: bioEngId, degreeLevel: 'DOCTORATE' },
          { customName: 'Master of Medical Sciences in Immunology', customCode: 'HMS-MMS-IMM', standardMajorId: bioEngId, degreeLevel: 'MASTER' }
        ]
      },
      {
        id: 'harvard-gsas',
        code: 'GSAS',
        nameEn: 'Harvard Graduate School of Arts and Sciences',
        nameZh: '哈佛文理研究生院',
        programs: [
          { customName: 'PhD in Computer Science', customCode: 'GSAS-PHD-CS', standardMajorId: csId, degreeLevel: 'DOCTORATE' },
          { customName: 'PhD in Physics', customCode: 'GSAS-PHD-PHYS', standardMajorId: physicsId, degreeLevel: 'DOCTORATE' },
          { customName: 'PhD in Applied Mathematics', customCode: 'GSAS-PHD-AM', standardMajorId: mathId, degreeLevel: 'DOCTORATE' },
          { customName: 'PhD in Chemistry and Chemical Biology', customCode: 'GSAS-PHD-CHEM', standardMajorId: chemEngId, degreeLevel: 'DOCTORATE' },
          { customName: 'PhD in History', customCode: 'GSAS-PHD-HIST', standardMajorId: histId, degreeLevel: 'DOCTORATE' },
          { customName: 'Master of Arts in Regional Studies', customCode: 'GSAS-MA-RS', standardMajorId: histId, degreeLevel: 'MASTER' }
        ]
      },
      {
        id: 'harvard-hks',
        code: 'HKS',
        nameEn: 'Harvard Kennedy School',
        nameZh: '哈佛肯尼迪政府学院',
        programs: [
          { customName: 'Master in Public Policy (MPP)', customCode: 'HKS-MPP', standardMajorId: lawId, degreeLevel: 'MASTER' },
          { customName: 'PhD in Public Policy', customCode: 'HKS-PHD-PP', standardMajorId: lawId, degreeLevel: 'DOCTORATE' }
        ]
      }
    ],
    stanford: [
      {
        id: 'stanford-gsb',
        code: 'GSB',
        nameEn: 'Stanford Graduate School of Business',
        nameZh: '斯坦福商学研究生院',
        programs: [
          { customName: 'Master of Business Administration (MBA)', customCode: 'GSB-MBA', standardMajorId: bizId, degreeLevel: 'MASTER' },
          { customName: 'PhD in Finance', customCode: 'GSB-PHD-FIN', standardMajorId: bizId, degreeLevel: 'DOCTORATE' }
        ]
      },
      {
        id: 'stanford-law',
        code: 'SLS',
        nameEn: 'Stanford Law School',
        nameZh: '斯坦福法学院',
        programs: [
          { customName: 'Juris Doctor (JD)', customCode: 'SLS-JD', standardMajorId: lawId, degreeLevel: 'DOCTORATE' },
          { customName: 'Master of Laws (LLM)', customCode: 'SLS-LLM', standardMajorId: lawId, degreeLevel: 'MASTER' }
        ]
      }
    ],
    mit: [
      {
        id: 'mit-sloan',
        code: 'Sloan',
        nameEn: 'MIT Sloan School of Management',
        nameZh: '麻省理工斯隆管理学院',
        programs: [
          { customName: 'Master of Business Administration (MBA)', customCode: 'SLOAN-MBA', standardMajorId: bizId, degreeLevel: 'MASTER' },
          { customName: 'Master of Finance (MFin)', customCode: 'SLOAN-MFIN', standardMajorId: bizId, degreeLevel: 'MASTER' },
          { customName: 'PhD in Management (Operations Research)', customCode: 'SLOAN-PHD', standardMajorId: mathId, degreeLevel: 'DOCTORATE' }
        ]
      }
    ]
  };

  // 2. Query all universities to separate premium and generic
  const allUnis = await prisma.university.findMany({ select: { id: true, nameEn: true } });
  console.log(`🏛️ Found ${allUnis.length} universities in database.`);

  const premiumUniIds = new Set(Object.keys(premiumSchoolsSpecs));

  // Schools list to batch create
  const schoolsToInsert: any[] = [];
  // Associations list to batch create
  const associationsToInsert: any[] = [];

  console.log('🧬 Formulating graduate schools and programs for all universities...');

  for (const uni of allUnis) {
    if (premiumUniIds.has(uni.id)) {
      // 1. Process Premium School configuration
      const specs = premiumSchoolsSpecs[uni.id];
      for (const spec of specs) {
        schoolsToInsert.push({
          id: spec.id,
          nameEn: spec.nameEn,
          nameZh: spec.nameZh,
          universityId: uni.id
        });

        for (const prog of spec.programs) {
          associationsToInsert.push({
            universityId: uni.id,
            schoolId: spec.id,
            customName: prog.customName,
            customCode: prog.customCode,
            standardMajorId: prog.standardMajorId,
            degreeLevel: prog.degreeLevel,
            mappingScore: 1.0,
            isValidated: true
          });
        }
      }
    } else {
      // 2. Process Generic Schools configuration for other universities
      const gsasId = `${uni.id}-gsas`;
      const gsbId = `${uni.id}-gsb`;

      schoolsToInsert.push({
        id: gsasId,
        nameEn: 'Graduate School of Arts and Sciences',
        nameZh: '硕士/博士文理研究生院',
        universityId: uni.id
      });

      schoolsToInsert.push({
        id: gsbId,
        nameEn: 'Graduate School of Business',
        nameZh: '硕士/博士商学院',
        universityId: uni.id
      });

      // Seeding standard Master's and PhD programs
      associationsToInsert.push(
        {
          universityId: uni.id,
          schoolId: gsbId,
          customName: 'Master of Business Administration (MBA)',
          customCode: `MBA-${uni.id.substring(0, 3).toUpperCase()}`,
          standardMajorId: bizId,
          degreeLevel: 'MASTER',
          mappingScore: 1.0,
          isValidated: true
        },
        {
          universityId: uni.id,
          schoolId: gsasId,
          customName: 'Master of Science in Computer Science',
          customCode: `MSCS-${uni.id.substring(0, 3).toUpperCase()}`,
          standardMajorId: csId,
          degreeLevel: 'MASTER',
          mappingScore: 1.0,
          isValidated: true
        },
        {
          universityId: uni.id,
          schoolId: gsasId,
          customName: 'PhD in Computer Science',
          customCode: `PHDCS-${uni.id.substring(0, 3).toUpperCase()}`,
          standardMajorId: csId,
          degreeLevel: 'DOCTORATE',
          mappingScore: 1.0,
          isValidated: true
        },
        {
          universityId: uni.id,
          schoolId: gsasId,
          customName: 'PhD in Physics',
          customCode: `PHDPHYS-${uni.id.substring(0, 3).toUpperCase()}`,
          standardMajorId: physicsId,
          degreeLevel: 'DOCTORATE',
          mappingScore: 1.0,
          isValidated: true
        }
      );
    }
  }

  // 3. Batch Create Schools
  console.log(`\n🏫 Inserting ${schoolsToInsert.length} Graduate/Professional Schools into database...`);
  const SCHOOL_BATCH = 500;
  for (let i = 0; i < schoolsToInsert.length; i += SCHOOL_BATCH) {
    const batch = schoolsToInsert.slice(i, i + SCHOOL_BATCH);
    await prisma.school.createMany({
      data: batch,
      skipDuplicates: true
    });
    console.log(`   └─ ✅ Inserted school batch ${Math.floor(i / SCHOOL_BATCH) + 1}/${Math.ceil(schoolsToInsert.length / SCHOOL_BATCH)} (${batch.length} rows)`);
  }

  // 4. Batch Create Associations (Graduate Programs)
  console.log(`\n🎓 Inserting ${associationsToInsert.length} Master's & Doctoral programs into database...`);
  const ASSOC_BATCH = 1000;
  for (let i = 0; i < associationsToInsert.length; i += ASSOC_BATCH) {
    const batch = associationsToInsert.slice(i, i + ASSOC_BATCH);
    await prisma.universityMajorAssociation.createMany({
      data: batch,
      skipDuplicates: true
    });
    console.log(`   └─ ✅ Inserted program batch ${Math.floor(i / ASSOC_BATCH) + 1}/${Math.ceil(associationsToInsert.length / ASSOC_BATCH)} (${batch.length} rows)`);
  }

  console.log('\n🎉 Graduate and Doctoral Programs seeding process completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding graduate programs:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
