import bcrypt from 'bcrypt'
import { supabase } from './client.js'

async function seed() {
  process.stdout.write('Seeding database...\n')

  // 1. Store
  const { data: store, error: storeError } = await supabase
    .from('stores')
    .insert({ store_identifier: 'demo-store', name: '데모 매장' })
    .select()
    .single()

  if (storeError) throw new Error(`Store 생성 실패: ${storeError.message}`)

  // 2. Admin
  const adminHash = await bcrypt.hash('admin1234', 12)
  const { error: adminError } = await supabase
    .from('admins')
    .insert({ store_id: store.id, username: 'admin', password_hash: adminHash })

  if (adminError) throw new Error(`Admin 생성 실패: ${adminError.message}`)

  // 3. Tables (1~5)
  const tableHash = await bcrypt.hash('1234', 12)
  const tableRows = Array.from({ length: 5 }, (_, i) => ({
    store_id: store.id,
    table_number: i + 1,
    password_hash: tableHash,
  }))
  const { error: tableError } = await supabase.from('table_info').insert(tableRows)
  if (tableError) throw new Error(`Tables 생성 실패: ${tableError.message}`)

  // 4. Categories
  const catData = [
    { store_id: store.id, name: '메인 요리', sort_order: 1 },
    { store_id: store.id, name: '사이드', sort_order: 2 },
    { store_id: store.id, name: '음료', sort_order: 3 },
    { store_id: store.id, name: '디저트', sort_order: 4 },
  ]
  const { data: insertedCats, error: catError } = await supabase
    .from('categories')
    .insert(catData)
    .select()

  if (catError) throw new Error(`Categories 생성 실패: ${catError.message}`)

  // 5. Menu items
  const menus = [
    { categoryIdx: 0, name: '김치찌개', name_en: 'Kimchi Stew', description: '돼지고기 김치찌개', price: 9000 },
    { categoryIdx: 0, name: '된장찌개', name_en: 'Soybean Paste Stew', description: '두부 된장찌개', price: 8000 },
    { categoryIdx: 0, name: '불고기', name_en: 'Bulgogi', description: '소고기 불고기', price: 15000 },
    { categoryIdx: 0, name: '비빔밥', name_en: 'Bibimbap', description: '야채 비빔밥', price: 10000 },
    { categoryIdx: 0, name: '치킨 버거', name_en: 'Chicken Burger', description: '바삭한 치킨 버거', price: 12000 },
    { categoryIdx: 1, name: '계란말이', name_en: 'Rolled Omelette', description: '부드러운 계란말이', price: 7000 },
    { categoryIdx: 1, name: '감자튀김', name_en: 'French Fries', description: '바삭한 감자튀김', price: 5000 },
    { categoryIdx: 1, name: '샐러드', name_en: 'Salad', description: '신선한 야채 샐러드', price: 6000 },
    { categoryIdx: 2, name: '콜라', name_en: 'Cola', description: '코카콜라 350ml', price: 2000 },
    { categoryIdx: 2, name: '사이다', name_en: 'Sprite', description: '스프라이트 350ml', price: 2000 },
    { categoryIdx: 2, name: '맥주', name_en: 'Beer', description: '생맥주 500ml', price: 5000 },
    { categoryIdx: 3, name: '아이스크림', name_en: 'Ice Cream', description: '바닐라 아이스크림', price: 3000 },
  ]

  const menuRows = menus.map((m, i) => ({
    store_id: store.id,
    category_id: insertedCats[m.categoryIdx].id,
    name: m.name,
    name_en: m.name_en,
    description: m.description,
    price: m.price,
    status: 'ON_SALE',
    sort_order: i,
  }))

  const { error: menuError } = await supabase.from('menu_items').insert(menuRows)
  if (menuError) throw new Error(`Menu items 생성 실패: ${menuError.message}`)

  process.stdout.write(`Seed complete. Store: ${store.store_identifier}\n`)
  process.stdout.write('Admin login: admin / admin1234\n')
  process.stdout.write('Table login: table 1~5 / 1234\n')
  process.exit(0)
}

seed().catch((err) => {
  process.stderr.write(`Seed failed: ${err.message}\n`)
  process.exit(1)
})
