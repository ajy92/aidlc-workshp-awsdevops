# 테이블 오더 서비스

식당 테이블 주문 시스템으로, 고객이 테이블에서 직접 메뉴를 주문하고 관리자가 실시간으로 주문을 관리할 수 있는 웹 애플리케이션입니다.

## 배포 URL

| 앱 | URL |
|---|---|
| 고객 앱 | https://customer-app-flame.vercel.app |
| 관리자 앱 | https://admin-app-murex-three.vercel.app |

## 로그인 정보 (데모)

**고객 앱**
- 매장 ID: `demo`
- 테이블 번호: `1` ~ `5`
- 비밀번호: `1234`

**관리자 앱**
- 매장 ID: `demo`
- 아이디: `admin`
- 비밀번호: `admin123`

## 기술 스택

- **Frontend**: Next.js 14, React 18, Tailwind CSS v4, TypeScript
- **Backend**: Next.js API Routes (Serverless)
- **Database**: PostgreSQL (Supabase)
- **배포**: Vercel
- **인증**: JWT (bcrypt 비밀번호 해싱)
- **실시간**: SSE + Polling fallback

## 프로젝트 구조

```
├── customer-app/     # 고객용 Next.js 앱
├── admin-app/        # 관리자용 Next.js 앱
├── shared-db/        # DB 스키마 및 시드 데이터
├── requirements/     # 요구사항 문서
└── aidlc-docs/       # AI-DLC 산출물
```

## 주요 기능

### 고객 앱
- 테이블 로그인 (매장 ID + 테이블 번호 + 비밀번호)
- 카테고리별 메뉴 조회 (BEST/할인 필터)
- 장바구니 및 주문
- 주문 현황 실시간 확인

### 관리자 앱
- 관리자 로그인
- 주문 모니터링 (테이블 그리드 + 상세 모달)
- 주문 상태 관리 (대기 → 준비중 → 완료)
- 메뉴 CRUD (카테고리, 가격, 상태, BEST/할인 플래그)
- 대시보드
  - 매출 분석: 총 매출, 주문 건수, 평균 객단가, 테이블별/메뉴별/시간대별/카테고리별
  - 고객 분석: 방문 세션, 재방문율, 일별 추이 (이용 완료 기준, KST)
  - 일별 → 테이블별 → 메뉴별 드릴다운 상세 조회

## 환경 변수

각 앱의 `.env.local`에 설정:

```
NEXT_PUBLIC_SUPABASE_URL=<supabase-project-url>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<supabase-publishable-key>
JWT_SECRET=<jwt-secret>
```

## 로컬 실행

```bash
# customer-app
cd customer-app && npm install && npm run dev

# admin-app
cd admin-app && npm install && npm run dev
```

## AIDLC 워크샵

이 프로젝트는 AIDLC (AI-Driven Development Life Cycle) 워크샵에서 생성되었습니다. Inception → Construction → Operations 단계를 거쳐 AI 기반으로 설계 및 구현되었습니다.

## 라이선스

워크샵 교육용 프로젝트입니다.
