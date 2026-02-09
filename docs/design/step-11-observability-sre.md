# Step 11: 가시성 및 운영 효율성 설계 (SRE/Observability)

> 방법론: Observability 3 Pillars (Logs, Metrics, Traces)
> 상태: 완료

---

## 1. 관찰성 3대 축

### MVP 적용 수준

| 축 | 적용 수준 | 도구 | 근거 |
|----|----------|------|------|
| 로깅 (Logs) | 구조화된 JSON 로그 | winston / pino | 필수 — 디버깅 기반 |
| 메트릭 (Metrics) | 기본 헬스체크 + 커스텀 카운터 | /health 엔드포인트 | SLO 측정 |
| 트레이싱 (Traces) | 요청 ID (requestId) 기반 | 미들웨어 UUID 생성 | 단일 서비스 (분산 추적 불필요) |

> MVP 모놀리스에서는 분산 트레이싱(Jaeger/Zipkin) 불필요. requestId 기반 로그 추적으로 충분.

---

## 2. 로깅 전략

### 로그 포맷 (구조화된 JSON)

```json
{
  "timestamp": "2026-02-09T10:30:00.000Z",
  "level": "ERROR",
  "requestId": "req_abc123",
  "method": "POST",
  "path": "/api/v1/orders",
  "storeId": "store_xyz",
  "tableNumber": 3,
  "message": "주문 생성 실패 — 품절 메뉴 포함",
  "error": {
    "code": "MENU_SOLD_OUT",
    "menuItemId": "menu_456"
  },
  "duration": 45
}
```

### 로그 레벨 정의

| 레벨 | 용도 | 예시 |
|------|------|------|
| ERROR | 요청 실패, 예외 | 주문 생성 실패, DB 연결 오류 |
| WARN | 비정상이지만 계속 동작 | SSE 클라이언트 비정상 종료, Rate limit 임계치 |
| INFO | 주요 비즈니스 이벤트 | 주문 생성, 세션 종료, 관리자 로그인 |
| DEBUG | 상세 디버깅 (프로덕션 OFF) | SQL 쿼리, 요청 파라미터 |

### 로깅 대상

| 이벤트 | 레벨 | 포함 데이터 |
|--------|------|------------|
| API 요청/응답 | INFO | method, path, status, duration, requestId |
| 인증 실패 | WARN | storeId, username(해시), IP, 실패 사유 |
| 주문 생성 | INFO | orderId, tableNumber, itemCount, totalAmount |
| 주문 상태 변경 | INFO | orderId, oldStatus, newStatus |
| 세션 종료 | INFO | tableId, sessionId, archivedCount |
| 서버 에러 | ERROR | requestId, error stack, context |
| SSE 연결/해제 | INFO | clientId, storeId |

### 민감 데이터 마스킹

| 필드 | 마스킹 규칙 |
|------|------------|
| password | 로그에 절대 포함하지 않음 |
| JWT 토큰 | 앞 10자만 표시 (`eyJhbGci...`) |
| IP 주소 | 마지막 옥텟 마스킹 (`192.168.1.xxx`) |

---

## 3. 메트릭 수집

### SLI 메트릭 (Step 2 SLO 연계)

| SLI | 측정 방법 | 수집 지점 | SLO 기준 |
|-----|----------|----------|---------|
| API 가용성 | 2xx 응답 비율 | Express 미들웨어 | 99.5% |
| API 응답 시간 | 요청~응답 소요 시간 | Express 미들웨어 | p99 < 500ms |
| 주문 API 응답 시간 | POST /orders 소요 시간 | Order Route | p99 < 1000ms |
| SSE 전달 지연 | 이벤트 발행→클라이언트 수신 | SSE Manager | < 2초 |

### 헬스체크 엔드포인트

```typescript
// GET /api/v1/health
{
  status: "ok" | "degraded" | "down",
  timestamp: "2026-02-09T10:00:00Z",
  checks: {
    database: { status: "ok", responseTime: 5 },
    sseClients: { count: 3 }
  },
  uptime: 86400
}
```

