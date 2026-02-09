# Step 12: 최종 설계 블루프린트 및 백로그

> 방법론: 산출물 종합, Sprint Backlog 생성
> 상태: 완료

---

## 1. 설계 완성도 검증

| 단계 | 산출물 | 상태 | 비고 |
|------|--------|------|------|
| Step 1 | 문제 정의서, 도메인 맵, 용어 사전 | ✅ | 5 Whys, UI 분석 포함 |
| Step 2 | FR 명세서 (15개), NFR 리포트, SLO 매트릭스 | ✅ | MoSCoW, RTM 포함 |
| Step 3 | 레거시 분석 | SKIP | 그린필드 프로젝트 |
| Step 4 | C4 Context/Container, 아키텍처 결정 | ✅ | 모놀리스 선택 |
| Step 5 | ADR 6개, 기술 스택 명세서 | ✅ | React+Vite, Express, PG |
| Step 6 | ERD, 바운디드 컨텍스트, 애그리거트 4개 | ✅ | 이벤트 스토밍 완료 |
| Step 7 | API 17개 + SSE, 에러 코드 사전 | ✅ | Interface-First |
| Step 8 | 디렉토리 구조, 패턴 5개 | ✅ | State Machine, Repository 등 |
| Step 9 | AWS 인프라, CI/CD, Docker | ✅ | ~$31/월 |
| Step 10 | 보안 설계, IAM, OWASP 대응 | ✅ | JWT + Zod + Helmet |
| Step 11 | 로깅/메트릭/런북 | ✅ | 구조화된 JSON 로그 |

---

## 2. 시스템 블루프린트 요약

### 아키텍처 한눈에 보기

```
[고객 태블릿]     [관리자 브라우저]
    │ HTTPS            │ HTTPS
    ▼                  ▼
┌──────────────────────────────┐
│  React SPA (Vite + Zustand)  │  ← 고객용 + 관리자용
└──────────────┬───────────────┘
               │ REST + SSE
               ▼
┌──────────────────────────────┐
│  Express API (Node.js + TS)  │  ← JWT 인증, Zod 검증
│  ├─ /modules/auth            │
│  ├─ /modules/order + SSE     │
│  ├─ /modules/menu            │
│  ├─ /modules/session         │
│  └─ /modules/store           │
└──────────────┬───────────────┘
               │ Drizzle ORM
               ▼
┌──────────────────────────────┐
│  PostgreSQL 16               │  ← 주문, 메뉴, 세션, 이력
└──────────────────────────────┘

배포: Docker Compose → AWS EC2 (t3.small)
CI/CD: GitHub Actions
비용: ~$31/월
```

### 핵심 기술 결정 요약

| 결정 | 선택 | ADR |
|------|------|-----|
| 아키텍처 | 모놀리스 | Step 4 |
| 프론트엔드 | React 19 + Vite + Zustand | ADR-001, 002 |
| 백엔드 | Node.js 20 + Express 5 + TypeScript | ADR-003 |
| ORM | Drizzle | ADR-004 |
| DB | PostgreSQL 16 | ADR-005 |
| UI | Tailwind CSS + shadcn/ui | ADR-006 |
| 실시간 | SSE (Server-Sent Events) | Step 4 |
| 인증 | JWT (16시간) + bcrypt | Step 10 |
| 배포 | Docker + EC2 + GitHub Actions | Step 9 |

---

## 3. 개발 백로그

### Sprint 0: 프로젝트 셋업

| ID | 작업 | 예상 | 의존성 |
|----|------|------|--------|
| S0-1 | 모노레포 구조 생성 (server/ + client/) | 2h | - |
| S0-2 | TypeScript + ESLint + Prettier 설정 | 1h | S0-1 |
| S0-3 | Express 서버 보일러플레이트 | 2h | S0-2 |
| S0-4 | Drizzle ORM + PostgreSQL 연결 + 마이그레이션 설정 | 3h | S0-3 |
| S0-5 | DB 스키마 생성 (전체 ERD) | 3h | S0-4 |
| S0-6 | 공통 미들웨어 (에러 핸들링, requestId, 로깅) | 2h | S0-3 |
| S0-7 | React + Vite + Tailwind + shadcn/ui 셋업 (고객/관리자) | 3h | S0-1 |
| S0-8 | Docker Compose (dev 환경) | 2h | S0-4 |
| S0-9 | GitHub Actions CI 파이프라인 (lint + test + build) | 2h | S0-8 |
| S0-10 | 시드 데이터 (테스트 매장, 메뉴, 테이블) | 1h | S0-5 |

