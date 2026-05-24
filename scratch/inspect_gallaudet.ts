async function main() {
  console.log("🔍 Checking Gallaudet University in local Express BFF...");
  try {
    const res = await fetch("http://localhost:38090/api/universities");
    const data = await res.json() as any[];
    const gallaudet = data.find(u => u.id === 'gallaudet');
    
    if (gallaudet) {
      console.log("✓ Gallaudet found in BFF response:");
      console.log(JSON.stringify(gallaudet, null, 2));
    } else {
      console.log("❌ Gallaudet NOT found in BFF response!");
    }
  } catch (err: any) {
    console.error("❌ Fetch failed:", err.message);
  }
}

main();
