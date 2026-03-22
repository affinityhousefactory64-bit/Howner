'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'
import { useUser } from '@/lib/context'

export default function Nav() {
  const { user, loading, logout } = useUser()
  const pathname = usePathname()
  const [unreadCount, setUnreadCount] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)

  const fetchUnread = useCallback(async () => {
    try {
      const res = await fetch('/api/conversations')
      if (res.ok) {
        const data = await res.json()
        const total = (data.conversations || []).reduce(
          (sum: number, c: { unread_count?: number }) => sum + (c.unread_count || 0),
          0
        )
        setUnreadCount(total)
      }
    } catch { /* */ }
  }, [])

  useEffect(() => {
    if (!user) return
    fetchUnread()
    const interval = setInterval(fetchUnread, 15000)
    return () => clearInterval(interval)
  }, [user, fetchUnread])

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const linkStyle = (path: string) => ({
    fontFamily: 'var(--b)' as const,
    fontSize: 11,
    color: pathname === path ? 'var(--a)' : 'rgba(255,255,255,.4)',
    textDecoration: 'none' as const,
    fontWeight: (pathname === path ? 700 : 500) as number,
    padding: '4px 8px',
    borderRadius: 6,
    background: pathname === path ? 'rgba(207,175,75,.06)' : 'transparent',
  })

  const mobileLinkStyle = (path: string) => ({
    fontFamily: 'var(--b)' as const,
    fontSize: 15,
    color: pathname === path ? 'var(--a)' : 'rgba(255,255,255,.6)',
    textDecoration: 'none' as const,
    fontWeight: (pathname === path ? 700 : 500) as number,
    padding: '14px 0',
    display: 'block' as const,
    borderBottom: '1px solid rgba(255,255,255,.06)',
  })

  return (
    <>
      <nav className="nav">
        <Link href="/" style={{ fontFamily: 'var(--m)', fontWeight: 700, fontSize: 15, color: 'var(--a)', textDecoration: 'none', letterSpacing: 2 }}>
          HOWNER
        </Link>

        {/* Desktop links */}
        <div className="nav-links">
          <Link href="/annonces" style={linkStyle('/annonces')}>Annonces</Link>
          <Link href="/feed" style={linkStyle('/feed')}>Feed</Link>
          <Link href="/estimation" style={linkStyle('/estimation')}>Estimation</Link>
          {!loading && user ? (
            <>
              <Link href="/match" style={linkStyle('/match')}>Match</Link>
              <Link href="/messages" style={{ ...linkStyle('/messages'), position: 'relative' as const }}>
                Messages
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute', top: -4, right: -6,
                    background: 'var(--a)', color: '#0a0e1a',
                    fontSize: 8, fontWeight: 800, fontFamily: 'var(--b)',
                    padding: '1px 5px', borderRadius: 8,
                    lineHeight: '13px', minWidth: 14, textAlign: 'center',
                  }}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>
              <Link href="/compte" style={linkStyle('/compte')}>
                Compte{user.type === 'pro' && <span style={{ marginLeft: 4, padding: '1px 5px', borderRadius: 4, background: 'rgba(207,175,75,.12)', fontFamily: 'var(--b)', fontSize: 8, fontWeight: 700, color: 'var(--a)', verticalAlign: 'middle' }}>PRO</span>}
              </Link>
              <Link href="/credits" style={{ ...linkStyle('/credits'), background: pathname === '/credits' ? 'rgba(207,175,75,.06)' : 'rgba(207,175,75,.04)', border: '1px solid rgba(207,175,75,.08)' }}>
                {user.credits}cr · {user.tickets}tk
              </Link>
              <button onClick={logout} style={{ padding: '4px 8px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 6, fontFamily: 'var(--b)', fontSize: 9, color: 'rgba(255,255,255,.3)', cursor: 'pointer' }}>✕</button>
            </>
          ) : !loading ? (
            <Link href="/login" className="btn-primary" style={{ padding: '6px 14px', fontSize: 10 }}>Commencer</Link>
          ) : null}
        </div>

        {/* Mobile burger button */}
        <button
          className="burger-btn"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
          style={{
            display: 'none',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 4,
            width: 36,
            height: 36,
            background: 'rgba(255,255,255,.04)',
            border: '1px solid rgba(255,255,255,.08)',
            borderRadius: 8,
            cursor: 'pointer',
            padding: 0,
            position: 'relative',
          }}
        >
          <span style={{
            display: 'block', width: 16, height: 1.5, background: 'rgba(255,255,255,.6)', borderRadius: 2,
            transition: 'all .3s', transform: menuOpen ? 'rotate(45deg) translateY(2.75px)' : 'none',
          }} />
          <span style={{
            display: 'block', width: 16, height: 1.5, background: 'rgba(255,255,255,.6)', borderRadius: 2,
            transition: 'all .3s', opacity: menuOpen ? 0 : 1,
          }} />
          <span style={{
            display: 'block', width: 16, height: 1.5, background: 'rgba(255,255,255,.6)', borderRadius: 2,
            transition: 'all .3s', transform: menuOpen ? 'rotate(-45deg) translateY(-2.75px)' : 'none',
          }} />
        </button>
      </nav>

      {/* Mobile overlay menu */}
      {menuOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 100,
          background: 'rgba(10,14,26,.98)',
          backdropFilter: 'blur(24px)',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
        }}>
          {/* Header */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,.06)',
          }}>
            <Link href="/" onClick={() => setMenuOpen(false)} style={{ fontFamily: 'var(--m)', fontWeight: 700, fontSize: 15, color: 'var(--a)', textDecoration: 'none', letterSpacing: 2 }}>
              HOWNER
            </Link>
            <button
              onClick={() => setMenuOpen(false)}
              aria-label="Fermer"
              style={{
                width: 36, height: 36,
                background: 'rgba(255,255,255,.04)',
                border: '1px solid rgba(255,255,255,.08)',
                borderRadius: 8, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'rgba(255,255,255,.6)', fontSize: 18,
                fontFamily: 'var(--b)',
              }}
            >
              ✕
            </button>
          </div>

          {/* Links */}
          <div style={{ padding: '20px 24px', flex: 1 }}>
            <Link href="/annonces" onClick={() => setMenuOpen(false)} style={mobileLinkStyle('/annonces')}>Annonces</Link>
            <Link href="/feed" onClick={() => setMenuOpen(false)} style={mobileLinkStyle('/feed')}>Feed</Link>
            <Link href="/estimation" onClick={() => setMenuOpen(false)} style={mobileLinkStyle('/estimation')}>Estimation</Link>

            {!loading && user ? (
              <>
                <Link href="/messages" onClick={() => setMenuOpen(false)} style={{ ...mobileLinkStyle('/messages'), position: 'relative' as const }}>
                  Messages
                  {unreadCount > 0 && (
                    <span style={{
                      marginLeft: 8,
                      background: 'var(--a)', color: '#0a0e1a',
                      fontSize: 9, fontWeight: 800, fontFamily: 'var(--b)',
                      padding: '2px 6px', borderRadius: 8,
                    }}>
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Link>
                <Link href="/credits" onClick={() => setMenuOpen(false)} style={mobileLinkStyle('/credits')}>
                  Cr{'\u00e9'}dits
                  <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--a)', fontWeight: 700 }}>
                    {user.credits}cr · {user.tickets}tk
                  </span>
                </Link>
                <Link href="/compte" onClick={() => setMenuOpen(false)} style={mobileLinkStyle('/compte')}>
                  Compte
                  {user.type === 'pro' && <span style={{ marginLeft: 8, padding: '2px 6px', borderRadius: 4, background: 'rgba(207,175,75,.12)', fontSize: 9, fontWeight: 700, color: 'var(--a)' }}>PRO</span>}
                </Link>

                <div style={{ marginTop: 24 }}>
                  <button
                    onClick={() => { logout(); setMenuOpen(false) }}
                    style={{
                      width: '100%', padding: '12px 0',
                      background: 'rgba(255,255,255,.04)',
                      border: '1px solid rgba(255,255,255,.08)',
                      borderRadius: 10,
                      fontFamily: 'var(--b)', fontSize: 13, fontWeight: 600,
                      color: 'rgba(255,255,255,.4)', cursor: 'pointer',
                    }}
                  >
                    Se d{'\u00e9'}connecter
                  </button>
                </div>
              </>
            ) : !loading ? (
              <div style={{ marginTop: 24 }}>
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="btn-primary btn-shine"
                  style={{ display: 'block', textAlign: 'center', padding: '14px 0', fontSize: 15 }}
                >
                  Commencer — gratuit
                </Link>
                <div style={{ textAlign: 'center', marginTop: 12 }}>
                  <Link href="/login" onClick={() => setMenuOpen(false)} style={{ fontSize: 13, color: 'rgba(255,255,255,.4)', textDecoration: 'none', fontFamily: 'var(--b)' }}>
                    Se connecter
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 639px) {
          .burger-btn { display: flex !important; }
          .nav-links { display: none !important; }
          .nav-mobile-actions { display: none !important; }
        }
      `}</style>
    </>
  )
}
