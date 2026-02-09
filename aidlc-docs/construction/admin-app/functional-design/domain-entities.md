# Domain Entities - admin-app

> DB 스키마는 shared-db에서 정의. 여기서는 admin-app이 사용하는 엔티티와 뷰 모델을 정의.

## Server-Side Entities (DB 조회/수정용)

### Store (인증용)
```typescript
type Store = { id: string; name: string; username: string; password: string }
```

### Order (모니터링/관리)
```typescript
type Order = {
  id: number; store_id: string; table_number: number; session_id: string;
  total_amount: number; status: 'pending' | 'preparing' | 'completed' | 'archived';
  created_at: string; order_items: OrderItem[];
}
type OrderItem = {
  id: number; order_id: number; menu_item_id: number;
  menu_name: string; quantity: number; unit_price: number;
}
```

### Table (관리)
```typescript
type Table = {
  id: number; store_id: string; table_number: number;
  session_id: string | null; session_started_at: string | null;
}
```

### Menu (CRUD)
```typescript
type MenuItem = {
  id: number; store_id: string; category_id: number | null;
  name: string; price: number; description: string; image_url: string;
  sort_order: number; status: 'ON_SALE' | 'NOT_YET';
  is_best: boolean; is_discount: boolean;
}
type Category = { id: number; store_id: string; name: string; sort_order: number }
```

### Dashboard
```typescript
type SalesData = {
  totalSales: number; orderCount: number; avgPerOrder: number;
  byTable: { table_number: number; total: number }[];
  byMenu: { menu_name: string; count: number; total: number }[];
  byHour: { hour: number; count: number }[];
  byCategory: { category: string; total: number }[];
}
type CustomerData = {
  totalSessions: number; revisitRate: number;
  byDate: { date: string; sessions: number }[];
}
```

## Client-Side Models

### AdminAuth (localStorage)
```typescript
type AdminAuth = { token: string; storeId: string; storeName: string }
```
