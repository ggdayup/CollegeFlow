import dotenv from 'dotenv';
dotenv.config();

async function test() {
  console.log('🔍 Inspecting Live BFF API output for Rice University...');
  try {
    const res = await fetch('http://localhost:38090/api/universities');
    const data: any = await res.json();
    
    const rice = data.find((u: any) => u.id === 'rice');
    if (!rice) {
      console.error('❌ Rice not found in BFF payload.');
      return;
    }
    
    console.log(`🏛️  ${rice.nameEn} (${rice.nameZh})`);
    console.log(`   └─ Schools found in BFF output: ${rice.schools.length}`);
    rice.schools.forEach((s: any) => {
      console.log(`      ├─ [${s.code}] ${s.nameEn} (${s.nameZh}) holds ${s.majors.length} majors`);
      const sample = s.majors.slice(0, 2).map((m: any) => `${m.nameEn} (Source: ${m.sourceUrl ? 'YES' : 'NO'})`);
      console.log(`         └─ Sample:`, sample.join(', '));
    });
  } catch (err) {
    console.error('❌ Request failed:', err);
  }
}

test();
