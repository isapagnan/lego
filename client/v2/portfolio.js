// Invoking strict mode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode#invoking_strict_mode
'use strict';

/**
 * GLOBAL STATE
 */
let allDeals = []; // Store all deals for client-side filtering (discount, search)
let currentDeals = [];
let currentPagination = {};

// Selectors
const selectSort = document.querySelector('#sort-select');
const selectShow = document.querySelector('#show-select');
const selectDiscount = document.querySelector('#discount-select');
const selectPage = document.querySelector('#page-select');
const searchInput = document.querySelector('#search-input');
const sectionDeals = document.querySelector('#deals');
const spanNbDeals = document.querySelector('#nbDeals');
const filterFavoriteCheckbox = document.querySelector('#filter-favorite');
const navLinks = document.querySelectorAll('.nav-link');

// Pagination Selectors
const btnPrev = document.querySelector('#prev-page');
const btnNext = document.querySelector('#next-page');
const btnPrevBottom = document.querySelector('#prev-page-bottom');
const btnNextBottom = document.querySelector('#next-page-bottom');

let currentTab = 'all'; // 'all', 'deals', or 'favorites'
/**
 * HELPERS
 */
const getFavorites = () => JSON.parse(localStorage.getItem('lego-favorites')) || [];

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
 * DATA FETCHING
 */
const fetchDeals = async (page = 1, size = 12) => {
  try {
    const response = await fetch(
      `https://lego-api-isa.vercel.app/deals?page=${page}&size=${size}`
    );
    const body = await response.json();

    if (body.success !== true) {
      console.error(body);
      return { result: [], meta: {} };
    }

    return body.data;
  } catch (error) {
    console.error(error);
    return { result: [], meta: {} };
  }
};

/**
 * RENDERING
 */
