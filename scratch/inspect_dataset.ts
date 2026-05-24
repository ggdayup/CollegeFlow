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
  
  console.log('Princeton University structure:');
  console.log(JSON.stringify(data['Princeton University'], null, 2));
  
  console.log('\nName structure (if it represents headers or years):');
  console.log(JSON.stringify(data['Name'], null, 2));
}

main().catch(console.error);
