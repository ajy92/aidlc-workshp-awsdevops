# Build and Test Report

## Build Results

| Unit | Status | Notes |
|---|---|---|
| shared-db | ✅ PASS | schema.sql + seed.sql 검증 완료. bcrypt 해시 수정 (실제 비밀번호 매칭 확인) |
| customer-app | ✅ PASS | Next.js 14 빌드 성공. Pages 4개 + API Routes 5개 |
| admin-app | ✅ PASS | Next.js 14 빌드 성공. Pages 4개 + API Routes 14개 |

## Integration Verification

### 앱 간 연동 (Cross-App Communication)
- customer-app과 admin-app은 별도 Vercel 프로젝트로 배포되므로 인메모리 SSE는 앱 간 공유 불가
- **해결**: 양쪽 앱에 5초 간격 polling fallback 추가
  - admin-app: 고객 주문 생성 감지용
  - customer-app: 관리자 상태 변경 감지용
- 동일 앱 내 SSE는 정상 동작 (admin 내부 상태 변경 → admin SSE 클라이언트)

### DB 스키마 호환성
- customer-app과 admin-app 모두 동일 Supabase 인스턴스 사용
- 테이블/컬럼명 일치 확인 완료
- FK 관계 및 CASCADE 삭제 정상

### 인증 체계
- customer-app: tableLogin → JWT (storeId, tableNumber, sessionId)
- admin-app: adminLogin → JWT (storeId, storeName)
- 동일 JWT_SECRET 사용, 16시간 만료

### Seed Data 검증
- 매장 비밀번호 `admin123` → bcrypt 해시 매칭 확인
- 테이블 비밀번호 `1234` → bcrypt 해시 매칭 확인
- 데모 메뉴 10개, 카테고리 3개, 테이블 5개

## Bug Fixes Applied
1. **seed.sql bcrypt 해시 오류**: 기존 해시가 실제 비밀번호와 불일치 → 올바른 해시로 교체
2. **Polling fallback 추가**: 앱 간 실시간 동기화를 위한 5초 간격 폴링

## Deployment Checklist
- [ ] Supabase 프로젝트 생성 후 schema.sql → seed.sql 순서로 실행
- [ ] customer-app Vercel 배포 (환경변수: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, JWT_SECRET)
- [ ] admin-app Vercel 배포 (동일 환경변수)
- [ ] 두 앱의 JWT_SECRET 동일하게 설정
