import { scrape } from './websites/dealabs.js';
import fs from 'fs';

async function run() {
  const URL = 'https://www.dealabs.com/groupe/lego';
  console.log(`🕵️‍♀️  Tentative de scraping sur : ${URL}`);

  try {
    const deals = await scrape(URL);

    if (deals && deals.length > 0) {
      console.log(`✅  Succès ! ${deals.length} deals trouvés.`);
      
      // On sauvegarde dans le fichier
      fs.writeFileSync('deals.json', JSON.stringify(deals, null, 2));
      
      console.log(`💾  Fichier créé avec succès ! Vérifie la gauche de ton écran.`);
      console.log('Exemple du premier deal :', deals[0]);
    } else {
      console.log('❌  Le robot est revenu bredouille (0 deals).');
    }
  } catch (error) {
    console.error('⚠️  Une erreur est survenue :', error.message);
  }
}

run();