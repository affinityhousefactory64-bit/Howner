'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useUser } from '@/lib/context'

export default function Nav() {
  const { user, loading, logout } = useUser()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

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
    color: pathname === path ? 'var(--a)' : '#6b7280',
    textDecoration: 'none' as const,
    fontWeight: (pathname === path ? 700 : 500) as number,
    padding: '4px 8px',
    borderRadius: 6,
    background: pathname === path ? 'rgba(207,175,75,.08)' : 'transparent',
  })

  const mobileLinkStyle = (path: string) => ({
    fontFamily: 'var(--b)' as const,
    fontSize: 15,
    color: pathname === path ? 'var(--a)' : '#9ca3af',
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
          <Link href="/chat" style={linkStyle('/chat')}>Agent IA</Link>
          <Link href="/recherche" style={linkStyle('/recherche')}>Recherche</Link>
          <Link href="/devis" style={linkStyle('/devis')}>Devis</Link>
          {!loading && user ? (
            <>
              <Link href="/compte" style={linkStyle('/compte')}>
                Mon compte{user.type === 'pro' && <span style={{ marginLeft: 4, padding: '1px 5px', borderRadius: 4, background: 'rgba(127,132,246,.12)', fontFamily: 'var(--b)', fontSize: 8, fontWeight: 700, color: 'var(--accent)', verticalAlign: 'middle' }}>PRO</span>}
              </Link>
              <button onClick={logout} style={{ padding: '4px 8px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 6, fontFamily: 'var(--b)', fontSize: 9, color: '#6b7280', cursor: 'pointer' }}>Se d{'é'}connecter</button>
            </>
          ) : !loading ? (
            <Link href="/login" className="btn-primary" style={{ padding: '6px 14px', fontSize: 10 }}>Essayer gratuit</Link>
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
            display: 'block', width: 16, height: 1.5, background: '#9ca3af', borderRadius: 2,
            transition: 'all .3s', transform: menuOpen ? 'rotate(45deg) translateY(2.75px)' : 'none',
          }} />
          <span style={{
            display: 'block', width: 16, height: 1.5, background: '#9ca3af', borderRadius: 2,
            transition: 'all .3s', opacity: menuOpen ? 0 : 1,
          }} />
          <span style={{
            display: 'block', width: 16, height: 1.5, background: '#9ca3af', borderRadius: 2,
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
          background: 'rgba(10,11,13,.98)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
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
                color: '#9ca3af', fontSize: 18,
                fontFamily: 'var(--b)',
              }}
            >
              {'\u2715'}
            </button>
          </div>

          {/* Links */}
          <div style={{ padding: '20px 24px', flex: 1 }}>
            <Link href="/chat" onClick={() => setMenuOpen(false)} style={mobileLinkStyle('/chat')}>Agent IA</Link>
            <Link href="/recherche" onClick={() => setMenuOpen(false)} style={mobileLinkStyle('/recherche')}>Recherche</Link>
            <Link href="/devis" onClick={() => setMenuOpen(false)} style={mobileLinkStyle('/devis')}>Devis</Link>

            {!loading && user ? (
              <>
                <Link href="/compte" onClick={() => setMenuOpen(false)} style={mobileLinkStyle('/compte')}>
                  Mon compte
                  {user.type === 'pro' && <span style={{ marginLeft: 8, padding: '2px 6px', borderRadius: 4, background: 'rgba(127,132,246,.12)', fontSize: 9, fontWeight: 700, color: 'var(--accent)' }}>PRO</span>}
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
                      color: '#6b7280', cursor: 'pointer',
                    }}
                  >
                    Se d{'é'}connecter
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
                  Essayer gratuitement
                </Link>
                <div style={{ textAlign: 'center', marginTop: 12 }}>
                  <Link href="/login" onClick={() => setMenuOpen(false)} style={{ fontSize: 13, color: '#6b7280', textDecoration: 'none', fontFamily: 'var(--b)' }}>
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
