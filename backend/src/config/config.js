module.exports = {
  SERPAPI_KEY: process.env.SERPAPI_KEY,
  DEFAULT_COUNTRY: 'IN',
  DEFAULT_CURRENCY: 'INR'
};

// Debug: Print API key (first 10 chars only for security)
console.log('🔑 API Key loaded:', process.env.SERPAPI_KEY ? process.env.SERPAPI_KEY.substring(0, 10) + '...' : 'NOT FOUND');