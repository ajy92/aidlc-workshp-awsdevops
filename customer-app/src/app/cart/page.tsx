'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCart, updateQuantity, clearCart, cartTotal, saveCart } from '@/lib/cart';
import { getAuth, apiFetch } from '@/lib/client-auth';
import { CartItem } from '@/lib/types';
import BottomNav from '@/components/BottomNav';

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [confirm, setConfirm] = useState(false);
  const [result, setResult] = useState<{ orderId: number; totalAmount: number } | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!getAuth()) { router.push('/login'); return; }
    setCart(getCart());
  }, [router]);

  const handleQuantity = (id: number, delta: number) => setCart(updateQuantity(id, delta));
  const handleClear = () => { clearCart(); setCart([]); };

  const handleOrder = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiFetch('/api/orders', {
        method: 'POST',
        body: JSON.stringify({ items: cart }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      clearCart();
      setCart([]);
      setConfirm(false);
      setResult(data);
      setTimeout(() => router.push('/'), 5000);
    } catch { setError('주문에 실패했습니다'); } finally { setLoading(false); }
  };

  if (result) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-2xl font-bold mb-2">주문 완료!</h1>
        <p className="text-gray-600 mb-1">주문번호: <span className="font-bold text-blue-600">#{result.orderId}</span></p>
        <p className="text-gray-600 mb-4">총 금액: {result.totalAmount.toLocaleString()}원</p>
        <p className="text-sm text-gray-400">5초 후 메뉴 화면으로 이동합니다...</p>
      </div>
    );
  }

  const total = cartTotal(cart);

  return (
    <div className="pb-20">
      <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between z-10">
        <h1 className="text-xl font-bold">장바구니</h1>
        {cart.length > 0 && (
          <button onClick={handleClear} className="text-sm text-red-500">전체 삭제</button>
        )}
      </div>

      {cart.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <p className="text-lg">장바구니가 비어있습니다</p>
          <button onClick={() => router.push('/')} className="mt-4 text-blue-600 underline">메뉴 보기</button>
        </div>
      ) : (
        <>
          <div className="p-4 space-y-3">
            {cart.map(item => (
              <div key={item.menu_item_id} className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{item.menu_name}</h3>
                  <p className="text-sm text-gray-500">{item.unit_price.toLocaleString()}원</p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => handleQuantity(item.menu_item_id, -1)} className="w-9 h-9 rounded-full bg-gray-100 text-lg flex items-center justify-center" aria-label="수량 감소">−</button>
                  <span className="font-bold w-6 text-center">{item.quantity}</span>
                  <button onClick={() => handleQuantity(item.menu_item_id, 1)} className="w-9 h-9 rounded-full bg-gray-100 text-lg flex items-center justify-center" aria-label="수량 증가">+</button>
                </div>
              </div>
            ))}
          </div>

          <div className="fixed bottom-16 left-0 right-0 bg-white border-t p-4">
            {error && <p className="text-red-500 text-sm mb-2 text-center">{error}</p>}
            {!confirm ? (
              <button onClick={() => setConfirm(true)} className="w-full bg-blue-600 text-white rounded-xl p-4 text-lg font-semibold">
                {total.toLocaleString()}원 주문하기
              </button>
            ) : (
              <div className="space-y-2">
                <p className="text-center font-semibold">총 {total.toLocaleString()}원 주문하시겠습니까?</p>
                <div className="flex gap-2">
                  <button onClick={() => setConfirm(false)} className="flex-1 border rounded-xl p-3 font-semibold">취소</button>
                  <button onClick={handleOrder} disabled={loading} className="flex-1 bg-blue-600 text-white rounded-xl p-3 font-semibold disabled:opacity-50">
                    {loading ? '주문 중...' : '확정'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      <BottomNav active="cart" />
    </div>
  );
}
