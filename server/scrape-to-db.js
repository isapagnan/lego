import scrape from './index.js';
import * as db from './db.js';

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
      console.log(`💾  Saving ${allDeals.length} deals to MongoDB...`);
      const mongoDb = await db.connect();
      const collection = mongoDb.collection('deals');
      
      // Clear existing deals or just append? 
      // For a workshop, we might want to clear it first to have fresh data.
      await collection.deleteMany({});
      await collection.insertMany(allDeals);
      
      console.log('✅  Deals saved successfully.');
    }

  } catch (error) {
    console.error('⚠️  Error during scraping/saving:', error);
  } finally {
    await db.close();
    process.exit(0);
  }
}

run();
