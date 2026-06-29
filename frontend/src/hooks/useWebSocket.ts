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

export function useWebSocket({ channel, username, onMessage }: UseWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null)
  const [connected, setConnected] = useState(false)
  const onMessageRef = useRef(onMessage)
  onMessageRef.current = onMessage

  useEffect(() => {
    if (!channel) return

    const proto = window.location.protocol === 'https:' ? 'wss' : 'ws'
    const host = window.location.host
    const url = `${proto}://${host}/ws/chat/${channel}`

    const ws = new WebSocket(url)
    wsRef.current = ws

    ws.onopen = () => setConnected(true)
    ws.onclose = () => setConnected(false)
    ws.onerror = () => setConnected(false)
    ws.onmessage = (e) => {
      try {
        const msg: ChatMessage = JSON.parse(e.data)
        onMessageRef.current(msg)
      } catch {
        // ignore malformed
      }
    }

    return () => {
      ws.close()
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
