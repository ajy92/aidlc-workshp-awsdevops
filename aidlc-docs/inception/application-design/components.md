# Application Components

## 시스템 구성도

```
+------------------+     +------------------+
|  customer-app    |     |   admin-app      |
|  (Next.js)       |     |   (Next.js)      |
|  Vercel 배포     |     |   Vercel 배포    |
+--------+---------+     +--------+---------+
         |                         |
         +----------+--------------+
                    |
                    v
         +----------+---------+
         |  Shared API Layer   |
         |  (Next.js API Routes|
         |   in each app)      |
         +----------+----------+
                    |
                    v
         +----------+----------+
         |  Supabase           |
         |  (PostgreSQL)       |
         +---------------------+
```

---

## Component 1: customer-app (고객용 앱)
- **Type**: Next.js 풀스택 앱
- **배포**: Vercel
- **책임**:
  - 테이블 자동 로그인 / 세션 관리
  - 메뉴 조회 및 카테고리 필터 (메인메뉴, 사이드, 음료, BEST, 할인)
  - 장바구니 관리 (로컬 저장)
  - 주문 생성 및 확인
  - 주문 내역 조회 (SSE 실시간 상태 업데이트)
- **Pages**:
  - `/` — 메뉴 화면 (기본)
  - `/cart` — 장바구니
  - `/orders` — 주문 내역
  - `/login` — 테이블 로그인 (초기 설정용)
- **API Routes**:
  - `POST /api/auth/table-login` — 테이블 인증
  - `GET /api/menu` — 메뉴 조회
  - `POST /api/orders` — 주문 생성
  - `GET /api/orders` — 주문 내역 조회
  - `GET /api/orders/stream` — SSE 주문 상태 스트림

## Component 2: admin-app (관리자용 앱)
- **Type**: Next.js 풀스택 앱
- **배포**: Vercel
- **책임**:
  - 매장 인증 (JWT 16시간)
  - 실시간 주문 모니터링 (SSE, 테이블별 그리드)
  - 테이블 관리 (주문 삭제, 이용 완료, 과거 내역)
  - 메뉴 관리 (CRUD, 상태, BEST/할인 플래그)
  - 대시보드 (매출 데이터, 고객 분석)
- **Pages**:
  - `/` — 주문 모니터링 대시보드
  - `/menu` — 메뉴 관리
  - `/dashboard` — 매출/고객 분석 대시보드
  - `/login` — 관리자 로그인
- **API Routes**:
  - `POST /api/auth/admin-login` — 관리자 인증
  - `GET /api/orders` — 주문 목록
  - `GET /api/orders/stream` — SSE 실시간 주문 스트림
  - `PUT /api/orders/[id]/status` — 주문 상태 변경
  - `DELETE /api/orders/[id]` — 주문 삭제
  - `GET/POST /api/menu` — 메뉴 조회/등록
  - `PUT/DELETE /api/menu/[id]` — 메뉴 수정/삭제
  - `GET/POST /api/categories` — 카테고리 관리
  - `GET /api/tables` — 테이블 목록
  - `POST /api/tables/[number]/complete` — 이용 완료
  - `GET /api/tables/[number]/history` — 과거 내역
  - `GET /api/dashboard/sales` — 매출 데이터
  - `GET /api/dashboard/customers` — 고객 분석

## Component 3: Shared DB Layer (Supabase)
- **Type**: Managed PostgreSQL (Supabase)
- **책임**:
  - 데이터 영속성 (매장, 테이블, 메뉴, 주문, 주문이력)
  - 데이터 무결성 (FK, 제약조건)
- **접근**: 두 앱 모두 동일한 Supabase 인스턴스에 연결
