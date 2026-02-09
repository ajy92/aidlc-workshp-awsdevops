import type { MenuItem } from '@/shared/types/api'
import { useCart } from '../stores/cart-store'

interface MenuCardProps {
  item: MenuItem
}

export function MenuCard({ item }: MenuCardProps) {
  const addItem = useCart((s) => s.addItem)
  const isSoldOut = item.status === 'SOLD_OUT'

  const handleAdd = () => {
    if (isSoldOut) return
    addItem({
      menuItemId: item.id,
      name: item.name,
      price: item.price,
    })
  }

  return (
    <div
      className={`overflow-hidden rounded-xl border bg-white shadow-sm transition-shadow hover:shadow-md ${
        isSoldOut ? 'opacity-50' : ''
      }`}
    >
      {item.imageUrl && (
        <div className="aspect-video w-full overflow-hidden bg-gray-100">
          <img
            src={item.imageUrl}
            alt={item.name}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className="p-4">
        <div className="mb-2 flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">{item.name}</h3>
            {item.nameEn && (
              <p className="text-xs text-gray-400">{item.nameEn}</p>
            )}
          </div>
          {isSoldOut && (
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600">
              품절
            </span>
          )}
        </div>

        {item.description && (
          <p className="mb-3 text-sm text-gray-500">{item.description}</p>
        )}

        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-primary-600">
            {item.price.toLocaleString()}원
          </span>
          <button
            onClick={handleAdd}
            disabled={isSoldOut}
            className="min-h-[44px] min-w-[44px] rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            담기
          </button>
        </div>
      </div>
    </div>
  )
}
