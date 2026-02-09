# Requirements Verification Questions

기존 요구사항 문서(`requirements/table-order-requirements.md`, `requirements/constraints.md`)를 분석한 결과, 아래 사항에 대한 확인이 필요합니다.

각 질문의 [Answer]: 뒤에 선택지 알파벳을 입력해주세요.

---

## Question 1
기술 스택(Tech Stack)을 어떻게 구성하시겠습니까?

A) Node.js (Express/Fastify) + React + SQLite
B) Node.js (Express/Fastify) + React + PostgreSQL
C) Python (FastAPI/Flask) + React + PostgreSQL
D) Java (Spring Boot) + React + PostgreSQL
E) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 2
프론트엔드 프레임워크를 어떻게 구성하시겠습니까?

A) React + TypeScript + Vite
B) React + JavaScript + Vite
C) Next.js (React 기반 풀스택)
D) Vue.js + TypeScript
E) Other (please describe after [Answer]: tag below)

[Answer]: C

## Question 3
고객용 화면과 관리자용 화면의 배포 구조를 어떻게 하시겠습니까?

A) 하나의 SPA에서 라우팅으로 분리 (/ → 고객, /admin → 관리자)
B) 별도의 프론트엔드 앱으로 분리 (customer-app, admin-app)
C) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 4
SSE(Server-Sent Events) 실시간 통신의 구현 범위는 어디까지입니까?

A) 관리자 주문 모니터링에만 적용 (요구사항 명시 범위)
B) 관리자 + 고객 주문 상태 업데이트 모두 적용
C) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 5
데모/시드 데이터를 포함하시겠습니까? (개발 및 테스트 편의를 위해)

A) 포함 (데모 매장, 샘플 메뉴, 테이블 5개 등)
B) 미포함 (빈 상태로 시작, 관리자가 직접 설정)
C) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 6
MVP 범위에서 메뉴 관리 기능의 포함 여부를 확인합니다. 요구사항 3.2.4에 메뉴 관리가 정의되어 있으나, MVP 범위(섹션 4)의 관리자용 목록에는 명시적으로 포함되어 있지 않습니다. 메뉴 관리를 MVP에 포함하시겠습니까?

A) 포함 (메뉴 CRUD: 등록, 수정, 삭제, 카테고리 관리)
B) 미포함 (시드 데이터로만 운영, 추후 추가)
C) Other (please describe after [Answer]: tag below)

[Answer]: A
