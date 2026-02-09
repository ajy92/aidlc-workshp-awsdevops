# Business Logic Model - shared-db

## 데이터 흐름

```
[고객 주문 플로우]
1. 테이블 로그인 → tables 조회 → session_id 확인/생성
2. 메뉴 조회 → menu_items WHERE status='ON_SALE' + categories JOIN
3. 주문 생성 → BEGIN TX → INSERT orders → INSERT order_items → COMMIT
4. 주문 내역 → orders WHERE session_id=? AND status!='archived'

[관리자 관리 플로우]
5. 주문 상태 변경 → UPDATE orders SET status=?
6. 주문 삭제 → DELETE orders (CASCADE order_items)
7. 이용 완료 → BEGIN TX → INSERT order_history → UPDATE orders archived → UPDATE tables reset → COMMIT
8. 메뉴 CRUD → INSERT/UPDATE/DELETE menu_items

[대시보드 집계 플로우]
9. 매출 집계 → SELECT SUM/COUNT/AVG FROM orders GROUP BY date/menu/table
10. 고객 분석 → SELECT COUNT(DISTINCT session_id) FROM orders GROUP BY date
```

## 인덱스 전략
- `orders(store_id, session_id)` — 세션별 주문 조회
- `orders(store_id, status)` — 활성 주문 조회
- `orders(store_id, created_at)` — 대시보드 시간 기반 집계
- `menu_items(store_id, status)` — 판매중 메뉴 조회
- `menu_items(store_id, is_best)` — BEST 필터
- `menu_items(store_id, is_discount)` — 할인 필터
- `order_history(store_id, table_number, completed_at)` — 과거 내역 조회

## 시드 데이터 명세
- **매장**: id='demo', name='데모 매장', username='admin', password=bcrypt('admin123')
- **카테고리**: 메인메뉴(sort:1), 사이드 메뉴(sort:2), 음료(sort:3)
- **메뉴 10개**:
  | 메뉴명 | 카테고리 | 가격 | 상태 | BEST | 할인 |
  |---|---|---|---|---|---|
  | 김치찌개 | 메인메뉴 | 9,000 | ON_SALE | N | N |
  | 된장찌개 | 메인메뉴 | 8,000 | ON_SALE | N | N |
  | 불고기 | 메인메뉴 | 13,000 | ON_SALE | Y | N |
  | 비빔밥 | 메인메뉴 | 10,000 | ON_SALE | N | N |
  | 계란말이 | 사이드 메뉴 | 5,000 | ON_SALE | N | N |
  | 김치전 | 사이드 메뉴 | 7,000 | ON_SALE | N | Y |
  | 떡볶이 | 사이드 메뉴 | 6,000 | ON_SALE | N | N |
  | 콜라 | 음료 | 2,000 | ON_SALE | N | N |
  | 사이다 | 음료 | 2,000 | ON_SALE | N | N |
  | 맥주 | 음료 | 5,000 | ON_SALE | Y | N |
- **테이블 5개**: table_number 1~5, password=bcrypt('1234')
