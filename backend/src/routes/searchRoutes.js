const express = require('express');
const router = express.Router();

const SerpApiClient = require('../api/serpApiClient');
const MLService = require('../ml/mlService');

const serpApi = new SerpApiClient();
const mlService = new MLService();

// ✅ GET (not POST) — reads ?q= from URL params
router.get('/search', async (req, res) => {
  try {
    const { q, query, pincode } = req.query;
    const searchQuery = (q || query || '').trim();

    if (!searchQuery) {
      return res.status(400).json({
        success: false,
        error: 'Query is required. Use ?q=your+search+term'
      });
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`🔍 NEW SEARCH: "${searchQuery}" ${pincode ? `(Pincode: ${pincode})` : ''}`);
    console.log('='.repeat(60));

    let products = await serpApi.searchProducts(searchQuery, pincode);

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No products found for this query'
      });
    }

    console.log(`📦 Total products fetched: ${products.length}`);
    console.log('🚀 Starting ML Processing...');

    const processedProducts = await mlService.scoreDeal(products);

    // ✅ Normalize field names to match what App.jsx expects
    const normalized = processedProducts.map(p => ({
      title:               p.title || 'Unknown Product',
      price:               p.price || 0,
      thumbnail:           p.image || p.thumbnail || '',
      link:                p.originalUrl || p.link || '',
      source:              p.platform || p.source || 'Store',
      rating:              p.rating || 0,
      reviews:             p.reviews || 0,
      free_shipping:       p.shippingCost === 0 || p.hasFreeShipping || false,
      cod_available:       p.hasCOD || false,
      delivery_days:       p.deliveryDays || null,
      discount_percentage: p.discount || 0,
      deal_score:          p.dealScore || p.deal_score || 0,
    }));

    normalized.sort((a, b) => b.deal_score - a.deal_score);

    const best = normalized[0];

    console.log(`\n${'='.repeat(60)}`);
    console.log('🏆 BEST DEAL FOUND:');
    console.log(`   Title: ${best.title?.substring(0, 50)}`);
    console.log(`   Price: ₹${best.price}`);
    console.log(`   Score: ${best.deal_score}/100`);
    console.log(`   Platform: ${best.source}`);
    console.log('='.repeat(60) + '\n');

    res.json({
      success: true,
      query: searchQuery,
      totalResults: normalized.length,
      currency: 'INR',
      country: 'India',
      products: normalized,
      bestDeal: {
        title: best.title,
        price: best.price,
        dealScore: best.deal_score,
        platform: best.source
      }
    });

  } catch (error) {
    console.error('\n❌ SEARCH ERROR:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;