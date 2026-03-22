'use client'

import { useState, useEffect, useRef } from 'react'
import { Post, PostComment, PostType } from '@/types'
import { useUser } from '@/lib/context'
import Nav from '@/components/Nav'

const TYPE_CONFIG: Record<PostType, { label: string; color: string; bg: string; border: string }> = {
  story: { label: 'Story', color: '#f472b6', bg: 'rgba(244,114,182,.08)', border: 'rgba(244,114,182,.2)' },
  update: { label: 'Update', color: '#60a5fa', bg: 'rgba(96,165,250,.08)', border: 'rgba(96,165,250,.2)' },
  milestone: { label: 'Vente r\u00e9alis\u00e9e !', color: '#cfaf4b', bg: 'rgba(207,175,75,.08)', border: 'rgba(207,175,75,.2)' },
  tip: { label: 'Conseil', color: '#34d399', bg: 'rgba(52,211,153,.08)', border: 'rgba(52,211,153,.2)' },
}

const POST_TYPES: { id: PostType; label: string }[] = [
  { id: 'story', label: 'Story' },
  { id: 'update', label: 'Update' },
  { id: 'milestone', label: 'Milestone' },
  { id: 'tip', label: 'Conseil' },
]

function timeAgo(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = now - then
  const diffMin = Math.floor(diffMs / (1000 * 60))
  if (diffMin < 1) return '\u00e0 l\'instant'
  if (diffMin < 60) return `il y a ${diffMin}min`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `il y a ${diffH}h`
  const diffD = Math.floor(diffH / 24)
  if (diffD === 1) return 'il y a 1 jour'
  return `il y a ${diffD} jours`
}

function userRole(user?: Post['user']): string {
  if (!user?.pro_category) return 'Particulier'
  const roles: Record<string, string> = {
    agent: 'Agent immobilier',
    courtier: 'Courtier',
    artisan: 'Artisan',
    promoteur: 'Promoteur',
    architecte: 'Architecte',
    diagnostiqueur: 'Diagnostiqueur',
    demenageur: 'D\u00e9m\u00e9nageur',
  }
  return roles[user.pro_category] || user.pro_category
}

// Story viewer overlay
function StoryViewer({ post, onClose }: { post: Post; onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,.95)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
      }}
    >
      {/* Header */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        padding: '16px 20px',
        display: 'flex', alignItems: 'center', gap: 10,
        background: 'linear-gradient(to bottom, rgba(0,0,0,.6), transparent)',
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: post.user?.pro_photo ? `url(${post.user.pro_photo}) center/cover` : 'rgba(207,175,75,.15)',
          border: '2px solid var(--a)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, fontWeight: 700, color: 'var(--a)',
        }}>
          {!post.user?.pro_photo && (post.user?.name?.[0] || '?')}
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{post.user?.name}</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)' }}>{timeAgo(post.created_at)}</div>
        </div>
        <div style={{ marginLeft: 'auto', fontSize: 20, color: 'rgba(255,255,255,.5)' }}>x</div>
      </div>

      {/* Content */}
      <div onClick={e => e.stopPropagation()} style={{ maxWidth: 480, width: '100%', padding: '0 20px', textAlign: 'center' }}>
        {post.media_url && post.media_type === 'photo' && (
          <img src={post.media_url} alt="" style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: 12, marginBottom: 16 }} />
        )}
        {post.media_url && post.media_type === 'video' && (
          <video src={post.media_url} controls autoPlay style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: 12, marginBottom: 16 }} />
        )}
        <p style={{ fontSize: 15, color: '#fff', lineHeight: 1.6 }}>{post.content}</p>
      </div>
    </div>
  )
}

