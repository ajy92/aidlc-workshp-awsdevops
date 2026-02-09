# Business Rules - admin-app

## BR-A1: 관리자 인증
- stores 테이블에서 store_id + username으로 조회
- bcrypt로 비밀번호 검증
- JWT 발급 (16시간 만료, payload: storeId, storeName)
- localStorage에 token/storeId/storeName 저장
- 만료 시 로그인 화면 리다이렉트

## BR-A2: 실시간 주문 모니터링
- SSE로 신규 주문/상태 변경/삭제/이용완료 이벤트 수신
- 테이블별 그리드 레이아웃, 각 카드에 총 주문액 + 최신 주문 미리보기
- 주문 상태 전이: pending → preparing → completed (역방향 불가)
- 신규 주문 시각적 강조 (2초 이내 표시)

## BR-A3: 테이블 관리
- 주문 삭제: 확인 팝업 → DELETE → 총 주문액 재계산
- 이용 완료: 확인 팝업 → 트랜잭션(order_history 저장 + orders archived + tables 리셋)
- 과거 내역: 테이블별 과거 주문 목록 (시간 역순, 날짜 필터)

## BR-A4: 메뉴 관리
- CRUD: 메뉴명(필수), 가격(필수, 0~10,000,000), 설명, 카테고리, 이미지URL, 상태, BEST/할인 플래그
- 카테고리별 조회 (전체 상태 포함)
- 삭제 시 확인 팝업

## BR-A5: 대시보드
- 매출: 일별/주별/월별 집계, 테이블별/메뉴별/시간대별/카테고리별 분석
- 고객: 세션 기반 방문 빈도, 재방문율
- 기간 비교: 전일/전주/전월 대비
