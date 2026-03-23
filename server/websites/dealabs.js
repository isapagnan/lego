import * as cheerio from 'cheerio';
import { v5 as uuidv5 } from 'uuid';

const parse = data => {
  const $ = cheerio.load(data);

  return $('article')
    .map((i, element) => {
      const title = $(element).find('a.thread-title--card, .thread-title, .thread-link').first().text().trim();
      const link = $(element).find('a.thread-title--card, .thread-title a, .thread-link').first().attr('href');
      const fullLink = link && !link.startsWith('http') ? `https://www.dealabs.com${link}` : link || 'Pas de lien';
      const priceText = $(element).find('.thread-price').text().trim();
      const price = parseFloat(priceText.replace(/[^0-9,.]/g, '').replace(',', '.'));

      // Dealabs uses lazy loading, so we check data-src first, then src
      const photo = $(element).find('img.thread-image, .vue-lazy-lazy, img').first().attr('data-src') 
                    || $(element).find('img.thread-image, .vue-lazy-lazy, img').first().attr('src');
      
      const absolutePhoto = photo && !photo.startsWith('http') && photo.startsWith('/')
                            ? `https://www.dealabs.com${photo}`
                            : photo;

      if (!title) return null;

      return {
        title,
        price: isNaN(price) ? 0 : price,
        link: fullLink,
        photo: absolutePhoto,
        uuid: uuidv5(fullLink, uuidv5.URL)
      };
    })
    .get()
    .filter(deal => deal !== null);
};

export const scrape = async (url) => {
  // fetch est inclus directement dans les versions récentes de Node.js !
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36'
    }
  });

  if (response.ok) {
    const body = await response.text();
    return parse(body);
  }

  console.error(`Erreur ${response.status} lors du scraping`);
  return null;
};