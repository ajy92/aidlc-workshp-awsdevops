import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { verifyAdminAuth, unauthorized } from '@/lib/auth';
import { broadcast } from '@/lib/sse';

export async function POST(req: NextRequest, { params }: { params: { number: string } }) {
  const payload = verifyAdminAuth(req);
  if (!payload) return unauthorized();

  const tableNumber = Number(params.number);
  const supabase = getSupabase();

  // 해당 테이블의 활성 주문 조회
  const { data: orders } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('store_id', payload.storeId)
    .eq('table_number', tableNumber)
    .neq('status', 'archived');

  if (!orders?.length) {
    return NextResponse.json({ error: '활성 주문이 없습니다' }, { status: 400 });
  }

  // order_history에 저장
  const historyRows = orders.map(o => ({
    store_id: payload.storeId,
    table_number: tableNumber,
    session_id: o.session_id,
    order_data: { items: o.order_items, status: o.status },
    total_amount: o.total_amount,
  }));
  await supabase.from('order_history').insert(historyRows);

  // 주문 archived 처리
  const orderIds = orders.map(o => o.id);
  await supabase.from('orders').update({ status: 'archived' }).in('id', orderIds);

  // 테이블 세션 리셋
  await supabase
    .from('tables')
    .update({ session_id: null, session_started_at: null })
    .eq('store_id', payload.storeId)
    .eq('table_number', tableNumber);

  broadcast(payload.storeId, 'table_completed', { tableNumber });
  return NextResponse.json({ success: true });
}
