import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '테이블오더',
  description: '테이블 주문 서비스',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="bg-gray-50 min-h-screen">{children}</body>
    </html>
  );
}
