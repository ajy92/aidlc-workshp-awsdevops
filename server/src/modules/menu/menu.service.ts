import { findMenuItemsByStore, findCategoriesByStore } from './menu.repository.js'

export async function getMenuItems(storeId: string, categoryId?: string, lang?: string) {
  const items = await findMenuItemsByStore(storeId, categoryId)

  return items.map((item) => ({
    id: item.id,
    name: lang === 'en' && item.nameEn ? item.nameEn : item.name,
    description: item.description,
    price: item.price,
    imageUrl: item.imageUrl,
    status: item.status,
    categoryId: item.categoryId,
    sortOrder: item.sortOrder,
  }))
}

export async function getCategories(storeId: string) {
  return findCategoriesByStore(storeId)
}
