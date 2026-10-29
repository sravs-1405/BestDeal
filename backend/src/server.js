const express = require('express');
const path = require('path');  // ← moved to top
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const searchRoutes = require('./routes/searchRoutes');
const accountRoutes = require('./routes/accountRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// The frontend is served by this same process. Allow cross-origin access only
// when a separate trusted frontend origin is configured.
const corsOrigin = process.env.CORS_ORIGIN || '';
app.use((req, res, next) => {
  const origin = req.get('Origin');
  if (origin && corsOrigin && origin === corsOrigin) {
    res.header('Access-Control-Allow-Origin', corsOrigin);
    res.header('Vary', 'Origin');
    res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  }
  if (req.method === 'OPTIONS') return res.sendStatus(origin && origin !== corsOrigin ? 403 : 204);
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', version: '2.0', currency: 'INR', database: 'sqlite', demoMode: process.env.DEMO_MODE === 'true', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api', searchRoutes);
app.use('/api', accountRoutes.router);

app.get('/api/*', (req, res) => res.status(404).json({ success:false, error:`API route not found: ${req.path}` }));

// ✅ Serve Frontend - OUTSIDE app.listen
app.use(express.static(path.join(__dirname, '../../frontend/dist')));

// ✅ Catch-all - serve React for any non-API route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/dist', 'index.html'));
});

// 404 handler (optional, catch-all above handles it)
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
  console.log(`🔍 Search:    http://localhost:${PORT}`)
  console.log(`❤️  Health:    http://localhost:${PORT}`)
  console.log(`🇮🇳 Currency:  INR | Country: India`);
  console.log(`🤖 ML Models: Enabled`);
  console.log('='.repeat(60) + '\n');
});
