import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useWebSocket, ChatMessage } from '../hooks/useWebSocket'

const PRESET_CHANNELS = ['general', 'random', 'dev']

export default function Chat() {
  const { user } = useAuth()
  const username = user?.user_name ?? 'guest'

  const [channel, setChannel] = useState(PRESET_CHANNELS[0])
  const [customChannel, setCustomChannel] = useState('')
  const [activeChannel, setActiveChannel] = useState(PRESET_CHANNELS[0])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const handleMessage = (msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg])
  }

  const { send, connected } = useWebSocket({
    channel: activeChannel,
    username,
    onMessage: handleMessage,
  })

  useEffect(() => {
    setMessages([])
  }, [activeChannel])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const joinChannel = () => {
    const target = customChannel.trim() || channel
    if (target) setActiveChannel(target)
  }

  const handleSend = () => {
    const text = input.trim()
    if (!text) return
    send(text)
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.sidebar}>
        <h3 style={styles.sidebarTitle}>Channels</h3>
        {PRESET_CHANNELS.map((ch) => (
          <div
            key={ch}
            style={{
              ...styles.channelItem,
              ...(activeChannel === ch ? styles.channelActive : {}),
            }}
            onClick={() => { setChannel(ch); setActiveChannel(ch) }}
          >
            # {ch}
          </div>
        ))}
        <div style={styles.customRow}>
          <input
            style={styles.customInput}
            placeholder="custom channel"
            value={customChannel}
            onChange={(e) => setCustomChannel(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && joinChannel()}
          />
          <button style={styles.joinBtn} onClick={joinChannel}>Join</button>
        </div>
      </div>

      <div style={styles.chat}>
        <div style={styles.chatHeader}>
          <span style={styles.channelName}># {activeChannel}</span>
          <span style={{ ...styles.dot, background: connected ? '#4caf50' : '#f44336' }} />
          <span style={styles.statusLabel}>{connected ? 'connected' : 'disconnected'}</span>
        </div>

        <div style={styles.messages}>
          {messages.length === 0 && (
            <div style={styles.empty}>No messages yet. Say something!</div>
          )}
          {messages.map((m, i) => (
            <div key={i} style={styles.messageRow}>
              <span style={styles.msgUser}>{m.user}</span>
              <span style={styles.msgText}>{m.text}</span>
              <span style={styles.msgTime}>{new Date(m.ts).toLocaleTimeString()}</span>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <div style={styles.inputRow}>
          <input
            style={styles.textInput}
            placeholder={`Message #${activeChannel}`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button style={styles.sendBtn} onClick={handleSend} disabled={!connected}>
            Send
          </button>
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    display: 'flex',
    height: '80vh',
    width: '80%',
    margin: '20px auto',
    border: '1px solid #333',
    borderRadius: 8,
    overflow: 'hidden',
    background: '#1a1a2e',
    color: '#e0e0e0',
  },
  sidebar: {
    width: 200,
    background: '#16213e',
    padding: '16px 8px',
    borderRight: '1px solid #333',
    flexShrink: 0,
  },
  sidebarTitle: {
    margin: '0 0 12px 8px',
    fontSize: 13,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  channelItem: {
    padding: '6px 12px',
    borderRadius: 4,
    cursor: 'pointer',
    fontSize: 14,
    color: '#aaa',
  },
  channelActive: {
    background: '#0f3460',
    color: '#fff',
  },
  customRow: {
    display: 'flex',
    marginTop: 16,
    gap: 4,
    padding: '0 4px',
  },
  customInput: {
    flex: 1,
    padding: '4px 6px',
    fontSize: 12,
    background: '#0d1b2a',
    border: '1px solid #444',
    borderRadius: 4,
    color: '#e0e0e0',
    minWidth: 0,
  },
  joinBtn: {
    padding: '4px 8px',
    fontSize: 12,
    background: '#0f3460',
    border: 'none',
    borderRadius: 4,
    color: '#fff',
    cursor: 'pointer',
  },
  chat: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  chatHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '12px 16px',
    borderBottom: '1px solid #333',
    background: '#16213e',
  },
  channelName: {
    fontWeight: 600,
    fontSize: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    display: 'inline-block',
  },
  statusLabel: {
    fontSize: 12,
    color: '#888',
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: '12px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  empty: {
    color: '#555',
    fontStyle: 'italic',
    marginTop: 20,
    textAlign: 'center',
  },
  messageRow: {
    display: 'flex',
    gap: 8,
    alignItems: 'baseline',
    flexWrap: 'wrap',
  },
  msgUser: {
    fontWeight: 700,
    color: '#64b5f6',
    fontSize: 13,
    minWidth: 'max-content',
  },
  msgText: {
    fontSize: 14,
    flex: 1,
  },
  msgTime: {
    fontSize: 11,
    color: '#555',
    minWidth: 'max-content',
  },
  inputRow: {
    display: 'flex',
    gap: 8,
    padding: '12px 16px',
    borderTop: '1px solid #333',
    background: '#16213e',
  },
  textInput: {
    flex: 1,
    padding: '8px 12px',
    fontSize: 14,
    background: '#0d1b2a',
    border: '1px solid #444',
    borderRadius: 4,
    color: '#e0e0e0',
  },
  sendBtn: {
    padding: '8px 20px',
    background: '#0f3460',
    border: 'none',
    borderRadius: 4,
    color: '#fff',
    cursor: 'pointer',
    fontSize: 14,
  },
}
