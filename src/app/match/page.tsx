'use client'
import Link from 'next/link'
export default function MatchPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#060a13', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ textAlign: 'center', maxWidth: 500 }}>
        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 20, color: '#cfaf4b', letterSpacing: 3, marginBottom: 24 }}>HOWNER</div>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 32, color: '#fff', marginBottom: 12 }}>Bientôt disponible</h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,.5)', lineHeight: 1.7, marginBottom: 24 }}>
          Cette fonctionnalité arrive prochainement. Vos crédits Howner seront utilisables ici.
        </p>
        <Link href="/" style={{ display: 'inline-block', padding: '12px 32px', background: '#cfaf4b', color: '#0a0e1a', borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  )
}
