const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const dataDir = process.env.DATA_DIR || path.join(__dirname, '..', '..', 'data');
fs.mkdirSync(dataDir, { recursive: true });
const db = new DatabaseSync(path.join(dataDir, 'bestdeal.sqlite'));
db.exec(`PRAGMA journal_mode = WAL;
CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS search_cache (cache_key TEXT PRIMARY KEY, payload TEXT NOT NULL, fetched_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS products (id TEXT PRIMARY KEY, title TEXT NOT NULL, payload TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS price_snapshots (id INTEGER PRIMARY KEY, product_id TEXT NOT NULL, price REAL NOT NULL, captured_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS wishlist (id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL, product_id TEXT NOT NULL, snapshot TEXT NOT NULL, created_at TEXT NOT NULL, UNIQUE(user_id,product_id));
CREATE TABLE IF NOT EXISTS comparisons (id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL, snapshot TEXT NOT NULL, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS preferences (user_id INTEGER PRIMARY KEY, payload TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS survey_pool (id INTEGER PRIMARY KEY, left_product TEXT NOT NULL, right_product TEXT NOT NULL, left_features TEXT, right_features TEXT, winner INTEGER, created_at TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS idx_price_snapshots_product_time ON price_snapshots(product_id,captured_at);`);
module.exports = { db, dataDir };
