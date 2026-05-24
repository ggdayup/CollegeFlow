import dotenv from 'dotenv';
dotenv.config();

async function test() {
  console.log('🔍 Inspecting BFF response on http://localhost:38090/api/universities ...');
  try {
    const res = await fetch('http://localhost:38090/api/universities');
    if (!res.ok) {
      throw new Error(`BFF response error: ${res.statusText}`);
    }
    const data: any = await res.json();
    console.log(`✓ Successfully fetched ${data.length} universities from BFF.`);
    
    // Find Harvard
    const harvard = data.find((u: any) => u.id === 'harvard');
    if (harvard) {
      console.log('🏛️ Harvard University Found!');
      const coreSchool = harvard.schools.find((s: any) => s.id === 'harvard-college');
      if (coreSchool) {
        console.log(`🏫 Harvard College found with ${coreSchool.majors.length} majors.`);
        const firstMajor = coreSchool.majors[0];
        console.log(`   └─ First Major: ${firstMajor.nameEn} (${firstMajor.id})`);
        console.log(`      └─ sourceUrl: ${firstMajor.sourceUrl}`);
        if (firstMajor.sourceUrl === 'https://handbook.fas.harvard.edu/book/fields-concentration') {
          console.log('✅ PASS: Harvard major has the correct catalog sourceUrl!');
        } else {
          console.error('❌ FAIL: Harvard major sourceUrl is incorrect or missing:', firstMajor.sourceUrl);
        }
      }
    } else {
      console.error('❌ FAIL: Harvard not found in BFF response.');
    }
  } catch (err) {
    console.error('❌ BFF Request failed:', err);
  }
}

test();
