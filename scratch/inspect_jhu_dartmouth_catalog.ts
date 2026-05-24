import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

async function main() {
  console.log("🔍 Querying local Express BFF universities API...");
  try {
    const res = await fetch("http://localhost:38090/api/universities");
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json() as any[];

    console.log(`✓ Fetched ${data.length} universities from BFF API.\n`);

    const targets = ["jhu", "dartmouth"];
    for (const targetId of targets) {
      const uni = data.find(u => u.id === targetId);
      if (!uni) {
        console.error(`❌ Error: University '${targetId}' not found in BFF response!`);
        continue;
      }

      console.log("="*60);
      console.log(`🏛️  ${uni.nameEn} (${uni.nameZh})`);
      console.log(`📍 Country: ${uni.countryEn} (${uni.countryZh}) | Location: ${uni.locationEn}`);
      console.log(`🏆 Rankings - US News: #${uni.usNewsRank} | QS: #${uni.qsRank}`);
      console.log(`💰 Scorecard Fact - Avg Cost: $${uni.averageCost} | Grad Rate: ${uni.gradRate}% | Median Salary: $${uni.medianSalary}`);
      console.log(`🔗 Wikidata: ${uni.wikidataId} | IPEDS: ${uni.scorecardUnitId}`);
      console.log(`🏫 Schools/Colleges (${uni.schools.length}):`);
      
      uni.schools.forEach((s: any) => {
        console.log(`   └─ [${s.code}] ${s.nameEn} (${s.nameZh})`);
        const majors = s.majors || [];
        if (s.categories) {
          s.categories.forEach((c: any) => {
            console.log(`      └─ Category: ${c.nameEn} (${c.nameZh})`);
            c.majors.forEach((m: any) => {
              console.log(`         └─ [${m.id}] ${m.nameEn} (${m.nameZh}) [National ID: ${m.nationalMajorId}]`);
              if (m.rankings) {
                console.log(`            🏆 Rankings: ${JSON.stringify(m.rankings)}`);
              }
            });
          });
        } else {
          majors.forEach((m: any) => {
            console.log(`      └─ [${m.id}] ${m.nameEn} (${m.nameZh}) [National ID: ${m.nationalMajorId}]`);
            if (m.rankings) {
              console.log(`         🏆 Rankings: ${JSON.stringify(m.rankings)}`);
            }
          });
        }
      });
      console.log("="*60 + "\n");
    }
  } catch (err: any) {
    console.error("❌ Test failed:", err.message);
  }
}

main();
