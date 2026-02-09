# Business Rules - customer-app

## BR-C1: 자동 로그인
- localStorage에 token/storeId/tableNumber/sessionId 저장
- 앱 진입 시 token 존재하면 자동으로 메뉴 화면 표시
- token 만료(16h) 시 로그인 화면으로 리다이렉트

## BR-C2: 메뉴 필터링
- 기본 표시: `status = 'ON_SALE'` 메뉴만
- 카테고리 탭: 메인메뉴 / 사이드 메뉴 / 음료 → `category_id` 필터
- BEST 탭: `is_best = true` 필터
- 할인 탭: `is_discount = true` 필터
- 정렬: `sort_order ASC`

## BR-C3: 장바구니
- localStorage 키: `cart`
- 동일 메뉴 추가 시 수량 +1
- 수량 0 이하 시 항목 삭제
- 총 금액 = SUM(unit_price × quantity)
- 주문 확정 시에만 서버 전송

## BR-C4: 주문 생성
- API 호출: POST /api/orders { items: CartItem[] }
- 성공 시: 주문 번호 표시 → 5초 후 메뉴 화면 리다이렉트 + 장바구니 비우기
- 실패 시: 에러 메시지 표시 + 장바구니 유지

## BR-C5: 주문 내역
- 현재 session_id의 주문만 조회
- status != 'archived' 필터
- 시간 역순 정렬
- SSE로 상태 변경 실시간 수신
