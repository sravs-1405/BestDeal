const config = require('../config/config');

function isDirectRetailerUrl(value) {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    return ['http:', 'https:'].includes(url.protocol) &&
      !/(^|\.)google\./i.test(host) &&
      !/(^|\.)serpapi\.com$/i.test(host);
  } catch {
    return false;
  }
}

function collectShoppingResults(body) {
  const categorized = Array.isArray(body.categorized_shopping_results)
    ? body.categorized_shopping_results.flatMap(group => Array.isArray(group.shopping_results) ? group.shopping_results : [])
    : [];
  const results = [
    ...(Array.isArray(body.shopping_results) ? body.shopping_results : []),
    ...categorized,
    ...(Array.isArray(body.inline_shopping_results) ? body.inline_shopping_results : [])
  ];
  const unique = new Map();

  for (const item of results) {
    if (!item || typeof item !== 'object') continue;
    const titleKey = String(item.title || '').toLowerCase().replace(/\s+/g, ' ').trim();
    const sourceKey = String(item.source || '').toLowerCase().trim();
    const priceKey = String(item.extracted_price ?? item.price ?? '').toLowerCase().trim();
    const key = titleKey || sourceKey || priceKey ? [titleKey, sourceKey, priceKey].join('|') : String(item.product_id || item.link || JSON.stringify(item));
    const current = unique.get(key);
    const directLink = [item.retailer_link, item.link].find(isDirectRetailerUrl);

    if (!current) {
      const copy = { ...item };
      if (directLink) copy.retailer_link = directLink;
      unique.set(key, copy);
      continue;
    }

    for (const [field, value] of Object.entries(item)) {
      if ((current[field] == null || current[field] === '') && value != null && value !== '') current[field] = value;
    }
    if (directLink) current.retailer_link = directLink;
  }

  return [...unique.values()];
}

class SerpApiClient {
  constructor() {
    this.apiKey = config.SERPAPI_KEY;
    this.baseUrl = 'https://serpapi.com/search.json';
  }

  async searchProducts(query, pincode = null) {
    try {
      const params = {
        engine: 'google_shopping',
        q: query,
        api_key: this.apiKey,
        google_domain: 'google.co.in',   // ✅ FIXED: India domain
        gl: 'in',                          // ✅ FIXED: India region
        hl: 'en',
        currency: 'INR'
      };

      console.log(`🔍 Searching for "${query}" on Google Shopping India...`);

      if (!this.apiKey) throw new Error('SERPAPI_KEY is not configured');
      const url = new URL(this.baseUrl);
      for (const [key,value] of Object.entries(params)) if (value != null) url.searchParams.set(key,String(value));
      const response = await fetch(url, { signal:AbortSignal.timeout(30000), headers:{'User-Agent':'BestDeal/1.0'} });
      const body = await response.json();
      if (!response.ok || body.error) throw new Error(body.error || `Google Shopping returned ${response.status}`);

      console.log('📦 Response status:', response.status);

      const products = collectShoppingResults(body);
      console.log(`✅ Found ${products.length} products`);

      if (products.length === 0) {
        console.log('⚠️  No products found.');
      }

      return products.map(item => this.normalizeProduct(item));
    } catch (error) {
      throw new Error(error.message || 'Google Shopping request failed');
    }
  }

