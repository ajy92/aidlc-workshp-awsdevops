# Domain Entities - shared-db

## ER Diagram

```
stores 1──* tables
stores 1──* categories
stores 1──* menu_items
stores 1──* orders
stores 1──* order_history

categories 1──* menu_items

orders 1──* order_items
menu_items 1──* order_items
```

---

## Entity: stores (매장)
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | VARCHAR(50) | PK | 매장 식별자 |
| name | VARCHAR(100) | NOT NULL | 매장명 |
| username | VARCHAR(50) | NOT NULL, UNIQUE | 관리자 사용자명 |
| password | VARCHAR(255) | NOT NULL | bcrypt 해싱된 비밀번호 |
| created_at | TIMESTAMP | DEFAULT NOW() | 생성일시 |

## Entity: tables (테이블)
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | SERIAL | PK | 자동 증가 ID |
| store_id | VARCHAR(50) | FK → stores.id, NOT NULL | 매장 ID |
| table_number | INTEGER | NOT NULL | 테이블 번호 |
| password | VARCHAR(255) | NOT NULL | bcrypt 해싱된 비밀번호 |
| session_id | VARCHAR(50) | NULLABLE | 현재 세션 ID |
| session_started_at | TIMESTAMP | NULLABLE | 세션 시작 시각 |
| | | UNIQUE(store_id, table_number) | 매장 내 테이블 번호 유니크 |

## Entity: categories (카테고리)
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | SERIAL | PK | 자동 증가 ID |
| store_id | VARCHAR(50) | FK → stores.id, NOT NULL | 매장 ID |
| name | VARCHAR(50) | NOT NULL | 카테고리명 |
| sort_order | INTEGER | DEFAULT 0 | 정렬 순서 |

## Entity: menu_items (메뉴)
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | SERIAL | PK | 자동 증가 ID |
| store_id | VARCHAR(50) | FK → stores.id, NOT NULL | 매장 ID |
| category_id | INTEGER | FK → categories.id, NULLABLE | 카테고리 ID |
| name | VARCHAR(100) | NOT NULL | 메뉴명 |
| price | INTEGER | NOT NULL, CHECK(price >= 0 AND price <= 10000000) | 가격 (원) |
| description | TEXT | DEFAULT '' | 설명 |
| image_url | TEXT | DEFAULT '' | 이미지 URL |
| sort_order | INTEGER | DEFAULT 0 | 정렬 순서 |
| status | VARCHAR(10) | NOT NULL, DEFAULT 'ON_SALE' | 판매 상태: ON_SALE / NOT_YET |
| is_best | BOOLEAN | DEFAULT FALSE | BEST 플래그 |
| is_discount | BOOLEAN | DEFAULT FALSE | 할인 플래그 |
| created_at | TIMESTAMP | DEFAULT NOW() | 생성일시 |

## Entity: orders (주문)
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | SERIAL | PK | 주문 번호 |
| store_id | VARCHAR(50) | FK → stores.id, NOT NULL | 매장 ID |
| table_number | INTEGER | NOT NULL | 테이블 번호 |
| session_id | VARCHAR(50) | NOT NULL | 테이블 세션 ID |
| total_amount | INTEGER | NOT NULL | 총 주문 금액 |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'pending' | pending / preparing / completed / archived |
| created_at | TIMESTAMP | DEFAULT NOW() | 주문 시각 |

## Entity: order_items (주문 항목)
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | SERIAL | PK | 자동 증가 ID |
| order_id | INTEGER | FK → orders.id ON DELETE CASCADE, NOT NULL | 주문 ID |
| menu_item_id | INTEGER | NOT NULL | 메뉴 ID (참조용) |
| menu_name | VARCHAR(100) | NOT NULL | 주문 시점 메뉴명 (스냅샷) |
| quantity | INTEGER | NOT NULL, CHECK(quantity > 0) | 수량 |
| unit_price | INTEGER | NOT NULL | 주문 시점 단가 (스냅샷) |

## Entity: order_history (주문 이력)
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | SERIAL | PK | 자동 증가 ID |
| store_id | VARCHAR(50) | NOT NULL | 매장 ID |
| table_number | INTEGER | NOT NULL | 테이블 번호 |
| session_id | VARCHAR(50) | NOT NULL | 세션 ID |
| order_data | JSONB | NOT NULL | 주문 데이터 (JSON) |
| total_amount | INTEGER | NOT NULL | 총 금액 |
| completed_at | TIMESTAMP | DEFAULT NOW() | 이용 완료 시각 |
