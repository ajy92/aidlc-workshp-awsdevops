-- Table Order System - Supabase DDL
-- Supabase SQL Editor에서 실행하세요

-- 1. stores
CREATE TABLE IF NOT EXISTS stores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_identifier VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. admins
CREATE TABLE IF NOT EXISTS admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES stores(id),
  username VARCHAR(50) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS admins_store_username_idx ON admins(store_id, username);

-- 3. table_info
CREATE TABLE IF NOT EXISTS table_info (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES stores(id),
  table_number INTEGER NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS table_info_store_number_idx ON table_info(store_id, table_number);

-- 4. categories
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES stores(id),
  name VARCHAR(50) NOT NULL,
  sort_order INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. menu_items
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES stores(id),
  category_id UUID NOT NULL REFERENCES categories(id),
  name VARCHAR(100) NOT NULL,
  name_en VARCHAR(100),
  description TEXT,
  price INTEGER NOT NULL,
  image_url VARCHAR(500),
  status VARCHAR(20) DEFAULT 'ON_SALE' NOT NULL,
  sort_order INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE INDEX IF NOT EXISTS menu_items_store_category_idx ON menu_items(store_id, category_id, sort_order);

-- 6. table_sessions
CREATE TABLE IF NOT EXISTS table_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES stores(id),
  table_id UUID NOT NULL REFERENCES table_info(id),
  status VARCHAR(20) DEFAULT 'ACTIVE' NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS table_sessions_store_table_status_idx ON table_sessions(store_id, table_id, status);

-- 7. orders
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES stores(id),
  table_id UUID NOT NULL REFERENCES table_info(id),
  session_id UUID NOT NULL REFERENCES table_sessions(id),
  order_number INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'PENDING' NOT NULL,
  total_amount INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE INDEX IF NOT EXISTS orders_store_session_idx ON orders(store_id, session_id, created_at);
CREATE INDEX IF NOT EXISTS orders_store_status_idx ON orders(store_id, status);

-- 8. order_items (CASCADE delete when order is deleted)
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL,
  menu_name VARCHAR(100) NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price INTEGER NOT NULL
);

-- 9. order_history
CREATE TABLE IF NOT EXISTS order_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES stores(id),
  table_id UUID NOT NULL REFERENCES table_info(id),
  session_id UUID NOT NULL,
  order_number INTEGER NOT NULL,
  order_items JSONB NOT NULL,
  total_amount INTEGER NOT NULL,
  ordered_at TIMESTAMPTZ NOT NULL,
  archived_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE INDEX IF NOT EXISTS order_history_store_table_archived_idx ON order_history(store_id, table_id, archived_at);
