import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import fs from 'fs';
import { scrape as scrapeVinted } from './websites/vinted.js';

const app = express();
const PORT = process.env.PORT || 8080;

app.use(helmet());
app.use(cors());
app.use(express.json());

const getDeals = () => {
  try {
    const data = fs.readFileSync('deals.json', 'utf8');
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
};

app.get('/', (req, res) => {
  res.send({ 'message': 'Lego API is running!', 'ack': true });
});

/**
 * GET /deals
 * Basic paginated deals for the frontend v2
 */
app.get('/deals', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const size = parseInt(req.query.size) || 12;
  const skip = (page - 1) * size;

  const deals = getDeals();
  const result = deals.slice(skip, skip + size);

  res.send({
    'success': true,
    'data': {
      'result': result,
      'meta': {
        'currentPage': page,
        'pageCount': Math.ceil(deals.length / size),
        'pageSize': size,
        'count': deals.length
      }
    }
  });
});

/**
 * GET /deals/search
 * Advanced search as per Workshop 4 requirements
 */
app.get('/deals/search', (req, res) => {
  let limit = parseInt(req.query.limit) || 12;
  let price = parseFloat(req.query.price);
  
  let deals = getDeals();

  if (!isNaN(price)) {
    deals = deals.filter(d => d.price <= price);
  }

  // Sorting by price ascending as per requirements
  deals.sort((a, b) => a.price - b.price);

  const results = deals.slice(0, limit);

  res.send({
    'limit': limit,
    'total': deals.length,
    'results': results
  });
});

/**
 * GET /deals/:id
 * Fetch a specific deal by its uuid
 */
app.get('/deals/:id', (req, res) => {
  const { id } = req.params;
  const deals = getDeals();
  const deal = deals.find(d => d.uuid === id);

  if (deal) {
    res.send(deal);
  } else {
    res.status(404).send({ 'message': 'Deal not found' });
  }
});

/**
 * GET /sales/search
 * Scrape Vinted sales for a specific lego set id
 */
app.get('/sales/search', async (req, res) => {
  const { legoSetId } = req.query;
  const limit = parseInt(req.query.limit) || 12;

  if (!legoSetId) {
    return res.status(400).send({ 'message': 'Missing legoSetId parameter' });
  }

  try {
    const URL = `https://www.vinted.fr/vetements?search_text=lego+${legoSetId}`;
    const sales = await scrapeVinted(URL);
    
    const results = (sales || []).slice(0, limit);

    res.send({
      'success': true,
      'data': {
        'limit': limit,
        'total': (sales || []).length,
        'results': results
      }
    });
  } catch (error) {
    res.status(500).send({ 'success': false, 'message': error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀  Server running on http://localhost:${PORT}`);
});
