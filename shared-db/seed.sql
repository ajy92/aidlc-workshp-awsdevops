-- ============================================
-- Table Order Service - Seed Data
-- Target: Supabase (PostgreSQL)
-- ============================================
-- 매장 비밀번호: admin123 / 테이블 비밀번호: 1234

-- 매장
INSERT INTO stores (id, name, username, password) VALUES
  ('demo', '데모 매장', 'admin', '$2b$10$.fNKw5qv8eInFyQvYcNXvOkmgjCF9vKFwSV4Wud3fPAs0ccoco7ou')
ON CONFLICT (id) DO NOTHING;

-- 카테고리
INSERT INTO categories (store_id, name, sort_order) VALUES
  ('demo', '메인메뉴', 1),
  ('demo', '사이드 메뉴', 2),
  ('demo', '음료', 3)
ON CONFLICT DO NOTHING;

-- 메뉴 (10개)
INSERT INTO menu_items (store_id, category_id, name, price, description, sort_order, status, is_best, is_discount) VALUES
  ('demo', 1, '김치찌개', 9000, '돼지고기 김치찌개', 1, 'ON_SALE', FALSE, FALSE),
  ('demo', 1, '된장찌개', 8000, '두부 된장찌개', 2, 'ON_SALE', FALSE, FALSE),
  ('demo', 1, '불고기', 13000, '양념 소불고기', 3, 'ON_SALE', TRUE, FALSE),
  ('demo', 1, '비빔밥', 10000, '야채 비빔밥', 4, 'ON_SALE', FALSE, FALSE),
  ('demo', 2, '계란말이', 5000, '부드러운 계란말이', 1, 'ON_SALE', FALSE, FALSE),
  ('demo', 2, '김치전', 7000, '바삭한 김치전', 2, 'ON_SALE', FALSE, TRUE),
  ('demo', 2, '떡볶이', 6000, '매콤 떡볶이', 3, 'ON_SALE', FALSE, FALSE),
  ('demo', 3, '콜라', 2000, '', 1, 'ON_SALE', FALSE, FALSE),
  ('demo', 3, '사이다', 2000, '', 2, 'ON_SALE', FALSE, FALSE),
  ('demo', 3, '맥주', 5000, '생맥주 500ml', 3, 'ON_SALE', TRUE, FALSE)
ON CONFLICT DO NOTHING;

-- 테이블 5개 (비밀번호: 1234)
INSERT INTO tables (store_id, table_number, password) VALUES
  ('demo', 1, '$2b$10$w47plkUJKpsph./HGmoggOghraDhcK2gjFbTWOaUaJQefTDWtkNNC'),
  ('demo', 2, '$2b$10$w47plkUJKpsph./HGmoggOghraDhcK2gjFbTWOaUaJQefTDWtkNNC'),
  ('demo', 3, '$2b$10$w47plkUJKpsph./HGmoggOghraDhcK2gjFbTWOaUaJQefTDWtkNNC'),
  ('demo', 4, '$2b$10$w47plkUJKpsph./HGmoggOghraDhcK2gjFbTWOaUaJQefTDWtkNNC'),
  ('demo', 5, '$2b$10$w47plkUJKpsph./HGmoggOghraDhcK2gjFbTWOaUaJQefTDWtkNNC')
ON CONFLICT DO NOTHING;
