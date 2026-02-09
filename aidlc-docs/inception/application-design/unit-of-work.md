# Unit of Work Definitions

## 분해 전략
Application Design에서 정의된 컴포넌트 구조를 기반으로 3개 Unit으로 분해.
각 Unit은 독립적으로 개발/배포 가능하며, 공유 DB 스키마를 통해 연결.

---

## Unit 1: shared-db (공유 데이터베이스)
- **Type**: Database Schema + Seed Data
- **책임**: PostgreSQL 스키마 정의, 마이그레이션, 시드 데이터
- **산출물**:
  - DB 스키마 (tables: stores, tables, categories, menu_items, orders, order_items, order_history)
  - 시드 데이터 스크립트 (데모 매장, 메뉴 10개, 테이블 5개)
  - Supabase 연결 설정
- **우선순위**: 1 (다른 Unit의 선행 조건)

## Unit 2: customer-app (고객용 앱)
- **Type**: Next.js 풀스택 앱
- **책임**: 고객 주문 여정 전체 (로그인→메뉴→장바구니→주문→내역)
- **산출물**:
  - Next.js 앱 (Pages + API Routes)
  - SSE 클라이언트 (주문 상태 실시간)
  - Vercel 배포 설정
- **우선순위**: 2 (shared-db 완료 후)

## Unit 3: admin-app (관리자용 앱)
- **Type**: Next.js 풀스택 앱
- **책임**: 관리자 여정 전체 (로그인→모니터링→테이블관리→메뉴관리→대시보드)
- **산출물**:
  - Next.js 앱 (Pages + API Routes)
  - SSE 서버/클라이언트 (실시간 주문)
  - 대시보드 차트/그래프
  - Vercel 배포 설정
- **우선순위**: 2 (shared-db 완료 후, customer-app과 병렬 가능)

## Code Organization (Greenfield)

```
/workshop/aidlc-workshp-awsdevops/
├── shared-db/
│   ├── schema.sql
│   ├── seed.sql
│   └── supabase-config.md
├── customer-app/
│   ├── package.json
│   ├── next.config.js
│   ├── src/
│   │   ├── app/           # Next.js App Router
│   │   ├── lib/           # DB 연결, 인증, SSE
│   │   └── components/    # UI 컴포넌트
│   └── vercel.json
├── admin-app/
│   ├── package.json
│   ├── next.config.js
│   ├── src/
│   │   ├── app/           # Next.js App Router
│   │   ├── lib/           # DB 연결, 인증, SSE
│   │   └── components/    # UI 컴포넌트
│   └── vercel.json
└── aidlc-docs/            # 문서만
```
