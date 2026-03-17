import * as cheerio from 'cheerio';

const parse = data => {
  const $ = cheerio.load(data);

  // Vinted change souvent ses classes HTML, on cible les éléments d'articles typiques
  return $('div.feed-grid__item, div.new-item-box__container')
    .map((i, element) => {
      // On cherche le prix et le titre dans la carte de l'article
      const title = $(element).find('[title]').attr('title') || 'Boîte de Lego';
      const price = $(element).find('h3, .new-item-box__price, [data-testid="item-price"]').text().trim();
      const link = $(element).find('a').attr('href');

      if (!price) return null;

      return {
        title,
        price,
        link: link ? link : 'Pas de lien'
      };
    })
    .get()
    .filter(sale => sale !== null);
};

export const scrape = async (url) => {
  const response = await fetch(url, {
    headers: {
      // On se fait passer pour un vrai navigateur pour essayer de contourner les sécurités
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7'
    }
  });

  if (response.ok) {
    const body = await response.text();
    return parse(body);
  }

  console.error(`Erreur ${response.status} : Vinted bloque probablement la connexion.`);
  return null;
};