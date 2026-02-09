'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, apiFetch } from '@/lib/client-auth';
import { MenuItem, Category } from '@/lib/types';
import Sidebar from '@/components/Sidebar';

type MenuForm = {
  name: string; price: string; description: string; category_id: string;
  image_url: string; status: 'ON_SALE' | 'NOT_YET'; is_best: boolean; is_discount: boolean;
};

const emptyForm: MenuForm = { name: '', price: '', description: '', category_id: '', image_url: '', status: 'ON_SALE', is_best: false, is_discount: false };

export default function MenuManagePage() {
  const router = useRouter();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filter, setFilter] = useState<number | 'all'>('all');
  const [editing, setEditing] = useState<number | 'new' | null>(null);
  const [form, setForm] = useState<MenuForm>(emptyForm);

  const load = async () => {
    const res = await apiFetch('/api/menu');
    const d = await res.json();
    setItems(d.items);
    setCategories(d.categories);
  };

  useEffect(() => {
    if (!getAuth()) { router.push('/login'); return; }
    load();
  }, [router]);

  const filtered = filter === 'all' ? items : items.filter(i => i.category_id === filter);

  const openNew = () => { setForm(emptyForm); setEditing('new'); };
  const openEdit = (item: MenuItem) => {
    setForm({
      name: item.name, price: String(item.price), description: item.description,
      category_id: item.category_id ? String(item.category_id) : '',
      image_url: item.image_url, status: item.status, is_best: item.is_best, is_discount: item.is_discount,
    });
    setEditing(item.id);
  };

  const save = async () => {
    const body = {
      name: form.name, price: Number(form.price), description: form.description,
      category_id: form.category_id ? Number(form.category_id) : null,
      image_url: form.image_url, status: form.status, is_best: form.is_best, is_discount: form.is_discount,
    };
    if (editing === 'new') {
      await apiFetch('/api/menu', { method: 'POST', body: JSON.stringify(body) });
    } else {
      await apiFetch(`/api/menu/${editing}`, { method: 'PUT', body: JSON.stringify(body) });
    }
    setEditing(null);
    load();
  };

  const remove = async (id: number) => {
    if (!confirm('이 메뉴를 삭제하시겠습니까?')) return;
    await apiFetch(`/api/menu/${id}`, { method: 'DELETE' });
    load();
  };

  const statusBadge = (s: string) =>
    s === 'ON_SALE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500';

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">메뉴 관리</h2>
          <button onClick={openNew} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">+ 메뉴 추가</button>
        </div>

        {/* 카테고리 필터 */}
        <div className="flex gap-2 mb-4 overflow-x-auto">
          <button onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-full text-sm ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}>전체</button>
          {categories.map(c => (
            <button key={c.id} onClick={() => setFilter(c.id)}
              className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${filter === c.id ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}>{c.name}</button>
          ))}
        </div>

        {/* 메뉴 테이블 */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="text-left px-4 py-3">메뉴명</th>
                <th className="text-right px-4 py-3">가격</th>
                <th className="text-center px-4 py-3">상태</th>
                <th className="text-center px-4 py-3">BEST</th>
                <th className="text-center px-4 py-3">할인</th>
                <th className="text-right px-4 py-3">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{item.name}</td>
                  <td className="px-4 py-3 text-right">{item.price.toLocaleString()}원</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusBadge(item.status)}`}>
                      {item.status === 'ON_SALE' ? '판매중' : '판매전'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">{item.is_best ? '⭐' : ''}</td>
                  <td className="px-4 py-3 text-center">{item.is_discount ? '🏷️' : ''}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button onClick={() => openEdit(item)} className="text-blue-600 hover:underline">수정</button>
                    <button onClick={() => remove(item.id)} className="text-red-500 hover:underline">삭제</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="text-center text-gray-400 py-10">메뉴가 없습니다</p>}
        </div>

        {/* 등록/수정 모달 */}
        {editing !== null && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setEditing(null)}>
            <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-3" onClick={e => e.stopPropagation()}>
              <h3 className="font-bold text-lg">{editing === 'new' ? '메뉴 추가' : '메뉴 수정'}</h3>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="메뉴명 *" className="w-full border rounded-lg px-3 py-2 text-sm" />
              <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="가격 *" className="w-full border rounded-lg px-3 py-2 text-sm" />
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="설명" className="w-full border rounded-lg px-3 py-2 text-sm" rows={2} />
              <select value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
                <option value="">카테고리 선택</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <input value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} placeholder="이미지 URL" className="w-full border rounded-lg px-3 py-2 text-sm" />
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as 'ON_SALE' | 'NOT_YET' })} className="w-full border rounded-lg px-3 py-2 text-sm">
                <option value="ON_SALE">판매중</option>
                <option value="NOT_YET">판매전</option>
              </select>
              <div className="flex gap-4">
                <label className="flex items-center gap-1 text-sm">
                  <input type="checkbox" checked={form.is_best} onChange={e => setForm({ ...form, is_best: e.target.checked })} /> BEST
                </label>
                <label className="flex items-center gap-1 text-sm">
                  <input type="checkbox" checked={form.is_discount} onChange={e => setForm({ ...form, is_discount: e.target.checked })} /> 할인
                </label>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={save} className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">저장</button>
                <button onClick={() => setEditing(null)} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium">취소</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
