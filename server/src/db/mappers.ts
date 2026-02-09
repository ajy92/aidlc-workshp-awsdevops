type SnakeRecord = Record<string, unknown>

function snakeToCamelKey(key: string): string {
  return key.replace(/_([a-z])/g, (_, char) => char.toUpperCase())
}

function camelToSnakeKey(key: string): string {
  return key.replace(/[A-Z]/g, (char) => `_${char.toLowerCase()}`)
}

export function toCamel<T>(row: SnakeRecord | null): T | null {
  if (!row) return null
  const result: Record<string, unknown> = {}
  for (const key of Object.keys(row)) {
    result[snakeToCamelKey(key)] = row[key]
  }
  return result as T
}

export function toCamelRequired<T>(row: SnakeRecord | null): T {
  if (!row) throw new Error('Expected row but got null')
  return toCamel<T>(row)!
}

export function toCamelArray<T>(rows: SnakeRecord[] | null): T[] {
  if (!rows) return []
  return rows.map((row) => toCamel<T>(row)!)
}

export function toSnake(obj: Record<string, unknown>): SnakeRecord {
  const result: SnakeRecord = {}
  for (const key of Object.keys(obj)) {
    result[camelToSnakeKey(key)] = obj[key]
  }
  return result
}
