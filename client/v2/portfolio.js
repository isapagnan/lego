// Invoking strict mode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode#invoking_strict_mode
'use strict';

// current deals on the page
let currentDeals = [];
let currentPagination = {};

// instantiate the selectors
const selectSort = document.querySelector('#sort-select');
const selectShow = document.querySelector('#show-select');
const selectPage = document.querySelector('#page-select');
const sectionDeals= document.querySelector('#deals');
const spanNbDeals = document.querySelector('#nbDeals');
const filterFavoriteCheckbox = document.querySelector('#filter-favorite');

/**
 * Helper: Get favorites from localStorage
 */
const getFavorites = () => JSON.parse(localStorage.getItem('lego-favorites')) || [];

/**
 * Helper: Toggle favorite in localStorage
 */
const toggleFavorite = (uuid) => {
  let favs = getFavorites();
  if (favs.includes(uuid)) {
    favs = favs.filter(id => id !== uuid);
  } else {
    favs.push(uuid);
  }
  localStorage.setItem('lego-favorites', JSON.stringify(favs));
};

/**
 * Set global value
 */
const setCurrentDeals = ({result, meta}) => {
  currentDeals = result;
  currentPagination = meta;
};

/**
 * Fetch deals from api
 */
const fetchDeals = async (page = 1, size = 12) => {
  try {
    const response = await fetch(
      `http://localhost:8080/deals?page=${page}&size=${size}`
    );
    const body = await response.json();

    if (body.success !== true) {
      console.error(body);
      return {currentDeals, currentPagination};
    }

    return body.data;
  } catch (error) {
    console.error(error);
    return {currentDeals, currentPagination};
  }
};

/**
 * Render list of deals
 */
const renderDeals = deals => {
  const favs = getFavorites();

  const template = deals
    .map(deal => {
      const isFav = favs.includes(deal.uuid);
      // Try to extract a Set ID from title if id is missing
      const setID = deal.id || deal.title.match(/[0-9]{4,}/)?.[0] || '';
      
      // If we have a Set ID, the LEGO CDN is usually the best and most reliable source
      let photoURL = '';
      if (setID) {
        photoURL = `https://images.brickset.com/sets/images/${setID}-1.jpg`;
      } else if (deal.photo && !deal.photo.includes('image-non-chargee')) {
        photoURL = deal.photo;
      } else {
        photoURL = 'https://www.lego.com/static/images/v2/logo.png';
      }

      return `
      <div class="deal-card" id="${deal.uuid}">
        <div class="deal-image">
          <img src="${photoURL}" alt="${deal.title}" onerror="this.onerror=null;this.src='https://www.lego.com/static/images/v2/logo.png';">
        </div>
        <div class="deal-content">
          <span class="deal-id">#${setID || 'LEGO'}</span>
          <a class="deal-title" href="${deal.link}" target="_blank" rel="noopener noreferrer">
            ${deal.title}
          </a>
          <div class="deal-footer">
            <span class="deal-price">${deal.price > 0 ? deal.price + ' €' : 'Check Link'}</span>
            <button class="fav-btn" data-uuid="${deal.uuid}">
              ${isFav ? '⭐' : '☆'}
            </button>
          </div>
        </div>
      </div>
    `;
    })
    .join('');

  sectionDeals.innerHTML = template;
};

/**
 * Render page selector
 */
const renderPagination = pagination => {
  const {currentPage, pageCount} = pagination;
  const options = Array.from(
    {'length': pageCount},
    (value, index) => `<option value="${index + 1}">${index + 1}</option>`
  ).join('');

  selectPage.innerHTML = options;
  selectPage.selectedIndex = currentPage - 1;
};

/**
 * Render Indicators
 */
const renderIndicators = pagination => {
  const {count} = pagination;
  spanNbDeals.innerHTML = count;
};

const render = (deals, pagination) => {
  renderDeals(deals);
  renderPagination(pagination);
  renderIndicators(pagination);
};

/**
 * Declaration of all Listeners
 */

selectShow.addEventListener('change', async (event) => {
  const deals = await fetchDeals(1, parseInt(event.target.value));
  setCurrentDeals(deals);
  render(currentDeals, currentPagination);
});

selectPage.addEventListener('change', async (event) => {
  const size = parseInt(selectShow.value);
  const page = parseInt(event.target.value);
  const deals = await fetchDeals(page, size);
  setCurrentDeals(deals);
  render(currentDeals, currentPagination);
});

selectSort.addEventListener('change', (event) => {
  const sortType = event.target.value;
  let sortedDeals = [...currentDeals];

  if (sortType === 'price-asc') {
    sortedDeals.sort((a, b) => a.price - b.price);
  } else if (sortType === 'price-desc') {
    sortedDeals.sort((a, b) => b.price - a.price);
  }

  renderDeals(sortedDeals);
});

sectionDeals.addEventListener('click', (event) => {
  if (event.target.classList.contains('fav-btn')) {
    const uuid = event.target.dataset.uuid;
    toggleFavorite(uuid);
    
    if (filterFavoriteCheckbox && filterFavoriteCheckbox.checked) {
      const favs = getFavorites();
      const favoriteDeals = currentDeals.filter(deal => favs.includes(deal.uuid));
      renderDeals(favoriteDeals);
    } else {
      renderDeals(currentDeals);
    }
  }
});

filterFavoriteCheckbox.addEventListener('change', (event) => {
  if (event.target.checked) {
    const favs = getFavorites();
    const favoriteDeals = currentDeals.filter(deal => favs.includes(deal.uuid));
    renderDeals(favoriteDeals);
  } else {
    renderDeals(currentDeals);
  }
});

document.addEventListener('DOMContentLoaded', async () => {
  const deals = await fetchDeals();
  setCurrentDeals(deals);
  render(currentDeals, currentPagination);
});
