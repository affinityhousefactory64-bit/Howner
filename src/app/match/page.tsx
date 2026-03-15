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
      <div style={{ minHeight: '100vh', background: '#0a0e1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'var(--b)', color: 'rgba(255,255,255,.3)' }}>Chargement...</div>
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
    <div style={{ minHeight: '100vh', background: '#0a0e1a', color: '#fff' }}>
      <Nav />
      <div style={{ maxWidth: 420, margin: '0 auto', padding: '28px 18px' }}>
        <h1 style={{ fontFamily: 'var(--d)', fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Matching</h1>
        <p style={{ fontFamily: 'var(--b)', fontSize: 11, color: 'rgba(255,255,255,.3)', marginBottom: 24 }}>
          Swipez pour trouver vos partenaires immobiliers
        </p>

        {/* Match popup */}
        {matchPopup && (
          <div
            style={{
              position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,.8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            onClick={() => setMatchPopup(null)}
          >
            <div style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
              <div style={{ fontFamily: 'var(--d)', fontSize: 28, fontWeight: 800, color: 'var(--a)', marginBottom: 8 }}>Match !</div>
              <div style={{ fontFamily: 'var(--b)', fontSize: 14, color: 'rgba(255,255,255,.6)', marginBottom: 20 }}>
                Vous et <strong style={{ color: '#fff' }}>{matchPopup}</strong> êtes connectés
              </div>
              <button
                onClick={() => setMatchPopup(null)}
                style={{
                  padding: '10px 28px', background: 'linear-gradient(135deg, var(--a), #b8932e)',
                  border: 'none', borderRadius: 8, fontFamily: 'var(--b)', fontWeight: 700,
                  fontSize: 12, color: '#0a0e1a', cursor: 'pointer',
                }}
              >
                Continuer
              </button>
            </div>
          </div>
        )}

        {/* Card area */}
        <div style={{ position: 'relative', height: 420, marginBottom: 24 }}>
          {done ? (
            <div style={{
              height: '100%', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              background: 'rgba(255,255,255,.015)', border: '1px solid rgba(255,255,255,.05)',
              borderRadius: 16,
            }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>✨</div>
              <div style={{ fontFamily: 'var(--d)', fontSize: 18, fontWeight: 800, marginBottom: 6 }}>Plus de profils</div>
              <div style={{ fontFamily: 'var(--b)', fontSize: 12, color: 'rgba(255,255,255,.35)' }}>
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
                  padding: '28px 22px', cursor: 'grab', userSelect: 'none',
                  transform: cardTransform,
                  transition: swipeDir ? 'transform 0.3s ease-out' : dragging ? 'none' : 'transform 0.2s ease',
                  touchAction: 'none',
                }}
              >
                {/* Swipe indicators */}
                {dragX > 30 && (
                  <div style={{
                    position: 'absolute', top: 24, left: 24, padding: '6px 16px',
                    border: '2px solid #34d399', borderRadius: 8,
                    fontFamily: 'var(--b)', fontWeight: 700, fontSize: 16, color: '#34d399',
                    transform: 'rotate(-12deg)',
                  }}>LIKE</div>
                )}
                {dragX < -30 && (
                  <div style={{
                    position: 'absolute', top: 24, right: 24, padding: '6px 16px',
                    border: '2px solid #f87171', borderRadius: 8,
                    fontFamily: 'var(--b)', fontWeight: 700, fontSize: 16, color: '#f87171',
                    transform: 'rotate(12deg)',
                  }}>NOPE</div>
                )}

                {/* Role badge */}
                <div style={{
                  display: 'inline-block', padding: '4px 10px', borderRadius: 6,
                  background: `${currentProfile.color}20`, border: `1px solid ${currentProfile.color}40`,
                  fontFamily: 'var(--m)', fontSize: 9, color: currentProfile.color,
                  fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 20,
                }}>
                  {currentProfile.role}
                </div>

                {/* Name */}
                <div style={{ fontFamily: 'var(--d)', fontSize: 26, fontWeight: 800, marginBottom: 6 }}>
                  {currentProfile.name}
                </div>

                {/* Sub info */}
                <div style={{ fontFamily: 'var(--b)', fontSize: 12, color: 'rgba(255,255,255,.45)', marginBottom: 16 }}>
                  {currentProfile.sub}
                </div>

                {/* Price if any */}
                {currentProfile.price && (
                  <div style={{
                    fontFamily: 'var(--m)', fontSize: 22, color: currentProfile.color,
                    fontWeight: 700, marginBottom: 16,
                  }}>
                    {currentProfile.price}
                  </div>
                )}

                {/* Tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 24 }}>
                  {currentProfile.tags.map((tag) => (
                    <span key={tag} style={{
                      padding: '5px 10px', borderRadius: 6,
                      background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.06)',
                      fontFamily: 'var(--b)', fontSize: 10, color: 'rgba(255,255,255,.5)',
                    }}>
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Counter */}
                <div style={{
                  position: 'absolute', bottom: 20, left: 0, right: 0, textAlign: 'center',
                  fontFamily: 'var(--m)', fontSize: 10, color: 'rgba(255,255,255,.15)',
                }}>
                  {currentIndex + 1} / {profiles.length}
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Action buttons */}
        {!done && currentProfile && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
            <button
              onClick={() => handleSwipe('left')}
              disabled={!!swipeDir}
              style={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'rgba(248,113,113,.06)', border: '2px solid rgba(248,113,113,.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, cursor: 'pointer', color: '#f87171',
              }}
            >
              ✕
            </button>
            <button
              onClick={() => handleSwipe('right')}
              disabled={!!swipeDir}
              style={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'rgba(52,211,153,.06)', border: '2px solid rgba(52,211,153,.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, cursor: 'pointer', color: '#34d399',
              }}
            >
              ♥
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
