import dotenv from 'dotenv';
dotenv.config();

async function test() {
  console.log('🔍 Comprehensive Inspection of Live BFF API for Rice, Dartmouth, and NUS...');
  try {
    const res = await fetch('http://localhost:38090/api/universities');
    const data: any = await res.json();
    
    const targetUnis = ['rice', 'dartmouth', 'nus'];
    for (const uniId of targetUnis) {
      const uni = data.find((u: any) => u.id === uniId);
      if (!uni) {
        console.error(`❌ University ${uniId} not found in BFF response.`);
        continue;
      }
      
      console.log(`\n================================================================================`);
      console.log(`🏛️  ${uni.nameEn} (${uni.nameZh})`);
      console.log(`   🏆 QS Rank: #${uni.qsRank} | US News Rank: #${uni.usNewsRank}`);
      console.log(`   └─ Mapped Schools in BFF output: ${uni.schools.length}`);
      
      let totalMajors = 0;
      let unmappedCount = 0;
      let missingSourceCount = 0;
      
      uni.schools.forEach((s: any) => {
        totalMajors += s.majors.length;
        s.majors.forEach((m: any) => {
          if (!m.nationalMajorId) unmappedCount++;
          if (!m.sourceUrl) missingSourceCount++;
        });
      });
      
      console.log(`   └─ Total Academic Majors: ${totalMajors}`);
      console.log(`   └─ Coupled to National Major: ${totalMajors - unmappedCount}`);
      console.log(`   └─ Unmapped (Decoupled Safely): ${unmappedCount}`);
      console.log(`   └─ Missing sourceUrl Check: ${missingSourceCount}`);
      
      uni.schools.slice(0, 3).forEach((s: any) => {
        console.log(`      ├─ [${s.code}] ${s.nameEn} (${s.majors.length} majors)`);
        const sample = s.majors.slice(0, 3).map((m: any) => `"${m.nameEn}" (Source: ${m.sourceUrl ? 'YES' : 'NO'})`);
        console.log(`         └─ Sample: ${sample.join(', ')}`);
      });
      if (uni.schools.length > 3) {
        console.log(`      └─ ... and ${uni.schools.length - 3} more schools`);
      }
    }
  } catch (err) {
    console.error('❌ Request failed:', err);
  }
}

test();
