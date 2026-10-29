// Render/.env values sometimes arrive with spaces or quote marks around them,
// which makes SerpApi answer "Invalid API key". Clean the key before using it.
const cleanKey = value => String(value || '').trim().replace(/^["']+|["']+$/g, '').trim();

module.exports = {
  SERPAPI_KEY: cleanKey(process.env.SERPAPI_KEY),
  DEFAULT_COUNTRY: 'IN',
  DEFAULT_CURRENCY: 'INR'
};