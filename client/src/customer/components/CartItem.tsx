import { useCart, type CartItem as CartItemType } from '../stores/cart-store'

interface CartItemProps {
  item: CartItemType
}

export function CartItem({ item }: CartItemProps) {
  const updateQuantity = useCart((s) => s.updateQuantity)
  const removeItem = useCart((s) => s.removeItem)

  return (
    <div className="flex items-center justify-between rounded-lg border bg-white p-4">
      <div className="flex-1">
        <h4 className="font-medium text-gray-900">{item.name}</h4>
        <p className="text-sm text-gray-500">{item.price.toLocaleString()}원</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-lg border">
          <button
            onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
            className="px-3 py-1 text-gray-500 hover:text-gray-700"
          >
            -
          </button>
          <span className="min-w-[2ch] text-center font-medium">{item.quantity}</span>
          <button
            onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
            className="px-3 py-1 text-gray-500 hover:text-gray-700"
          >
            +
          </button>
        </div>

        <span className="min-w-[5rem] text-right font-semibold">
          {(item.price * item.quantity).toLocaleString()}원
        </span>

        <button
          onClick={() => removeItem(item.menuItemId)}
          className="text-red-400 hover:text-red-600"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
