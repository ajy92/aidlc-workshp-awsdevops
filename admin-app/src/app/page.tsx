'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, apiFetch } from '@/lib/client-auth';
import { Order } from '@/lib/types';
import Sidebar from '@/components/Sidebar';

type TableCard = {
  table_number: number;
  orders: Order[];
  total: number;
};

export default function OrderMonitorPage() {
  const router = useRouter();
  const [tables, setTables] = useState<TableCard[]>([]);
  const [selected, setSelected] = useState<Order | null>(null);
  const [highlight] = useState<Set<number>>(new Set());

  const loadOrders = useCallback(async () => {
    const res = await apiFetch('/api/orders');
    const orders: Order[] = await res.json();
    const map: Record<number, Order[]> = {};
    orders.forEach(o => {
      if (!map[o.table_number]) map[o.table_number] = [];
      map[o.table_number].push(o);
    });
    setTables(
      Object.entries(map)
        .map(([k, v]) => ({
          table_number: Number(k),
          orders: v,
          total: v.reduce((s, o) => s + o.total_amount, 0),
        }))
        .sort((a, b) => a.table_number - b.table_number)
    );
  }, []);

  useEffect(() => {
    const auth = getAuth();
    if (!auth) { router.push('/login'); return; }
    loadOrders();

    const es = new EventSource(`/api/orders/stream?token=${auth.token}`);
    es.addEventListener('new_order', () => loadOrders());
    es.addEventListener('status_update', () => loadOrders());
    es.addEventListener('order_deleted', () => loadOrders());
    es.addEventListener('table_completed', () => loadOrders());

    // Polling fallback: customer-app은 별도 프로세스이므로 SSE 수신 불가 → 5초 간격 폴링
    const poll = setInterval(loadOrders, 5000);
    return () => { es.close(); clearInterval(poll); };
  }, [router, loadOrders]);

  const updateStatus = async (orderId: number, status: string) => {
    await apiFetch(`/api/orders/${orderId}/status`, {
      method: 'PUT', body: JSON.stringify({ status }),
    });
    loadOrders();
    setSelected(null);
  };

  const deleteOrder = async (orderId: number) => {
    if (!confirm('이 주문을 삭제하시겠습니까?')) return;
    await apiFetch(`/api/orders/${orderId}`, { method: 'DELETE' });
    loadOrders();
    setSelected(null);
  };

  const completeTable = async (tableNumber: number) => {
    if (!confirm(`테이블 ${tableNumber} 이용 완료 처리하시겠습니까?`)) return;
    await apiFetch(`/api/tables/${tableNumber}/complete`, { method: 'POST' });
    loadOrders();
  };

  const statusLabel: Record<string, string> = { pending: '대기', preparing: '준비중', completed: '완료' };
  const statusColor: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    preparing: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6">
        <h2 className="text-xl font-bold mb-4">주문 모니터링</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tables.map(t => (
            <div key={t.table_number}
              className={`bg-white rounded-xl shadow-sm p-4 border-2 ${highlight.has(t.table_number) ? 'border-yellow-400 animate-pulse' : 'border-transparent'}`}>
              <div className="flex justify-between items-center mb-3">
                <span className="font-bold text-lg">테이블 {t.table_number}</span>
                <span className="text-blue-600 font-semibold">{t.total.toLocaleString()}원</span>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {t.orders.map(o => (
                  <div key={o.id} onClick={() => setSelected(o)}
                    className="p-2 rounded-lg bg-gray-50 cursor-pointer hover:bg-gray-100 text-sm">
                    <div className="flex justify-between items-center">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColor[o.status]}`}>
                        {statusLabel[o.status]}
                      </span>
                      <span className="text-gray-500 text-xs">{new Date(o.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="mt-1 text-gray-700 truncate">
                      {o.order_items.map(i => `${i.menu_name}×${i.quantity}`).join(', ')}
                    </p>
                    <p className="text-right font-medium">{o.total_amount.toLocaleString()}원</p>
                  </div>
                ))}
              </div>
              <button onClick={() => completeTable(t.table_number)}
                className="mt-3 w-full py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-900">
                이용 완료
              </button>
            </div>
          ))}
          {tables.length === 0 && <p className="text-gray-400 col-span-full text-center py-20">활성 주문이 없습니다</p>}
        </div>

        {/* 주문 상세 모달 */}
        {selected && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setSelected(null)}>
            <div className="bg-white rounded-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
              <h3 className="font-bold text-lg mb-1">주문 #{selected.id}</h3>
              <p className="text-sm text-gray-500 mb-4">테이블 {selected.table_number} · {new Date(selected.created_at).toLocaleString('ko-KR')}</p>
              <div className="space-y-1 mb-4">
                {selected.order_items.map(i => (
                  <div key={i.id} className="flex justify-between text-sm">
                    <span>{i.menu_name} × {i.quantity}</span>
                    <span>{(i.unit_price * i.quantity).toLocaleString()}원</span>
                  </div>
                ))}
                <div className="border-t pt-2 flex justify-between font-bold">
                  <span>합계</span><span>{selected.total_amount.toLocaleString()}원</span>
                </div>
              </div>
              <div className="flex gap-2">
                {selected.status === 'pending' && (
                  <button onClick={() => updateStatus(selected.id, 'preparing')}
                    className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">준비 시작</button>
                )}
                {selected.status === 'preparing' && (
                  <button onClick={() => updateStatus(selected.id, 'completed')}
                    className="flex-1 py-2 bg-green-600 text-white rounded-lg text-sm font-medium">완료</button>
                )}
                <button onClick={() => deleteOrder(selected.id)}
                  className="px-4 py-2 bg-red-100 text-red-600 rounded-lg text-sm font-medium">삭제</button>
                <button onClick={() => setSelected(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium">닫기</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
