import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/shared/api/client'
import { LoadingSpinner } from '@/shared/components/LoadingSpinner'
import type { Category, MenuItem } from '@/shared/types/api'
import { CategoryTabs } from '../components/CategoryTabs'
import { MenuCard } from '../components/MenuCard'
import { useCart } from '../stores/cart-store'
import { useCustomerAuth } from '../stores/auth-store'

export function MenuPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const totalItemCount = useCart((s) =>
    s.items.reduce((sum, item) => sum + item.quantity, 0)
  )
  const tableNumber = useCustomerAuth((s) => s.tableNumber)
  const navigate = useNavigate()

  useEffect(() => {
    async function load() {
      try {
        const [cats, items] = await Promise.all([
          api.get<Category[]>('/categories'),
          api.get<MenuItem[]>('/menu-items'),
        ])
        setCategories(cats)
        setMenuItems(items)
        if (cats.length > 0 && cats[0]) {
          setActiveCategoryId(cats[0].id)
        }
      } catch {
        // token expired
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  if (isLoading) return <LoadingSpinner />

  const filteredItems = activeCategoryId
    ? menuItems.filter((item) => item.categoryId === activeCategoryId)
    : menuItems

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900">
            테이블 {tableNumber}
          </h1>
          <button
            onClick={() => navigate('/orders')}
            className="text-sm text-primary-600 hover:underline"
          >
            주문내역
          </button>
        </div>
      </header>

      {/* Categories */}
      <div className="sticky top-[53px] z-10 bg-gray-50 pt-3">
        <CategoryTabs
          categories={categories}
          activeId={activeCategoryId}
          onSelect={setActiveCategoryId}
        />
      </div>

      {/* Menu Grid */}
      <div className="grid gap-4 p-4 sm:grid-cols-2">
        {filteredItems.map((item) => (
          <MenuCard key={item.id} item={item} />
        ))}
      </div>

      {/* Floating Cart Button */}
      {totalItemCount > 0 && (
        <div className="fixed bottom-4 left-0 right-0 px-4">
          <button
            onClick={() => navigate('/cart')}
            className="flex w-full items-center justify-between rounded-xl bg-primary-600 px-6 py-4 text-white shadow-lg transition-colors hover:bg-primary-700"
          >
            <span className="font-semibold">장바구니 보기</span>
            <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-bold">
              {totalItemCount}개
            </span>
          </button>
        </div>
      )}
    </div>
  )
}
