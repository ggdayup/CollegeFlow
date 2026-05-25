import fs from 'fs';
import { execSync } from 'child_process';

const issuePayload = {
    state: "aa17c124-ecbb-4e70-bfde-7c607685f9f3", // Done
    description_html: `
        <h3>CDS User Scenarios Simulation and Testing Summary</h3>
        <p>Simulated 3 realistic user scenarios from the product requirements in docs/prd/ and tested querying the PostgreSQL CDS database to retrieve target fields, validating the commercial and educational value of the CDS data asset.</p>
        <h4>Key Accomplishments:</h4>
        <ul>
            <li><strong>Scenario 1: Elite STEM Competitiveness (Stanford vs. MIT vs. Caltech):</strong> Validated that Caltech test-blind policy is handled gracefully as an explicit NULL (triggering UI score CONSIDERATION warnings), while MIT and Stanford show top-75th percentile profiles.</li>
            <li><strong>Scenario 2: Need-Based cost calculation (Princeton vs. Harvard vs. Duke):</strong> Computed true net costs showing Princeton ($13,129 out-of-pocket) and Harvard ($11,822) packages. Gracefully raised a Data Gap warning for Duke which declared costs_available=false in Section G.</li>
            <li><strong>Scenario 3: Transfer Credit and Selectivity (UPenn vs. Columbia):</strong> Demonstrated Columbia's transfer acceptance rate (~8.97%) is 2.8x higher than UPenn's (~3.21%), and retrieved exact credit transfer grades (C for Columbia, 2.0 for UPenn) and credit limitations.</li>
        </ul>
        <h4>New/Modified Files:</h4>
        <ul>
            <li><code>scratch/test_user_scenarios.py</code> (NEW - testing query script)</li>
            <li><code>verify_cds_user_scenarios.md</code> (NEW - persistent markdown audit verification report in artifacts)</li>
        </ul>
    `
};

try {
    const tempFile = 'scratch/temp_complete_simulation.json';
    fs.writeFileSync(tempFile, JSON.stringify(issuePayload, null, 2));
    
    console.log("Updating Plane issue to Done...");
    const cmd = `node /Users/ggdayup/.agents/skills/plane-api/scripts/plane-api.js update-issue sheenvita 15c381fa-d6ad-4f10-8c47-2b04a3a342b5 0d0e7c8a-1770-433e-9f86-0d27b54cd067 ${tempFile}`;
    const output = execSync(cmd, { encoding: 'utf-8' });
    console.log("CLI Output:", output);
    
    fs.unlinkSync(tempFile);
} catch (e) {
    console.error("Error completing issue:", e);
}
