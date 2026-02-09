import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { verifyAdminAuth, unauthorized } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: { number: string } }) {
  const payload = verifyAdminAuth(req);
  if (!payload) return unauthorized();

  const tableNumber = Number(params.number);
  const date = req.nextUrl.searchParams.get('date');

  const supabase = getSupabase();
  let query = supabase
    .from('order_history')
    .select('*')
    .eq('store_id', payload.storeId)
    .eq('table_number', tableNumber)
    .order('completed_at', { ascending: false });

  if (date) {
    query = query.gte('completed_at', `${date}T00:00:00`).lt('completed_at', `${date}T23:59:59`);
  }

  const { data } = await query;
  return NextResponse.json(data ?? []);
}
