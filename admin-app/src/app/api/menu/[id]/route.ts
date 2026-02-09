import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { verifyAdminAuth, unauthorized } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const payload = verifyAdminAuth(req);
  if (!payload) return unauthorized();

  const body = await req.json();
  const supabase = getSupabase();
  const { error } = await supabase
    .from('menu_items')
    .update(body)
    .eq('id', params.id)
    .eq('store_id', payload.storeId);

  if (error) return NextResponse.json({ error: '수정 실패' }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const payload = verifyAdminAuth(req);
  if (!payload) return unauthorized();

  const supabase = getSupabase();
  const { error } = await supabase
    .from('menu_items')
    .delete()
    .eq('id', params.id)
    .eq('store_id', payload.storeId);

  if (error) return NextResponse.json({ error: '삭제 실패' }, { status: 500 });
  return NextResponse.json({ success: true });
}
