import { scrape as scrapeAvenue } from './websites/avenuedelabrique.js';
import { scrape as scrapeDealabs } from './websites/dealabs.js';
import { scrape as scrapeVinted } from './websites/vinted.js';

/**
 * Scrape a given link
 * @param {String} link
 * @returns {Array} deals
 */
export default async link => {
  if (link.includes('avenuedelabrique.com')) {
    return await scrapeAvenue(link);
  }

  if (link.includes('dealabs.com')) {
    return await scrapeDealabs(link);
  }

  if (link.includes('vinted')) {
    return await scrapeVinted(link);
  }

  return [];
};
