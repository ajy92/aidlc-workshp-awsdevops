import { supabase } from '../../db/client.js'
import { toCamel, toCamelRequired } from '../../db/mappers.js'

export interface Session {
  id: string
  storeId: string
  tableId: string
  status: string
  startedAt: string
  completedAt: string | null
}

export async function findActiveSession(storeId: string, tableId: string) {
  const { data } = await supabase
    .from('table_sessions')
    .select('*')
    .eq('store_id', storeId)
    .eq('table_id', tableId)
    .eq('status', 'ACTIVE')
    .maybeSingle()

  return toCamel<Session>(data)
}

export async function createSession(storeId: string, tableId: string) {
  const { data, error } = await supabase
    .from('table_sessions')
    .insert({ store_id: storeId, table_id: tableId, status: 'ACTIVE' })
    .select()
    .single()

  if (error) throw new Error(`세션 생성 실패: ${error.message}`)

  return toCamelRequired<Session>(data)
}

export async function completeSession(sessionId: string) {
  const { data, error } = await supabase
    .from('table_sessions')
    .update({ status: 'COMPLETED', completed_at: new Date().toISOString() })
    .eq('id', sessionId)
    .select()
    .single()

  if (error) throw new Error(`세션 완료 실패: ${error.message}`)

  return toCamelRequired<Session>(data)
}
