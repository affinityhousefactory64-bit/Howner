'use client'

import { useState } from 'react'
import Link from 'next/link'

const EXAMPLES = [
  'T3 à Bayonne max 800€/mois',
  'Maison 4 chambres Anglet achat max 400K€',
  'Location saisonnière Biarritz juillet 2 semaines',
  'Studio meublé Pau proche université',
  'Terrain constructible Pays Basque max 150K€',
]

type Result = {
  title: string
  price: string
  location: string
  surface: string
  source: string
  score: number
  highlight: string
}

export default function RecherchePage() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<Result[] | null>(null)
  const [error, setError] = useState('')

  const handleSearch = async () => {
    if (!query.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/ai/recherche', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Erreur lors de la recherche')
        return
      }
      setResults(data.results)
    } catch {
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingTop: 80 }}>
      <nav className="nav">
        <Link href="/" style={{ textDecoration: 'none' }}><span className="heading-md text-gold" style={{ fontSize: 20 }}>HOWNER</span></Link>
        <Link href="/compte" className="btn-secondary" style={{ padding: '8px 20px', fontSize: 13 }}>Mon compte</Link>
      </nav>

      <div className="container" style={{ maxWidth: 800, padding: '0 20px' }}>
        <div className="text-center" style={{ marginBottom: 40 }}>
          <h1 className="heading-lg" style={{ marginBottom: 8 }}>Comparateur immo</h1>
          <p className="text-muted text-sm">
            Décrivez ce que vous cherchez. On compare toutes les offres pour vous.
          </p>
          <p className="text-gold text-xs" style={{ fontWeight: 700, marginTop: 4 }}>1 crédit = 1 recherche + 1 ticket offert</p>
        </div>

        {/* Search box */}
        <div className="card" style={{ padding: '24px', marginBottom: 24 }}>
          <textarea
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Décrivez ce que vous cherchez..."
            rows={3}
            style={{
              width: '100%', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)',
              borderRadius: 10, padding: '14px 16px', color: '#fff', fontSize: 15,
              fontFamily: 'var(--b)', resize: 'none', outline: 'none',
            }}
          />
          <button
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            className="btn-primary btn-shine"
            style={{ width: '100%', padding: '14px 0', fontSize: 15, marginTop: 12, border: 'none', cursor: 'pointer' }}
          >
            {loading ? 'Recherche en cours...' : 'Rechercher — 1 crédit'}
          </button>
        </div>

        {/* Examples */}
        {!results && !loading && (
          <div style={{ marginBottom: 32 }}>
            <p className="text-muted text-xs" style={{ marginBottom: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Exemples de recherches</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {EXAMPLES.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => setQuery(ex)}
                  style={{
                    padding: '8px 16px', borderRadius: 20, background: 'rgba(255,255,255,.04)',
                    border: '1px solid rgba(255,255,255,.08)', color: 'rgba(255,255,255,.6)',
                    fontSize: 12, cursor: 'pointer', fontFamily: 'var(--b)',
                  }}
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="card" style={{ padding: 16, borderColor: 'rgba(239,68,68,.2)', marginBottom: 16 }}>
            <p style={{ color: '#ef4444', fontSize: 14 }}>{error}</p>
            {error.includes('crédit') && (
              <Link href="/credits" className="btn-primary" style={{ marginTop: 12, display: 'inline-block', padding: '10px 24px', fontSize: 13 }}>
                Acheter des crédits
              </Link>
            )}
          </div>
        )}

        {/* Results */}
        {results && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <p style={{ fontSize: 14, fontWeight: 700 }}>{results.length} résultats trouvés</p>
              <p className="text-gold text-xs" style={{ fontWeight: 700 }}>Triés par rapport qualité/prix</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {results.map((r, i) => (
                <div key={i} className="card" style={{ padding: '20px 24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{r.title}</div>
                      <div className="text-muted text-sm">{r.location} · {r.surface}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="text-gold mono" style={{ fontSize: 20, fontWeight: 700 }}>{r.price}</div>
                      <div className="text-muted text-xs">{r.source}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,.5)' }}>{r.highlight}</p>
                    <div style={{
                      padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                      background: r.score >= 8 ? 'rgba(52,211,153,.1)' : r.score >= 6 ? 'rgba(251,191,36,.1)' : 'rgba(239,68,68,.1)',
                      color: r.score >= 8 ? '#34d399' : r.score >= 6 ? '#fbbf24' : '#ef4444',
                      border: `1px solid ${r.score >= 8 ? 'rgba(52,211,153,.2)' : r.score >= 6 ? 'rgba(251,191,36,.2)' : 'rgba(239,68,68,.2)'}`,
                    }}>
                      {r.score}/10
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center" style={{ marginTop: 24 }}>
              <button onClick={() => { setResults(null); setQuery('') }} className="btn-secondary" style={{ padding: '10px 24px', fontSize: 13 }}>
                Nouvelle recherche
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
