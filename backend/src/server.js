const express = require('express');
const cors = require('cors');
require('dotenv').config();

const searchRoutes = require('./routes/searchRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ CORS - explicitly allow all localhost ports
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use(cors({ origin: '*', optionsSuccessStatus: 200 }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', version: '1.0', currency: 'INR', mlEnabled: true, timestamp: new Date().toISOString() });
});

// Routes
app.use('/api', searchRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route not found: ${req.method} ${req.url}` });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  res.status(500).json({ success: false, error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 BestDeal Backend Server');
  console.log('='.repeat(60));
  console.log(`📍 Server:    http://localhost:${PORT}`);
  console.log(`🔍 Search:    http://localhost:${PORT}/api/search?q=laptop`);
  console.log(`❤️  Health:    http://localhost:${PORT}/api/health`);
  console.log(`🇮🇳 Currency:  INR | Country: India`);
  console.log(`🤖 ML Models: Enabled`);
  console.log('='.repeat(60) + '\n');
  const path = require('path');

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../../frontend/dist')));

// Catch-all route - serve React app for any unknown route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/dist', 'index.html'));
});
});