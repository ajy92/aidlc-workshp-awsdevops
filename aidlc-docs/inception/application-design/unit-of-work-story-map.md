# Unit of Work - Story Map

## Story → Unit 매핑

| Story | Unit | 비고 |
|---|---|---|
| US-C1: 테이블 자동 로그인 | customer-app + shared-db | tables 테이블 필요 |
| US-C2: 메뉴 조회/카테고리 필터 | customer-app + shared-db | categories, menu_items 테이블 필요 |
| US-C3: 장바구니 관리 | customer-app | 클라이언트 전용 (localStorage) |
| US-C4: 주문 생성 | customer-app + shared-db | orders, order_items 테이블 필요 |
| US-C5: 주문 내역 조회 (실시간) | customer-app + shared-db | SSE + orders 조회 |
| US-A1: 매장 인증 | admin-app + shared-db | stores 테이블 필요 |
| US-A2: 실시간 주문 모니터링 | admin-app + shared-db | SSE + orders 조회 |
| US-A3: 테이블 관리 | admin-app + shared-db | tables, orders, order_history 필요 |
| US-A4: 메뉴 관리 | admin-app + shared-db | categories, menu_items CRUD |
| US-A5: 대시보드 | admin-app + shared-db | SQL 집계 쿼리 |

## Unit별 Story 요약

| Unit | Stories | 개수 |
|---|---|---|
| shared-db | 모든 Story의 DB 기반 | 10 (간접) |
| customer-app | US-C1 ~ US-C5 | 5 |
| admin-app | US-A1 ~ US-A5 | 5 |
