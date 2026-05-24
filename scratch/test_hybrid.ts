import { WikidataUniDetails } from '../src/ingest/comprehensiveIngest';

const WIKIDATA_SPARQL_URL = 'https://query.wikidata.org/sparql';
const USER_AGENT = 'CollegeMajorWikidataIngestionEngine/1.0 (contact: ggdayup@example.com) Antigravity/1.0';

async function main() {
  const query = `
    SELECT DISTINCT ?item ?nameEn ?nameZh ?countryEn ?countryZh ?coords ?logo ?ipeds ?qsId
    WHERE {
      ?item wdt:P31/wdt:P279* wd:Q3918 .
      ?item wdt:P5584 ?qsId .
      
      ?item rdfs:label ?nameEn .
      FILTER(LANG(?nameEn) = "en")
      
      OPTIONAL {
        ?item rdfs:label ?nameZh .
        FILTER(LANG(?nameZh) = "zh")
      }
      
      OPTIONAL {
        ?item wdt:P17 ?countryItem .
        ?countryItem rdfs:label ?countryEn .
        FILTER(LANG(?countryEn) = "en")
      }
      OPTIONAL {
        ?item wdt:P17 ?countryItem .
        ?countryItem rdfs:label ?countryZh .
        FILTER(LANG(?countryZh) = "zh")
      }
      
      OPTIONAL { ?item wdt:P1771 ?ipeds . }
      OPTIONAL { ?item wdt:P625 ?coords . }
      OPTIONAL { ?item wdt:P154 ?logo . }
    }
  `;

  console.log('Fetching all universities with QS IDs from Wikidata...');
  const url = `${WIKIDATA_SPARQL_URL}?query=${encodeURIComponent(query)}&format=json`;
  const response = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
      Accept: 'application/sparql-results+json',
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
  }

  const data: any = await response.json();
  const bindings = data.results.bindings;
  console.log(`Fetched ${bindings.length} results.`);
}

main().catch(console.error);
