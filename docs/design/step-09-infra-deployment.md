# Step 9: 인프라 및 배포 전략 (IaC & AWS)

> 방법론: Infrastructure as Code, CI/CD
> 상태: 완료

---

## 1. 인프라 아키텍처

### 환경 구성

| 환경 | 용도 | 스펙 | 비용 등급 |
|------|------|------|----------|
| Development | 로컬 개발 | Docker Compose | 무료 |
| Production | 실서비스 | AWS (단일 인스턴스) | 낮음 |

> MVP 단계에서는 Staging 환경을 별도 구성하지 않음. Production 배포 전 로컬 E2E 테스트로 대체.

### 네트워크 토폴로지 (AWS)

```
┌─────────────────────────────────────────────────────┐
│  AWS VPC (10.0.0.0/16)                              │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │  Public Subnet (10.0.1.0/24) — AZ-a         │    │
│  │                                             │    │
│  │  ┌──────────────┐                           │    │
│  │  │ EC2 Instance │ ← API Server + Static     │    │
│  │  │ (t3.small)   │   React SPA 서빙           │    │
│  │  └──────────────┘                           │    │
│  │  ┌──────────────┐                           │    │
│  │  │ RDS (PG 16)  │ ← db.t3.micro            │    │
│  │  │ Single AZ    │                           │    │
│  │  └──────────────┘                           │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
│  Security Groups:                                   │
│  - EC2: 80, 443 (inbound), 5432 (to RDS)          │
│  - RDS: 5432 (from EC2 SG only)                   │
│                                                     │
└─────────────────────────────────────────────────────┘
         │
    ┌────┴─────┐
    │ Internet │ ← 고객 태블릿 / 관리자 브라우저
    └──────────┘
```

### MVP 인프라 비용 추정 (월)

| 서비스 | 스펙 | 예상 비용 |
|--------|------|----------|
| EC2 | t3.small (2 vCPU, 2GB RAM) | ~$15/월 |
| RDS | db.t3.micro (1 vCPU, 1GB RAM) | ~$13/월 |
| EBS | 20GB gp3 | ~$2/월 |
| 데이터 전송 | < 10GB/월 | ~$1/월 |
| **합계** | | **~$31/월** |

---

## 2. 컨테이너 전략

### Docker Compose (개발/배포 공용)

```yaml
# docker-compose.yml (간소화)
services:
  api:
    build: ./server
    ports: ["3000:3000"]
    environment:
      DATABASE_URL: postgres://...
      JWT_SECRET: ${JWT_SECRET}
    depends_on: [db]

  client:
    build: ./client
    ports: ["5173:80"]

  db:
    image: postgres:16-alpine
    volumes: [pgdata:/var/lib/postgresql/data]
    environment:
      POSTGRES_DB: tableorder
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}

volumes:
  pgdata:
```

### Dockerfile (API 서버)

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/app.js"]
```

---

## 3. CI/CD 파이프라인

### GitHub Actions 워크플로우

```
[Push to main]
      │
      ▼
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│   Lint +     │────>│  Unit +       │────>│  Build       │
│   Type Check │     │  Integration  │     │  Docker Image│
└─────────────┘     │  Tests        │     └──────────────┘
                    └──────────────┘            │
                                                ▼
                                    ┌──────────────────┐
                                    │  Deploy to EC2    │
                                    │  (docker compose) │
                                    └──────────────────┘
```

### 파이프라인 단계

| 단계 | 도구 | 실행 내용 | 실패 시 |
|------|------|----------|---------|
| Lint | ESLint | 코드 스타일 검사 | 파이프라인 중단 |
| Type Check | tsc --noEmit | TypeScript 타입 검증 | 파이프라인 중단 |
| Unit Test | Vitest | 단위/통합 테스트 + 커버리지 80%+ | 파이프라인 중단 |
| Build | Docker | 이미지 빌드 | 파이프라인 중단 |
| Deploy | SSH + docker compose | EC2에 배포 | 롤백 (이전 이미지) |

### 배포 전략: Rolling Deploy (단일 인스턴스)

```
1. SSH로 EC2 접속
2. docker compose pull (새 이미지)
3. docker compose up -d (재시작)
4. 헬스체크 확인 (GET /api/v1/health)
5. 실패 시 이전 이미지로 롤백
```

> MVP에서는 단일 인스턴스 Rolling Deploy. 다운타임 ~10초 수용 (99.5% SLO 내).

---

## 4. 환경 변수 관리

| 변수 | 설명 | 관리 방법 |
|------|------|----------|
| DATABASE_URL | DB 접속 URL | GitHub Secrets → EC2 .env |
| JWT_SECRET | JWT 서명 키 | GitHub Secrets → EC2 .env |
| DB_USER | DB 사용자명 | GitHub Secrets |
| DB_PASSWORD | DB 비밀번호 | GitHub Secrets |
| NODE_ENV | 실행 환경 | CI/CD에서 설정 |
| PORT | API 서버 포트 | 기본 3000 |

---

## 5. 헬스체크 & 모니터링 엔드포인트

```typescript
// GET /api/v1/health
{
  status: "ok",
  timestamp: "2026-02-09T10:00:00Z",
  checks: {
    database: "ok",      // DB 커넥션 확인
    uptime: 3600         // 초
  }
}
```

---

## 6. 핵심 질문 체크리스트

- [x] 인프라 비용이 MVP 예산에 적합한가? → ~$31/월
- [x] CI/CD 파이프라인이 테스트를 포함하는가? → Lint + Type + Unit + Build
- [x] 롤백 전략이 있는가? → 이전 Docker 이미지로 롤백
- [x] 환경 변수/시크릿 관리가 안전한가? → GitHub Secrets → .env
- [x] 헬스체크 엔드포인트가 정의되었는가? → /api/v1/health

---

## 7. 다음 단계

- **인프라 아키텍처** → Step 10 (보안 — Security Group, 네트워크)
- **CI/CD 워크플로우** → Step 12 (백로그 — DevOps 작업 항목)
- **환경 변수** → Step 10 (Secrets 관리)
