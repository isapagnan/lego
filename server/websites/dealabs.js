import * as cheerio from 'cheerio';

const parse = data => {
  const $ = cheerio.load(data);

  return $('article')
    .map((i, element) => {
      const title = $(element).find('a.thread-title--card').text().trim() 
                    || $(element).find('.thread-title').text().trim();
      const price = $(element).find('.thread-price').text().trim();
      const link = $(element).find('a.thread-title--card').attr('href') 
                   || $(element).find('.thread-title a').attr('href');

      if (!title) return null;

      return {
        title,
        price: price || 'Gratuit / Inconnu',
        link: link ? `https://www.dealabs.com${link}` : 'Pas de lien'
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