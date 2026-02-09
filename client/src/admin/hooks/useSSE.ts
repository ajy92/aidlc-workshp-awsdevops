import { useEffect, useRef, useCallback } from 'react'

type SSEHandler = (data: unknown) => void

export function useSSE(handlers: Record<string, SSEHandler>) {
  const eventSourceRef = useRef<EventSource | null>(null)
  const handlersRef = useRef(handlers)
  handlersRef.current = handlers

  const connect = useCallback(() => {
    const token = localStorage.getItem('token')
    if (!token) return

    const es = new EventSource(`/api/v1/admin/events?token=${token}`)
    eventSourceRef.current = es

    es.addEventListener('order.created', (e) => {
      const data = JSON.parse(e.data)
      handlersRef.current['order.created']?.(data)
    })

    es.addEventListener('order.status_changed', (e) => {
      const data = JSON.parse(e.data)
      handlersRef.current['order.status_changed']?.(data)
    })

    es.addEventListener('order.deleted', (e) => {
      const data = JSON.parse(e.data)
      handlersRef.current['order.deleted']?.(data)
    })

    es.addEventListener('connected', (e) => {
      const data = JSON.parse(e.data)
      handlersRef.current['connected']?.(data)
    })

    es.onerror = () => {
      es.close()
      // reconnect after 3 seconds
      setTimeout(connect, 3000)
    }
  }, [])

  useEffect(() => {
    connect()
    return () => {
      eventSourceRef.current?.close()
    }
  }, [connect])
}
