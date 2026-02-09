import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { verifyTableAuth, unauthorized } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const payload = verifyTableAuth(req);
  if (!payload) return unauthorized();

  const supabase = getSupabase();
  const { data: orders } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('store_id', payload.storeId)
    .eq('session_id', payload.sessionId)
    .neq('status', 'archived')
    .order('created_at', { ascending: false });

  return NextResponse.json(orders ?? []);
}

export async function POST(req: NextRequest) {
  const payload = verifyTableAuth(req);
  if (!payload) return unauthorized();

  const { items } = await req.json();
  if (!items?.length) {
    return NextResponse.json({ error: '주문 항목이 없습니다' }, { status: 400 });
  }

  const totalAmount = items.reduce((sum: number, i: { unit_price: number; quantity: number }) => sum + i.unit_price * i.quantity, 0);

  const supabase = getSupabase();
  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .insert({
      store_id: payload.storeId,
      table_number: payload.tableNumber,
      session_id: payload.sessionId,
      total_amount: totalAmount,
      status: 'pending',
    })
    .select()
    .single();

  if (orderErr || !order) {
    return NextResponse.json({ error: '주문 생성 실패' }, { status: 500 });
  }

  const orderItems = items.map((i: { menu_item_id: number; menu_name: string; quantity: number; unit_price: number }) => ({
    order_id: order.id,
    menu_item_id: i.menu_item_id,
    menu_name: i.menu_name,
    quantity: i.quantity,
    unit_price: i.unit_price,
  }));

  await supabase.from('order_items').insert(orderItems);

  return NextResponse.json({ orderId: order.id, totalAmount });
}
