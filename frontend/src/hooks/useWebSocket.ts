import { useEffect, useRef, useCallback, useState } from 'react'

export interface ChatMessage {
  user: string
  text: string
  ts: number
}

interface UseWebSocketOptions {
  channel: string
  username: string
  onMessage: (msg: ChatMessage) => void
}

const INITIAL_DELAY = 1000
const MAX_DELAY = 30000

export function useWebSocket({ channel, username, onMessage }: UseWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null)
  const [connected, setConnected] = useState(false)
  const onMessageRef = useRef(onMessage)
  const retryDelay = useRef(INITIAL_DELAY)
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const destroyed = useRef(false)

  onMessageRef.current = onMessage

  useEffect(() => {
    if (!channel) return
    destroyed.current = false
    retryDelay.current = INITIAL_DELAY

    const proto = window.location.protocol === 'https:' ? 'wss' : 'ws'
    const host = window.location.host
    const url = `${proto}://${host}/ws/chat/${channel}`

    function connect() {
      if (destroyed.current) return

      const ws = new WebSocket(url)
      wsRef.current = ws

      ws.onopen = () => {
        setConnected(true)
        retryDelay.current = INITIAL_DELAY
      }

      ws.onmessage = (e) => {
        try {
          const msg: ChatMessage = JSON.parse(e.data)
          onMessageRef.current(msg)
        } catch {
          // ignore malformed
        }
      }

      ws.onclose = () => {
        if (wsRef.current !== ws) return
        setConnected(false)
        wsRef.current = null
        if (!destroyed.current) {
          retryTimer.current = setTimeout(() => {
            retryDelay.current = Math.min(retryDelay.current * 2, MAX_DELAY)
            connect()
          }, retryDelay.current)
        }
      }

      ws.onerror = () => {
        ws.close()
      }
    }

    connect()

    return () => {
      destroyed.current = true
      if (retryTimer.current) clearTimeout(retryTimer.current)
      wsRef.current?.close()
      wsRef.current = null
      setConnected(false)
    }
  }, [channel])

  const send = useCallback((text: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ user: username, text, ts: Date.now() }))
    }
  }, [username])

  return { send, connected }
}
