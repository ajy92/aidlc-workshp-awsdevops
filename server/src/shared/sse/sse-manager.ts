import { randomUUID } from 'crypto'
import type { Response } from 'express'

interface SSEClient {
  id: string
  storeId: string
  res: Response
}

export interface SSEEvent {
  eventId: string
  eventType: string
  timestamp: string
  data: unknown
}

class SSEManager {
  private clients = new Map<string, SSEClient>()

  addClient(storeId: string, res: Response): string {
    const id = randomUUID()
    this.clients.set(id, { id, storeId, res })

    res.on('close', () => {
      this.clients.delete(id)
    })

    return id
  }

  broadcast(storeId: string, eventType: string, data: unknown): void {
    const event: SSEEvent = {
      eventId: randomUUID(),
      eventType,
      timestamp: new Date().toISOString(),
      data,
    }

    for (const client of this.clients.values()) {
      if (client.storeId === storeId) {
        client.res.write(`event: ${eventType}\ndata: ${JSON.stringify(event)}\nid: ${event.eventId}\n\n`)
      }
    }
  }

  getClientCount(storeId?: string): number {
    if (!storeId) return this.clients.size
    let count = 0
    for (const client of this.clients.values()) {
      if (client.storeId === storeId) count++
    }
    return count
  }
}

export const sseManager = new SSEManager()