const renderDeals = deals => {
  const favs = getFavorites();

  const template = deals
    .map(deal => {
      const isFav = favs.includes(deal.uuid);
      
      // 1. Precise Set ID Extraction (4 to 6 digits only, as 7+ are often not standard sets)
      const setIDMatch = deal.title ? deal.title.match(/\b([0-9]{4,6})\b/) : null;
      const setID = deal.id || (setIDMatch ? setIDMatch[1] : '');
      
      // 2. Fallback static logo (Wikimedia is very stable and won't redirect to LEGO home)
      const fallbackLogo = 'https://upload.wikimedia.org/wikipedia/commons/2/24/LEGO_logo.svg';
      
      // 3. Reliable CDN URL (Brickset)
      const bricksetURL = setID ? `https://images.brickset.com/sets/images/${setID}-1.jpg` : '';
      
      // 4. Fix Scraped URL
      let photoURL = deal.photo || '';
      if (photoURL.includes('avenuedelabrique.comproduits')) {
        photoURL = photoURL.replace('avenuedelabrique.comproduits', 'avenuedelabrique.com/produits');
      }

      // 5. Priority Logic: Brickset > Corrected Scraped > Wikimedia Logo
      const finalPhoto = bricksetURL || photoURL || fallbackLogo;

      return `
      <div class="deal-card" id="${deal.uuid}">
        ${deal.discount > 0 ? `<div class="discount-badge">-${deal.discount}%</div>` : ''}
        <div class="deal-image">
          <img src="${finalPhoto}" 
               alt="${deal.title || 'Lego Set'}" 
               loading="lazy"
               onerror="this.onerror=null;this.src='${fallbackLogo}';">
        </div>
        <div class="deal-content">
          <span class="deal-id">${setID ? 'SET #' + setID : 'LEGO EXCLUSIVE'}</span>
          <a class="deal-title" href="${deal.link}" target="_blank" rel="noopener noreferrer">
            ${deal.title || 'Untitled Lego Set'}
          </a>
          <div class="deal-footer">
            <span class="deal-price">${deal.price > 0 ? deal.price + ' €' : 'Check Site'}</span>
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

const renderPagination = (currentPage, pageCount) => {
  if (!pageCount) {
    selectPage.innerHTML = '<option value="1">1</option>';
    return;
  }
  const options = Array.from(
    { length: pageCount },
    (v, i) => `<option value="${i + 1}">${i + 1}</option>`
  ).join('');

  selectPage.innerHTML = options;
  selectPage.selectedIndex = currentPage - 1;

  // Disable/Enable buttons
  const isFirst = currentPage === 1;
  const isLast = currentPage === pageCount;

  btnPrev.disabled = isFirst;
  btnPrevBottom.disabled = isFirst;
  btnNext.disabled = isLast;
  btnNextBottom.disabled = isLast;
};

const renderIndicators = (count) => {
  spanNbDeals.innerHTML = count;
};

/**
 * FILTERING & SORTING LOGIC
 */
const applyFilters = (resetPage = false) => {
  let filtered = [...allDeals];

  // 1. Tab Filter (All, Deals, Favorites)
  if (currentTab === 'deals') {
    filtered = filtered.filter(d => d.discount > 0);
  }

  // 2. Discount Filter
  const minDiscount = parseInt(selectDiscount.value);
  if (minDiscount > 0) {
    filtered = filtered.filter(d => d.discount >= minDiscount);
  }

  // 3. Search Filter
  const search = searchInput.value.toLowerCase();
  if (search) {
    filtered = filtered.filter(d => 
      (d.title && d.title.toLowerCase().includes(search)) || 
      (d.id && d.id.toString().includes(search))
    );
  }

  // 4. Favorites Filter
  if (filterFavoriteCheckbox.checked || currentTab === 'favorites') {
    const favs = getFavorites();
    filtered = filtered.filter(d => favs.includes(d.uuid));
  }

  // 5. Sorting
  const sortType = selectSort.value;
  if (sortType === 'price-asc') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sortType === 'price-desc') {
    filtered.sort((a, b) => b.price - a.price);
  }

  // 6. Pagination Calculations
  const size = parseInt(selectShow.value);
  const totalResults = filtered.length;
  const pageCount = Math.ceil(totalResults / size) || 1;
  
  // If resetPage is true, or current selection is invalid, go to page 1
  let page = resetPage ? 1 : (parseInt(selectPage.value) || 1);
  if (page > pageCount) page = 1;

  const start = (page - 1) * size;
  const pageDeals = filtered.slice(start, start + size);

  // 7. Render Everything
  renderDeals(pageDeals);
  renderIndicators(totalResults);
  renderPagination(page, pageCount);
};

/**
 * LISTENERS
 */
navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    navLinks.forEach(l => l.classList.remove('active'));
    link.classList.add('active');
    
    const text = link.textContent.toLowerCase();
    if (text === 'all') currentTab = 'all';
    if (text === 'deals') currentTab = 'deals';
    if (text === 'favorites') currentTab = 'favorites';
    
    applyFilters(true); // Reset to page 1 when switching tabs
  });
});

selectShow.addEventListener('change', () => applyFilters(true)); // Reset to page 1 when changing size
selectPage.addEventListener('change', () => applyFilters(false)); // Just re-render the selected page
selectSort.addEventListener('change', () => applyFilters(false)); 
selectDiscount.addEventListener('change', () => applyFilters(true));
searchInput.addEventListener('input', () => applyFilters(true));
filterFavoriteCheckbox.addEventListener('change', () => applyFilters(true));

// Prev / Next Listeners
const goToPrev = () => {
    const current = parseInt(selectPage.value);
    if (current > 1) {
        selectPage.value = current - 1;
        applyFilters(false);
    }
};

const goToNext = () => {
    const current = parseInt(selectPage.value);
    const max = selectPage.options.length;
    if (current < max) {
        selectPage.value = current + 1;
        applyFilters(false);
    }
};

btnPrev.addEventListener('click', goToPrev);
btnPrevBottom.addEventListener('click', goToPrev);
btnNext.addEventListener('click', goToNext);
btnNextBottom.addEventListener('click', goToNext);

sectionDeals.addEventListener('click', (event) => {
  const btn = event.target.closest('.fav-btn');
  if (btn) {
    const uuid = btn.dataset.uuid;
    toggleFavorite(uuid);
    applyFilters();
  }
});

/**
 * INIT
 */
document.addEventListener('DOMContentLoaded', async () => {
  // Fetch a large initial batch to allow client-side filtering/search
  // For a real app, we'd do this on the server, but for this workshop, 
  // fetching more at once makes the UI feel much faster.
  const data = await fetchDeals(1, 100); 
  allDeals = data.result;
  applyFilters();
});
