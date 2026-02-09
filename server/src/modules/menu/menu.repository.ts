import { supabase } from '../../db/client.js'
import { toCamelArray, toCamel } from '../../db/mappers.js'

export interface MenuItem {
  id: string
  storeId: string
  categoryId: string
  name: string
  nameEn: string | null
  description: string | null
  price: number
  imageUrl: string | null
  status: string
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  storeId: string
  name: string
  sortOrder: number
  createdAt: string
}

export async function findMenuItemsByStore(storeId: string, categoryId?: string) {
  let query = supabase
    .from('menu_items')
    .select('*')
    .eq('store_id', storeId)

  if (categoryId) {
    query = query.eq('category_id', categoryId)
  }

  const { data, error } = await query.order('sort_order')
  if (error) throw new Error(`메뉴 조회 실패: ${error.message}`)

  return toCamelArray<MenuItem>(data)
}

export async function findCategoriesByStore(storeId: string) {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('store_id', storeId)
    .order('sort_order')

  if (error) throw new Error(`카테고리 조회 실패: ${error.message}`)

  return toCamelArray<Category>(data)
}

export async function findMenuItemById(id: string) {
  const { data } = await supabase
    .from('menu_items')
    .select('*')
    .eq('id', id)
    .single()

  return toCamel<MenuItem>(data)
}
