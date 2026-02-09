# Step 10: 보안 및 거버넌스 강화

> 방법론: Zero Trust 원칙, OWASP Top 10 대응
> 상태: 완료

---

## 1. 보안 아키텍처 개요

### 적용 수준

MVP 단일 매장 시스템으로 PII를 수집하지 않으므로, 실용적 보안 수준을 적용:

| 영역 | 적용 수준 | 근거 |
|------|----------|------|
| 인증 | JWT (16시간) | NFR-SEC-001 |
| 인가 | 역할 기반 (2개 역할) | 관리자 vs 테이블 |
| 데이터 암호화 | 전송 중 (HTTPS) | 저장 데이터 암호화 불필요 (PII 없음) |
| 입력 검증 | Zod 스키마 | 모든 API 입력 |
| 비밀번호 | bcrypt 해싱 | NFR-SEC-002 |
| Secrets | 환경 변수 (.env) | GitHub Secrets 연동 |

---

## 2. IAM 권한 매트릭스

### 역할 정의

| 역할 | 토큰 유형 | 만료 | 접근 범위 |
|------|----------|------|----------|
| ADMIN | JWT (관리자) | 16시간 | /api/v1/admin/*, /api/v1/auth/admin/* |
| TABLE | JWT (테이블) | 16시간 | /api/v1/orders, /api/v1/menu-items, /api/v1/categories |

### API 접근 제어 매트릭스

| 엔드포인트 | ADMIN | TABLE | 미인증 |
|-----------|-------|-------|--------|
| POST /auth/admin/login | - | - | O |
| POST /auth/table/login | - | - | O |
| GET /menu-items | O | O | X |
| GET /categories | O | O | X |
| POST /orders | X | O | X |
| GET /orders (현재 세션) | X | O | X |
| GET /admin/orders | O | X | X |
| PATCH /admin/orders/:id/status | O | X | X |
| DELETE /admin/orders/:id | O | X | X |
| GET /admin/tables | O | X | X |
| POST /admin/tables/:id/complete | O | X | X |
| GET /admin/tables/:id/history | O | X | X |
| POST /admin/menu-items | O | X | X |
| PUT /admin/menu-items/:id | O | X | X |
| DELETE /admin/menu-items/:id | O | X | X |
| GET /admin/events (SSE) | O | X | X |

---

## 3. 인증/인가 구현 설계

### JWT 토큰 구조

```typescript
// 관리자 토큰 페이로드
interface AdminTokenPayload {
  sub: string        // admin UUID
  role: "ADMIN"
  storeId: string
  iat: number
  exp: number        // +16시간
}

// 테이블 토큰 페이로드
interface TableTokenPayload {
  sub: string        // table UUID
  role: "TABLE"
  storeId: string
  tableId: string
  tableNumber: number
  iat: number
  exp: number        // +16시간
}
```

### 인증 미들웨어 체인

```
요청 → [CORS] → [Helmet] → [Rate Limit] → [JWT 검증] → [역할 검사] → Route Handler
```

| 미들웨어 | 책임 | 적용 |
|----------|------|------|
| CORS | 허용 오리진 제한 | 전체 |
| Helmet | HTTP 보안 헤더 설정 | 전체 |
| Rate Limiter | 요청 빈도 제한 | 로그인 엔드포인트 |
| JWT Verify | 토큰 유효성 검증 | 인증 필요 엔드포인트 |
| Role Guard | 역할 기반 접근 제어 | /admin/* 엔드포인트 |

---

## 4. OWASP Top 10 대응

| # | 위협 | 대응 | 구현 |
|---|------|------|------|
| A01 | Broken Access Control | 역할 기반 미들웨어, JWT storeId 검증 | roleGuard 미들웨어 |
| A02 | Cryptographic Failures | bcrypt 해싱, HTTPS 전송 | bcrypt (salt round 12) |
| A03 | Injection | Drizzle ORM 파라미터 바인딩, Zod 검증 | ORM 사용 (raw SQL 금지) |
| A04 | Insecure Design | API 설계 리뷰 (Step 7) | Interface-First 설계 |
| A05 | Security Misconfiguration | Helmet, CORS 제한, 불필요 헤더 제거 | helmet 미들웨어 |
| A06 | Vulnerable Components | npm audit, dependabot | CI/CD에 audit 포함 |
| A07 | Auth Failures | 로그인 시도 제한 (5회/5분), JWT 만료 | express-rate-limit |
| A08 | Data Integrity | 입력 검증 (Zod), 상태 전이 검증 | 스키마 검증 미들웨어 |
| A09 | Logging Failures | 인증 실패/권한 위반 로깅 | 구조화된 로깅 |
| A10 | SSRF | 외부 API 호출 없음 (MVP) | 해당 없음 |

---

## 5. 입력 검증 전략

### Zod 스키마 기반 검증

```typescript
// 모든 API 입력은 Zod 스키마로 검증
const createOrderSchema = z.object({
  items: z.array(z.object({
    menuItemId: z.string().uuid(),
    quantity: z.number().int().min(1).max(99)
  })).min(1).max(50)
})

const loginSchema = z.object({
  storeIdentifier: z.string().min(1).max(50).trim(),
  username: z.string().min(1).max(50).trim(),
  password: z.string().min(1).max(100)
})
```

### 검증 계층

| 계층 | 검증 내용 |
|------|----------|
| 프론트엔드 | 기본 형식 검증 (UX용, 보안 미신뢰) |
| API Route | Zod 스키마 검증 (필수) |
| Service | 비즈니스 규칙 검증 (상태 전이, 존재 여부) |
| DB | 제약 조건 (UK, FK, NOT NULL) |

---

## 6. Secrets 관리

| 시크릿 | 저장 위치 | 접근 |
|--------|----------|------|
| JWT_SECRET | GitHub Secrets → .env | API 서버 |
| DB_PASSWORD | GitHub Secrets → .env | API 서버, RDS |
| ADMIN 초기 비밀번호 | 시드 스크립트 (bcrypt 해시) | DB |
| 테이블 비밀번호 | DB (bcrypt 해시) | API 서버 |

### 시크릿 관리 규칙
- 소스 코드에 시크릿 하드코딩 금지
- .env 파일은 .gitignore에 포함
- GitHub Secrets로 CI/CD 파이프라인에서 주입
- JWT_SECRET은 최소 256비트 (32바이트)

---

## 7. 보안 체크리스트

### 커밋 전 체크리스트
- [ ] 하드코딩된 시크릿 없음
- [ ] 모든 API 입력이 Zod로 검증됨
- [ ] SQL 인젝션 방지 (ORM 파라미터 바인딩)
- [ ] XSS 방지 (React 자동 이스케이프 + Helmet CSP)
- [ ] JWT storeId로 매장 간 데이터 격리 확인
- [ ] 에러 메시지가 내부 정보 노출하지 않음

### 배포 전 체크리스트
- [ ] npm audit 결과 Critical/High 없음
- [ ] HTTPS 설정 확인
- [ ] CORS 허용 오리진 확인
- [ ] Rate Limiting 설정 확인
- [ ] 로그에 비밀번호/토큰 기록 안 됨

---

## 8. 핵심 질문 체크리스트

- [x] 인증/인가가 모든 엔드포인트에 적용되었는가? → 17개 엔드포인트 권한 매트릭스 정의
- [x] OWASP Top 10이 모두 대응되었는가? → 10개 항목 대응 완료
- [x] Secrets 관리 방안이 안전한가? → GitHub Secrets + .env
- [x] 입력 검증이 서버 측에서 수행되는가? → Zod 스키마 검증
- [x] 보안 헤더가 설정되었는가? → Helmet 미들웨어

---

## 9. 다음 단계

- **보안 설계** → Step 11 (보안 이벤트 모니터링)
- **IAM 매트릭스** → Step 12 (백로그 — 보안 구현 작업)
