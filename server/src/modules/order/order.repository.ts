import { supabase } from '../../db/client.js'
import { toCamel, toCamelRequired, toCamelArray } from '../../db/mappers.js'

export interface Order {
  id: string
  storeId: string
  tableId: string
  sessionId: string
  orderNumber: number
  status: string
  totalAmount: number
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  id: string
  orderId: string
  menuItemId: string
  menuName: string
  quantity: number
  unitPrice: number
}

export interface OrderWithItems extends Order {
  items: OrderItem[]
}

export async function getNextOrderNumber(storeId: string) {
  const { data } = await supabase
    .from('orders')
    .select('order_number')
    .eq('store_id', storeId)
    .order('order_number', { ascending: false })
    .limit(1)

  return (data?.[0]?.order_number ?? 0) + 1
}

export async function createOrder(data: {
  storeId: string
  tableId: string
  sessionId: string
  orderNumber: number
  totalAmount: number
  items: Array<{ menuItemId: string; menuName: string; quantity: number; unitPrice: number }>
}) {
  const { data: orderRow, error: orderError } = await supabase
    .from('orders')
    .insert({
      store_id: data.storeId,
      table_id: data.tableId,
      session_id: data.sessionId,
      order_number: data.orderNumber,
      total_amount: data.totalAmount,
      status: 'PENDING',
    })
    .select()
    .single()

  if (orderError) throw new Error(`주문 생성 실패: ${orderError.message}`)

  const order = toCamelRequired<Order>(orderRow)

  const itemRows = data.items.map((item) => ({
    order_id: order.id,
    menu_item_id: item.menuItemId,
    menu_name: item.menuName,
    quantity: item.quantity,
    unit_price: item.unitPrice,
  }))

  const { error: itemsError } = await supabase.from('order_items').insert(itemRows)
  if (itemsError) throw new Error(`주문 항목 생성 실패: ${itemsError.message}`)

  return { ...order, items: data.items }
}

export async function findOrderById(id: string) {
  const { data: orderRow } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single()

  const order = toCamel<Order>(orderRow)
  if (!order) return null

  const { data: itemRows } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', id)

  const items = toCamelArray<OrderItem>(itemRows)
  return { ...order, items }
}

export async function findOrdersBySession(sessionId: string): Promise<OrderWithItems[]> {
  const { data: orderRows } = await supabase
    .from('orders')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })

  const orders = toCamelArray<Order>(orderRows)
  const result: OrderWithItems[] = []

  for (const order of orders) {
    const { data: itemRows } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', order.id)

    result.push({ ...order, items: toCamelArray<OrderItem>(itemRows) })
  }

  return result
}

export async function findOrdersByStore(storeId: string): Promise<OrderWithItems[]> {
  const { data: orderRows } = await supabase
    .from('orders')
    .select('*')
    .eq('store_id', storeId)
    .order('created_at', { ascending: false })

  const orders = toCamelArray<Order>(orderRows)
  const result: OrderWithItems[] = []

  for (const order of orders) {
    const { data: itemRows } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', order.id)

    result.push({ ...order, items: toCamelArray<OrderItem>(itemRows) })
  }

  return result
}

export async function updateOrderStatus(id: string, status: string) {
  const { data, error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(`주문 상태 변경 실패: ${error.message}`)

  return toCamelRequired<Order>(data)
}

export async function deleteOrder(id: string) {
  // CASCADE: order_items automatically deleted
  const { error } = await supabase.from('orders').delete().eq('id', id)
  if (error) throw new Error(`주문 삭제 실패: ${error.message}`)
}

export async function deleteOrdersBySession(sessionId: string) {
  // CASCADE: order_items automatically deleted
  const { error } = await supabase.from('orders').delete().eq('session_id', sessionId)
  if (error) throw new Error(`세션 주문 삭제 실패: ${error.message}`)
}
