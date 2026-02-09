import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { verifyAdminAuth, unauthorized } from '@/lib/auth';
import { broadcast } from '@/lib/sse';

const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ['preparing'],
  preparing: ['completed'],
};

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const payload = verifyAdminAuth(req);
  if (!payload) return unauthorized();

  const { status } = await req.json();
  const supabase = getSupabase();

  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('id', params.id)
    .eq('store_id', payload.storeId)
    .single();

  if (!order) return NextResponse.json({ error: '주문을 찾을 수 없습니다' }, { status: 404 });

  const allowed = VALID_TRANSITIONS[order.status];
  if (!allowed?.includes(status)) {
    return NextResponse.json({ error: '허용되지 않는 상태 변경입니다' }, { status: 400 });
  }

  await supabase.from('orders').update({ status }).eq('id', params.id);
  broadcast(payload.storeId, 'status_update', { orderId: Number(params.id), status });

  return NextResponse.json({ success: true });
}
