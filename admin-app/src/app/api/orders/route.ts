import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { verifyAdminAuth, unauthorized } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const payload = verifyAdminAuth(req);
  if (!payload) return unauthorized();

  const supabase = getSupabase();
  const { data: orders } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('store_id', payload.storeId)
    .neq('status', 'archived')
    .order('created_at', { ascending: false });

  return NextResponse.json(orders ?? []);
}
