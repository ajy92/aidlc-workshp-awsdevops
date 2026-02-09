# Business Logic Model - customer-app

## Page Flow

```
/login → (자동 로그인 성공) → / (메뉴)
                                  ↕ (탭 전환)
                              /cart (장바구니)
                                  ↓ (주문 확정)
                              주문 성공 화면 (5초)
                                  ↓
                              / (메뉴)
                                  ↕ (탭 전환)
                              /orders (주문 내역, SSE)
```

## API Routes

| Route | Method | Auth | Logic |
|---|---|---|---|
| `/api/auth/table-login` | POST | None | bcrypt 비교 → session_id 확인/생성 → JWT 발급 |
| `/api/menu` | GET | tableAuth | menu_items WHERE store_id=? AND status='ON_SALE' + categories JOIN |
| `/api/orders` | POST | tableAuth | BEGIN TX → INSERT orders → INSERT order_items → COMMIT |
| `/api/orders` | GET | tableAuth | orders WHERE store_id=? AND session_id=? AND status!='archived' |
| `/api/orders/stream` | GET | tableAuth | SSE — 해당 세션의 주문 상태 변경 이벤트 |

## SSE 이벤트 (수신)
- `status_update` — { orderId, status } → 주문 내역 화면 실시간 업데이트

## 인증 미들웨어 (tableAuth)
1. Authorization 헤더에서 Bearer token 추출
2. JWT 검증 (secret, 만료)
3. payload에서 storeId, tableNumber, sessionId 추출
4. 실패 시 401 응답
