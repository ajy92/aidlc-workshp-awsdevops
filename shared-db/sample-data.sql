-- ============================================
-- 대시보드 분석용 샘플 데이터
-- 최근 30일간 다양한 주문 데이터
-- ============================================

DO $$
DECLARE
  v_order_id INTEGER;
  v_day INTEGER;
  v_hour INTEGER;
  v_table INTEGER;
  v_session TEXT;
  v_total INTEGER;
  v_ts TIMESTAMP;
  v_menu RECORD;
  v_qty INTEGER;
  v_items_total INTEGER;
  v_orders_per_day INTEGER;
  v_i INTEGER;
BEGIN
  -- 30일간 반복
  FOR v_day IN 0..29 LOOP
    -- 요일에 따라 주문 수 다르게 (주말 더 많이)
    IF EXTRACT(DOW FROM (NOW() - (v_day || ' days')::INTERVAL)) IN (0, 6) THEN
      v_orders_per_day := 8 + (random() * 6)::INT;  -- 주말 8~14건
    ELSE
      v_orders_per_day := 4 + (random() * 5)::INT;  -- 평일 4~9건
    END IF;

    FOR v_i IN 1..v_orders_per_day LOOP
      -- 랜덤 시간대 (11~21시, 점심/저녁 피크)
      v_hour := CASE
        WHEN random() < 0.35 THEN 11 + (random() * 2)::INT   -- 점심 11~13
        WHEN random() < 0.7 THEN 17 + (random() * 3)::INT    -- 저녁 17~20
        ELSE 14 + (random() * 2)::INT                         -- 오후 14~16
      END;

      v_table := 1 + (random() * 4)::INT;  -- 테이블 1~5
      v_session := 'sess-' || v_day || '-' || v_i || '-' || v_table;
      v_ts := (NOW() - (v_day || ' days')::INTERVAL)::DATE + (v_hour || ' hours')::INTERVAL + ((random() * 59)::INT || ' minutes')::INTERVAL;
      v_items_total := 0;

      -- 주문 생성 (임시 total 0)
      INSERT INTO orders (store_id, table_number, session_id, total_amount, status, created_at)
      VALUES ('demo', v_table, v_session, 0, 'completed', v_ts)
      RETURNING id INTO v_order_id;

      -- 랜덤 메뉴 2~5개 주문
      FOR v_menu IN
        SELECT id, name, price FROM menu_items
        WHERE store_id = 'demo' AND status = 'ON_SALE'
        ORDER BY random() LIMIT 2 + (random() * 3)::INT
      LOOP
        v_qty := 1 + (random() * 2)::INT;
        INSERT INTO order_items (order_id, menu_item_id, menu_name, quantity, unit_price)
        VALUES (v_order_id, v_menu.id, v_menu.name, v_qty, v_menu.price);
        v_items_total := v_items_total + (v_qty * v_menu.price);
      END LOOP;

      -- total_amount 업데이트
      UPDATE orders SET total_amount = v_items_total WHERE id = v_order_id;

      -- order_history에도 추가
      INSERT INTO order_history (store_id, table_number, session_id, order_data, total_amount, completed_at)
      VALUES ('demo', v_table, v_session,
        json_build_object('order_id', v_order_id, 'items_total', v_items_total)::JSONB,
        v_items_total, v_ts + INTERVAL '30 minutes');
    END LOOP;
  END LOOP;
END $$;
