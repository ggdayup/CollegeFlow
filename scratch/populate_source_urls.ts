import * as fs from 'fs';
import * as path from 'path';

const filePath = './src/data/universitiesData.ts';
let content = fs.readFileSync(filePath, 'utf-8');

const urls: Record<string, string> = {
  harvard: 'https://handbook.fas.harvard.edu/book/fields-concentration',
  mit: 'https://catalog.mit.edu/schools/',
  stanford: 'https://bulletin.stanford.edu/programs',
  berkeley: 'https://guide.berkeley.edu/undergraduate/degree-programs/',
  princeton: 'https://ua.princeton.edu/fields-study',
  yale: 'https://catalog.yale.edu/ycps/subjects-of-instruction/',
  upenn: 'https://catalog.upenn.edu/programs/',
  caltech: 'https://catalog.caltech.edu/current/academic-divisions/',
  columbia: 'https://bulletin.columbia.edu/columbia-college/departments-instruction/',
  uchicago: 'https://collegecatalog.uchicago.edu/thecollege/programsofstudy/',
  umich: 'https://lsa.umich.edu/lsa/academics/departments-programs.html',
  rice: 'https://ga.rice.edu/programs-study/departments-programs/',
  tsinghua: 'https://www.tsinghua.edu.cn/en/Academics/Schools_Departments.htm',
  peking: 'https://www.pku.edu.cn/department.html',
  oxford: 'https://www.ox.ac.uk/admissions/undergraduate/courses/course-listing',
  nus: 'https://nus.edu.sg/gro/global-programmes/special-global-programmes',
  jhu: 'https://e-catalog.jhu.edu/',
  dartmouth: 'https://dartmouth.smartcatalogiq.com/'
};

// We will split the file by university block.
// Each university starts with a line containing: "    id: 'something',"
const lines = content.split('\n');
let currentUni: string | null = null;
let updatedLines: string[] = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Check if this line starts a new university block
  const uniMatch = line.match(/^\s+id:\s+'([^']+)',/);
  if (uniMatch && urls[uniMatch[1]] !== undefined) {
    currentUni = uniMatch[1];
    console.log(`Entered university block: ${currentUni}`);
  }
  
  // If we are inside a university block, check if this line contains a major definition
  // e.g., { id: '...', nameEn: '...', nameZh: '...' }
  // We want to add sourceUrl to it if it doesn't already have one
  if (currentUni && line.includes('{ id: \'') && !line.includes('sourceUrl:')) {
    const url = urls[currentUni];
    // Find the closing brace of the object
    const closingBraceIndex = line.lastIndexOf('}');
    if (closingBraceIndex !== -1) {
      // Find the closing brace of the object
      const trimLine = line.trim();
      const hasCommaAtEnd = trimLine.endsWith(',');
      
      const beforeBrace = line.substring(0, closingBraceIndex).trim();
      const afterBrace = line.substring(closingBraceIndex);
      
      // Ensure we add a comma before our new property if needed
      const separator = beforeBrace.endsWith(',') ? ' ' : ', ';
      const newProperty = `sourceUrl: '${url}'`;
      
      const newLine = beforeBrace + separator + newProperty + ' ' + afterBrace;
      updatedLines.push(newLine);
      continue;
    }
  }
  
  updatedLines.push(line);
}

fs.writeFileSync(filePath, updatedLines.join('\n'), 'utf-8');
console.log('Successfully populated sourceUrl for all premium universities!');
