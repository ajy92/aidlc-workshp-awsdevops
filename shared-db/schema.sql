-- ============================================
-- Table Order Service - Database Schema
-- Target: Supabase (PostgreSQL)
-- ============================================

-- 매장
CREATE TABLE IF NOT EXISTS stores (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 테이블
CREATE TABLE IF NOT EXISTS tables (
  id SERIAL PRIMARY KEY,
  store_id VARCHAR(50) NOT NULL REFERENCES stores(id),
  table_number INTEGER NOT NULL,
  password VARCHAR(255) NOT NULL,
  session_id VARCHAR(50),
  session_started_at TIMESTAMP,
  UNIQUE(store_id, table_number)
);

-- 카테고리
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  store_id VARCHAR(50) NOT NULL REFERENCES stores(id),
  name VARCHAR(50) NOT NULL,
  sort_order INTEGER DEFAULT 0
);

-- 메뉴
CREATE TABLE IF NOT EXISTS menu_items (
  id SERIAL PRIMARY KEY,
  store_id VARCHAR(50) NOT NULL REFERENCES stores(id),
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  name VARCHAR(100) NOT NULL,
  price INTEGER NOT NULL CHECK (price >= 0 AND price <= 10000000),
  description TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  status VARCHAR(10) NOT NULL DEFAULT 'ON_SALE' CHECK (status IN ('ON_SALE', 'NOT_YET')),
  is_best BOOLEAN DEFAULT FALSE,
  is_discount BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 주문
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  store_id VARCHAR(50) NOT NULL REFERENCES stores(id),
  table_number INTEGER NOT NULL,
  session_id VARCHAR(50) NOT NULL,
  total_amount INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'completed', 'archived')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 주문 항목
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id INTEGER NOT NULL,
  menu_name VARCHAR(100) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price INTEGER NOT NULL
);

-- 주문 이력
CREATE TABLE IF NOT EXISTS order_history (
  id SERIAL PRIMARY KEY,
  store_id VARCHAR(50) NOT NULL,
  table_number INTEGER NOT NULL,
  session_id VARCHAR(50) NOT NULL,
  order_data JSONB NOT NULL,
  total_amount INTEGER NOT NULL,
  completed_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_orders_store_session ON orders(store_id, session_id);
CREATE INDEX IF NOT EXISTS idx_orders_store_status ON orders(store_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_store_created ON orders(store_id, created_at);
CREATE INDEX IF NOT EXISTS idx_menu_items_store_status ON menu_items(store_id, status);
CREATE INDEX IF NOT EXISTS idx_menu_items_store_best ON menu_items(store_id, is_best);
CREATE INDEX IF NOT EXISTS idx_menu_items_store_discount ON menu_items(store_id, is_discount);
CREATE INDEX IF NOT EXISTS idx_order_history_store_table ON order_history(store_id, table_number, completed_at);
