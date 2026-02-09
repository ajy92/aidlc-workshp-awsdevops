-- 기존 샘플 주문 데이터 삭제
DELETE FROM order_history WHERE store_id = 'demo';
DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE store_id = 'demo');
DELETE FROM orders WHERE store_id = 'demo';

-- KST 기준 샘플 데이터 재생성
DO $$
DECLARE
  v_order_id INTEGER;
  v_day INTEGER;
  v_hour INTEGER;
  v_table INTEGER;
  v_session TEXT;
  v_ts TIMESTAMP;
  v_menu RECORD;
  v_qty INTEGER;
  v_items_total INTEGER;
  v_orders_per_day INTEGER;
  v_i INTEGER;
  v_now_kst TIMESTAMP := NOW() + INTERVAL '9 hours';
BEGIN
  FOR v_day IN 0..29 LOOP
    IF EXTRACT(DOW FROM (v_now_kst - (v_day || ' days')::INTERVAL)) IN (0, 6) THEN
      v_orders_per_day := 8 + (random() * 6)::INT;
    ELSE
      v_orders_per_day := 4 + (random() * 5)::INT;
    END IF;

    FOR v_i IN 1..v_orders_per_day LOOP
      -- KST 11~21시 → UTC로 저장 (-9h)
      v_hour := CASE
        WHEN random() < 0.35 THEN 11 + (random() * 2)::INT
        WHEN random() < 0.7 THEN 17 + (random() * 3)::INT
        ELSE 14 + (random() * 2)::INT
      END;

      v_table := 1 + (random() * 4)::INT;
      v_session := 'sess-' || v_day || '-' || v_i || '-' || v_table;
      -- KST 날짜 기준으로 계산 후 UTC로 변환 (-9h)
      v_ts := (v_now_kst - (v_day || ' days')::INTERVAL)::DATE
              + (v_hour || ' hours')::INTERVAL
              + ((random() * 59)::INT || ' minutes')::INTERVAL
              - INTERVAL '9 hours';
      v_items_total := 0;

      INSERT INTO orders (store_id, table_number, session_id, total_amount, status, created_at)
      VALUES ('demo', v_table, v_session, 0, 'completed', v_ts)
      RETURNING id INTO v_order_id;

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

      UPDATE orders SET total_amount = v_items_total WHERE id = v_order_id;

      INSERT INTO order_history (store_id, table_number, session_id, order_data, total_amount, completed_at)
      VALUES ('demo', v_table, v_session,
        json_build_object('order_id', v_order_id, 'items_total', v_items_total)::JSONB,
        v_items_total, v_ts + INTERVAL '30 minutes');
    END LOOP;
  END LOOP;
END $$;
