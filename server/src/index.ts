// 로컬 개발용 dotenv (Vercel에서는 불필요)
if (!process.env.SUPABASE_URL) {
  const { config } = await import('dotenv')
  const { resolve, dirname } = await import('path')
  const { fileURLToPath } = await import('url')
  const __dirname = dirname(fileURLToPath(import.meta.url))
  config({ path: resolve(__dirname, '../../.env') })
}

import { app } from './app.js'

const port = process.env.PORT ?? 4000

app.listen(port, () => {
  process.stdout.write(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'INFO',
    message: `Server running on port ${port}`,
  }) + '\n')
})
