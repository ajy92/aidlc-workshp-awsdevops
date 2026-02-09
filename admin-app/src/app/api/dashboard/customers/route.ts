import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { verifyAdminAuth, unauthorized } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const payload = verifyAdminAuth(req);
  if (!payload) return unauthorized();

  const startDate = req.nextUrl.searchParams.get('startDate') || new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
  const endDate = req.nextUrl.searchParams.get('endDate') || new Date().toISOString().slice(0, 10);

  const supabase = getSupabase();
  const start = `${startDate}T00:00:00`;
  const end = `${endDate}T23:59:59`;

  // 세션 기반 방문 분석 (order_history 사용)
  const { data: history } = await supabase
    .from('order_history')
    .select('session_id, table_number, completed_at')
    .eq('store_id', payload.storeId)
    .gte('completed_at', start)
    .lte('completed_at', end);

  const sessions = new Set<string>();
  const dateMap: Record<string, Set<string>> = {};
  const tableSessionCount: Record<number, Set<string>> = {};

  (history ?? []).forEach(h => {
    sessions.add(h.session_id);
    const d = h.completed_at.slice(0, 10);
    if (!dateMap[d]) dateMap[d] = new Set();
    dateMap[d].add(h.session_id);
    if (!tableSessionCount[h.table_number]) tableSessionCount[h.table_number] = new Set();
    tableSessionCount[h.table_number].add(h.session_id);
  });

  const totalSessions = sessions.size;

  // 재방문율: 2회 이상 세션이 있는 테이블 비율
  const tables = Object.values(tableSessionCount);
  const revisitTables = tables.filter(s => s.size > 1).length;
  const revisitRate = tables.length ? Math.round((revisitTables / tables.length) * 100) : 0;

  const byDate = Object.entries(dateMap)
    .map(([date, s]) => ({ date, sessions: s.size }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return NextResponse.json({ totalSessions, revisitRate, byDate });
}
