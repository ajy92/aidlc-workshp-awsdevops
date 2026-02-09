import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { verifyAdminAuth, unauthorized } from '@/lib/auth';

const toKSTDate = (d: string) => {
  const kst = new Date(new Date(d).getTime() + 9 * 3600000);
  return kst.toISOString().slice(0, 10);
};

export async function GET(req: NextRequest) {
  const payload = verifyAdminAuth(req);
  if (!payload) return unauthorized();

  const startDate = req.nextUrl.searchParams.get('startDate') || new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
  const endDate = req.nextUrl.searchParams.get('endDate') || new Date().toISOString().slice(0, 10);
  const detailDate = req.nextUrl.searchParams.get('detailDate'); // 일별 상세

  const supabase = getSupabase();
  const start = `${startDate}T00:00:00+09:00`;
  const end = `${endDate}T23:59:59+09:00`;

  const { data: history } = await supabase
    .from('order_history')
    .select('session_id, table_number, total_amount, completed_at, order_data')
    .eq('store_id', payload.storeId)
    .gte('completed_at', start)
    .lte('completed_at', end);

  const rows = history ?? [];

  // 일별 상세 요청
  if (detailDate) {
    const dayRows = rows.filter(h => toKSTDate(h.completed_at) === detailDate);
    // order_id 추출하여 order_items 조회
    const orderIds = dayRows.map(h => h.order_data?.order_id).filter(Boolean);
    const { data: items } = orderIds.length
      ? await supabase.from('order_items').select('order_id, menu_name, quantity, unit_price').in('order_id', orderIds)
      : { data: [] };
    const itemMap: Record<number, { order_id: number; menu_name: string; quantity: number; unit_price: number }[]> = {};
    (items ?? []).forEach(i => { if (!itemMap[i.order_id]) itemMap[i.order_id] = []; itemMap[i.order_id].push(i); });

    const details = dayRows.map(h => ({
      table_number: h.table_number,
      session_id: h.session_id,
      total_amount: h.total_amount,
      completed_at: h.completed_at,
      order_items: itemMap[h.order_data?.order_id] || [],
    }));
    return NextResponse.json({ date: detailDate, count: details.length, details });
  }

  // 전체 요약
  const sessions = new Set<string>();
  const dateMap: Record<string, { sessions: Set<string>; totalAmount: number; count: number }> = {};
  const tableSessionCount: Record<number, Set<string>> = {};

  rows.forEach(h => {
    sessions.add(h.session_id);
    const d = toKSTDate(h.completed_at);
    if (!dateMap[d]) dateMap[d] = { sessions: new Set(), totalAmount: 0, count: 0 };
    dateMap[d].sessions.add(h.session_id);
    dateMap[d].totalAmount += h.total_amount;
    dateMap[d].count += 1;
    if (!tableSessionCount[h.table_number]) tableSessionCount[h.table_number] = new Set();
    tableSessionCount[h.table_number].add(h.session_id);
  });

  const totalSessions = sessions.size;
  const tables = Object.values(tableSessionCount);
  const revisitTables = tables.filter(s => s.size > 1).length;
  const revisitRate = tables.length ? Math.round((revisitTables / tables.length) * 100) : 0;

  const byDate = Object.entries(dateMap)
    .map(([date, v]) => ({ date, sessions: v.sessions.size, orders: v.count, totalAmount: v.totalAmount }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return NextResponse.json({ totalSessions, revisitRate, byDate });
}
