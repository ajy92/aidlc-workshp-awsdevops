'use client';
import Link from 'next/link';

const tabs = [
  { key: 'menu', label: '메뉴', href: '/', icon: '🍽️' },
  { key: 'cart', label: '장바구니', href: '/cart', icon: '🛒' },
  { key: 'orders', label: '주문내역', href: '/orders', icon: '📋' },
];

export default function BottomNav({ active }: { active: string }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex" aria-label="메인 내비게이션">
      {tabs.map(t => (
        <Link key={t.key} href={t.href}
          className={`flex-1 flex flex-col items-center py-2 text-xs ${active === t.key ? 'text-blue-600 font-bold' : 'text-gray-400'}`}
          aria-current={active === t.key ? 'page' : undefined}>
          <span className="text-xl">{t.icon}</span>
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
