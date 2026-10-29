const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const SerpApiClient = require('../api/serpApiClient');
const categories = require('../categories');
const { db } = require('../data/database');
const { demoProducts } = require('../data/demo');
const MLService = require('../ml/mlService');
const serpApi = new SerpApiClient();
const ml = new MLService();

router.get('/categories', (_req, res) => res.json({ categories }));
router.get('/search', async (req, res) => {
  const q = String(req.query.q || req.query.query || '').trim();
  if (!q) return res.status(400).json({ success:false, error:'Query is required' });
  const category = String(req.query.category || 'all').toLowerCase();
  const options = Object.fromEntries(['subcategory','priority','minPrice','maxPrice','minRating','freeShipping','lang'].map(k => [k, req.query[k] || '']));
  const categoryConfig = categories.find(c => c.id === category) || {};
  const subcategoryConfig = (categoryConfig.subcategories || []).find(s => s.id === options.subcategory);
  const queryHint = subcategoryConfig?.queries?.[0] || '';
  const searchQuery = queryHint && !q.toLowerCase().includes(queryHint.toLowerCase()) ? `${q} ${queryHint}` : q;
  const searchMode = process.env.DEMO_MODE === 'true' ? 'demo' : 'live';
  const cacheKey = crypto.createHash('sha256').update(JSON.stringify(['shopping-result-groups-v6', searchMode, searchQuery.toLowerCase(), category, options])).digest('hex');
  const cacheTtl = Math.max(1, Number(process.env.CACHE_TTL_HOURS || 12)) * 3600_000;
  const cached = db.prepare('SELECT payload,fetched_at FROM search_cache WHERE cache_key=?').get(cacheKey);
  const cachedAt = cached?.fetched_at ? Date.parse(cached.fetched_at) : 0;
  if (cached && Date.now() - cachedAt < cacheTtl) {
    return res.json({ ...JSON.parse(cached.payload), source:'cache', fetchedAt:cached.fetched_at });
  }
  let source = 'live'; let fetchedAt = new Date().toISOString(); let products;
  if (process.env.DEMO_MODE === 'true') {
    source = 'demo'; products = demoProducts(searchQuery, category);
  } else {
    try { products = await serpApi.searchProducts(searchQuery); }
    catch (error) {
      if (!cached) return res.status(503).json({ success:false, error:`Live search unavailable and no cached results are available. ${error.message}` });
      source = 'stale'; products = JSON.parse(cached.payload).products; fetchedAt = cached.fetched_at;
    }
  }
  const prepared = (products || []).map(p => {
    const id = crypto.createHash('sha1').update(`${p.platform}|${p.title}|${p.originalUrl}`).digest('hex');
    const row = { ...p, id, listingSource:source==='stale'?(p.listingSource||'stale'):source, title:p.title || 'Unknown product', price:p.price ?? null, rating:p.rating ?? null, reviews:p.reviews ?? null,
      free_shipping:p.hasFreeShipping ?? (p.shippingCost === 0 ? true : (p.shippingCost == null ? null : false)), cod_available:p.hasCOD ?? null,
      delivery_days:p.deliveryDays ?? null, discount_percentage:p.discount ?? null, deal_score:null, dataConfidence:p.demo ? 'sample' : 'listing data' };
    return row;
  });
  let ranked = prepared, picks = {}, hidden = [], model = { status:'unranked', message:'Python ranking has not run.' };
  let pipelineFailed = false;
  try {
    const output = await ml.rankProducts({ query:searchQuery, products:prepared, params:options, categoryConfig });
    ranked=output.ranked || output.products || []; picks=output.picks || {}; hidden=output.hidden || []; model=output.model || {status:'default'};
  } catch (error) {
    pipelineFailed=true;
    model={ status:'unranked', message:`Ranking unavailable: ${error.message}. Listings are shown without ranking.` };
  }
  for (const product of prepared) {
    db.prepare('INSERT INTO products(id,title,payload,updated_at) VALUES(?,?,?,?) ON CONFLICT(id) DO UPDATE SET title=excluded.title,payload=excluded.payload,updated_at=excluded.updated_at')
      .run(product.id, product.title, JSON.stringify(product), fetchedAt);
    const previous = db.prepare('SELECT captured_at FROM price_snapshots WHERE product_id=? ORDER BY captured_at DESC LIMIT 1').get(product.id);
    if (source === 'live' && product.price != null && (!previous || Date.now() - Date.parse(previous.captured_at) >= 6 * 3600_000)) {
      db.prepare('INSERT INTO price_snapshots(product_id,price,captured_at) VALUES(?,?,?)').run(product.id, product.price, fetchedAt);
    }
  }
  for (const p of ranked) db.prepare('UPDATE products SET payload=? WHERE id=?').run(JSON.stringify(p),p.id);
  const result = { success:true, query:q, searchTerm:searchQuery, category, subcategory:options.subcategory||null, currency:'INR', source, fetchedAt, totalResults:ranked.length,
    products:ranked, ranked, picks, hidden, model };
  if (source !== 'stale' && !pipelineFailed) db.prepare('INSERT INTO search_cache(cache_key,payload,fetched_at) VALUES(?,?,?) ON CONFLICT(cache_key) DO UPDATE SET payload=excluded.payload,fetched_at=excluded.fetched_at').run(cacheKey, JSON.stringify(result), fetchedAt);
  res.json(result);
});
router.get('/history', (req,res) => {
  const id = String(req.query.productId || '');
  if (!id) return res.status(400).json({ error:'productId is required' });
  const days = Math.min(90, Math.max(7, Number(req.query.days || 30)));
  const rows = db.prepare("SELECT price,captured_at FROM price_snapshots WHERE product_id=? AND captured_at>=datetime('now',?) ORDER BY captured_at").all(id, `-${days} days`);
  const prices = rows.map(r => r.price);
  res.json({ productId:id, days, points:rows, min:prices.length ? Math.min(...prices) : null, max:prices.length ? Math.max(...prices) : null, average:prices.length ? prices.reduce((a,b)=>a+b,0)/prices.length : null, trackingSince:rows[0]?.captured_at || null });
});
module.exports = router;
