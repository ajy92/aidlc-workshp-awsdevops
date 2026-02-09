'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, apiFetch } from '@/lib/client-auth';
import { addToCart } from '@/lib/cart';
import { Category, MenuItem } from '@/lib/types';
import BottomNav from '@/components/BottomNav';

type Filter = 'all' | 'best' | 'discount' | number;

export default function MenuPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (!getAuth()) { router.push('/login'); return; }
    apiFetch('/api/menu').then(r => r.json()).then(d => {
      setCategories(d.categories);
      setItems(d.items);
    });
  }, [router]);

  const filtered = items.filter(i => {
    if (filter === 'all') return true;
    if (filter === 'best') return i.is_best;
    if (filter === 'discount') return i.is_discount;
    return i.category_id === filter;
  });

  const handleAdd = (item: MenuItem) => {
    addToCart({ menu_item_id: item.id, menu_name: item.name, unit_price: item.price });
    setToast(`${item.name} 추가됨`);
    setTimeout(() => setToast(''), 1500);
  };

  const tabs: { label: string; value: Filter }[] = [
    { label: '전체', value: 'all' },
    ...categories.map(c => ({ label: c.name, value: c.id as Filter })),
    { label: 'BEST', value: 'best' as Filter },
    { label: '할인', value: 'discount' as Filter },
  ];

  return (
    <div className="pb-20">
      {/* 카테고리 탭 */}
      <div className="sticky top-0 bg-white border-b z-10 overflow-x-auto">
        <div className="flex gap-1 p-2">
          {tabs.map(t => (
            <button key={String(t.value)} onClick={() => setFilter(t.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${filter === t.value ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* 메뉴 그리드 */}
      <div className="grid grid-cols-2 gap-3 p-4">
        {filtered.map(item => (
          <div key={item.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
            {item.image_url && (
              <div className="h-32 bg-gray-200 flex items-center justify-center">
                <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
              </div>
            )}
            <div className="p-3">
              <div className="flex items-center gap-1 mb-1">
                {item.is_best && <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">BEST</span>}
                {item.is_discount && <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">할인</span>}
              </div>
              <h3 className="font-semibold text-sm">{item.name}</h3>
              {item.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{item.description}</p>}
              <div className="flex items-center justify-between mt-2">
                <span className="font-bold text-blue-600">{item.price.toLocaleString()}원</span>
                <button onClick={() => handleAdd(item)}
                  className="bg-blue-600 text-white w-9 h-9 rounded-full text-xl flex items-center justify-center hover:bg-blue-700" aria-label={`${item.name} 담기`}>
                  +
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 토스트 */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-full text-sm">
          {toast}
        </div>
      )}

      <BottomNav active="menu" />
    </div>
  );
}
