import fs from 'fs';
import { execSync } from 'child_process';

const issuePayload = {
    name: "CDS PostgreSQL Schema Ingestion and Verification Implementation",
    state: "c7701ec6-17bc-4b40-a72f-2970f96cdc9e", // In Progress
    priority: "high",
    description_html: "<p>Implement the optimized PostgreSQL DDL schema for Common Data Set (CDS), write the robust batch importer to load canonical CDS data, build the validation/audit layer, and verify zero data loss across the 16 target universities.</p>"
};

try {
    const tempFile = 'scratch/temp_issue.json';
    fs.writeFileSync(tempFile, JSON.stringify(issuePayload, null, 2));
    
    console.log("Creating Plane issue...");
    const cmd = `node /Users/ggdayup/.agents/skills/plane-api/scripts/plane-api.js create-issue sheenvita 15c381fa-d6ad-4f10-8c47-2b04a3a342b5 ${tempFile}`;
    const output = execSync(cmd, { encoding: 'utf-8' });
    console.log("CLI Output:", output);
    
    fs.unlinkSync(tempFile);
} catch (e) {
    console.error("Error creating issue:", e);
}
