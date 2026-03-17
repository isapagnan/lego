// Invoking strict mode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode#invoking_strict_mode
'use strict';

/**
Description of the available api
GET https://lego-api-blue.vercel.app/deals

Search for specific deals

This endpoint accepts the following optional query string parameters:

- `page` - page of deals to return
- `size` - number of deals to return

GET https://lego-api-blue.vercel.app/sales

Search for current Vinted sales for a given lego set id

This endpoint accepts the following optional query string parameters:

- `id` - lego set id to return
*/

// current deals on the page
let currentDeals = [];
let currentPagination = {};

// instantiate the selectors
const filterCommentedCheckbox = document.querySelector('#filter-commented');
const filterHotCheckbox = document.querySelector('#filter-hot');
const selectSort = document.querySelector('#sort-select');
const filterDiscountCheckbox = document.querySelector('#filter-discount');
const selectShow = document.querySelector('#show-select');
const selectPage = document.querySelector('#page-select');
const selectLegoSetIds = document.querySelector('#lego-set-id-select');
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
    favs = favs.filter(id => id !== uuid); // Retire des favoris
  } else {
    favs.push(uuid); // Ajoute aux favoris
  }
  localStorage.setItem('lego-favorites', JSON.stringify(favs));
};

/**
 * Set global value
 * @param {Array} result - deals to display
 * @param {Object} meta - pagination meta info
 */
const setCurrentDeals = ({result, meta}) => {
  currentDeals = result;
  currentPagination = meta;
};

/**
 * Fetch deals from api
 * @param  {Number}  [page=1] - current page to fetch
 * @param  {Number}  [size=12] - size of the page
 * @return {Object}
 */
