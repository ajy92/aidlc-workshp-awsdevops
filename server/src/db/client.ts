import { createClient } from '@supabase/supabase-js'

// Vercel: process.env에 직접 주입됨. 로컬: dotenv로 .env 로드
if (!process.env.SUPABASE_URL) {
  const { config } = await import('dotenv')
  const { resolve, dirname } = await import('path')
  const { fileURLToPath } = await import('url')
  const __dirname = dirname(fileURLToPath(import.meta.url))
  config({ path: resolve(__dirname, '../../../.env') })
}

const supabaseUrl = process.env.SUPABASE_URL ?? ''
const supabaseKey = process.env.SUPABASE_KEY ?? ''

if (!supabaseUrl || !supabaseKey) {
  throw new Error('SUPABASE_URL, SUPABASE_KEY 환경변수가 설정되지 않았습니다')
}

export const supabase = createClient(supabaseUrl, supabaseKey)
