import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { verifyAdminAuth, unauthorized } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const payload = verifyAdminAuth(req);
  if (!payload) return unauthorized();

  const supabase = getSupabase();
  const { data: items } = await supabase
    .from('menu_items')
    .select('*')
    .eq('store_id', payload.storeId)
    .order('sort_order');

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('store_id', payload.storeId)
    .order('sort_order');

  return NextResponse.json({ items: items ?? [], categories: categories ?? [] });
}

export async function POST(req: NextRequest) {
  const payload = verifyAdminAuth(req);
  if (!payload) return unauthorized();

  const body = await req.json();
  if (!body.name || body.price == null) {
    return NextResponse.json({ error: '메뉴명과 가격은 필수입니다' }, { status: 400 });
  }

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('menu_items')
    .insert({ store_id: payload.storeId, ...body })
    .select()
    .single();

  if (error) return NextResponse.json({ error: '등록 실패' }, { status: 500 });
  return NextResponse.json({ id: data.id }, { status: 201 });
}