  normalizeProduct(item) {
    const price = this.extractPrice(item.price != null && item.price !== '' ? item.price : item.extracted_price);
    const ratingValue = item.rating == null || item.rating === '' ? null : Number(item.rating);
    const rating = Number.isFinite(ratingValue) ? ratingValue : null;
    const reviewValue = item.reviews == null || item.reviews === '' ? null : parseInt(String(item.reviews).replace(/[^\d]/g, ''), 10);
    const reviews = Number.isFinite(reviewValue) ? reviewValue : null;
    const platform = this.identifyPlatform(item.source || '');
    const imageCandidates = [item.thumbnail, item.serpapi_thumbnail, item.thumbnail_url, item.image, item.image_url,
      ...(Array.isArray(item.thumbnails) ? item.thumbnails : []), ...(Array.isArray(item.serpapi_thumbnails) ? item.serpapi_thumbnails : [])]
      .filter((value, index, all) => typeof value === 'string' && /^https?:\/\//i.test(value) && all.indexOf(value) === index);
    const image = imageCandidates[0] || '';
    const originalUrl = item.retailer_link || (isDirectRetailerUrl(item.link) ? item.link : '') || item.product_link || item.link || '';
    const shippingInfo = String(item.shipping ?? item.delivery ?? '').toLowerCase();
    const hasFreeShipping = typeof item.free_shipping === 'boolean' ? item.free_shipping : (typeof item.has_free_shipping === 'boolean' ? item.has_free_shipping : (/free delivery|free shipping/i.test(shippingInfo) ? true : null));
    const shippingCurrency = String(item.shipping ?? item.delivery ?? '').match(/(?:₹|rs\.?\s*)\s*([\d,]+)/i);
    const explicitShipping = typeof item.shipping_cost === 'number' ? item.shipping_cost : (item.shipping_cost != null ? this.extractPrice(item.shipping_cost) : (shippingCurrency ? Number(shippingCurrency[1].replace(/,/g,'')) : null));
    const shippingCost = hasFreeShipping === true ? 0 : (explicitShipping ?? null);
      const codUnavailable = /\b(cod|cash on delivery)\b.{0,24}\b(not available|unavailable|not supported)\b/i.test(shippingInfo) || /\b(not available|unavailable|not supported)\b.{0,24}\b(cod|cash on delivery)\b/i.test(shippingInfo);
    const hasCOD = typeof item.cod_available === 'boolean' ? item.cod_available : (codUnavailable ? false : (/\bcod\b|cash on delivery/i.test(shippingInfo) ? true : null));
    const deliveryDays = Number.isFinite(Number(item.delivery_days)) && item.delivery_days != null && item.delivery_days !== '' ? Number(item.delivery_days) : this.estimateDelivery(shippingInfo);
    const discountValue = item.discount_percentage != null && item.discount_percentage !== '' ? Number(item.discount_percentage) : this.calculateDiscount(item);
    const discount = Number.isFinite(discountValue) ? discountValue : null;

    return {
      title: item.title || 'Unknown Product',
      price,
      rating,
      reviews,
      image,
      thumbnail: image,
      thumbnails: imageCandidates,
      originalUrl,
      link: originalUrl,
      platform,
      source: platform,
      shippingCost,
      hasFreeShipping,
      deliveryDays,
      hasCOD,
      discount,
      condition: item.condition || null,
      demo: false
    };
  }

  extractPrice(priceStr) {
    if (typeof priceStr === 'number') return Number.isFinite(priceStr) ? priceStr : null;
    // Handle ₹1,23,456 or Rs. 1234 or $12.34
    const cleaned = String(priceStr).replace(/(?:₹|Rs\.?|INR|\$)/gi, '').replace(/[\s,]/g, '');
    const match = cleaned.match(/[\d]+(?:\.\d+)?/);
    return match ? parseFloat(match[0]) : null;
  }

  identifyPlatform(source) {
    const s = (source || '').toLowerCase();
    if (s.includes('amazon')) return 'Amazon';
    if (s.includes('flipkart')) return 'Flipkart';
    if (s.includes('myntra')) return 'Myntra';
    if (s.includes('snapdeal')) return 'Snapdeal';
    if (s.includes('meesho')) return 'Meesho';
    if (s.includes('shopsy')) return 'Shopsy';
    if (s.includes('croma')) return 'Croma';
    if (s.includes('reliance digital')) return 'Reliance Digital';
    if (s.includes('jiomart')) return 'JioMart';
    if (s.includes('reliance')) return 'Reliance';
    if (s.includes('tata') || s.includes('cliq')) return 'Tata CLiQ';
    if (s.includes('nykaa')) return 'Nykaa';
    if (s.includes('ajio')) return 'AJIO';
    if (s.includes('vijay sales')) return 'Vijay Sales';
    return source || 'Online Store';
  }

  estimateDelivery(info) {
    if (info.includes('today') || info.includes('same day')) return 0;
    if (info.includes('tomorrow') || info.includes('1 day')) return 1;
    if (info.includes('2 day')) return 2;
    if (info.includes('3 day')) return 3;
    if (info.includes('4 day')) return 4;
    if (info.includes('5 day')) return 5;
    return null;
  }

  calculateDiscount(item) {
    if (item.old_price && item.extracted_price) {
      const oldPrice = this.extractPrice(item.old_price);
      const newPrice = this.extractPrice(item.extracted_price);
      if (oldPrice > newPrice && oldPrice > 0) {
        return Math.round(((oldPrice - newPrice) / oldPrice) * 100);
      }
    }
    const match = JSON.stringify(item).match(/(\d+)%\s*off/i);
    return match ? parseInt(match[1]) : null;
  }
}

module.exports = SerpApiClient;
