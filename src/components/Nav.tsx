'use client'

import Link from 'next/link'
import { useUser } from '@/lib/context'

export default function Nav() {
  const { user, loading, logout } = useUser()

  return (
    <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(10,14,26,.95)', backdropFilter: 'blur(14px)', borderBottom: '1px solid rgba(255,255,255,.04)', padding: '10px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Link href="/" style={{ fontFamily: 'var(--m)', fontWeight: 700, fontSize: 15, color: 'var(--a)', textDecoration: 'none' }}>HOWNER</Link>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Link href="/browse" style={{ fontFamily: 'var(--b)', fontSize: 11, color: 'rgba(255,255,255,.4)', textDecoration: 'none' }}>Annonces</Link>
        {!loading && user ? (
          <>
            <Link href="/match" style={{ fontFamily: 'var(--b)', fontSize: 11, color: 'rgba(255,255,255,.4)', textDecoration: 'none' }}>Matching</Link>
            <Link href={user.type === 'particulier' ? '/dashboard' : '/pro'} style={{ fontFamily: 'var(--b)', fontSize: 11, color: 'rgba(255,255,255,.4)', textDecoration: 'none' }}>Dashboard</Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: 'var(--m)', fontSize: 9, color: 'var(--a)' }}>{user.credits}cr · {user.tickets}tk</span>
              <button onClick={logout} style={{ padding: '4px 10px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 5, fontFamily: 'var(--b)', fontSize: 9, color: 'rgba(255,255,255,.3)', cursor: 'pointer' }}>Déco</button>
            </div>
          </>
        ) : !loading ? (
          <Link href="/login" style={{ padding: '5px 12px', background: 'linear-gradient(135deg, var(--a), #b8932e)', borderRadius: 6, fontFamily: 'var(--b)', fontWeight: 700, fontSize: 10, color: '#0a0e1a', textDecoration: 'none' }}>S&apos;inscrire</Link>
        ) : null}
      </div>
    </nav>
  )
}
