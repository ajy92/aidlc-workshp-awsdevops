import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getSupabase } from '@/lib/supabase';
import { signAdminToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const { storeId, username, password } = await req.json();
  if (!storeId || !username || !password) {
    return NextResponse.json({ error: '필수 항목을 입력해주세요' }, { status: 400 });
  }

  const supabase = getSupabase();
  const { data: store } = await supabase
    .from('stores')
    .select('*')
    .eq('id', storeId)
    .eq('username', username)
    .single();

  if (!store) return NextResponse.json({ error: '매장 정보를 찾을 수 없습니다' }, { status: 404 });

  const valid = await bcrypt.compare(password, store.password);
  if (!valid) return NextResponse.json({ error: '비밀번호가 올바르지 않습니다' }, { status: 401 });

  const token = signAdminToken({ storeId: store.id, storeName: store.name });
  return NextResponse.json({ token, storeName: store.name });
}