// Single post card
function PostCard({
  post, user, onLike, onToggleComments, showComments, comments, onAddComment, loadingComments,
}: {
  post: Post
  user: { id: string } | null
  onLike: (id: string) => void
  onToggleComments: (id: string) => void
  showComments: boolean
  comments: PostComment[]
  onAddComment: (postId: string, content: string) => void
  loadingComments: boolean
}) {
  const [commentText, setCommentText] = useState('')
  const cfg = TYPE_CONFIG[post.type]

  return (
    <div style={{
      background: 'rgba(255,255,255,.02)',
      border: '1px solid rgba(255,255,255,.06)',
      borderRadius: 12,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ padding: '14px 16px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
          background: post.user?.pro_photo ? `url(${post.user.pro_photo}) center/cover` : 'rgba(207,175,75,.1)',
          border: '1px solid rgba(207,175,75,.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, fontWeight: 700, color: 'var(--a)',
        }}>
          {!post.user?.pro_photo && (post.user?.name?.[0] || '?')}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{post.user?.name || 'Utilisateur'}</span>
            <span style={{
              padding: '1px 6px', borderRadius: 4,
              background: cfg.bg, border: `1px solid ${cfg.border}`,
              fontSize: 8, fontWeight: 700, color: cfg.color, textTransform: 'uppercase',
            }}>
              {cfg.label}
            </span>
            {post.is_sponsored && (
              <span style={{ padding: '1px 5px', borderRadius: 4, background: 'rgba(255,255,255,.04)', fontSize: 8, fontWeight: 600, color: 'rgba(255,255,255,.25)' }}>
                SPONSORIS\u00c9
              </span>
            )}
          </div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', marginTop: 1 }}>
            {userRole(post.user)} &middot; {timeAgo(post.created_at)}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '10px 16px' }}>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,.75)', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>
          {post.content}
        </p>
      </div>

      {/* Media */}
      {post.media_url && post.media_type === 'photo' && (
        <div style={{ position: 'relative' }}>
          <img src={post.media_url} alt="" style={{ width: '100%', display: 'block' }} />
        </div>
      )}
      {post.media_url && post.media_type === 'video' && (
        <div style={{ position: 'relative', background: '#000' }}>
          <video src={post.media_url} controls style={{ width: '100%', display: 'block' }} />
        </div>
      )}

      {/* Actions */}
      <div style={{
        padding: '10px 16px',
        display: 'flex', alignItems: 'center', gap: 16,
        borderTop: '1px solid rgba(255,255,255,.04)',
      }}>
        <button
          onClick={() => onLike(post.id)}
          style={{
            background: 'none', border: 'none', cursor: user ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', gap: 5,
            fontSize: 12, color: 'rgba(255,255,255,.4)',
            opacity: user ? 1 : 0.5,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <span style={{ fontFamily: 'var(--b)', fontWeight: 600 }}>{post.likes_count}</span>
        </button>

        <button
          onClick={() => onToggleComments(post.id)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 5,
            fontSize: 12, color: 'rgba(255,255,255,.4)',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span style={{ fontFamily: 'var(--b)', fontWeight: 600 }}>{post.comments_count}</span>
        </button>
      </div>

      {/* Comments section */}
      {showComments && (
        <div style={{
          padding: '0 16px 14px',
          borderTop: '1px solid rgba(255,255,255,.04)',
        }}>
          {loadingComments ? (
            <div style={{ padding: '10px 0', fontSize: 11, color: 'rgba(255,255,255,.25)' }}>Chargement...</div>
          ) : (
            <>
              {comments.length === 0 && (
                <div style={{ padding: '10px 0', fontSize: 11, color: 'rgba(255,255,255,.2)' }}>Aucun commentaire</div>
              )}
              {comments.map(c => (
                <div key={c.id} style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,.03)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.6)' }}>{c.user?.name}</span>
                    <span style={{ fontSize: 9, color: 'rgba(255,255,255,.2)' }}>{timeAgo(c.created_at)}</span>
                  </div>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', margin: '3px 0 0', lineHeight: 1.5 }}>{c.content}</p>
                </div>
              ))}
            </>
          )}

          {/* Add comment */}
          {user && (
            <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
              <input
                type="text"
                placeholder="Votre commentaire..."
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && commentText.trim()) {
                    onAddComment(post.id, commentText.trim())
                    setCommentText('')
                  }
                }}
                style={{
                  flex: 1, padding: '7px 10px', fontSize: 11,
                  background: 'rgba(255,255,255,.04)',
                  border: '1px solid rgba(255,255,255,.08)',
                  borderRadius: 6, color: '#fff', outline: 'none',
                }}
              />
              <button
                onClick={() => {
                  if (commentText.trim()) {
                    onAddComment(post.id, commentText.trim())
                    setCommentText('')
                  }
                }}
                style={{
                  padding: '7px 12px', fontSize: 10, fontWeight: 700,
                  background: 'rgba(207,175,75,.1)', border: '1px solid rgba(207,175,75,.2)',
                  borderRadius: 6, color: 'var(--a)', cursor: 'pointer',
                }}
              >
                Envoyer
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function FeedPage() {
  const { user } = useUser()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('')

  // Post creation
  const [showCreate, setShowCreate] = useState(false)
  const [newType, setNewType] = useState<PostType>('update')
  const [newContent, setNewContent] = useState('')
  const [newMediaUrl, setNewMediaUrl] = useState('')
  const [newMediaType, setNewMediaType] = useState<'photo' | 'video'>('photo')
  const [posting, setPosting] = useState(false)

  // Comments
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({})
  const [commentsData, setCommentsData] = useState<Record<string, PostComment[]>>({})
  const [loadingComments, setLoadingComments] = useState<Record<string, boolean>>({})

  // Story viewer
  const [viewingStory, setViewingStory] = useState<Post | null>(null)

  const storiesRef = useRef<HTMLDivElement>(null)

  useEffect(() => { fetchPosts() }, [filter])

  async function fetchPosts() {
    setLoading(true)
    const params = new URLSearchParams()
    if (filter) params.set('type', filter)
    const res = await fetch(`/api/posts?${params}`)
    const data = await res.json()
    setPosts(data.posts || [])
    setLoading(false)
  }

  async function handleCreatePost() {
    if (!newContent.trim()) return
    setPosting(true)
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: newType,
          content: newContent.trim(),
          media_url: newMediaUrl || null,
          media_type: newMediaUrl ? newMediaType : null,
        }),
      })
      if (res.ok) {
        setNewContent('')
        setNewMediaUrl('')
        setShowCreate(false)
        fetchPosts()
      } else {
        const data = await res.json()
        alert(data.error || 'Erreur')
      }
    } catch {
      alert('Erreur r\u00e9seau')
    } finally {
      setPosting(false)
    }
  }

  async function handleLike(postId: string) {
    if (!user) return
    const res = await fetch(`/api/posts/${postId}/like`, { method: 'POST' })
    if (res.ok) {
      const data = await res.json()
      setPosts(prev =>
        prev.map(p =>
          p.id === postId
            ? { ...p, likes_count: data.liked ? p.likes_count + 1 : Math.max(0, p.likes_count - 1) }
            : p
        )
      )
    }
  }

  async function handleToggleComments(postId: string) {
    const isOpen = openComments[postId]
    setOpenComments(prev => ({ ...prev, [postId]: !isOpen }))

    if (!isOpen && !commentsData[postId]) {
      setLoadingComments(prev => ({ ...prev, [postId]: true }))
      const res = await fetch(`/api/posts/${postId}/comments`)
      const data = await res.json()
      setCommentsData(prev => ({ ...prev, [postId]: data.comments || [] }))
      setLoadingComments(prev => ({ ...prev, [postId]: false }))
    }
  }

  async function handleAddComment(postId: string, content: string) {
    const res = await fetch(`/api/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    })
    if (res.ok) {
      const data = await res.json()
      setCommentsData(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), data.comment],
      }))
      setPosts(prev =>
        prev.map(p => p.id === postId ? { ...p, comments_count: p.comments_count + 1 } : p)
      )
    }
  }

  const stories = posts.filter(p => p.type === 'story')

  return (
    <div className="page">
      <Nav />

      {/* Story viewer overlay */}
      {viewingStory && <StoryViewer post={viewingStory} onClose={() => setViewingStory(null)} />}

      <div style={{ maxWidth: 560, margin: '0 auto', padding: '0 16px 40px' }}>

        {/* Stories row */}
        {stories.length > 0 && (
          <div style={{ marginBottom: 20, paddingTop: 4 }}>
            <div
              ref={storiesRef}
              style={{
                display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8,
                scrollbarWidth: 'none',
              }}
            >
              {stories.map(s => (
                <button
                  key={s.id}
                  onClick={() => setViewingStory(s)}
                  style={{
                    flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                    padding: 0,
                  }}
                >
                  <div style={{
                    width: 56, height: 56, borderRadius: '50%',
                    background: s.user?.pro_photo ? `url(${s.user.pro_photo}) center/cover` : 'rgba(207,175,75,.1)',
                    border: '2px solid #f472b6',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18, fontWeight: 700, color: 'var(--a)',
                  }}>
                    {!s.user?.pro_photo && (s.user?.name?.[0] || '?')}
                  </div>
                  <span style={{
                    fontSize: 9, color: 'rgba(255,255,255,.4)', fontFamily: 'var(--b)',
                    maxWidth: 60, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {s.user?.name?.split(' ')[0] || 'User'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Create post */}
        {user ? (
          <div style={{
            background: 'rgba(255,255,255,.02)',
            border: '1px solid rgba(255,255,255,.06)',
            borderRadius: 12, marginBottom: 16, overflow: 'hidden',
          }}>
            {!showCreate ? (
              <button
                onClick={() => setShowCreate(true)}
                style={{
                  width: '100%', padding: '14px 16px',
                  background: 'none', border: 'none', cursor: 'pointer',
                  textAlign: 'left', fontSize: 12, color: 'rgba(255,255,255,.3)',
                  fontFamily: 'var(--b)',
                }}
              >
                Partager une actualit\u00e9, un conseil, une r\u00e9ussite...
              </button>
            ) : (
              <div style={{ padding: 16 }}>
                {/* Type selector */}
                <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
                  {POST_TYPES.map(t => {
                    const cfg = TYPE_CONFIG[t.id]
                    return (
                      <button
                        key={t.id}
                        onClick={() => setNewType(t.id)}
                        style={{
                          padding: '4px 10px', borderRadius: 6, fontSize: 10, fontWeight: 700,
                          background: newType === t.id ? cfg.bg : 'transparent',
                          border: `1px solid ${newType === t.id ? cfg.border : 'rgba(255,255,255,.06)'}`,
                          color: newType === t.id ? cfg.color : 'rgba(255,255,255,.3)',
                          cursor: 'pointer',
                        }}
                      >
                        {t.label}
                      </button>
                    )
                  })}
                </div>

                {/* Content */}
                <textarea
                  placeholder="Quoi de neuf ?"
                  value={newContent}
                  onChange={e => setNewContent(e.target.value)}
                  rows={3}
                  style={{
                    width: '100%', padding: '10px 12px', fontSize: 13,
                    background: 'rgba(255,255,255,.03)',
                    border: '1px solid rgba(255,255,255,.08)',
                    borderRadius: 8, color: '#fff', outline: 'none',
                    resize: 'vertical', fontFamily: 'var(--b)', lineHeight: 1.5,
                  }}
                />

                {/* Media URL */}
                <div style={{ display: 'flex', gap: 6, marginTop: 10, alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder="URL photo ou vid\u00e9o (optionnel)"
                    value={newMediaUrl}
                    onChange={e => setNewMediaUrl(e.target.value)}
                    style={{
                      flex: 1, padding: '7px 10px', fontSize: 11,
                      background: 'rgba(255,255,255,.03)',
                      border: '1px solid rgba(255,255,255,.06)',
                      borderRadius: 6, color: '#fff', outline: 'none',
                    }}
                  />
                  {newMediaUrl && (
                    <select
                      value={newMediaType}
                      onChange={e => setNewMediaType(e.target.value as 'photo' | 'video')}
                      style={{
                        padding: '7px 8px', fontSize: 10,
                        background: 'rgba(255,255,255,.04)',
                        border: '1px solid rgba(255,255,255,.08)',
                        borderRadius: 6, color: 'rgba(255,255,255,.5)',
                      }}
                    >
                      <option value="photo">Photo</option>
                      <option value="video">Vid\u00e9o</option>
                    </select>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => { setShowCreate(false); setNewContent(''); setNewMediaUrl('') }}
                    style={{
                      padding: '7px 14px', fontSize: 11,
                      background: 'none', border: '1px solid rgba(255,255,255,.08)',
                      borderRadius: 6, color: 'rgba(255,255,255,.3)', cursor: 'pointer',
                    }}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleCreatePost}
                    disabled={posting || !newContent.trim()}
                    style={{
                      padding: '7px 16px', fontSize: 11, fontWeight: 700,
                      background: 'linear-gradient(135deg, var(--a), #b8932e)',
                      border: 'none', borderRadius: 6, color: '#0a0e1a', cursor: 'pointer',
                      opacity: posting || !newContent.trim() ? 0.5 : 1,
                    }}
                  >
                    {posting ? 'Publication...' : 'Publier'}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{
            background: 'rgba(255,255,255,.02)',
            border: '1px solid rgba(255,255,255,.06)',
            borderRadius: 12, marginBottom: 16, padding: '14px 16px',
            textAlign: 'center',
          }}>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,.3)', fontFamily: 'var(--b)' }}>
              Connectez-vous pour publier
            </span>
          </div>
        )}

        {/* Filter chips */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
          {[{ id: '', label: 'Tous' }, ...POST_TYPES].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`filter-chip ${filter === f.id ? 'active' : ''}`}
              style={{ padding: '5px 12px', fontSize: 10 }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Feed */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, fontSize: 11, color: 'rgba(255,255,255,.25)' }}>
            Chargement...
          </div>
        ) : posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.2)', marginBottom: 8 }}>Aucun post pour le moment</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.15)' }}>Soyez le premier a publier</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {posts.map(p => (
              <PostCard
                key={p.id}
                post={p}
                user={user}
                onLike={handleLike}
                onToggleComments={handleToggleComments}
                showComments={!!openComments[p.id]}
                comments={commentsData[p.id] || []}
                onAddComment={handleAddComment}
                loadingComments={!!loadingComments[p.id]}
              />
            ))}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 10, color: 'rgba(255,255,255,.12)' }}>
          {posts.length} post{posts.length > 1 ? 's' : ''}
        </div>
      </div>
    </div>
  )
}
