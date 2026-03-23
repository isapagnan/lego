import scrape from './index.js';
import fs from 'fs';

const SOURCES = [
  'https://www.avenuedelabrique.com/promotions-et-bons-plans-lego',
  'https://www.dealabs.com/groupe/lego'
];

async function run() {
  try {
    let allDeals = [];

    for (const url of SOURCES) {
      console.log(`🕵️‍♀️  Scraping ${url}...`);
      const deals = await scrape(url);
      if (deals) {
        console.log(`✅  Found ${deals.length} deals.`);
        allDeals = allDeals.concat(deals);
      }
    }

    if (allDeals.length > 0) {
      console.log(`💾  Saving ${allDeals.length} deals to deals.json...`);
      fs.writeFileSync('deals.json', JSON.stringify(allDeals, null, 2));
      console.log('✅  Deals saved successfully.');
    }

  } catch (error) {
    console.error('⚠️  Error during scraping:', error);
  }
}

run();
