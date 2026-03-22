'use client'

import { useState, useEffect } from 'react'
import Nav from '@/components/Nav'
import Link from 'next/link'

const CARDS = [
  {
    title: 'Investissez à partir de 100€',
    desc: 'Pas besoin de 300 000€ pour investir dans l\'immobilier.',
    color: '#cfaf4b',
  },
  {
    title: 'Rendement locatif partagé',
    desc: 'Vous recevez votre part des loyers chaque mois.',
    color: '#3b82f6',
  },
  {
    title: 'Valorisation du bien',
    desc: 'La plus-value est partagée à la revente.',
    color: '#34d399',
  },
]

export default function InvestirPage() {
  const [email, setEmail] = useState('')
  const [count, setCount] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/waitlist/invest')
      .then(r => r.json())
      .then(data => setCount(data.count ?? 0))
      .catch(() => {})
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !email.includes('@')) {
      setError('Entrez une adresse email valide.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/waitlist/invest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()

      if (data.success) {
        setSubmitted(true)
        setCount(data.position)
      } else {
        setError(data.error || 'Erreur. Réessayez.')
      }
    } catch {
      setError('Erreur réseau. Réessayez.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <Nav />

      {/* HERO */}
      <section className="section text-center" style={{ padding: '80px 16px 40px', position: 'relative', overflow: 'hidden' }}>
        <div className="hero-glow" style={{ top: -100, right: -200, background: 'var(--a)' }} />
        <div className="hero-glow" style={{ bottom: -100, left: -200, background: '#3b82f6' }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ marginBottom: 20 }}>
            <span className="badge" style={{
              color: 'var(--a)',
              background: 'rgba(207,175,75,.08)',
              border: '1px solid rgba(207,175,75,.15)',
              fontSize: 10,
              letterSpacing: 3,
              textTransform: 'uppercase',
              padding: '6px 16px',
            }}>
              Bientôt disponible
            </span>
          </div>

          <h1 className="heading-xl" style={{ marginBottom: 16, lineHeight: 1.15, letterSpacing: -1 }}>
            <span className="text-gradient" style={{ fontSize: 'inherit' }}>
              Investissez dans l&apos;immobilier
            </span>
            <br />
            <span style={{ color: '#fff' }}>à partir de 100€</span>
          </h1>

          <p style={{
            fontSize: 17,
            lineHeight: 1.8,
            maxWidth: 520,
            margin: '0 auto 32px',
            color: 'rgba(255,255,255,.6)',
          }}>
            Howner Invest — investissement fractionné dans des villas construites par Affinity Home
          </p>

          {/* Email form */}
          {!submitted ? (
            <form onSubmit={handleSubmit} style={{
              display: 'flex',
              gap: 8,
              maxWidth: 440,
              margin: '0 auto 16px',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}>
              <input
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{
                  flex: 1,
                  minWidth: 200,
                  padding: '14px 18px',
                  borderRadius: 10,
                  border: '1px solid rgba(207,175,75,.2)',
                  background: 'rgba(255,255,255,.04)',
                  color: '#fff',
                  fontSize: 14,
                  fontFamily: 'var(--b)',
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                disabled={loading}
                className="btn-primary btn-shine"
                style={{ padding: '14px 28px', fontSize: 14, opacity: loading ? 0.6 : 1 }}
              >
                {loading ? '...' : 'Reserver ma place'}
              </button>
            </form>
          ) : (
            <div className="card-glass" style={{
              maxWidth: 440,
              margin: '0 auto 16px',
              padding: '20px 24px',
              borderColor: 'rgba(52,211,153,.15)',
            }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#34d399', marginBottom: 4 }}>
                Place reservee.
              </p>
              <p className="text-muted text-sm">
                Tu seras parmi les premiers informes du lancement.
              </p>
            </div>
          )}

          {error && (
            <p style={{ fontSize: 13, color: '#f87171', marginBottom: 12 }}>{error}</p>
          )}

          {/* Counter */}
          <p className="mono text-sm" style={{ color: 'var(--a)', fontWeight: 700 }}>
            {count > 0 ? `${count} personne${count > 1 ? 's' : ''} sur liste d'attente` : '\u00A0'}
          </p>
        </div>
      </section>

      {/* CONCEPT CARDS */}
      <section className="section section-dark">
        <div className="container">
          <div className="grid-3">
            {CARDS.map((card, i) => (
              <div key={i} className="card-glass text-center" style={{ borderColor: `${card.color}15` }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 8, fontFamily: 'var(--d)' }}>
                  {card.title}
                </h3>
                <p className="text-muted text-sm" style={{ lineHeight: 1.6 }}>
                  {card.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER NOTE */}
      <section className="section section-mid text-center">
        <div className="container">
          <div className="card-glass" style={{
            maxWidth: 500,
            margin: '0 auto',
            padding: '32px 24px',
            borderColor: 'rgba(207,175,75,.1)',
          }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--a)', marginBottom: 8 }}>
              Les 1 000 premiers inscrits auront accès en priorité
            </p>
            <p className="text-muted text-sm" style={{ lineHeight: 1.6, marginBottom: 20 }}>
              Investissement fractionné dans l&apos;immobilier neuf. Rendement locatif + plus-value.
            </p>
            <Link href="/" className="text-sm" style={{ color: 'rgba(255,255,255,.4)', textDecoration: 'none' }}>
              Retour à Howner
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="page-footer">
        <p>
          Affinity House Factory SAS · SIRET 982 581 506 00010 · Anglet (64600)
        </p>
        <p style={{ fontSize: 9, color: 'rgba(255,255,255,.1)', marginTop: 16 }}>
          &copy; {new Date().getFullYear()} Howner
        </p>
      </footer>
    </div>
  )
}
