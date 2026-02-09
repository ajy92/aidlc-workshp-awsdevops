# Component Methods

> Note: 상세 비즈니스 로직은 Functional Design(Construction Phase)에서 정의

## customer-app API Methods

### AuthService
| Method | Input | Output | Purpose |
|---|---|---|---|
| `tableLogin(storeId, tableNumber, password)` | string, number, string | `{ token, sessionId }` | 테이블 인증, JWT 발급 |

### MenuService
| Method | Input | Output | Purpose |
|---|---|---|---|
| `getMenu(storeId)` | string | `{ categories[], items[] }` | 판매중 메뉴 + 카테고리 조회 |

### OrderService
| Method | Input | Output | Purpose |
|---|---|---|---|
| `createOrder(storeId, tableNumber, sessionId, items[])` | string, number, string, OrderItem[] | `{ orderId, totalAmount }` | 주문 생성 |
| `getOrders(storeId, sessionId)` | string, string | `Order[]` | 현재 세션 주문 내역 |
| `streamOrderStatus(storeId, sessionId)` | string, string | SSE stream | 주문 상태 실시간 스트림 |

## admin-app API Methods

### AuthService
| Method | Input | Output | Purpose |
|---|---|---|---|
| `adminLogin(storeId, username, password)` | string, string, string | `{ token, storeName }` | 관리자 인증, JWT 발급 |

### OrderManagementService
| Method | Input | Output | Purpose |
|---|---|---|---|
| `getOrders(storeId)` | string | `Order[]` | 전체 활성 주문 조회 |
| `updateOrderStatus(orderId, status)` | number, string | `{ success }` | 주문 상태 변경 |
| `deleteOrder(orderId)` | number | `{ success }` | 주문 삭제 |
| `streamOrders(storeId)` | string | SSE stream | 실시간 주문 스트림 |

### MenuManagementService
| Method | Input | Output | Purpose |
|---|---|---|---|
| `getMenu(storeId)` | string | `{ categories[], items[] }` | 전체 메뉴 조회 (판매전 포함) |
| `createMenuItem(data)` | MenuItemInput | `{ id }` | 메뉴 등록 |
| `updateMenuItem(id, data)` | number, MenuItemInput | `{ success }` | 메뉴 수정 |
| `deleteMenuItem(id)` | number | `{ success }` | 메뉴 삭제 |
| `createCategory(name, sortOrder)` | string, number | `{ id }` | 카테고리 등록 |
| `updateCategory(id, name, sortOrder)` | number, string, number | `{ success }` | 카테고리 수정 |
| `deleteCategory(id)` | number | `{ success }` | 카테고리 삭제 |

### TableManagementService
| Method | Input | Output | Purpose |
|---|---|---|---|
| `getTables(storeId)` | string | `Table[]` | 테이블 목록 + 주문 현황 |
| `completeTable(storeId, tableNumber)` | string, number | `{ success }` | 이용 완료 처리 |
| `getTableHistory(storeId, tableNumber, date?)` | string, number, string? | `OrderHistory[]` | 과거 내역 조회 |

### DashboardService
| Method | Input | Output | Purpose |
|---|---|---|---|
| `getSalesData(storeId, period, startDate, endDate)` | string, string, string, string | `SalesData` | 매출 데이터 |
| `getCustomerAnalytics(storeId, startDate, endDate)` | string, string, string | `CustomerData` | 고객 분석 |

## Shared Types

```typescript
type MenuItemInput = {
  name: string; price: number; description?: string;
  category_id: number; image_url?: string; sort_order?: number;
  status: 'ON_SALE' | 'NOT_YET';
  is_best: boolean; is_discount: boolean;
}

type OrderItem = {
  menu_item_id: number; menu_name: string;
  quantity: number; unit_price: number;
}

type OrderStatus = 'pending' | 'preparing' | 'completed';
type SalesPeriod = 'daily' | 'weekly' | 'monthly';
```
