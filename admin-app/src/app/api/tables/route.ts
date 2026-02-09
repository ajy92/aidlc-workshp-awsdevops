import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { verifyAdminAuth, unauthorized } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const payload = verifyAdminAuth(req);
  if (!payload) return unauthorized();

  const supabase = getSupabase();
  const { data: tables } = await supabase
    .from('tables')
    .select('*')
    .eq('store_id', payload.storeId)
    .order('table_number');

  // 활성 주문 현황 집계
  const { data: orderSums } = await supabase
    .from('orders')
    .select('table_number, total_amount')
    .eq('store_id', payload.storeId)
    .neq('status', 'archived');

  const sumByTable: Record<number, number> = {};
  orderSums?.forEach(o => {
    sumByTable[o.table_number] = (sumByTable[o.table_number] || 0) + o.total_amount;
  });

  const result = (tables ?? []).map(t => ({
    ...t,
    active_total: sumByTable[t.table_number] || 0,
  }));

  return NextResponse.json(result);
}
