const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 35432,
  user: 'postgres',
  password: 'postgres',
  database: 'college_major',
});

async function main() {
  console.log('=== 统计信息 ===');

  // 总体统计
  const stats = await pool.query('SELECT COUNT(*) as total, COUNT(DISTINCT "unitId") as uniq_institutions, COUNT(DISTINCT "cipCode") as uniq_cips FROM "InstitutionProgramField"');
  console.log('Total:', stats.rows[0].total);
  console.log('Unique institutions:', stats.rows[0].uniq_institutions);
  console.log('Unique CIP codes:', stats.rows[0].uniq_cips);

  // DegreeLevel 分布
  console.log('\nDegree Level 分布：');
  const dl = await pool.query('SELECT "degreeLevel", COUNT(*) as cnt FROM "InstitutionProgramField" GROUP BY "degreeLevel" ORDER BY cnt DESC');
  for (const row of dl.rows) console.log('  ' + row.degreeLevel + ': ' + row.cnt);

  // sourceType 分布
  console.log('\nSource Type 分布：');
  const st = await pool.query('SELECT "sourceType", COUNT(*) as cnt FROM "InstitutionProgramField" GROUP BY "sourceType" ORDER BY cnt DESC');
  for (const row of st.rows) console.log('  ' + row.sourceType + ': ' + row.cnt);

  // 随机 30 个 displayTitle 样本
  console.log('\n=== 随机 30 个 displayTitle ===');
  const titles = await pool.query('SELECT DISTINCT "displayTitle" FROM "InstitutionProgramField" ORDER BY "displayTitle" LIMIT 30');
  for (const t of titles.rows) console.log('  ' + t.displayTitle);

  // 按 completionTotal 分布
  console.log('\n=== completionTotal 分布：');
  const ct = await pool.query('SELECT COUNT(*) as cnt FROM "InstitutionProgramField" WHERE "completionsTotal" IS NOT NULL');
  console.log('  有 completionsTotal 的记录数:', ct.rows[0].cnt);

  // 几所知名大学的项目
  console.log('\n=== 知名大学项目 ===');
  const univs = [
    'Princeton University',
    'Harvard University',
    'Stanford University',
    'Massachusetts Institute of Technology',
    'University of California-Berkeley',
  ];

  for (const u of univs) {
    // 找 candidate 里的这个名字
    const cand = await pool.query('SELECT "unitId" FROM "InstitutionCandidate" WHERE "nameEn" = $1', [u]);
    if (cand.rows.length === 0) {
      console.log('\n' + u + ' -> InstitutionCandidate 中未找到');
      continue;
    }
    const unitId = cand.rows[0].unitId;
    console.log('\n' + u + ' (unitId: ' + unitId + ')');
    const pf = await pool.query('SELECT ipf."displayTitle", ipf."degreeLevel", ipf."cipCode", ipf."completionsTotal", cip."title" as "cipTitle" FROM "InstitutionProgramField" ipf LEFT JOIN "CipCode" cip ON cip."code" = ipf."cipCode" WHERE ipf."unitId" = $1 ORDER BY ipf."completionsTotal" DESC NULLS LAST LIMIT 10', [unitId]);
    for (const r of pf.rows) {
      console.log('  ' + r.displayTitle + ' [' + r.degreeLevel + ']  CIP:' + r.cipCode + '  completions:' + (r.completionsTotal !== null ? r.completionsTotal : 'N/A'));
    }
  }

  await pool.end();
}

main().catch(console.error);
