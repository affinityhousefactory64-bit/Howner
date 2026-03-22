'use client'

import { useState } from 'react'
import Link from 'next/link'

const SUGGESTIONS = [
  'Plombier à Bayonne disponible cette semaine',
  'Courtier pour premier achat Pays Basque',
  'Électricien pour rénovation appartement Anglet',
  'Agent immobilier spécialisé Biarritz',
  'Architecte pour extension maison Boucau',
  'Déménageur Bayonne vers Bordeaux',
]

type ProResult = {
  name: string
  specialty: string
  location: string
  rating: number
  reviews: number
  avg_price: string
  availability: string
  highlight: string
}

export default function TrouverPage() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<ProResult[] | null>(null)
  const [error, setError] = useState('')

  const handleSearch = async () => {
    if (!query.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/ai/trouver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Erreur')
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
          <h1 className="heading-lg" style={{ marginBottom: 8 }}>Trouve pour moi</h1>
          <p className="text-muted text-sm">
            Dites ce que vous cherchez. L&apos;IA trouve le bon pro en quelques secondes.
          </p>
          <p className="text-gold text-xs" style={{ fontWeight: 700, marginTop: 4 }}>1 crédit = 1 recherche + 1 ticket offert</p>
        </div>

        {/* Search */}
        <div className="card" style={{ padding: 24, marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Décrivez ce que vous cherchez..."
              style={{
                flex: 1, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)',
                borderRadius: 10, padding: '14px 16px', color: '#fff', fontSize: 15,
                fontFamily: 'var(--b)', outline: 'none',
              }}
            />
            <button
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              className="btn-primary"
              style={{ padding: '14px 24px', fontSize: 14, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              {loading ? '...' : 'Chercher'}
            </button>
          </div>
        </div>

        {/* Suggestions */}
        {!results && !loading && (
          <div style={{ marginBottom: 32 }}>
            <p className="text-muted text-xs" style={{ marginBottom: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Suggestions</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setQuery(s)}
                  style={{
                    padding: '8px 16px', borderRadius: 20, background: 'rgba(255,255,255,.04)',
                    border: '1px solid rgba(255,255,255,.08)', color: 'rgba(255,255,255,.6)',
                    fontSize: 12, cursor: 'pointer', fontFamily: 'var(--b)',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="card" style={{ padding: 16, borderColor: 'rgba(239,68,68,.2)', marginBottom: 16 }}>
            <p style={{ color: '#ef4444', fontSize: 14 }}>{error}</p>
          </div>
        )}

        {/* Results */}
        {results && (
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>{results.length} professionnels trouvés</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {results.map((pro, i) => (
                <div key={i} className={i === 0 ? 'card-gold' : 'card'} style={{ padding: '20px 24px' }}>
                  {i === 0 && (
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--a)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                      Meilleur match
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                      <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>{pro.name}</div>
                      <div className="text-muted text-sm">{pro.specialty} · {pro.location}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: '#fbbf24', fontSize: 14, fontWeight: 700 }}>
                        {'★'.repeat(Math.floor(pro.rating))} {pro.rating}
                      </div>
                      <div className="text-muted text-xs">{pro.reviews} avis</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 8 }}>
                    <div>
                      <div className="text-muted text-xs">Tarif moyen</div>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{pro.avg_price}</div>
                    </div>
                    <div>
                      <div className="text-muted text-xs">Disponibilité</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#34d399' }}>{pro.availability}</div>
                    </div>
                  </div>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,.5)' }}>{pro.highlight}</p>
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
