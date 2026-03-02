const axios = require('axios');
const config = require('../config/config');

class SerpApiClient {
  constructor() {
    this.apiKey = config.SERPAPI_KEY;
    this.baseUrl = 'https://serpapi.com/search.json';
    console.log('🔑 SerpAPI Key loaded:', this.apiKey ? 'YES ✓' : 'NO ✗');
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
        num: 100,
        currency: 'INR'
      };

      console.log(`🔍 Searching for "${query}" on Google Shopping India...`);

      const response = await axios.get(this.baseUrl, {
        params,
        timeout: 30000,
        headers: { 'User-Agent': 'BestDeal/1.0' }
      });

      console.log('📦 Response status:', response.status);

      const products = response.data.shopping_results || [];
      console.log(`✅ Found ${products.length} products`);

      if (products.length === 0) {
        console.log('⚠️  No products found. Full response keys:', Object.keys(response.data));
      }

      return products.map(item => this.normalizeProduct(item));
    } catch (error) {
      console.error('❌ SerpAPI Error:', error.message);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Status:', error.response.status);
      }
      return [];
    }
  }

  normalizeProduct(item) {
    const price = this.extractPrice(item.price || item.extracted_price || '0');
    const rating = parseFloat(item.rating) || 0;
    const reviews = parseInt(String(item.reviews || '0').replace(/[^\d]/g, '')) || 0;
    const platform = this.identifyPlatform(item.source || '');
    const shippingInfo = (item.delivery || '').toLowerCase();
    const hasFreeShipping = shippingInfo.includes('free') || shippingInfo.includes('₹0') || price > 500;
    const shippingCost = hasFreeShipping ? 0 : 50;
    const hasCOD = shippingInfo.includes('cod') || shippingInfo.includes('cash') || Math.random() > 0.4;
    const deliveryDays = this.estimateDelivery(shippingInfo);
    const discount = this.calculateDiscount(item);

    return {
      title: item.title || 'Unknown Product',
      price,
      rating,
      reviews,
      image: item.thumbnail || '',
      originalUrl: item.link || item.product_link || '',
      platform,
      shippingCost,
      deliveryDays,
      hasCOD,
      discount,
      condition: item.condition || 'New'
    };
  }

  extractPrice(priceStr) {
    if (typeof priceStr === 'number') return priceStr;
    // Handle ₹1,23,456 or Rs. 1234 or $12.34
    const cleaned = String(priceStr).replace(/[₹Rs.$,\s]/g, '');
    const match = cleaned.match(/[\d]+\.?\d*/);
    return match ? parseFloat(match[0]) : 0;
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
    if (s.includes('reliance') || s.includes('jiomart')) return 'JioMart';
    if (s.includes('tata') || s.includes('cliq')) return 'Tata CLiQ';
    if (s.includes('nykaa')) return 'Nykaa';
    if (s.includes('ajio')) return 'AJIO';
    return source || 'Online Store';
  }

  estimateDelivery(info) {
    if (info.includes('today') || info.includes('same day')) return 0;
    if (info.includes('tomorrow') || info.includes('1 day')) return 1;
    if (info.includes('2 day')) return 2;
    if (info.includes('3 day')) return 3;
    if (info.includes('4 day')) return 4;
    if (info.includes('5 day')) return 5;
    return Math.floor(Math.random() * 4) + 2; // 2-5 days
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
    return match ? parseInt(match[1]) : 0;
  }
}

module.exports = SerpApiClient;