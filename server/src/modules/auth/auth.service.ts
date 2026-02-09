import bcrypt from 'bcrypt'
import { supabase } from '../../db/client.js'
import { toCamel } from '../../db/mappers.js'
import { signToken } from '../../shared/middleware/auth.js'
import { AuthError } from '../../shared/errors/domain-error.js'
import type { AdminLoginInput, TableLoginInput } from './auth.schema.js'

interface Store { id: string; storeIdentifier: string; name: string }
interface Admin { id: string; storeId: string; username: string; passwordHash: string }
interface TableRow { id: string; storeId: string; tableNumber: number; passwordHash: string }

export async function loginAdmin(input: AdminLoginInput) {
  const { data: storeRow } = await supabase
    .from('stores')
    .select('*')
    .eq('store_identifier', input.storeIdentifier)
    .single()

  const store = toCamel<Store>(storeRow)
  if (!store) {
    throw new AuthError('AUTH_INVALID_CREDENTIALS', '매장 정보 또는 계정 정보가 올바르지 않습니다')
  }

  const { data: adminRow } = await supabase
    .from('admins')
    .select('*')
    .eq('store_id', store.id)
    .eq('username', input.username)
    .single()

  const admin = toCamel<Admin>(adminRow)
  if (!admin) {
    throw new AuthError('AUTH_INVALID_CREDENTIALS', '매장 정보 또는 계정 정보가 올바르지 않습니다')
  }

  const valid = await bcrypt.compare(input.password, admin.passwordHash)
  if (!valid) {
    throw new AuthError('AUTH_INVALID_CREDENTIALS', '매장 정보 또는 계정 정보가 올바르지 않습니다')
  }

  const token = signToken({ sub: admin.id, role: 'ADMIN', storeId: store.id })

  return {
    token,
    store: { id: store.id, name: store.name, identifier: store.storeIdentifier },
  }
}

export async function loginTable(input: TableLoginInput) {
  const { data: storeRow } = await supabase
    .from('stores')
    .select('*')
    .eq('store_identifier', input.storeIdentifier)
    .single()

  const store = toCamel<Store>(storeRow)
  if (!store) {
    throw new AuthError('AUTH_INVALID_CREDENTIALS', '매장 정보 또는 테이블 정보가 올바르지 않습니다')
  }

  const { data: tableRow } = await supabase
    .from('table_info')
    .select('*')
    .eq('store_id', store.id)
    .eq('table_number', input.tableNumber)
    .single()

  const table = toCamel<TableRow>(tableRow)
  if (!table) {
    throw new AuthError('AUTH_INVALID_CREDENTIALS', '매장 정보 또는 테이블 정보가 올바르지 않습니다')
  }

  const valid = await bcrypt.compare(input.password, table.passwordHash)
  if (!valid) {
    throw new AuthError('AUTH_INVALID_CREDENTIALS', '매장 정보 또는 테이블 정보가 올바르지 않습니다')
  }

  const token = signToken({
    sub: table.id,
    role: 'TABLE',
    storeId: store.id,
    tableId: table.id,
    tableNumber: table.tableNumber,
  })

  return {
    token,
    store: { id: store.id, name: store.name },
    table: { id: table.id, tableNumber: table.tableNumber },
  }
}
