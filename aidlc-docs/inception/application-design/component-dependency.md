# Component Dependencies

## Dependency Matrix

| Component | Depends On | Communication |
|---|---|---|
| customer-app (Pages) | customer-app (API Routes) | HTTP (internal Next.js) |
| customer-app (API Routes) | Supabase PostgreSQL | TCP (pg connection) |
| customer-app (API Routes) | SSE Event Service | In-process |
| admin-app (Pages) | admin-app (API Routes) | HTTP (internal Next.js) |
| admin-app (API Routes) | Supabase PostgreSQL | TCP (pg connection) |
| admin-app (API Routes) | SSE Event Service | In-process |

## Data Flow

```
+------------------+                    +------------------+
|  customer-app    |                    |   admin-app      |
|                  |                    |                  |
|  [Pages/UI]      |                    |  [Pages/UI]      |
|       |          |                    |       |          |
|  [API Routes]    |                    |  [API Routes]    |
|       |          |                    |       |          |
|  [SSE Service]   |                    |  [SSE Service]   |
+--------+---------+                    +--------+---------+
         |                                       |
         +------------------+--------------------+
                            |
                            v
                  +---------+----------+
                  |  Supabase          |
                  |  PostgreSQL        |
                  |                    |
                  |  - stores          |
                  |  - tables          |
                  |  - categories      |
                  |  - menu_items      |
                  |  - orders          |
                  |  - order_items     |
                  |  - order_history   |
                  +--------------------+
```

## Cross-App Communication
- customer-app과 admin-app은 직접 통신하지 않음
- 공유 DB(Supabase)를 통해 데이터 동기화
- SSE는 각 앱 내부에서 독립적으로 관리
  - 고객 주문 생성 → DB 저장 → admin-app이 polling/SSE로 감지
  - 관리자 상태 변경 → DB 저장 → customer-app이 SSE로 감지

## 환경 변수 (공유)
- `DATABASE_URL` — Supabase PostgreSQL 연결 문자열
- `JWT_SECRET` — JWT 서명 키 (두 앱 동일)
- `NEXT_PUBLIC_API_URL` — 각 앱의 API base URL
