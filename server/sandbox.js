import { scrape as scrapeVinted } from './websites/vinted.js';
import fs from 'fs';

async function run() {
  const legoId = '75192'; // Le Faucon Millenium !
  const URL = `https://www.vinted.fr/vetements?search_text=lego+${legoId}`;
  
  console.log(`🕵️‍♀️  Tentative de scraping sur Vinted : ${URL}`);

  try {
    const sales = await scrapeVinted(URL);

    if (sales && sales.length > 0) {
      console.log(`✅  Succès ! ${sales.length} ventes trouvées.`);
      
      // On sauvegarde dans un nouveau fichier json
      fs.writeFileSync('vinted_sales.json', JSON.stringify(sales, null, 2));
      
      console.log(`💾  Fichier créé avec succès : vinted_sales.json`);
      console.log('Exemple de vente :', sales[0]);
    } else {
      console.log('❌  Le robot est revenu bredouille. Soit il n\'y a pas de Lego, soit Vinted a bloqué le robot (très fréquent) !');
    }
  } catch (error) {
    console.error('⚠️  Une erreur est survenue :', error.message);
  }
}

run();