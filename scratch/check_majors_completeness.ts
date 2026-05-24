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
  console.log('📊 ====== COLLEGE MAJORS DATABASE INTEGRITY AUDIT ====== 📊\n');

  // 1. BroadField Audit
  const broadFieldCount = await prisma.broadField.count();
  const broadFields = await prisma.broadField.findMany();
  const bfMissingZh = broadFields.filter(f => !f.nameZh).length;
  const bfMissingEarnings = broadFields.filter(f => !f.recentMedianEarningsVal || !f.primeMedianEarningsVal).length;

  console.log('📌 [1] BroadFields (大类) 统计:');
  console.log(`- 总数: ${broadFieldCount}`);
  console.log(`- 中文名缺失数: ${bfMissingZh}`);
  console.log(`- 薪资数据缺失数: ${bfMissingEarnings}\n`);

  // 2. DetailedField Audit
  const detailedFieldCount = await prisma.detailedField.count();
  const detailedFields = await prisma.detailedField.findMany();
  const dfMissingZh = detailedFields.filter(f => !f.nameZh).length;

  console.log('📌 [2] DetailedFields (中类) 统计:');
  console.log(`- 总数: ${detailedFieldCount}`);
  console.log(`- 中文名缺失数: ${dfMissingZh}\n`);

  // 3. Major Audit
  const majorCount = await prisma.major.count();
  const majors = await prisma.major.findMany();
  
  const majorMissingZh = majors.filter(m => !m.nameZh).length;
  const majorMathNull = majors.filter(m => m.mathDemand === null).length;
  const majorPhysicsNull = majors.filter(m => m.physicsDemand === null).length;
  const majorChemistryNull = majors.filter(m => m.chemistryDemand === null).length;
  const majorBiologyNull = majors.filter(m => (m as any).biologyDemand === null).length;
  const majorHumanitiesNull = majors.filter(m => m.humanitiesDemand === null).length;
  const majorEarningsNull = majors.filter(m => m.earningsValue === null).length;
  const majorSpecialTagCount = majors.filter(m => m.specialTag !== null).length;

  console.log('📌 [3] Standard Majors (标准专业) 统计:');
  console.log(`- 总数: ${majorCount}`);
  console.log(`- 中文名缺失数: ${majorMissingZh}`);
  console.log(`- 核心学科需求缺失数:`);
  console.log(`  * 数学 (mathDemand) 缺失数: ${majorMathNull} (${((majorMathNull/majorCount)*100).toFixed(1)}%)`);
  console.log(`  * 物理 (physicsDemand) 缺失数: ${majorPhysicsNull} (${((majorPhysicsNull/majorCount)*100).toFixed(1)}%)`);
  console.log(`  * 化学 (chemistryDemand) 缺失数: ${majorChemistryNull} (${((majorChemistryNull/majorCount)*100).toFixed(1)}%)`);
  console.log(`  * 生物 (biologyDemand) 缺失数: ${majorBiologyNull} (${((majorBiologyNull/majorCount)*100).toFixed(1)}%)`);
  console.log(`  * 人文 (humanitiesDemand) 缺失数: ${majorHumanitiesNull} (${((majorHumanitiesNull/majorCount)*100).toFixed(1)}%)`);
  console.log(`- 薪资字段缺失数 (earningsValue): ${majorEarningsNull} (${((majorEarningsNull/majorCount)*100).toFixed(1)}%)`);
  console.log(`- 拥有特殊标签 (specialTag, e.g. highest/lowest) 数量: ${majorSpecialTagCount}\n`);

  // 4. UniversityMajorAssociation (大学与专业映射关系) Audit
  const assocCount = await prisma.universityMajorAssociation.count();
  const validatedCount = await prisma.universityMajorAssociation.count({ where: { isValidated: true } });
  const unvalidatedCount = await prisma.universityMajorAssociation.count({ where: { isValidated: false } });
  
  const avgMappingScoreResult = await prisma.universityMajorAssociation.aggregate({
    _avg: { mappingScore: true }
  });
  const avgMappingScore = avgMappingScoreResult._avg.mappingScore || 0;

  console.log('📌 [4] University-Major Associations (大学专业关联) 统计:');
  console.log(`- 总关联数: ${assocCount}`);
  console.log(`- 已验证 (isValidated=true) 关联数: ${validatedCount} (${((validatedCount/assocCount)*100).toFixed(1)}%)`);
  console.log(`- 未验证 (isValidated=false) 关联数: ${unvalidatedCount} (${((unvalidatedCount/assocCount)*100).toFixed(1)}%)`);
  console.log(`- 平均语义匹配得分 (mappingScore): ${(avgMappingScore * 100).toFixed(1)}%\n`);

  // 5. Gap Analysis (没有关联任何大学的专业)
  const majorsWithAssoc = await prisma.universityMajorAssociation.findMany({
    select: { standardMajorId: true },
    distinct: ['standardMajorId']
  });
  const mappedMajorIds = new Set(majorsWithAssoc.map(a => a.standardMajorId));
  const unmappedMajors = majors.filter(m => !mappedMajorIds.has(m.id));

  console.log('📌 [5] 覆盖度与鸿沟分析 (Gap Analysis):');
  console.log(`- 至少关联了一所大学的标准专业数: ${mappedMajorIds.size} (${((mappedMajorIds.size/majorCount)*100).toFixed(1)}%)`);
  console.log(`- 未被任何大学关联的标准专业数: ${unmappedMajors.length} (${((unmappedMajors.length/majorCount)*100).toFixed(1)}%)`);
  if (unmappedMajors.length > 0) {
    console.log('- 部分未覆盖的标准专业示例 (Top 10):');
    unmappedMajors.slice(0, 10).forEach(m => {
      console.log(`  * [${m.id}] ${m.nameEn} (${m.nameZh})`);
    });
  }
  console.log('\n=======================================================\n');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
