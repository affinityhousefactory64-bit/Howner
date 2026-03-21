'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUser } from '@/lib/context'

export default function Nav() {
  const { user, loading, logout } = useUser()
  const pathname = usePathname()

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

  return (
    <nav className="nav">
      <Link href="/" style={{ fontFamily: 'var(--m)', fontWeight: 700, fontSize: 15, color: 'var(--a)', textDecoration: 'none', letterSpacing: 2 }}>
        HOWNER
      </Link>

      {/* Desktop links */}
      <div className="nav-links">
        <Link href="/annonces" style={linkStyle('/annonces')}>Annonces</Link>
        {!loading && user ? (
          <>
            <Link href="/match" style={linkStyle('/match')}>Match</Link>
            <Link href="/compte" style={linkStyle('/compte')}>
              Compte{user.type === 'pro' && <span style={{ marginLeft: 4, padding: '1px 5px', borderRadius: 4, background: 'rgba(207,175,75,.12)', fontFamily: 'var(--b)', fontSize: 8, fontWeight: 700, color: 'var(--a)', verticalAlign: 'middle' }}>PRO</span>}
            </Link>
            <Link href="/credits" style={{ ...linkStyle('/credits'), background: pathname === '/credits' ? 'rgba(207,175,75,.06)' : 'rgba(207,175,75,.04)', border: '1px solid rgba(207,175,75,.08)' }}>
              {user.credits}cr · {user.tickets}tk
            </Link>
            <button onClick={logout} style={{ padding: '4px 8px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 6, fontFamily: 'var(--b)', fontSize: 9, color: 'rgba(255,255,255,.3)', cursor: 'pointer' }}>✕</button>
          </>
        ) : !loading ? (
          <Link href="/login" className="btn-primary" style={{ padding: '6px 14px', fontSize: 10 }}>S&apos;inscrire</Link>
        ) : null}
      </div>

      {/* Mobile actions */}
      <div className="nav-mobile-actions">
        {!loading && user ? (
          <>
            <Link href="/credits" style={{ padding: '4px 8px', borderRadius: 6, background: 'rgba(207,175,75,.04)', border: '1px solid rgba(207,175,75,.08)', fontFamily: 'var(--b)', fontSize: 10, fontWeight: 600, color: 'var(--a)', textDecoration: 'none' }}>
              {user.credits}cr
            </Link>
            <Link href="/compte" style={{ padding: '6px 12px', background: 'linear-gradient(135deg, var(--a), #b8932e)', borderRadius: 7, fontFamily: 'var(--b)', fontWeight: 700, fontSize: 10, color: '#0a0e1a', textDecoration: 'none' }}>
              Compte
            </Link>
          </>
        ) : !loading ? (
          <Link href="/login" className="btn-primary" style={{ padding: '6px 14px', fontSize: 10 }}>S&apos;inscrire</Link>
        ) : null}
      </div>
    </nav>
  )
}
