'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, apiFetch } from '@/lib/client-auth';
import { Order } from '@/lib/types';
import BottomNav from '@/components/BottomNav';

const STATUS_LABEL: Record<string, string> = { pending: '대기중', preparing: '준비중', completed: '완료' };
const STATUS_COLOR: Record<string, string> = { pending: 'bg-yellow-100 text-yellow-700', preparing: 'bg-blue-100 text-blue-700', completed: 'bg-green-100 text-green-700' };

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const auth = getAuth();
    if (!auth) { router.push('/login'); return; }

    apiFetch('/api/orders').then(r => r.json()).then(setOrders);

    // SSE 연결
    const es = new EventSource(`/api/orders/stream?token=${auth.token}`);
    es.addEventListener('status_update', (e) => {
      const { orderId, status } = JSON.parse(e.data);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    });

    // Polling fallback: admin-app에서 상태 변경 시 별도 프로세스이므로 SSE 수신 불가
    const poll = setInterval(() => {
      apiFetch('/api/orders').then(r => r.json()).then(setOrders);
    }, 5000);
    return () => { es.close(); clearInterval(poll); };
  }, [router]);

  return (
    <div className="pb-20">
      <div className="sticky top-0 bg-white border-b p-4 z-10">
        <h1 className="text-xl font-bold">주문 내역</h1>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <p className="text-lg">주문 내역이 없습니다</p>
        </div>
      ) : (
        <div className="p-4 space-y-3">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold">주문 #{order.id}</span>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLOR[order.status] || ''}`}>
                  {STATUS_LABEL[order.status] || order.status}
                </span>
              </div>
              <p className="text-xs text-gray-400 mb-2">{new Date(order.created_at).toLocaleString('ko-KR')}</p>
              <div className="space-y-1">
                {order.order_items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span>{item.menu_name} × {item.quantity}</span>
                    <span className="text-gray-600">{(item.unit_price * item.quantity).toLocaleString()}원</span>
                  </div>
                ))}
              </div>
              <div className="border-t mt-2 pt-2 flex justify-between font-bold">
                <span>합계</span>
                <span className="text-blue-600">{order.total_amount.toLocaleString()}원</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <BottomNav active="orders" />
    </div>
  );
}
