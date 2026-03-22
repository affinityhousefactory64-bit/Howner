'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useUser } from '@/lib/context'
import Nav from '@/components/Nav'
import { Conversation, Message } from '@/types'

function timeAgo(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = now - then
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'maintenant'
  if (mins < 60) return `${mins}min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  if (days === 1) return '1j'
  return `${days}j`
}

type EnrichedConversation = Conversation & {
  last_message_preview?: string | null
  last_message_time?: string
}

export default function MessagesPage() {
  const { user, loading } = useUser()
  const router = useRouter()
  const [conversations, setConversations] = useState<EnrichedConversation[]>([])
  const [convsLoading, setConvsLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [msgsLoading, setMsgsLoading] = useState(false)
  const [newMsg, setNewMsg] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [loading, user, router])

  // Load conversations
  const loadConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/conversations')
      if (res.ok) {
        const data = await res.json()
        setConversations(data.conversations || [])
      }
    } catch { /* */ }
    finally { setConvsLoading(false) }
  }, [])

  useEffect(() => {
    if (user) loadConversations()
  }, [user, loadConversations])

  // Load messages for selected conversation
  const loadMessages = useCallback(async (convId: string) => {
    try {
      const res = await fetch(`/api/conversations/${convId}/messages`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages || [])
      }
    } catch { /* */ }
  }, [])

  // Select conversation
  const selectConversation = useCallback((convId: string) => {
    setSelectedId(convId)
    setMsgsLoading(true)
    loadMessages(convId).finally(() => setMsgsLoading(false))

    // Mark as read locally
    setConversations(prev =>
      prev.map(c => c.id === convId ? { ...c, unread_count: 0 } : c)
    )
  }, [loadMessages])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Poll for new messages every 5 seconds
  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current)
    if (!selectedId) return

    pollRef.current = setInterval(() => {
      loadMessages(selectedId)
      loadConversations()
    }, 5000)

    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [selectedId, loadMessages, loadConversations])

  // Send message
  async function handleSend() {
    if (!newMsg.trim() || !selectedId || sending) return
    setSending(true)
    try {
      const res = await fetch(`/api/conversations/${selectedId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMsg.trim() }),
      })
      if (res.ok) {
        setNewMsg('')
        await loadMessages(selectedId)
        loadConversations()
      }
    } catch { /* */ }
    finally { setSending(false) }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const selectedConv = conversations.find(c => c.id === selectedId)

  if (loading || !user) {
    return (
      <div className="loading-page">
        <div className="loading-text">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="page">
      <Nav />
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 12px', height: 'calc(100vh - 60px)' }}>
        <h1 className="heading-lg" style={{ marginBottom: 12, paddingTop: 8 }}>Messages</h1>

        <div style={{
          display: 'flex',
          height: 'calc(100vh - 120px)',
          border: '1px solid rgba(255,255,255,.06)',
          borderRadius: 14,
          overflow: 'hidden',
          background: 'rgba(255,255,255,.02)',
        }}>

          {/* Left panel — conversation list */}
          <div
            className="msg-list-panel"
            style={{
              width: 320,
              minWidth: 280,
              borderRight: '1px solid rgba(255,255,255,.06)',
              overflowY: 'auto',
              display: selectedId ? undefined : undefined,
            }}
          >
            {convsLoading ? (
              <div className="text-xs text-muted text-center" style={{ padding: 30 }}>Chargement...</div>
            ) : conversations.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: 'rgba(255,255,255,.4)', marginBottom: 6 }}>
                  Aucune conversation
                </div>
                <div className="text-xs text-muted" style={{ marginBottom: 14 }}>
                  Les conversations sont créées automatiquement lors d&apos;un match ou d&apos;une réservation.
                </div>
                <Link href="/annonces" className="btn-secondary" style={{ padding: '8px 16px', fontSize: 11 }}>
                  Voir les annonces
                </Link>
              </div>
            ) : (
              conversations.map(conv => {
                const isSelected = conv.id === selectedId
                const hasUnread = (conv.unread_count || 0) > 0
                return (
                  <div
                    key={conv.id}
                    onClick={() => selectConversation(conv.id)}
                    style={{
                      padding: '14px 16px',
                      cursor: 'pointer',
                      borderBottom: '1px solid rgba(255,255,255,.04)',
                      background: isSelected ? 'rgba(207,175,75,.06)' : 'transparent',
                      transition: 'background .15s',
                    }}
                    onMouseEnter={e => { if (!isSelected) (e.currentTarget.style.background = 'rgba(255,255,255,.03)') }}
                    onMouseLeave={e => { if (!isSelected) (e.currentTarget.style.background = 'transparent') }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {/* Avatar */}
                      <div style={{
                        width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                        background: conv.other_user?.pro_photo
                          ? `url(${conv.other_user.pro_photo}) center/cover`
                          : 'rgba(207,175,75,.08)',
                        border: '1px solid rgba(207,175,75,.12)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 16, color: 'rgba(207,175,75,.4)',
                      }}>
                        {!conv.other_user?.pro_photo && '\u2709'}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
                          <span style={{
                            fontFamily: 'var(--b)', fontWeight: hasUnread ? 700 : 500,
                            fontSize: 13, color: hasUnread ? '#fff' : 'rgba(255,255,255,.7)',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>
                            {conv.other_user?.name || 'Utilisateur'}
                          </span>
                          <span className="text-xs text-muted" style={{ flexShrink: 0, fontSize: 10 }}>
                            {timeAgo(conv.last_message_time || conv.last_message_at)}
                          </span>
                        </div>

                        {conv.listing?.title && (
                          <div className="text-xs" style={{ color: 'var(--a)', fontSize: 10, marginTop: 1, opacity: .7 }}>
                            {conv.listing.title}
                          </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 3 }}>
                          <span className="text-xs text-muted" style={{
                            fontSize: 11,
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            maxWidth: '80%',
                            fontWeight: hasUnread ? 600 : 400,
                            color: hasUnread ? 'rgba(255,255,255,.6)' : undefined,
                          }}>
                            {conv.last_message_preview || 'Nouvelle conversation'}
                          </span>
                          {hasUnread && (
                            <span style={{
                              background: 'var(--a)', color: '#0a0e1a',
                              fontSize: 9, fontWeight: 800,
                              padding: '1px 6px', borderRadius: 10,
                              fontFamily: 'var(--b)',
                            }}>
                              {conv.unread_count}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Right panel — chat */}
          <div
            className="msg-chat-panel"
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {!selectedId ? (
              <div style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexDirection: 'column', gap: 8, padding: 20,
              }}>
                <div style={{ fontSize: 32, opacity: .15 }}>{'\u2709'}</div>
                <div className="text-xs text-muted">Sélectionnez une conversation</div>
              </div>
            ) : (
              <>
                {/* Chat header */}
                <div style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid rgba(255,255,255,.06)',
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: 'rgba(255,255,255,.02)',
                }}>
                  {/* Back button (mobile) */}
                  <button
                    className="msg-back-btn"
                    onClick={() => setSelectedId(null)}
                    style={{
                      background: 'none', border: 'none', color: 'var(--a)',
                      fontSize: 18, cursor: 'pointer', padding: '0 4px',
                      display: 'none',
                    }}
                  >
                    &#8592;
                  </button>

                  <div style={{
                    width: 34, height: 34, borderRadius: 8, flexShrink: 0,
                    background: selectedConv?.other_user?.pro_photo
                      ? `url(${selectedConv.other_user.pro_photo}) center/cover`
                      : 'rgba(207,175,75,.08)',
                    border: '1px solid rgba(207,175,75,.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, color: 'rgba(207,175,75,.4)',
                  }}>
                    {!selectedConv?.other_user?.pro_photo && '\u2709'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--b)', fontWeight: 700, fontSize: 13, color: '#fff' }}>
                      {selectedConv?.other_user?.name || 'Utilisateur'}
                    </div>
                    {selectedConv?.other_user?.pro_category && (
                      <div className="text-xs" style={{ color: 'var(--a)', fontSize: 10 }}>
                        {selectedConv.other_user.pro_category}
                      </div>
                    )}
                  </div>
                  {selectedConv?.listing?.title && (
                    <div className="text-xs text-muted" style={{
                      fontSize: 10, padding: '3px 8px', borderRadius: 6,
                      background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.06)',
                    }}>
                      {selectedConv.listing.title}
                    </div>
                  )}
                </div>

                {/* Messages area */}
                <div style={{
                  flex: 1, overflowY: 'auto', padding: '16px 16px 8px',
                  display: 'flex', flexDirection: 'column', gap: 6,
                }}>
                  {msgsLoading ? (
                    <div className="text-xs text-muted text-center" style={{ padding: 30 }}>Chargement...</div>
                  ) : messages.length === 0 ? (
                    <div className="text-xs text-muted text-center" style={{ padding: 30, opacity: .6 }}>
                      Envoyez le premier message
                    </div>
                  ) : (
                    messages.map(msg => {
                      const isMine = msg.sender_id === user.id
                      return (
                        <div key={msg.id} style={{
                          display: 'flex',
                          justifyContent: isMine ? 'flex-end' : 'flex-start',
                        }}>
                          <div style={{
                            maxWidth: '75%',
                            padding: '10px 14px',
                            borderRadius: isMine ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                            background: isMine
                              ? 'rgba(207,175,75,.12)'
                              : 'rgba(255,255,255,.05)',
                            border: isMine
                              ? '1px solid rgba(207,175,75,.2)'
                              : '1px solid rgba(255,255,255,.08)',
                          }}>
                            <div style={{
                              fontFamily: 'var(--b)', fontSize: 13,
                              color: isMine ? 'rgba(255,255,255,.9)' : 'rgba(255,255,255,.75)',
                              lineHeight: 1.45, wordBreak: 'break-word',
                            }}>
                              {msg.content}
                            </div>
                            <div style={{
                              fontSize: 9, marginTop: 4,
                              color: isMine ? 'rgba(207,175,75,.5)' : 'rgba(255,255,255,.2)',
                              textAlign: isMine ? 'right' : 'left',
                              fontFamily: 'var(--m)',
                            }}>
                              {new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input area */}
                <div style={{
                  padding: '10px 12px',
                  borderTop: '1px solid rgba(255,255,255,.06)',
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: 'rgba(255,255,255,.02)',
                }}>
                  <input
                    type="text"
                    value={newMsg}
                    onChange={e => setNewMsg(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Votre message..."
                    style={{
                      flex: 1, padding: '10px 14px', borderRadius: 10,
                      background: 'rgba(255,255,255,.04)',
                      border: '1px solid rgba(255,255,255,.08)',
                      color: '#fff', fontSize: 13, fontFamily: 'var(--b)',
                      outline: 'none',
                    }}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!newMsg.trim() || sending}
                    style={{
                      padding: '10px 18px', borderRadius: 10,
                      background: newMsg.trim()
                        ? 'linear-gradient(135deg, var(--a), #b8932e)'
                        : 'rgba(255,255,255,.04)',
                      border: 'none',
                      color: newMsg.trim() ? '#0a0e1a' : 'rgba(255,255,255,.2)',
                      fontFamily: 'var(--b)', fontWeight: 700, fontSize: 12,
                      cursor: newMsg.trim() ? 'pointer' : 'default',
                      transition: 'all .15s',
                    }}
                  >
                    {sending ? '...' : 'Envoyer'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile-specific styles */}
      <style jsx>{`
        @media (max-width: 640px) {
          .msg-list-panel {
            width: 100% !important;
            min-width: 100% !important;
            border-right: none !important;
            display: ${selectedId ? 'none' : 'block'} !important;
          }
          .msg-chat-panel {
            display: ${selectedId ? 'flex' : 'none'} !important;
          }
          .msg-back-btn {
            display: inline-block !important;
          }
        }
      `}</style>
    </div>
  )
}
