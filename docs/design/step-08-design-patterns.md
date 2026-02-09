# Step 8: 디자인 패턴 및 클린 코드 전략 (SOLID)

> 방법론: Clean Architecture, SOLID, Domain-Driven Design
> 상태: 완료

---

## 1. 계층형 아키텍처 설계

### 선택: Layered Architecture (실용적 간소화)

MVP 모놀리스에 맞게 Clean Architecture를 실용적으로 간소화:

```
┌─────────────────────────────────────────┐
│          Routes (Express Router)        │  ← HTTP 진입점, 입력 검증
├─────────────────────────────────────────┤
│          Services (비즈니스 로직)         │  ← 유스케이스, 트랜잭션 관리
├─────────────────────────────────────────┤
│          Repositories (데이터 접근)       │  ← Drizzle ORM 쿼리
├─────────────────────────────────────────┤
│          Database (PostgreSQL)          │  ← 영속성
└─────────────────────────────────────────┘
```

### 디렉토리 구조

```
server/
├── src/
│   ├── modules/                 # 도메인별 모듈 (바운디드 컨텍스트)
│   │   ├── auth/
│   │   │   ├── auth.routes.ts       # Express 라우터
│   │   │   ├── auth.service.ts      # 비즈니스 로직
│   │   │   ├── auth.repository.ts   # DB 접근
│   │   │   └── auth.schema.ts       # Zod 검증 스키마
│   │   ├── order/
│   │   │   ├── order.routes.ts
│   │   │   ├── order.service.ts
│   │   │   ├── order.repository.ts
│   │   │   ├── order.schema.ts
│   │   │   └── order.events.ts      # SSE 이벤트 발행
│   │   ├── menu/
│   │   │   ├── menu.routes.ts
│   │   │   ├── menu.service.ts
│   │   │   ├── menu.repository.ts
│   │   │   └── menu.schema.ts
│   │   ├── session/
│   │   │   ├── session.routes.ts
│   │   │   ├── session.service.ts
│   │   │   └── session.repository.ts
│   │   └── store/
│   │       ├── store.routes.ts
│   │       ├── store.service.ts
│   │       └── store.repository.ts
│   ├── shared/                  # 공통 유틸리티
│   │   ├── middleware/          # 인증, 에러 핸들링, 검증
│   │   ├── errors/              # 커스텀 에러 클래스
│   │   ├── sse/                 # SSE 매니저
│   │   └── types/               # 공통 타입
│   ├── db/                      # 데이터베이스
│   │   ├── schema.ts            # Drizzle 스키마 정의
│   │   ├── migrations/          # 마이그레이션 파일
│   │   └── client.ts            # DB 커넥션
│   └── app.ts                   # Express 앱 설정
│
client/
├── src/
│   ├── customer/                # 고객용 앱
│   │   ├── pages/               # 페이지 컴포넌트
│   │   ├── components/          # UI 컴포넌트
│   │   ├── hooks/               # 커스텀 훅
│   │   └── stores/              # Zustand 스토어
│   ├── admin/                   # 관리자용 앱
│   │   ├── pages/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── stores/
│   └── shared/                  # 공통
│       ├── api/                 # API 클라이언트
│       ├── components/          # 공통 UI
│       └── types/               # 공통 타입
```

### 계층 간 의존성 규칙

```
Routes → Services → Repositories → Database
  │          │            │
  │          │            └── Drizzle ORM (인프라)
  │          └── 비즈니스 로직 (도메인)
  └── 입력 검증, 응답 변환 (프레젠테이션)
```

- Routes는 Services만 호출 (Repository 직접 접근 금지)
- Services는 여러 Repository를 조합 가능
- Repository는 Drizzle ORM만 사용 (SQL 직접 작성 최소화)

---

## 2. 도메인 복잡도 평가

| 컴포넌트 | 비즈니스 규칙 | 상태 전이 | 외부 의존 | 복잡도 |
|----------|-------------|----------|----------|--------|
| 주문 (Order) | 높음 (상태 전이, 금액 계산, 세션 연동) | 복잡 (3단계) | 세션, 메뉴 | **높음** |
| 세션 (Session) | 중간 (라이프사이클, 아카이빙) | 중간 (2단계) | 주문 | **중간** |
| 메뉴 (Menu) | 낮음 (CRUD + 상태) | 단순 (2단계) | 카테고리 | **낮음** |
| 인증 (Auth) | 낮음 (JWT 발급/검증) | 없음 | 매장/테이블 | **낮음** |
| 매장 (Store) | 낮음 (CRUD) | 없음 | 없음 | **낮음** |

---

## 3. 적용 디자인 패턴

| 패턴 | 적용 대상 | 목적 | 복잡도 근거 |
|------|----------|------|------------|
| **State Machine** | 주문 상태 전이 | PENDING→PREPARING→COMPLETED 전이 규칙 캡슐화 | Order 복잡도 높음 |
| **Repository** | 모든 데이터 접근 | Service와 DB 분리, 테스트 용이 | 전체 적용 |
| **Observer (EventEmitter)** | SSE 이벤트 발행 | 주문 생성/변경 시 관리자 대시보드 실시간 알림 | Order SSE 요구사항 |
| **Factory Function** | 주문 생성 | 주문 항목 검증 + 금액 계산 + 세션 연동 로직 캡슐화 | Order 복잡도 높음 |
| **Middleware Chain** | 인증/검증/에러 | Express 미들웨어 체인으로 횡단 관심사 분리 | Express 패턴 |

### 미적용 패턴 (YAGNI)

