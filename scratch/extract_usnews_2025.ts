import fs from 'fs';
import path from 'path';

async function main() {
  const scratchDir = path.resolve(process.cwd(), 'scratch');
  const localPath = path.resolve(scratchDir, 'usnews_raw_archive.json');
  
  if (!fs.existsSync(localPath)) {
    console.error('File not found! Run the download script first.');
    return;
  }
  
  const rawData = fs.readFileSync(localPath, 'utf8');
  const data = JSON.parse(rawData);
  
  const extracted: { name: string; rank2025: number }[] = [];
  
  for (const [name, years] of Object.entries(data)) {
    if (name === 'Name') continue;
    
    const yObj = years as Record<string, string>;
    const rankStr = yObj['2025'] || yObj['2024']; // fallback to 2024 if 2025 is missing
    
    if (rankStr && !isNaN(Number(rankStr))) {
      const rank = Number(rankStr);
      // We only want top 200 national universities
      if (rank > 0 && rank <= 200) {
        extracted.push({ name, rank2025: rank });
      }
    }
  }
  
  // Sort by rank ascending
  extracted.sort((a, b) => a.rank2025 - b.rank2025);
  
  console.log(`Extracted ${extracted.length} universities ranked in Top 200:`);
  console.log(`Sample first 25:`);
  extracted.slice(0, 25).forEach(e => {
    console.log(`  #${e.rank2025}: "${e.name}"`);
  });
  
  // Save extracted dataset
  const outputPath = path.resolve(scratchDir, 'usnews_2025_top200.json');
  fs.writeFileSync(outputPath, JSON.stringify(extracted, null, 2));
  console.log(`\nSaved extracted list to ${outputPath}`);
}

main().catch(console.error);
