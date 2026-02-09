# Step 7: API 스펙 및 컨트랙트 설계 (Interface-First)

> 방법론: Contract-First, OpenAPI 3.1
> 상태: 완료

---

## 1. API 스타일 결정

| 스타일 | 선택 | 근거 |
|--------|------|------|
| **REST** | 선택 | CRUD 중심, 범용 클라이언트(브라우저), 단순 |
| **SSE** | 선택 | 서버→클라이언트 단방향 실시간 (주문 알림) |
| GraphQL | 미선택 | 단순 도메인에 과도, 캐싱 복잡 |
| WebSocket | 미선택 | 양방향 불필요, SSE로 충분 |

---

## 2. 공통 규약

### URL 구조
```
/api/v1/{resource}
```
- 명사 복수형: `/api/v1/orders`, `/api/v1/menu-items`
- 계층 관계: `/api/v1/stores/{storeId}/tables`
- 최대 깊이: 3단계
- 필터/정렬: 쿼리 파라미터 (`?status=PENDING&sort=-createdAt`)

### 표준 응답 형식

```typescript
// 성공 응답
interface ApiSuccessResponse<T> {
  success: true
  data: T
  meta?: {
    total: number
    page: number
    limit: number
    hasNext: boolean
  }
}

// 에러 응답
interface ApiErrorResponse {
  success: false
  error: {
    code: string        // "ORDER_INVALID_STATUS"
    message: string     // "주문 상태 전이가 유효하지 않습니다"
    details?: Array<{
      field: string
      message: string
    }>
    requestId: string
  }
}
```

### 인증 헤더
```
Authorization: Bearer <JWT_TOKEN>
```
- 관리자 API: JWT 필수
- 고객 API: 테이블 토큰 (자동 로그인 후 발급)

---

## 3. API 엔드포인트 목록

### 3.1 인증 (Auth)

| 메서드 | 경로 | 설명 | 인증 | FR |
|--------|------|------|------|-----|
| POST | `/api/v1/auth/admin/login` | 관리자 로그인 | 불필요 | FR-A-001 |
| POST | `/api/v1/auth/table/login` | 테이블 로그인 | 불필요 | FR-C-001 |

#### POST /api/v1/auth/admin/login
```typescript
// Request
{
  storeIdentifier: string  // "store_abc123"
  username: string         // "admin"
  password: string         // "****"
}

// Response 200
{
  success: true,
  data: {
    token: string          // JWT (16시간 만료)
    store: {
      id: string
      name: string
      identifier: string
    }
  }
}
```

#### POST /api/v1/auth/table/login
```typescript
// Request
{
  storeIdentifier: string  // "store_abc123"
  tableNumber: number      // 3
  password: string         // "****"
}

// Response 200
{
  success: true,
  data: {
    token: string          // JWT (테이블용)
    store: { id: string, name: string }
    table: { id: string, tableNumber: number }
  }
}
```

---

### 3.2 메뉴 (Menu) — 고객용

| 메서드 | 경로 | 설명 | 인증 | FR |
|--------|------|------|------|-----|
| GET | `/api/v1/menu-items` | 메뉴 목록 조회 | 테이블 토큰 | FR-C-002 |
| GET | `/api/v1/categories` | 카테고리 목록 조회 | 테이블 토큰 | FR-C-002 |

#### GET /api/v1/menu-items
```typescript
// Query Parameters
{
  categoryId?: string    // 카테고리 필터
  lang?: "ko" | "en"    // 언어 (기본: ko)
}

// Response 200
{
  success: true,
  data: [
    {
      id: string,
      name: string,          // lang=ko → 한글명, lang=en → 영문명 (없으면 한글)
      description: string,
      price: number,         // 원 단위
      imageUrl: string | null,
      status: "ON_SALE" | "SOLD_OUT",
      categoryId: string,
      categoryName: string,
      sortOrder: number
    }
  ]
}
```

---

### 3.3 주문 (Order) — 고객용

| 메서드 | 경로 | 설명 | 인증 | FR |
|--------|------|------|------|-----|
| POST | `/api/v1/orders` | 주문 생성 | 테이블 토큰 | FR-C-004 |
| GET | `/api/v1/orders` | 현재 세션 주문 내역 | 테이블 토큰 | FR-C-005 |

#### POST /api/v1/orders
```typescript
// Request
{
  items: Array<{
    menuItemId: string
    quantity: number        // >= 1
  }>
}
// storeId, tableId, sessionId는 JWT에서 추출

// Response 201
{
  success: true,
  data: {
    id: string,
    orderNumber: number,    // 매장 내 순번
    items: Array<{
      menuItemId: string,
      menuName: string,
      quantity: number,
      unitPrice: number
    }>,
    totalAmount: number,
    status: "PENDING",
    createdAt: string       // ISO 8601
  }
}
```

