'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/lib/context'
import Nav from '@/components/Nav'

interface Profile {
  id: string
  name: string
  type: string
  sub: string
  price: string | null
  tags: string[]
  color: string
  role: string
}

export default function MatchPage() {
  const { user, loading } = useUser()
  const router = useRouter()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [swipeDir, setSwipeDir] = useState<'left' | 'right' | null>(null)
  const [matchPopup, setMatchPopup] = useState<string | null>(null)
  const [dragX, setDragX] = useState(0)
  const [dragging, setDragging] = useState(false)
  const startX = useRef(0)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
      return
    }
    if (user) {
      fetch('/api/match/profiles')
        .then((r) => r.json())
        .then((d) => setProfiles(d.profiles || []))
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="loading-page">
        <div className="loading-text">Chargement...</div>
      </div>
    )
  }

  if (!user) return null

  const currentProfile = profiles[currentIndex]
  const done = currentIndex >= profiles.length

  async function handleSwipe(direction: 'left' | 'right') {
    if (!currentProfile || swipeDir) return
    setSwipeDir(direction)

    try {
      const res = await fetch('/api/match/swipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId: currentProfile.id, direction }),
      })
      const data = await res.json()
      if (data.isMatch) {
        setMatchPopup(currentProfile.name)
      }
    } catch {
      // silently continue
    }

    setTimeout(() => {
      setSwipeDir(null)
      setDragX(0)
      setCurrentIndex((i) => i + 1)
    }, 300)
  }

  function onPointerDown(e: React.PointerEvent) {
    startX.current = e.clientX
    setDragging(true)
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging) return
    setDragX(e.clientX - startX.current)
  }

  function onPointerUp() {
    if (!dragging) return
    setDragging(false)
    if (dragX > 80) {
      handleSwipe('right')
    } else if (dragX < -80) {
      handleSwipe('left')
    } else {
      setDragX(0)
    }
  }

  const cardTransform = swipeDir
    ? `translateX(${swipeDir === 'right' ? 400 : -400}px) rotate(${swipeDir === 'right' ? 15 : -15}deg)`
    : `translateX(${dragX}px) rotate(${dragX * 0.05}deg)`

  return (
    <div className="page">
      <Nav />
      <div className="content-narrow" style={{ maxWidth: 420 }}>
        <h1 className="heading-lg mb-8">Matching</h1>
        <p className="text-xs text-muted mb-24">
          Swipez pour trouver vos partenaires immobiliers
        </p>

        {/* Match popup */}
        {matchPopup && (
          <div
            style={{
              position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,.8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 16,
            }}
            onClick={() => setMatchPopup(null)}
          >
            <div className="text-center" style={{ padding: 40 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>&#127881;</div>
              <div style={{ fontFamily: 'var(--d)', fontSize: 28, fontWeight: 800, color: 'var(--a)', marginBottom: 8 }}>Match !</div>
              <div className="text-sm text-muted" style={{ marginBottom: 20 }}>
                Vous et <strong style={{ color: '#fff' }}>{matchPopup}</strong> êtes connectés
              </div>
              <button
                onClick={() => setMatchPopup(null)}
                className="btn-primary"
                style={{ padding: '10px 28px', fontSize: 12 }}
              >
                Continuer
              </button>
            </div>
          </div>
        )}

        {/* Card area */}
        <div className="match-area">
          {done ? (
            <div className="card" style={{
              height: '100%', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ fontFamily: 'var(--d)', fontSize: 18, fontWeight: 800, marginBottom: 6 }}>Plus de profils</div>
              <div className="text-xs text-muted">
                Revenez plus tard pour de nouvelles découvertes
              </div>
            </div>
          ) : currentProfile ? (
            <>
              {/* Next card preview */}
              {profiles[currentIndex + 1] && (
                <div style={{
                  position: 'absolute', inset: 0, borderRadius: 16,
                  background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.04)',
                  transform: 'scale(0.95)', transformOrigin: 'bottom center',
                }} />
              )}

              {/* Active card */}
              <div
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerLeave={() => { if (dragging) { setDragging(false); setDragX(0) } }}
                style={{
                  position: 'absolute', inset: 0, borderRadius: 16,
                  background: `linear-gradient(160deg, ${currentProfile.color}15, rgba(255,255,255,.02))`,
                  border: `1px solid ${currentProfile.color}30`,
                  padding: '24px 20px', cursor: 'grab', userSelect: 'none',
                  transform: cardTransform,
                  transition: swipeDir ? 'transform 0.3s ease-out' : dragging ? 'none' : 'transform 0.2s ease',
                  touchAction: 'none',
                  overflow: 'hidden',
                }}
              >
                {/* Swipe indicators */}
                {dragX > 30 && (
                  <div style={{
                    position: 'absolute', top: 20, left: 20, padding: '6px 16px',
                    border: '2px solid #34d399', borderRadius: 8,
                    fontWeight: 700, fontSize: 16, color: '#34d399',
                    transform: 'rotate(-12deg)',
                  }}>LIKE</div>
                )}
                {dragX < -30 && (
                  <div style={{
                    position: 'absolute', top: 20, right: 20, padding: '6px 16px',
                    border: '2px solid #f87171', borderRadius: 8,
                    fontWeight: 700, fontSize: 16, color: '#f87171',
                    transform: 'rotate(12deg)',
                  }}>NOPE</div>
                )}

                {/* Role badge */}
                <div className="badge mb-20" style={{
                  background: `${currentProfile.color}20`, border: `1px solid ${currentProfile.color}40`,
                  fontSize: 9, color: currentProfile.color,
                  fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase',
                }}>
                  {currentProfile.role}
                </div>

                {/* Name */}
                <div style={{ fontFamily: 'var(--d)', fontSize: 24, fontWeight: 800, marginBottom: 6 }}>
                  {currentProfile.name}
                </div>

                {/* Sub info */}
                <div className="text-xs text-muted mb-16">
                  {currentProfile.sub}
                </div>

                {/* Price if any */}
                {currentProfile.price && (
                  <div className="mono mb-16" style={{ fontSize: 22, color: currentProfile.color, fontWeight: 700 }}>
                    {currentProfile.price}
                  </div>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-6 mb-24">
                  {currentProfile.tags.map((tag) => (
                    <span key={tag} className="chip-btn" style={{ cursor: 'default' }}>
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Counter */}
                <div className="mono text-xs" style={{
                  position: 'absolute', bottom: 16, left: 0, right: 0, textAlign: 'center',
                  color: 'rgba(255,255,255,.15)',
                }}>
                  {currentIndex + 1} / {profiles.length}
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Action buttons */}
        {!done && currentProfile && (
          <div className="flex justify-center" style={{ gap: 16 }}>
            <button
              onClick={() => handleSwipe('left')}
              disabled={!!swipeDir}
              className="swipe-btn nope"
            >
              &#10005;
            </button>
            <button
              onClick={() => handleSwipe('right')}
              disabled={!!swipeDir}
              className="swipe-btn like"
            >
              &#9829;
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