### 커스텀 카운터 (인메모리)

| 카운터 | 설명 | 리셋 주기 |
|--------|------|----------|
| orders_created_total | 생성된 주문 수 | 서버 재시작 시 |
| orders_by_status | 상태별 주문 수 | 서버 재시작 시 |
| sse_clients_connected | 현재 SSE 연결 수 | 실시간 |
| auth_failures_total | 인증 실패 수 | 서버 재시작 시 |
| api_requests_total | 전체 API 요청 수 | 서버 재시작 시 |

> MVP에서는 Prometheus/Grafana 미구성. 로그 기반 메트릭 + 헬스체크로 운영.
> 향후 CloudWatch 또는 Prometheus 도입 가능.

---

## 4. 알림 전략

### 알림 조건

| 조건 | 심각도 | 알림 채널 | 대응 |
|------|--------|----------|------|
| 헬스체크 실패 (3회 연속) | Critical | 서버 로그 확인 | 서버 재시작 |
| API 에러율 > 5% (5분간) | High | 로그 모니터링 | 원인 분석 |
| SSE 연결 0개 (영업시간) | Medium | 로그 확인 | 브라우저/네트워크 확인 |
| 인증 실패 10회/분 | Medium | 로그 확인 | 브루트포스 의심 |

> MVP에서는 CloudWatch Alarm 또는 외부 모니터링 서비스 미구성.
> 로그 기반으로 수동 모니터링 (향후 자동화 도입).

---

## 5. 런북 (Runbook)

### RB-001: API 서버 다운

```markdown
증상: 헬스체크 실패, 고객/관리자 접속 불가
심각도: Critical
RTO: 30분

진단:
1. SSH로 EC2 접속
2. docker compose ps (컨테이너 상태 확인)
3. docker compose logs api --tail 100 (에러 로그 확인)

복구:
1. docker compose restart api
2. 헬스체크 확인: curl http://localhost:3000/api/v1/health
3. 실패 시: docker compose down && docker compose up -d
4. DB 문제 시: docker compose restart db → api 순서로 재시작

사후:
1. 에러 로그 분석
2. 근본 원인 식별 및 수정
```

### RB-002: DB 연결 실패

```markdown
증상: API 500 에러, 헬스체크 database: "down"
심각도: Critical
RTO: 30분

진단:
1. docker compose ps db (DB 컨테이너 상태)
2. docker compose logs db --tail 50
3. 디스크 사용량 확인: df -h

복구:
1. docker compose restart db
2. API 서버 헬스체크 확인
3. 디스크 부족 시: 오래된 로그 정리 후 재시작

사후:
1. DB 커넥션 풀 설정 확인
2. 디스크 사용량 모니터링 추가
```

### RB-003: SSE 연결 끊김

```markdown
증상: 관리자 대시보드에 실시간 업데이트 없음
심각도: Medium

진단:
1. 브라우저 개발자 도구 → Network → EventSource 확인
2. API 서버 로그에서 SSE 연결 이벤트 확인
3. curl -N http://localhost:3000/api/v1/admin/events (토큰 포함)

복구:
1. 브라우저 새로고침 (자동 재연결)
2. API 서버 재시작 (SSE 연결 초기화)

사후:
1. SSE 자동 재연결 로직 확인
2. 타임아웃 설정 확인
```

---

## 6. 핵심 질문 체크리스트

- [x] 로깅 포맷이 표준화되었는가? → 구조화된 JSON
- [x] SLO 측정을 위한 SLI 메트릭이 정의되었는가? → 4개 SLI 정의
- [x] 민감 데이터 마스킹이 적용되었는가? → password, JWT, IP
- [x] 런북이 주요 장애 시나리오를 커버하는가? → 3개 런북
- [x] 알림 조건이 SLO와 연계되었는가? → 에러율, 헬스체크 기반

---

## 7. 다음 단계

- **모니터링 설계** → Step 12 (백로그 — 관찰성 구현 작업)
- **런북** → Step 12 (운영 매뉴얼 포함)