#### GET /api/v1/orders
```typescript
// Query Parameters
// (storeId, tableId, sessionId는 JWT에서 추출)

// Response 200
{
  success: true,
  data: [
    {
      id: string,
      orderNumber: number,
      items: Array<{
        menuName: string,
        quantity: number,
        unitPrice: number
      }>,
      totalAmount: number,
      status: "PENDING" | "PREPARING" | "COMPLETED",
      createdAt: string
    }
  ]
}
```

---

### 3.4 주문 관리 (Order) — 관리자용

| 메서드 | 경로 | 설명 | 인증 | FR |
|--------|------|------|------|-----|
| GET | `/api/v1/admin/orders` | 전체 주문 조회 (대시보드) | 관리자 JWT | FR-A-002 |
| PATCH | `/api/v1/admin/orders/{orderId}/status` | 주문 상태 변경 | 관리자 JWT | FR-A-003 |
| DELETE | `/api/v1/admin/orders/{orderId}` | 주문 삭제 | 관리자 JWT | FR-A-004 |

#### PATCH /api/v1/admin/orders/{orderId}/status
```typescript
// Request
{
  status: "PREPARING" | "COMPLETED"
}

// Response 200
{
  success: true,
  data: {
    id: string,
    status: string,
    updatedAt: string
  }
}

// Error 422 — 유효하지 않은 상태 전이
{
  success: false,
  error: {
    code: "ORDER_INVALID_STATUS_TRANSITION",
    message: "COMPLETED에서 PREPARING으로 변경할 수 없습니다",
    requestId: "req_xxx"
  }
}
```

---

### 3.5 테이블/세션 관리 — 관리자용

| 메서드 | 경로 | 설명 | 인증 | FR |
|--------|------|------|------|-----|
| GET | `/api/v1/admin/tables` | 테이블 목록 + 현재 세션 현황 | 관리자 JWT | FR-A-002 |
| POST | `/api/v1/admin/tables/{tableId}/complete` | 이용완료 (세션 종료) | 관리자 JWT | FR-A-005 |
| GET | `/api/v1/admin/tables/{tableId}/history` | 과거 주문 내역 | 관리자 JWT | FR-A-006 |

#### POST /api/v1/admin/tables/{tableId}/complete
```typescript
// Request: 없음 (path parameter만)

// Response 200
{
  success: true,
  data: {
    tableId: string,
    sessionId: string,
    completedAt: string,
    archivedOrderCount: number
  }
}
```

#### GET /api/v1/admin/tables/{tableId}/history
```typescript
// Query Parameters
{
  startDate?: string    // "2026-02-01"
  endDate?: string      // "2026-02-09"
  page?: number         // 기본 1
  limit?: number        // 기본 20
}

// Response 200
{
  success: true,
  data: [
    {
      id: string,
      sessionId: string,
      orderNumber: number,
      orderItems: Array<{ menuName: string, quantity: number, unitPrice: number }>,
      totalAmount: number,
      orderedAt: string,
      archivedAt: string
    }
  ],
  meta: { total: number, page: number, limit: number, hasNext: boolean }
}
```

---

### 3.6 메뉴 관리 — 관리자용

| 메서드 | 경로 | 설명 | 인증 | FR |
|--------|------|------|------|-----|
| GET | `/api/v1/admin/menu-items` | 메뉴 목록 (관리용) | 관리자 JWT | FR-A-007 |
| POST | `/api/v1/admin/menu-items` | 메뉴 등록 | 관리자 JWT | FR-A-007 |
| PUT | `/api/v1/admin/menu-items/{id}` | 메뉴 수정 | 관리자 JWT | FR-A-007 |
| DELETE | `/api/v1/admin/menu-items/{id}` | 메뉴 삭제 | 관리자 JWT | FR-A-007 |
| PATCH | `/api/v1/admin/menu-items/{id}/status` | 판매 상태 변경 | 관리자 JWT | FR-A-008 |
| GET | `/api/v1/admin/categories` | 카테고리 목록 | 관리자 JWT | FR-A-007 |
| POST | `/api/v1/admin/categories` | 카테고리 등록 | 관리자 JWT | FR-A-007 |

#### POST /api/v1/admin/menu-items
```typescript
// Request
{
  name: string,          // 필수 (한글 메뉴명)
  nameEn?: string,       // 선택 (영문 메뉴명)
  description?: string,
  price: number,         // 필수, > 0
  categoryId: string,    // 필수
  imageUrl?: string,
  sortOrder?: number     // 기본 0
}

// Response 201
{
  success: true,
  data: {
    id: string,
    name: string,
    nameEn: string | null,
    description: string | null,
    price: number,
    categoryId: string,
    imageUrl: string | null,
    status: "ON_SALE",
    sortOrder: number,
    createdAt: string
  }
}
```

