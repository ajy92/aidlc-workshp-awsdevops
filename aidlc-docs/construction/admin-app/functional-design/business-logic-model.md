# Business Logic Model - admin-app

## Page Flow
```
/login → (인증 성공) → / (주문 모니터링, SSE)
                          ↕ 사이드 네비게이션
                       /menu (메뉴 관리 CRUD)
                       /dashboard (매출/고객 분석)
```

## API Routes

| Route | Method | Auth | Logic |
|---|---|---|---|
| `/api/auth/admin-login` | POST | None | stores에서 store_id+username 조회 → bcrypt → JWT 발급 |
| `/api/orders` | GET | adminAuth | orders WHERE store_id=? AND status!='archived' + order_items JOIN |
| `/api/orders/stream` | GET | adminAuth | SSE — 매장 전체 주문 이벤트 |
| `/api/orders/[id]/status` | PUT | adminAuth | 상태 전이 검증 → UPDATE → SSE broadcast |
| `/api/orders/[id]` | DELETE | adminAuth | DELETE orders (CASCADE) → SSE broadcast |
| `/api/menu` | GET | adminAuth | 전체 메뉴 + 카테고리 (판매전 포함) |
| `/api/menu` | POST | adminAuth | INSERT menu_items (필드 검증) |
| `/api/menu/[id]` | PUT | adminAuth | UPDATE menu_items |
| `/api/menu/[id]` | DELETE | adminAuth | DELETE menu_items |
| `/api/tables` | GET | adminAuth | tables + 활성 주문 현황 |
| `/api/tables/[number]/complete` | POST | adminAuth | 이용 완료 트랜잭션 → SSE broadcast |
| `/api/tables/[number]/history` | GET | adminAuth | order_history WHERE table_number=? (날짜 필터) |
| `/api/dashboard/sales` | GET | adminAuth | SQL 집계 (기간/테이블/메뉴/시간대/카테고리) |
| `/api/dashboard/customers` | GET | adminAuth | SQL 집계 (세션 기반 방문/재방문) |

## SSE 이벤트 (발신)
- `new_order` — 신규 주문 발생
- `status_update` — 주문 상태 변경
- `order_deleted` — 주문 삭제
- `table_completed` — 테이블 이용 완료

## 인증 미들웨어 (adminAuth)
1. Authorization 헤더에서 Bearer token 추출
2. JWT 검증 (secret, 만료)
3. payload에서 storeId, storeName 추출
4. 실패 시 401 응답
