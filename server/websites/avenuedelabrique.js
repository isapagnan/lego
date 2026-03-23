import * as cheerio from 'cheerio';
import { v5 as uuidv5 } from 'uuid';
/**
 * Parse webpage data response
 * @param  {String} data - html response
 * @return {Object} deal
 */
const parse = data => {
  const $ = cheerio.load(data);

  return $('div.prods a')
    .map((i, element) => {
      const link = $(element).attr('href');

      const price = parseFloat($(element).find('span.prodl-prix span').text());
      const discount = Math.abs(parseInt($(element).find('span.prodl-reduc').text()));

      // Try different lazy-loading attributes used by Avenue de la Brique
      let photo = $(element).find('span.prodl-img img').attr('data-src') 
                  || $(element).find('span.prodl-img img').attr('data-original')
                  || $(element).find('span.prodl-img img').attr('src');
      
      // If we still have the "image-non-chargee" placeholder, try to find another img in the same block
      if (photo && photo.includes('image-non-chargee')) {
        const altPhoto = $(element).find('img').not('[src*="image-non-chargee"]').first().attr('src');
        if (altPhoto) photo = altPhoto;
      }

      const absolutePhoto = photo && !photo.startsWith('http') 
                            ? `https://www.avenuedelabrique.com${photo}` 
                            : photo;

      return {
        discount,
        link: link.startsWith('http') ? link : `https://www.avenuedelabrique.com${link}`,
        price: isNaN(price) ? 0 : price,
        'photo': absolutePhoto,
        'title': $(element).attr('title') || $(element).find('.prodl-nom').text().trim(),
        'uuid': uuidv5(link, uuidv5.URL)
      };
    })
    .get();
};

/**
 * Scrape a given url page
 * @param {String} url - url to parse and scrape
 * @returns 
 */
const scrape = async url => {
  const response = await fetch(url);

  if (response.ok) {
    const body = await response.text();

    return parse(body);
  }

  console.error(response);

  return null;
};

export {scrape};