---

### 3.7 SSE (Server-Sent Events) — 실시간

| 메서드 | 경로 | 설명 | 인증 |
|--------|------|------|------|
| GET | `/api/v1/admin/events` | 관리자 실시간 이벤트 스트림 | 관리자 JWT |

#### GET /api/v1/admin/events
```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
```

#### SSE 이벤트 컨트랙트

```typescript
// 공통 이벤트 형식
interface SSEEvent {
  eventId: string       // UUID
  eventType: string     // "order.created" | "order.status_changed" | "order.deleted" | "session.completed"
  timestamp: string     // ISO 8601
  data: object          // 이벤트별 페이로드
}
```

| 이벤트 타입 | 발생 시점 | 페이로드 |
|------------|----------|---------|
| `order.created` | 고객 주문 생성 | `{ orderId, tableNumber, orderNumber, items, totalAmount }` |
| `order.status_changed` | 관리자 상태 변경 | `{ orderId, tableNumber, oldStatus, newStatus }` |
| `order.deleted` | 관리자 주문 삭제 | `{ orderId, tableNumber }` |
| `session.completed` | 이용완료 처리 | `{ tableId, tableNumber, sessionId, archivedCount }` |

---

## 4. 에러 코드 사전

### HTTP 상태 코드 매핑

| 상태 코드 | 의미 | 사용 시점 |
|-----------|------|----------|
| 200 | 성공 | 조회/수정 |
| 201 | 생성됨 | 주문/메뉴 생성 |
| 204 | 내용 없음 | 삭제 성공 |
| 400 | 잘못된 요청 | 입력 검증 실패 |
| 401 | 인증 필요 | 토큰 없음/만료 |
| 403 | 권한 없음 | 테이블 토큰으로 관리자 API 접근 |
| 404 | 찾을 수 없음 | 리소스 미존재 |
| 409 | 충돌 | 중복 데이터 |
| 422 | 처리 불가 | 비즈니스 규칙 위반 |
| 429 | 요청 과다 | 레이트 리밋 초과 |
| 500 | 서버 오류 | 예상치 못한 오류 |

### 도메인 에러 코드

| 코드 | 설명 | HTTP |
|------|------|------|
| AUTH_INVALID_CREDENTIALS | 잘못된 인증 정보 | 401 |
| AUTH_TOKEN_EXPIRED | JWT 만료 | 401 |
| AUTH_RATE_LIMITED | 로그인 시도 초과 (5회/5분) | 429 |
| ORDER_INVALID_STATUS_TRANSITION | 유효하지 않은 상태 전이 | 422 |
| ORDER_EMPTY_ITEMS | 주문 항목 없음 | 400 |
| ORDER_NOT_FOUND | 주문 미존재 | 404 |
| MENU_NOT_FOUND | 메뉴 미존재 | 404 |
| MENU_SOLD_OUT | 품절 메뉴 주문 시도 | 422 |
| MENU_DUPLICATE_NAME | 메뉴명 중복 | 409 |
| TABLE_NOT_FOUND | 테이블 미존재 | 404 |
| TABLE_NO_ACTIVE_SESSION | 활성 세션 없음 (이용완료 시도) | 422 |
| SESSION_NOT_FOUND | 세션 미존재 | 404 |
| VALIDATION_ERROR | 입력 검증 실패 | 400 |

---

## 5. API 버저닝 전략

### 선택: URL Path 버저닝
```
/api/v1/...
```

### 정책
- MVP는 v1 고정
- 브레이킹 체인지 시 v2 도입
- 이전 버전은 새 버전 출시 후 6개월간 유지
- Sunset 헤더: `Sunset: 2026-08-01`

---

## 6. 핵심 질문 체크리스트

- [x] 모든 엔드포인트가 문서화되었는가? → 17개 엔드포인트 + SSE 스트림
- [x] 에러 응답 형식이 표준화되었는가? → ApiErrorResponse 공통 형식
- [x] 페이지네이션 전략이 일관적인가? → page/limit 쿼리 파라미터 + meta 응답
- [x] 인증/인가 흐름이 API 스펙에 반영되었는가? → 관리자 JWT / 테이블 토큰 구분
- [x] 버저닝 전략이 명확한가? → URL Path v1

---

## 7. 다음 단계

- **API 스펙** → Step 8 (구현 패턴 결정)
- **SSE 이벤트 컨트랙트** → Step 9 (인프라 — SSE 연결 관리)
- **에러 코드 사전** → Step 11 (모니터링 알람 조건)
