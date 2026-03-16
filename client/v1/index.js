'use strict';

/**
 * 🎯 TODO 1: The highest reduction
 */
// On part du principe que la variable 'deals' est déjà chargée via data.js
let bestDeal = deals[0];

for (let i = 1; i < deals.length; i++) {
  if (deals[i].discount > bestDeal.discount) {
    bestDeal = deals[i];
  }
}
console.log(`The best deal is: ${bestDeal.link} (-${bestDeal.discount}%)`);

/**
 * 🎯 TODO 2: Number of deals
 */
const numberOfDeals = deals.length;
console.log(`Number of deals: ${numberOfDeals}`);

/**
 * 🎯 TODO 3: Website name
 */
// Utilisation de Set pour avoir des noms uniques sans doublons
const communityNames = [...new Set(deals.map(deal => deal.community))];
console.log(`Shopping communities: ${communityNames.join(', ')}`);
console.log(`Number of shopping communities: ${communityNames.length}`);

/**
 * 🎯 TODO 4: Sort by price
 */
const dealsByPrice = [...deals].sort((a, b) => a.price - b.price);
console.log('Deals sorted by price:', dealsByPrice);

/**
 * 🎯 TODO 5: Sort by date
 */
const parseDate = (value) => (typeof value === 'number' ? new Date(value * 1000) : new Date(value));
const dealsByDate = [...deals].sort((a, b) => parseDate(b.published) - parseDate(a.published));
console.log('Deals sorted by date:', dealsByDate);

/**
 * 🎯 TODO 6: Filter a specific percentage discount range
 */
const filteredDeals = deals.filter(deal => deal.discount >= 50 && deal.discount <= 75);
console.log('Deals with discount between 50% and 75%:', filteredDeals);

/**
 * 🎯 TODO 7: Average percentage discount
 */
const totalDiscount = deals.reduce((acc, deal) => acc + deal.discount, 0);
const averageDiscount = totalDiscount / deals.length;
console.log(`Average discount: ${averageDiscount.toFixed(2)}%`);

/**
 * 🎯 TODO 8: Deals by community
 */
const communities = {};
deals.forEach(deal => {
  if (!communities[deal.community]) {
    communities[deal.community] = [];
  }
  communities[deal.community].push(deal);
});
console.log('Deals by community:', communities);

/**
 * 🎯 TODO 9 & 10: Sort by price and date for each community
 */
for (const name in communities) {
  // Tri par prix (plus cher au moins cher)
  communities[name].sort((a, b) => b.price - a.price);
  // Tri par date (plus vieux au plus récent)
  communities[name].sort((a, b) => parseDate(a.published) - parseDate(b.published));
}
console.log('Communities sorted:', communities);

/**
 * 🎯 TODO 11: Compute average, p5 and p25
 */
const vintedPrices = VINTED.map(item => parseFloat(item.price)).sort((a, b) => a - b);
const avgVintedPrice = vintedPrices.reduce((a, b) => a + b, 0) / vintedPrices.length;
const p5Price = vintedPrices[Math.floor(0.05 * vintedPrices.length)];
const p25Price = vintedPrices[Math.floor(0.25 * vintedPrices.length)];

console.log(`Vinted Stats - Avg: ${avgVintedPrice.toFixed(2)}, P5: ${p5Price}, P25: ${p25Price}`);

/**
 * 🎯 TODO 12: Very old listed items
 */
const threeWeeksMs = 3 * 7 * 24 * 60 * 60 * 1000;
const now = new Date();
const hasOldItems = VINTED.some(item => (now - new Date(item.published)) > threeWeeksMs);
console.log(`Are there very old items? ${hasOldItems}`);

/**
 * 🎯 TODO 13 & 14: Find and Delete
 */
const specificId = 'f2c5377c-84f9-571d-8712-98902dcbb913';
const foundItem = VINTED.find(item => item.uuid === specificId);
const filteredVinted = VINTED.filter(item => item.uuid !== specificId);
console.log('Found:', foundItem, 'New List length:', filteredVinted.length);

/**
 * 🎯 TODO 15: Objects and Reference
 */
let sealedCamera = VINTED[0];
// On utilise le spread operator (...) pour copier les valeurs sans lier les objets
let camera = { ...sealedCamera, favorite: true };
console.log('Original (sealedCamera):', sealedCamera);
console.log('Copy with favorite (camera):', camera);

/**
 * 🎯 LAST TODO: Save in localStorage
 */
localStorage.setItem('MY_FAVORITE_DEALERS', JSON.stringify(MY_FAVORITE_DEALERS));
console.log('Saved to LocalStorage:', JSON.parse(localStorage.getItem('MY_FAVORITE_DEALERS')));