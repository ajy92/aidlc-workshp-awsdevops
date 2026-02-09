'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, apiFetch } from '@/lib/client-auth';
import { SalesData, CustomerData } from '@/lib/types';
import Sidebar from '@/components/Sidebar';

export default function DashboardPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'sales' | 'customers'>('sales');
  const [period, setPeriod] = useState('daily');
  const [startDate, setStartDate] = useState(() => new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [sales, setSales] = useState<SalesData | null>(null);
  const [customers, setCustomers] = useState<CustomerData | null>(null);

  useEffect(() => {
    if (!getAuth()) { router.push('/login'); return; }
  }, [router]);

  useEffect(() => {
    if (tab === 'sales') {
      apiFetch(`/api/dashboard/sales?period=${period}&startDate=${startDate}&endDate=${endDate}`)
        .then(r => r.json()).then(setSales);
    } else {
      apiFetch(`/api/dashboard/customers?startDate=${startDate}&endDate=${endDate}`)
        .then(r => r.json()).then(setCustomers);
    }
  }, [tab, period, startDate, endDate]);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6">
        <h2 className="text-xl font-bold mb-4">대시보드</h2>

        {/* 탭 + 필터 */}
        <div className="flex flex-wrap gap-3 items-center mb-6">
          <div className="flex bg-white rounded-lg overflow-hidden border">
            <button onClick={() => setTab('sales')} className={`px-4 py-2 text-sm font-medium ${tab === 'sales' ? 'bg-blue-600 text-white' : ''}`}>매출</button>
            <button onClick={() => setTab('customers')} className={`px-4 py-2 text-sm font-medium ${tab === 'customers' ? 'bg-blue-600 text-white' : ''}`}>고객</button>
          </div>
          {tab === 'sales' && (
            <select value={period} onChange={e => setPeriod(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
              <option value="daily">일별</option><option value="weekly">주별</option><option value="monthly">월별</option>
            </select>
          )}
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border rounded-lg px-3 py-2 text-sm" />
          <span className="text-gray-400">~</span>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="border rounded-lg px-3 py-2 text-sm" />
        </div>

        {/* 매출 탭 */}
        {tab === 'sales' && sales && (
          <div className="space-y-6">
            {/* 요약 카드 */}
            <div className="grid grid-cols-3 gap-4">
              <Card label="총 매출" value={`${sales.totalSales.toLocaleString()}원`} />
              <Card label="주문 건수" value={`${sales.orderCount}건`} />
              <Card label="평균 객단가" value={`${sales.avgPerOrder.toLocaleString()}원`} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* 테이블별 매출 */}
              <Section title="테이블별 매출">
                {sales.byTable.map(t => (
                  <Bar key={t.table_number} label={`테이블 ${t.table_number}`} value={t.total} max={Math.max(...sales.byTable.map(x => x.total))} />
                ))}
              </Section>

              {/* 메뉴별 판매 */}
              <Section title="메뉴별 판매 순위">
                {sales.byMenu.slice(0, 10).map(m => (
                  <div key={m.menu_name} className="flex justify-between text-sm py-1">
                    <span>{m.menu_name}</span>
                    <span className="text-gray-500">{m.count}개 · {m.total.toLocaleString()}원</span>
                  </div>
                ))}
              </Section>

              {/* 시간대별 */}
              <Section title="시간대별 주문">
                <div className="flex items-end gap-1 h-32">
                  {sales.byHour.filter(h => h.count > 0 || (h.hour >= 9 && h.hour <= 22)).map(h => (
                    <div key={h.hour} className="flex-1 flex flex-col items-center">
                      <div className="bg-blue-400 rounded-t w-full" style={{ height: `${Math.max(4, (h.count / Math.max(...sales.byHour.map(x => x.count), 1)) * 100)}%` }} />
                      <span className="text-[10px] text-gray-400 mt-1">{h.hour}</span>
                    </div>
                  ))}
                </div>
              </Section>

              {/* 카테고리별 */}
              <Section title="카테고리별 매출">
                {sales.byCategory.map(c => (
                  <Bar key={c.category} label={c.category} value={c.total} max={Math.max(...sales.byCategory.map(x => x.total))} />
                ))}
              </Section>
            </div>
          </div>
        )}

        {/* 고객 탭 */}
        {tab === 'customers' && customers && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Card label="총 방문 세션" value={`${customers.totalSessions}회`} />
              <Card label="재방문율" value={`${customers.revisitRate}%`} />
            </div>
            <Section title="일별 방문 추이">
              {customers.byDate.map(d => (
                <div key={d.date} className="flex justify-between text-sm py-1">
                  <span>{d.date}</span><span>{d.sessions}회</span>
                </div>
              ))}
              {customers.byDate.length === 0 && <p className="text-gray-400 text-sm">데이터가 없습니다</p>}
            </Section>
          </div>
        )}
      </main>
    </div>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm">
      <h3 className="font-semibold mb-3">{title}</h3>
      {children}
    </div>
  );
}

function Bar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-2 text-sm py-1">
      <span className="w-24 shrink-0 truncate">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
        <div className="bg-blue-500 h-full rounded-full" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-24 text-right text-gray-500">{value.toLocaleString()}원</span>
    </div>
  );
}
