import { universities } from '../src/data/universitiesData';

console.log(` universities in static dataset: ${universities.length}`);
let totalSchools = 0;
let totalMajors = 0;
let linkedMajors = 0;

universities.forEach(u => {
  let uMajors = 0;
  let uLinked = 0;
  u.schools.forEach(s => {
    totalSchools++;
    if (s.majors) {
      uMajors += s.majors.length;
      uLinked += s.majors.filter(m => m.nationalMajorId).length;
    }
    if (s.categories) {
      s.categories.forEach(c => {
        if (c.majors) {
          uMajors += c.majors.length;
          uLinked += c.majors.filter(m => m.nationalMajorId).length;
        }
      });
    }
  });
  totalMajors += uMajors;
  linkedMajors += uLinked;
  console.log(`- ${u.nameEn}: ${u.schools.length} schools, ${uMajors} majors (${uLinked} linked to nationalMajorId)`);
});

console.log(`\nTotal schools: ${totalSchools}`);
console.log(`Total majors defined statically: ${totalMajors}`);
console.log(`Total statically linked majors: ${linkedMajors}`);