### Sprint 1: 인증 + 메뉴 조회 (Core Path 시작)

| ID | 작업 | 예상 | 의존성 | FR |
|----|------|------|--------|-----|
| S1-1 | 관리자 로그인 API (POST /auth/admin/login) | 3h | S0-6 | FR-A-001 |
| S1-2 | 테이블 로그인 API (POST /auth/table/login) | 3h | S0-6 | FR-C-001 |
| S1-3 | JWT 인증 미들웨어 + 역할 가드 | 3h | S1-1 | - |
| S1-4 | Rate Limiter (로그인 5회/5분) | 1h | S1-1 | NFR-SEC-006 |
| S1-5 | 메뉴 목록 API (GET /menu-items) | 2h | S1-3 | FR-C-002 |
| S1-6 | 카테고리 목록 API (GET /categories) | 1h | S1-3 | FR-C-002 |
| S1-7 | [FE] 테이블 로그인 화면 + 자동 로그인 | 4h | S1-2 | FR-C-001 |
| S1-8 | [FE] 고객 메뉴 목록 화면 (카테고리 탭, 카드 UI) | 5h | S1-5 | FR-C-002 |
| S1-9 | [FE] 관리자 로그인 화면 | 3h | S1-1 | FR-A-001 |

### Sprint 2: 주문 생성 + 장바구니

| ID | 작업 | 예상 | 의존성 | FR |
|----|------|------|--------|-----|
| S2-1 | 주문 생성 API (POST /orders) + 세션 자동 생성 | 5h | S1-3 | FR-C-004 |
| S2-2 | 주문 상태 머신 (State Machine 패턴) | 2h | S2-1 | FR-A-003 |
| S2-3 | 현재 세션 주문 내역 API (GET /orders) | 2h | S2-1 | FR-C-005 |
| S2-4 | SSE 매니저 구현 (Observer 패턴) | 4h | S0-3 | FR-A-002 |
| S2-5 | SSE 엔드포인트 (GET /admin/events) | 3h | S2-4, S1-3 | FR-A-002 |
| S2-6 | 주문 생성 시 SSE 이벤트 발행 | 2h | S2-1, S2-4 | FR-A-002 |
| S2-7 | [FE] 장바구니 (Zustand + persist) | 4h | S1-8 | FR-C-003 |
| S2-8 | [FE] 주문 확정 화면 + 성공/실패 처리 | 4h | S2-1 | FR-C-004 |
| S2-9 | [FE] 주문 내역 화면 | 3h | S2-3 | FR-C-005 |

### Sprint 3: 관리자 대시보드

| ID | 작업 | 예상 | 의존성 | FR |
|----|------|------|--------|-----|
| S3-1 | 전체 주문 조회 API (GET /admin/orders) | 2h | S2-1 | FR-A-002 |
| S3-2 | 주문 상태 변경 API (PATCH /admin/orders/:id/status) | 3h | S2-2 | FR-A-003 |
| S3-3 | 주문 삭제 API (DELETE /admin/orders/:id) | 2h | S2-1 | FR-A-004 |
| S3-4 | 테이블 목록 + 현황 API (GET /admin/tables) | 2h | S2-1 | FR-A-002 |
| S3-5 | 이용완료 API (POST /admin/tables/:id/complete) | 4h | S2-1 | FR-A-005 |
| S3-6 | 과거 내역 API (GET /admin/tables/:id/history) | 3h | S3-5 | FR-A-006 |
| S3-7 | [FE] 관리자 대시보드 (그리드 레이아웃 + SSE 실시간) | 8h | S3-1, S2-5 | FR-A-002 |
| S3-8 | [FE] 주문 상태 변경 + 삭제 UI | 3h | S3-2, S3-3 | FR-A-003, 004 |
| S3-9 | [FE] 이용완료 + 과거 내역 UI | 4h | S3-5, S3-6 | FR-A-005, 006 |

### Sprint 4: 메뉴 관리 + 다국어

