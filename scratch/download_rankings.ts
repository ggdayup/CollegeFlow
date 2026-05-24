import fs from 'fs';
import path from 'path';

async function main() {
  const urlMaster = 'https://raw.githubusercontent.com/frishberg/Archive-of-US-News-College-Rankings/master/data.json';
  const urlMain = 'https://raw.githubusercontent.com/frishberg/Archive-of-US-News-College-Rankings/main/data.json';
  
  console.log('Attempting to fetch US News college rankings archive...');
  
  let response;
  try {
    console.log(`Trying master branch...`);
    response = await fetch(urlMaster);
    if (!response.ok) throw new Error(`Status ${response.status}`);
  } catch (err) {
    console.log(`Master branch failed: ${(err as Error).message}. Trying main branch...`);
    response = await fetch(urlMain);
  }

  if (!response.ok) {
    throw new Error(`Failed to download. HTTP Status: ${response.status}`);
  }

  const data = await response.json();
  console.log(`Successfully downloaded! Data type: ${typeof data}`);
  
  // Save locally to scratch for analysis
  const scratchDir = path.resolve(process.cwd(), 'scratch');
  const localPath = path.resolve(scratchDir, 'usnews_raw_archive.json');
  fs.writeFileSync(localPath, JSON.stringify(data, null, 2));
  console.log(`Saved raw archive to ${localPath}`);
}

main().catch(console.error);
