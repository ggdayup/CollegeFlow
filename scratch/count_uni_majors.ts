import { universities } from '../src/data/universitiesData';

let count = 0;
let linkedCount = 0;
const allMajors: any[] = [];

universities.forEach(uni => {
  uni.schools.forEach(school => {
    if (school.majors) {
      school.majors.forEach(major => {
        count++;
        if (major.nationalMajorId) linkedCount++;
        allMajors.push({
          uniName: uni.nameZh || uni.nameEn,
          schoolName: school.nameZh || school.nameEn,
          major
        });
      });
    }
    if (school.categories) {
      school.categories.forEach(cat => {
        cat.majors.forEach(major => {
          count++;
          if (major.nationalMajorId) linkedCount++;
          allMajors.push({
            uniName: uni.nameZh || uni.nameEn,
            schoolName: school.nameZh || school.nameEn,
            catName: cat.nameZh || cat.nameEn,
            major
          });
        });
      });
    }
  });
});

console.log(`Total university majors: ${count}`);
console.log(`Linked to national major: ${linkedCount}`);
console.log(`Unlinked: ${count - linkedCount}`);
console.log(`First 5 university majors:`, JSON.stringify(allMajors.slice(0, 5), null, 2));
