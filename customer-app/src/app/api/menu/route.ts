import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { verifyTableAuth, unauthorized } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const payload = verifyTableAuth(req);
  if (!payload) return unauthorized();

  const supabase = getSupabase();
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('store_id', payload.storeId)
    .order('sort_order');

  const { data: items } = await supabase
    .from('menu_items')
    .select('*')
    .eq('store_id', payload.storeId)
    .eq('status', 'ON_SALE')
    .order('sort_order');

  return NextResponse.json({ categories: categories ?? [], items: items ?? [] });
}
