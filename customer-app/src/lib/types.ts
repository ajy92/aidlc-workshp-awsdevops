export type Category = { id: number; name: string; sort_order: number };
export type MenuItem = {
  id: number; name: string; price: number; description: string;
  image_url: string; category_id: number; sort_order: number;
  status: string; is_best: boolean; is_discount: boolean;
};
export type CartItem = {
  menu_item_id: number; menu_name: string; unit_price: number; quantity: number;
};
export type OrderItem = {
  menu_item_id: number; menu_name: string; quantity: number; unit_price: number;
};
export type Order = {
  id: number; table_number: number; session_id: string;
  total_amount: number; status: string; created_at: string;
  order_items: OrderItem[];
};
export type TableAuth = {
  token: string; storeId: string; tableNumber: number; sessionId: string;
};
