import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { verifyAdminAuth, unauthorized } from '@/lib/auth';
import { broadcast } from '@/lib/sse';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const payload = verifyAdminAuth(req);
  if (!payload) return unauthorized();

  const supabase = getSupabase();
  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('id', params.id)
    .eq('store_id', payload.storeId);

  if (error) return NextResponse.json({ error: '삭제 실패' }, { status: 500 });

  broadcast(payload.storeId, 'order_deleted', { orderId: Number(params.id) });
  return NextResponse.json({ success: true });
}