| ID | 작업 | 예상 | 의존성 | FR |
|----|------|------|--------|-----|
| S4-1 | 메뉴 CRUD API (POST/PUT/DELETE /admin/menu-items) | 4h | S1-3 | FR-A-007 |
| S4-2 | 메뉴 상태 변경 API (PATCH /admin/menu-items/:id/status) | 2h | S4-1 | FR-A-008 |
| S4-3 | 카테고리 CRUD API | 2h | S1-3 | FR-A-007 |
| S4-4 | [FE] 관리자 메뉴 관리 화면 (테이블 + CRUD 폼) | 6h | S4-1 | FR-A-007 |
| S4-5 | [FE] 고객 다국어 전환 (한/영) | 3h | S1-8 | FR-C-006 |

### Sprint 5: 품질 + 배포

| ID | 작업 | 예상 | 의존성 | FR |
|----|------|------|--------|-----|
| S5-1 | 단위 테스트 (서비스 레이어) — 80%+ 커버리지 | 6h | S1~S4 | NFR-MAINT-001 |
| S5-2 | 통합 테스트 (API 엔드포인트) | 4h | S1~S4 | NFR-MAINT-001 |
| S5-3 | E2E 테스트 (고객 주문 흐름, 관리자 대시보드) | 5h | S1~S4 | NFR-MAINT-001 |
| S5-4 | Dockerfile + docker-compose.prod.yml | 2h | S0-8 | - |
| S5-5 | AWS EC2 + RDS 프로비저닝 | 3h | S5-4 | Step 9 |
| S5-6 | GitHub Actions CD (EC2 배포) | 3h | S5-5 | Step 9 |
| S5-7 | 구조화된 로깅 적용 | 2h | S0-6 | Step 11 |
| S5-8 | 보안 최종 체크리스트 검증 | 2h | 전체 | Step 10 |

---

## 4. 스프린트 요약

| 스프린트 | 목표 | 작업 수 | 예상 시간 |
|---------|------|---------|----------|
| Sprint 0 | 프로젝트 셋업 | 10 | ~21h |
| Sprint 1 | 인증 + 메뉴 조회 | 9 | ~25h |
| Sprint 2 | 주문 + 장바구니 + SSE | 9 | ~29h |
| Sprint 3 | 관리자 대시보드 | 9 | ~31h |
| Sprint 4 | 메뉴 관리 + 다국어 | 5 | ~17h |
| Sprint 5 | 테스트 + 배포 | 8 | ~27h |
| **합계** | | **50** | **~150h** |

---

## 5. 리스크 및 완화

| 리스크 | 확률 | 영향 | 완화 |
|--------|------|------|------|
| SSE 연결 안정성 | 중간 | 높음 | 자동 재연결 로직, Long Polling 폴백 준비 |
| 동시 주문 처리 성능 | 낮음 | 중간 | 부하 테스트 (Sprint 5), DB 인덱스 최적화 |
| 태블릿 브라우저 호환성 | 중간 | 중간 | Chrome/Safari 최신 2버전 타겟, E2E 테스트 |
| DB 마이그레이션 오류 | 낮음 | 높음 | Drizzle 마이그레이션 + 시드 데이터 스크립트 |

---

## 6. 전체 설계 산출물 인덱스

| 파일 | 내용 |
|------|------|
| `step-01-problem-definition.md` | 문제 정의, 5 Whys, 도메인 맵, 용어 사전 |
| `step-02-requirements-engineering.md` | FR 15개, NFR, SLO, MoSCoW, RTM |
| `step-03-legacy-analysis.md` | SKIP (그린필드) |
| `step-04-high-level-architecture.md` | C4 Context/Container, 모놀리스 결정 |
| `step-05-tech-stack-adr.md` | ADR 6개, 기술 스택 명세서 |
| `step-06-data-modeling-ddd.md` | ERD, 애그리거트 4개, 바운디드 컨텍스트 5개 |
| `step-07-api-contract.md` | API 17개 + SSE, 에러 코드 사전 |
| `step-08-design-patterns.md` | 디렉토리 구조, 패턴 5개, SOLID |
| `step-09-infra-deployment.md` | AWS 인프라, Docker, CI/CD |
| `step-10-security-governance.md` | IAM, OWASP, 보안 체크리스트 |
| `step-11-observability-sre.md` | 로깅, 메트릭, 런북 3개 |
| `step-12-blueprint-backlog.md` | 블루프린트, 백로그 50개, 스프린트 계획 |
