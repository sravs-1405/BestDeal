const assert = require('node:assert/strict');

process.env.SERPAPI_KEY = 'local-test-key';
const SerpApiClient = require('../src/api/serpApiClient');

async function main() {
  const previousFetch = global.fetch;
  const responseBody = {
    shopping_results: [{
      title: 'Sample Phone 128GB',
      product_id: 'phone-1',
      source: 'Amazon',
      product_link: 'https://www.google.com/shopping/product/phone-1',
      price: '₹20,000',
      extracted_price: 20000,
      thumbnail: 'https://images.example/phone.webp'
    }],
    categorized_shopping_results: [{
      title: 'Mobile phones',
      shopping_results: [
        { title: 'Sample Phone 128GB', product_id: 'phone-1', source: 'Amazon', product_link: 'https://www.google.com/shopping/product/phone-1', extracted_price: 20000 },
        { title: 'Other Phone 128GB', source: 'Flipkart', product_link: 'https://www.google.com/shopping/product/phone-2', extracted_price: 18000 }
      ]
    }],
    inline_shopping_results: [{
      title: 'Sample Phone 128GB',
      source: 'Amazon',
      link: 'https://www.amazon.in/dp/phone-1',
      extracted_price: 20000
    }, {
      title: 'Third Phone 128GB',
      source: 'Myntra',
      link: 'https://www.myntra.com/phone-3',
      extracted_price: 17000
    }]
  };
  global.fetch = async url => {
    const parsed = new URL(url);
    assert.equal(parsed.searchParams.get('engine'), 'google_shopping');
    assert.equal(parsed.searchParams.get('gl'), 'in');
    return { ok: true, status: 200, json: async () => responseBody };
  };

  try {
    const results = await new SerpApiClient().searchProducts('phone');
    assert.equal(results.length, 3, 'unique offers from all Shopping response groups should be returned');
    const amazon = results.find(item => item.platform === 'Amazon');
    assert.equal(amazon.originalUrl, 'https://www.amazon.in/dp/phone-1', 'prefer direct retailer link when present');
    assert.equal(amazon.image, 'https://images.example/phone.webp');
    assert.equal(amazon.hasCOD, null, 'do not invent COD');
    assert.equal(amazon.deliveryDays, null, 'do not invent delivery');
    assert.equal(results.some(item => item.platform === 'Flipkart'), true);
    assert.equal(results.some(item => item.platform === 'Myntra'), true);
    console.log('SerpApi adapter checks passed: India settings, merged unique offers, seller link, image and unknown facts.');
  } finally {
    global.fetch = previousFetch;
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});