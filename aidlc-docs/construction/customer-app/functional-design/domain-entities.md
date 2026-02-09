# Domain Entities - customer-app

> DB 스키마는 shared-db에서 정의. 여기서는 customer-app이 사용하는 엔티티와 클라이언트 측 모델을 정의.

## Server-Side Entities (DB 조회용)

### Menu (조회 전용)
```typescript
type Category = { id: number; name: string; sort_order: number }
type MenuItem = {
  id: number; name: string; price: number; description: string;
  image_url: string; category_id: number; sort_order: number;
  status: 'ON_SALE' | 'NOT_YET'; is_best: boolean; is_discount: boolean;
}
```

### Order (생성 + 조회)
```typescript
type Order = {
  id: number; table_number: number; session_id: string;
  total_amount: number; status: 'pending' | 'preparing' | 'completed';
  created_at: string; items: OrderItem[];
}
type OrderItem = {
  menu_item_id: number; menu_name: string; quantity: number; unit_price: number;
}
```

### Table Session
```typescript
type TableSession = {
  store_id: string; table_number: number; session_id: string;
}
```

## Client-Side Models

### CartItem (localStorage)
```typescript
type CartItem = {
  menu_item_id: number; menu_name: string;
  unit_price: number; quantity: number;
}
```

### Auth State (localStorage)
```typescript
type TableAuth = {
  token: string; storeId: string; tableNumber: number; sessionId: string;
}
```
