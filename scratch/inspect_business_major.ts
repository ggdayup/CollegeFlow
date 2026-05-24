import dotenv from 'dotenv';
dotenv.config();

async function test() {
  const res = await fetch('http://localhost:38090/api/universities');
  const data: any = await res.json();
  const rice = data.find((u: any) => u.id === 'rice');
  const bizSchool = rice.schools.find((s: any) => s.id === 'rice-business');
  console.log(JSON.stringify(bizSchool.majors, null, 2));
}

test();
