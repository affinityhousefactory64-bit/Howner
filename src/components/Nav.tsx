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
    <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(6,10,19,.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,.04)', padding: '10px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Link href="/" style={{ fontFamily: 'var(--m)', fontWeight: 700, fontSize: 15, color: 'var(--a)', textDecoration: 'none', letterSpacing: 2 }}>HOWNER</Link>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <Link href="/annonces" style={linkStyle('/annonces')}>Annonces</Link>
        {!loading && user ? (
          <>
            <Link href="/match" style={linkStyle('/match')}>Match</Link>
            <Link href="/compte" style={linkStyle('/compte')}>Compte</Link>
            <Link href="/credits" style={{ ...linkStyle('/credits'), background: pathname === '/credits' ? 'rgba(207,175,75,.06)' : 'rgba(207,175,75,.04)', border: '1px solid rgba(207,175,75,.08)' }}>
              {user.credits}cr · {user.tickets}tk
            </Link>
            <button onClick={logout} style={{ padding: '4px 8px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 6, fontFamily: 'var(--b)', fontSize: 9, color: 'rgba(255,255,255,.3)', cursor: 'pointer' }}>✕</button>
          </>
        ) : !loading ? (
          <Link href="/login" style={{ padding: '6px 14px', background: 'linear-gradient(135deg, var(--a), #b8932e)', borderRadius: 7, fontFamily: 'var(--b)', fontWeight: 700, fontSize: 10, color: '#0a0e1a', textDecoration: 'none', boxShadow: '0 2px 8px rgba(207,175,75,.2)' }}>S&apos;inscrire</Link>
        ) : null}
      </div>
    </nav>
  )
}
