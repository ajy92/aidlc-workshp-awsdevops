# Business Rules - shared-db

## BR-1: 메뉴 상태 규칙
- 메뉴 status는 `ON_SALE` 또는 `NOT_YET`만 허용
- 고객 조회 시 `status = 'ON_SALE'` 필터 적용
- 관리자 조회 시 모든 상태 표시

## BR-2: 가격 검증
- price >= 0 AND price <= 10,000,000 (1천만원)
- 정수형 (원 단위)

## BR-3: 주문 상태 전이
- 허용 전이: `pending` → `preparing` → `completed`
- `archived`는 이용 완료 시 시스템이 자동 설정 (직접 전이 불가)
- 역방향 전이 불가

## BR-4: 테이블 세션 관리
- 세션 시작: 테이블 로그인 시 session_id가 없으면 UUID 생성
- 세션 종료: 이용 완료 시 session_id = NULL, session_started_at = NULL
- 새 세션: 다음 로그인 시 새 UUID 생성

## BR-5: 이용 완료 처리 (트랜잭션)
1. 해당 세션의 모든 주문을 order_history에 JSON으로 저장
2. 해당 세션의 모든 주문 status를 `archived`로 변경
3. 테이블의 session_id, session_started_at을 NULL로 리셋
- 위 3단계는 하나의 트랜잭션으로 실행

## BR-6: 주문 항목 스냅샷
- order_items에 menu_name, unit_price를 주문 시점 값으로 저장
- 메뉴 수정/삭제 후에도 주문 내역의 정확성 보장

## BR-7: 카테고리 삭제 시 메뉴 처리
- 카테고리 삭제 시 해당 카테고리의 menu_items.category_id = NULL (SET NULL)

## BR-8: 주문 삭제 시 항목 처리
- 주문 삭제 시 order_items도 CASCADE 삭제

## BR-9: BEST/할인 필터링
- BEST 탭: `is_best = TRUE AND status = 'ON_SALE'` 필터
- 할인 탭: `is_discount = TRUE AND status = 'ON_SALE'` 필터
- 일반 카테고리 탭: `category_id = ? AND status = 'ON_SALE'` 필터

## BR-10: 매장 내 테이블 번호 유니크
- 동일 매장 내 테이블 번호 중복 불가 (UNIQUE 제약)
