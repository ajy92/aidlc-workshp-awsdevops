export type Category = { id: number; name: string; sort_order: number };
export type MenuItem = {
  id: number; name: string; price: number; description: string;
  image_url: string; category_id: number | null; sort_order: number;
  status: 'ON_SALE' | 'NOT_YET'; is_best: boolean; is_discount: boolean;
};
export type OrderItem = {
  id: number; order_id: number; menu_item_id: number;
  menu_name: string; quantity: number; unit_price: number;
};
export type Order = {
  id: number; store_id: string; table_number: number; session_id: string;
  total_amount: number; status: 'pending' | 'preparing' | 'completed' | 'archived';
  created_at: string; order_items: OrderItem[];
};
export type Table = {
  id: number; store_id: string; table_number: number;
  session_id: string | null; session_started_at: string | null;
};
export type AdminAuth = { token: string; storeId: string; storeName: string };
export type SalesData = {
  totalSales: number; orderCount: number; avgPerOrder: number;
  byTable: { table_number: number; total: number }[];
  byMenu: { menu_name: string; count: number; total: number }[];
  byHour: { hour: number; count: number }[];
  byCategory: { category: string; total: number }[];
};
export type CustomerData = {
  totalSessions: number; revisitRate: number;
  byDate: { date: string; sessions: number }[];
};
