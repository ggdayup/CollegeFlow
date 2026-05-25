import fs from 'fs';
import { execSync } from 'child_process';

const issuePayload = {
    name: "Simulate and Test CDS User Needs & Scenarios",
    state: "c7701ec6-17bc-4b40-a72f-2970f96cdc9e", // In Progress
    priority: "high",
    description_html: "<p>Simulate 3 realistic user scenarios from the product requirements in docs/prd/ and test querying the PostgreSQL CDS database to retrieve the target fields, validating the commercial/educational value of the CDS data asset.</p>"
};

try {
    const tempFile = 'scratch/temp_simulation_issue.json';
    fs.writeFileSync(tempFile, JSON.stringify(issuePayload, null, 2));
    
    console.log("Creating Plane issue for CDS Simulation & Testing...");
    const cmd = `node /Users/ggdayup/.agents/skills/plane-api/scripts/plane-api.js create-issue sheenvita 15c381fa-d6ad-4f10-8c47-2b04a3a342b5 ${tempFile}`;
    const output = execSync(cmd, { encoding: 'utf-8' });
    console.log("CLI Output:", output);
    
    fs.unlinkSync(tempFile);
} catch (e) {
    console.error("Error creating issue:", e);
}
