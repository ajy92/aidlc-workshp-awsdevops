# Services

## Service 1: Authentication Service
- **위치**: 각 앱의 API Routes 내부
- **책임**: JWT 토큰 발급/검증, bcrypt 비밀번호 검증
- **패턴**: Middleware 기반 인증 (adminAuth, tableAuth)
- **세션**: 16시간 JWT 만료

## Service 2: Order Orchestration Service
- **위치**: 각 앱의 API Routes 내부
- **책임**: 주문 생성 → DB 저장 → SSE 브로드캐스트
- **패턴**: Transaction 기반 (주문 + 주문항목 원자적 저장)
- **실시간**: SSE를 통해 관리자/고객에게 이벤트 전달

## Service 3: SSE Event Service
- **위치**: 각 앱의 API Routes 내부
- **책임**: SSE 연결 관리, 이벤트 브로드캐스트
- **이벤트 타입**:
  - `new_order` — 신규 주문 (관리자)
  - `status_update` — 주문 상태 변경 (고객 + 관리자)
  - `order_deleted` — 주문 삭제 (관리자)
  - `table_completed` — 테이블 이용 완료 (관리자)

## Service 4: Dashboard Analytics Service
- **위치**: admin-app API Routes 내부
- **책임**: 매출 집계, 고객 분석 데이터 생성
- **패턴**: SQL 집계 쿼리 기반 (GROUP BY period, menu, table 등)

## Service Interaction Flow

```
[고객 주문 플로우]
Customer App → tableAuth middleware → OrderService.createOrder()
  → DB INSERT (transaction) → SSE broadcast to admin-app
  → Response { orderId, totalAmount }

[관리자 상태 변경 플로우]
Admin App → adminAuth middleware → OrderManagementService.updateOrderStatus()
  → DB UPDATE → SSE broadcast to customer-app + admin-app
  → Response { success }

[대시보드 조회 플로우]
Admin App → adminAuth middleware → DashboardService.getSalesData()
  → SQL aggregate queries → Response { salesData }
```
