import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { verifyAdminAuth, unauthorized } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const payload = verifyAdminAuth(req);
  if (!payload) return unauthorized();

  const _period = req.nextUrl.searchParams.get('period') || 'daily';
  void _period; // reserved for future grouping
  const startDate = req.nextUrl.searchParams.get('startDate') || new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
  const endDate = req.nextUrl.searchParams.get('endDate') || new Date().toISOString().slice(0, 10);

  const supabase = getSupabase();
  const start = `${startDate}T00:00:00`;
  const end = `${endDate}T23:59:59`;

  // 기간 내 완료/아카이브 주문
  const { data: orders } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('store_id', payload.storeId)
    .gte('created_at', start)
    .lte('created_at', end);

  const allOrders = orders ?? [];
  const totalSales = allOrders.reduce((s, o) => s + o.total_amount, 0);
  const orderCount = allOrders.length;
  const avgPerOrder = orderCount ? Math.round(totalSales / orderCount) : 0;

  // 테이블별
  const tableMap: Record<number, number> = {};
  allOrders.forEach(o => { tableMap[o.table_number] = (tableMap[o.table_number] || 0) + o.total_amount; });
  const byTable = Object.entries(tableMap).map(([k, v]) => ({ table_number: Number(k), total: v }));

  // 메뉴별
  const menuMap: Record<string, { count: number; total: number }> = {};
  allOrders.forEach(o => o.order_items?.forEach((i: { menu_name: string; quantity: number; unit_price: number }) => {
    if (!menuMap[i.menu_name]) menuMap[i.menu_name] = { count: 0, total: 0 };
    menuMap[i.menu_name].count += i.quantity;
    menuMap[i.menu_name].total += i.quantity * i.unit_price;
  }));
  const byMenu = Object.entries(menuMap)
    .map(([k, v]) => ({ menu_name: k, ...v }))
    .sort((a, b) => b.count - a.count);

  // 시간대별
  const hourMap: Record<number, number> = {};
  allOrders.forEach(o => {
    const h = new Date(o.created_at).getHours();
    hourMap[h] = (hourMap[h] || 0) + 1;
  });
  const byHour = Array.from({ length: 24 }, (_, i) => ({ hour: i, count: hourMap[i] || 0 }));

  // 카테고리별 (menu_items 조인)
  const { data: menuItems } = await supabase
    .from('menu_items')
    .select('id, category_id')
    .eq('store_id', payload.storeId);
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .eq('store_id', payload.storeId);

  const catNameMap: Record<number, string> = {};
  categories?.forEach(c => { catNameMap[c.id] = c.name; });
  const itemCatMap: Record<number, string> = {};
  menuItems?.forEach(m => { itemCatMap[m.id] = catNameMap[m.category_id] || '기타'; });

  const catSalesMap: Record<string, number> = {};
  allOrders.forEach(o => o.order_items?.forEach((i: { menu_item_id: number; quantity: number; unit_price: number }) => {
    const cat = itemCatMap[i.menu_item_id] || '기타';
    catSalesMap[cat] = (catSalesMap[cat] || 0) + i.quantity * i.unit_price;
  }));
  const byCategory = Object.entries(catSalesMap).map(([k, v]) => ({ category: k, total: v }));

  return NextResponse.json({ totalSales, orderCount, avgPerOrder, byTable, byMenu, byHour, byCategory });
}
