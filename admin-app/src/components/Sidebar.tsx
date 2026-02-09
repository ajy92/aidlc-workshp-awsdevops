'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { href: '/', label: '주문', icon: '📋' },
  { href: '/menu', label: '메뉴', icon: '🍽️' },
  { href: '/dashboard', label: '대시보드', icon: '📊' },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-56 bg-white border-r min-h-screen p-4 flex flex-col gap-1 shrink-0">
      <h1 className="text-lg font-bold mb-6 px-3">🏪 관리자</h1>
      {NAV.map(n => (
        <Link key={n.href} href={n.href}
          className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium ${pathname === n.href ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}>
          <span>{n.icon}</span>{n.label}
        </Link>
      ))}
    </aside>
  );
}
