import fs from 'fs';
const issuesData = JSON.parse(fs.readFileSync('scratch/plane_issues.json', 'utf8'));
const issues = Array.isArray(issuesData.data) ? issuesData.data : (issuesData.data.results || []);

console.log(`Total issues found: ${issues.length}`);
issues.forEach((issue, index) => {
  console.log(`${index + 1}. [${issue.id}] State: ${issue.state} | Name: ${issue.name}`);
});