const fetchDeals = async (page = 1, size = 6) => {
  try {
    const response = await fetch(
      `https://lego-api-blue.vercel.app/deals?page=${page}&size=${size}`
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
 * @param  {Array} deals
 */
const renderDeals = deals => {
  const fragment = document.createDocumentFragment();
  const div = document.createElement('div');
  const favs = getFavorites(); // On récupère les favoris actuels

  const template = deals
    .map(deal => {
      // On vérifie si ce deal est dans nos favoris pour colorer l'étoile
      const isFav = favs.includes(deal.uuid);
      return `
      <div class="deal" id=${deal.uuid} style="padding: 10px; border: 1px solid #ccc; margin-bottom: 5px;">
        <span>${deal.id}</span>
        <a href="${deal.link}" target="_blank" rel="noopener noreferrer">${deal.title}</a>
        <span>${deal.price} €</span>
        <button class="fav-btn" data-uuid="${deal.uuid}" style="cursor: pointer; border: none; background: none;">
          ${isFav ? '⭐' : '☆'}
        </button>
      </div>
    `;
    })
    .join('');

  div.innerHTML = template;
  fragment.appendChild(div);
  sectionDeals.innerHTML = '<h2>Deals</h2>';
  sectionDeals.appendChild(fragment);
};

/**
 * Render page selector
 * @param  {Object} pagination
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
 * Render lego set ids selector
 * @param  {Array} lego set ids
 */
const renderLegoSetIds = deals => {
  const ids = getIdsFromDeals(deals);
  const options = ids.map(id => 
    `<option value="${id}">${id}</option>`
  ).join('');

  selectLegoSetIds.innerHTML = options;
};

/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderIndicators = pagination => {
  const {count} = pagination;

  spanNbDeals.innerHTML = count;
};

const render = (deals, pagination) => {
  renderDeals(deals);
  renderPagination(pagination);
  renderIndicators(pagination);
  renderLegoSetIds(deals)
};

/**
 * Declaration of all Listeners
 */

/**
 * Select the number of deals to display
 */
selectShow.addEventListener('change', async (event) => {
  const deals = await fetchDeals(currentPagination.currentPage, parseInt(event.target.value));

  setCurrentDeals(deals);
  render(currentDeals, currentPagination);
});

/**
 * Feature 1 - Browse pages
 * Select the page to display
 */
selectPage.addEventListener('change', async (event) => {
  // On récupère la taille actuelle et la nouvelle page sélectionnée
  const size = parseInt(selectShow.value);
  const page = parseInt(event.target.value);
  
  // On fetch la nouvelle page depuis l'API
  const deals = await fetchDeals(page, size);

  setCurrentDeals(deals);
  render(currentDeals, currentPagination);
});

/**
 * Feature 2 - Filter by best discount
 * Filter deals with discount > 50%
 */
if (filterDiscountCheckbox) {
  filterDiscountCheckbox.addEventListener('change', (event) => {
    const isChecked = event.target.checked;
    
    if (isChecked) {
      // On filtre les deals du tableau actuel en local
      const bestDeals = currentDeals.filter(deal => deal.discount > 50);
      render(bestDeals, currentPagination);
    } else {
      // On remet la liste complète si on décoche
      render(currentDeals, currentPagination);
    }
  });
}

/**
 * Feature 3 - Filter by most commented
 * N'affiche que les deals avec plus de 15 commentaires
 */
if (filterCommentedCheckbox) {
  filterCommentedCheckbox.addEventListener('change', (event) => {
    if (event.target.checked) {
      const commentedDeals = currentDeals.filter(deal => deal.comments >= 15);
      render(commentedDeals, currentPagination);
    } else {
      render(currentDeals, currentPagination); // Remet la liste normale
    }
  });
}

/**
 * Feature 4 - Filter by hot deals
 * N'affiche que les deals avec une température > 100
 */
if (filterHotCheckbox) {
  filterHotCheckbox.addEventListener('change', (event) => {
    if (event.target.checked) {
      const hotDeals = currentDeals.filter(deal => deal.temperature >= 100);
      render(hotDeals, currentPagination);
    } else {
      render(currentDeals, currentPagination);
    }
  });
}

/**
 * Feature 5 & 6 - Sort by price and date
 * Trie la liste selon l'option choisie dans le menu déroulant
 */
if (selectSort) {
  selectSort.addEventListener('change', (event) => {
    const sortType = event.target.value;
    
    // On fait une copie de la liste pour ne pas détruire l'originale
    let sortedDeals = [...currentDeals];

    if (sortType === 'price-asc') {
      sortedDeals.sort((a, b) => a.price - b.price); // Prix croissant
    } else if (sortType === 'price-desc') {
      sortedDeals.sort((a, b) => b.price - a.price); // Prix décroissant
    } else if (sortType === 'date-asc') {
      // Date croissante (du plus vieux au plus récent)
      sortedDeals.sort((a, b) => new Date(a.published) - new Date(b.published));
    } else if (sortType === 'date-desc') {
      // Date décroissante (du plus récent au plus vieux)
      sortedDeals.sort((a, b) => new Date(b.published) - new Date(a.published));
    }

    // On affiche la liste triée
    render(sortedDeals, currentPagination);
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  const deals = await fetchDeals();

  setCurrentDeals(deals);
  render(currentDeals, currentPagination);
});

/**
 * Feature 13 - Save as favorite
 * Écoute les clics sur les boutons étoiles
 */
sectionDeals.addEventListener('click', (event) => {
  // Si on clique sur un élément qui a la classe "fav-btn"
  if (event.target.classList.contains('fav-btn')) {
    const uuid = event.target.dataset.uuid;
    toggleFavorite(uuid); // Ajoute/Enlève du localStorage
    
    // Si la case "My favorites" est cochée, on filtre. Sinon, on rafraîchit la page normale
    if (filterFavoriteCheckbox && filterFavoriteCheckbox.checked) {
      const favs = getFavorites();
      const favoriteDeals = currentDeals.filter(deal => favs.includes(deal.uuid));
      render(favoriteDeals, currentPagination);
    } else {
      render(currentDeals, currentPagination);
    }
  }
});

/**
 * Feature 14 - Filter by favorite
 * Filtre la liste quand on coche la case
 */
if (filterFavoriteCheckbox) {
  filterFavoriteCheckbox.addEventListener('change', (event) => {
    if (event.target.checked) {
      const favs = getFavorites();
      const favoriteDeals = currentDeals.filter(deal => favs.includes(deal.uuid));
      render(favoriteDeals, currentPagination);
    } else {
      render(currentDeals, currentPagination);
    }
  });
}
