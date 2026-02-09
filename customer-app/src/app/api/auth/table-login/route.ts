import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { getSupabase } from '@/lib/supabase';
import { signTableToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const { storeId, tableNumber, password } = await req.json();
  if (!storeId || !tableNumber || !password) {
    return NextResponse.json({ error: '필수 항목을 입력해주세요' }, { status: 400 });
  }

  const supabase = getSupabase();
  const { data: table } = await supabase
    .from('tables')
    .select('*')
    .eq('store_id', storeId)
    .eq('table_number', tableNumber)
    .single();

  if (!table) {
    return NextResponse.json({ error: '테이블 정보를 찾을 수 없습니다' }, { status: 404 });
  }

  const valid = await bcrypt.compare(password, table.password);
  if (!valid) {
    return NextResponse.json({ error: '비밀번호가 올바르지 않습니다' }, { status: 401 });
  }

  let sessionId = table.session_id;
  if (!sessionId) {
    sessionId = uuidv4();
    await supabase
      .from('tables')
      .update({ session_id: sessionId, session_started_at: new Date().toISOString() })
      .eq('id', table.id);
  }

  const token = signTableToken({ storeId, tableNumber, sessionId });
  return NextResponse.json({ token, sessionId, tableNumber });
}