| 패턴 | 미적용 사유 |
|------|------------|
| CQRS | 읽기/쓰기 부하 차이 미미 (50 CCU) |
| Saga | 분산 트랜잭션 없음 (모놀리스) |
| Strategy | 가격 정책이 단순 (할인 없음, MVP) |
| Specification | 검색/필터가 단순 (카테고리 필터만) |
| DI Container | 함수형 의존성 주입으로 충분 (클래스 기반 DI 불필요) |

---

## 4. 주요 컴포넌트 구조

### 4.1 주문 상태 머신 (State Machine)

```typescript
// order.state-machine.ts
const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['PREPARING'],
  PREPARING: ['COMPLETED'],
  COMPLETED: [],
}

function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return ORDER_TRANSITIONS[from].includes(to)
}

function transitionOrderStatus(
  currentStatus: OrderStatus,
  newStatus: OrderStatus
): OrderStatus {
  if (!canTransition(currentStatus, newStatus)) {
    throw new InvalidStatusTransitionError(currentStatus, newStatus)
  }
  return newStatus
}
```

### 4.2 SSE 이벤트 매니저 (Observer)

```typescript
// shared/sse/sse-manager.ts
interface SSEClient {
  id: string
  storeId: string
  response: Response
}

class SSEManager {
  private readonly clients: Map<string, SSEClient> = new Map()

  addClient(client: SSEClient): void { ... }
  removeClient(clientId: string): void { ... }

  broadcast(storeId: string, event: SSEEvent): void {
    for (const client of this.clients.values()) {
      if (client.storeId === storeId) {
        client.response.write(
          `event: ${event.eventType}\n` +
          `data: ${JSON.stringify(event.data)}\n` +
          `id: ${event.eventId}\n\n`
        )
      }
    }
  }
}
```

### 4.3 주문 서비스 (Service Layer)

```typescript
// order/order.service.ts
function createOrderService(deps: {
  orderRepo: OrderRepository
  menuRepo: MenuRepository
  sessionRepo: SessionRepository
  sseManager: SSEManager
}) {
  return {
    async createOrder(input: CreateOrderInput): Promise<Order> {
      // 1. 메뉴 유효성 검증 (존재, 판매중)
      // 2. 활성 세션 확인 (없으면 자동 생성)
      // 3. 주문 생성 (금액 계산, 스냅샷 저장)
      // 4. SSE 이벤트 발행
      // (트랜잭션 내에서 실행)
    },

    async changeStatus(orderId: string, newStatus: OrderStatus): Promise<Order> {
      // 1. 주문 조회
      // 2. 상태 전이 검증 (State Machine)
      // 3. 상태 업데이트
      // 4. SSE 이벤트 발행
    },

    async deleteOrder(orderId: string): Promise<void> {
      // 1. 주문 조회
      // 2. 주문 삭제
      // 3. SSE 이벤트 발행
    }
  }
}
```

### 4.4 Repository 패턴

```typescript
// order/order.repository.ts
interface OrderRepository {
  findById(id: string): Promise<Order | null>
  findBySessionId(sessionId: string): Promise<Order[]>
  findByStoreId(storeId: string): Promise<Order[]>
  create(data: CreateOrderData): Promise<Order>
  updateStatus(id: string, status: OrderStatus): Promise<Order>
  delete(id: string): Promise<void>
}

function createOrderRepository(db: DrizzleDB): OrderRepository {
  return {
    async findById(id) {
      return db.query.orders.findFirst({ where: eq(orders.id, id) })
    },
    // ... 구현
  }
}
```

### 4.5 에러 처리 계층

```typescript
// shared/errors/domain-error.ts
class DomainError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number = 400
  ) {
    super(message)
  }
}

class InvalidStatusTransitionError extends DomainError {
  constructor(from: string, to: string) {
    super(
      'ORDER_INVALID_STATUS_TRANSITION',
      `${from}에서 ${to}로 변경할 수 없습니다`,
      422
    )
  }
}

class NotFoundError extends DomainError {
  constructor(resource: string, id: string) {
    super(
      `${resource.toUpperCase()}_NOT_FOUND`,
      `${resource}을(를) 찾을 수 없습니다: ${id}`,
      404
    )
  }
}
```

---

## 5. SOLID 원칙 적용 가이드

| 원칙 | 적용 방법 | 예시 |
|------|----------|------|
| **S**ingle Responsibility | 모듈별 routes/service/repository 분리 | order.service.ts는 주문 로직만 |
| **O**pen-Closed | Repository 인터페이스로 확장 가능 | DB 변경 시 구현체만 교체 |
| **L**iskov Substitution | DomainError 상속 체계 | InvalidStatusTransitionError는 DomainError로 대체 가능 |
| **I**nterface Segregation | 작은 인터페이스 (OrderRepository vs MenuRepository) | 각 모듈별 독립 인터페이스 |
| **D**ependency Inversion | Service가 Repository 인터페이스에 의존 | createOrderService(deps) 패턴 |

---

## 6. 핵심 질문 체크리스트

- [x] 도메인 레이어가 프레임워크에 의존하지 않는가? → Service 로직은 Express 무관
- [x] 모든 외부 의존성이 인터페이스로 추상화되었는가? → Repository 인터페이스 패턴
- [x] 각 컴포넌트의 책임이 명확하게 분리되었는가? → Routes/Service/Repository 3계층
- [x] 디자인 패턴이 과도하게 적용되지 않았는가? → 5개만 적용, YAGNI 준수
- [x] 의존성 방향이 일관적인가? → Routes → Services → Repositories

---

## 7. 다음 단계

- **디렉토리 구조** → Step 9 (컨테이너/배포 단위)
- **패턴 리스트** → Step 12 (백로그 복잡도 추정)
- **계층 구조** → Step 10 (보안 경계 — 미들웨어 체인)
