'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

/* ═══ TYPES ═══ */
type Category =
  | 'plomberie'
  | 'electricite'
  | 'peinture'
  | 'maconnerie'
  | 'cuisine'
  | 'salle_de_bain'
  | 'toiture'
  | 'chauffage'
  | 'renovation_complete'
  | 'autre'

type Verdict = 'correct' | 'surcote' | 'sous_cote' | 'bonne_affaire'

interface DevisResult {
  verdict: Verdict
  market_range: { low: number; high: number }
  deviation_percent: number
  analysis: string
  recommendations: string[]
  top_companies: { name: string; rating: number; avg_price: number }[]
}

/* ═══ CONSTANTS ═══ */
const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'plomberie', label: 'Plomberie' },
  { value: 'electricite', label: 'Electricite' },
  { value: 'peinture', label: 'Peinture' },
  { value: 'maconnerie', label: 'Maconnerie' },
  { value: 'cuisine', label: 'Cuisine equipee' },
  { value: 'salle_de_bain', label: 'Salle de bain' },
  { value: 'toiture', label: 'Toiture' },
  { value: 'chauffage', label: 'Chauffage' },
  { value: 'renovation_complete', label: 'Renovation complete' },
  { value: 'autre', label: 'Autre' },
]

const VERDICT_CONFIG: Record<Verdict, { label: string; color: string; bg: string; border: string }> = {
  correct:       { label: 'Bon prix',              color: '#34d399', bg: 'rgba(52,211,153,.08)',  border: 'rgba(52,211,153,.2)' },
  surcote:       { label: 'Surcote',               color: '#f87171', bg: 'rgba(248,113,113,.08)', border: 'rgba(248,113,113,.2)' },
  sous_cote:     { label: 'Legerement sous-cote',  color: '#fb923c', bg: 'rgba(251,146,60,.08)',  border: 'rgba(251,146,60,.2)' },
  bonne_affaire: { label: 'Bonne affaire',         color: '#60a5fa', bg: 'rgba(96,165,250,.08)',  border: 'rgba(96,165,250,.2)' },
}

/* ═══ HELPERS ═══ */
function fmt(n: number): string {
  return n.toLocaleString('fr-FR')
}

/* ═══ COMPONENT ═══ */
export default function DevisPage() {
  const [category, setCategory] = useState<Category>('plomberie')
  const [location, setLocation] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [noCredits, setNoCredits] = useState(false)
  const [result, setResult] = useState<DevisResult | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => { setIsLoggedIn(r.ok) })
      .catch(() => setIsLoggedIn(false))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setResult(null)
    setNoCredits(false)

    const numAmount = parseFloat(amount)
    if (!numAmount || numAmount <= 0) {
      setError('Veuillez saisir un montant valide.')
      return
    }
    if (!location.trim()) {
      setError('Veuillez saisir une ville.')
      return
    }
    if (!description.trim() || description.trim().length < 10) {
      setError('Decrivez les travaux en au moins 10 caracteres.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/ai/devis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: description.trim(), amount: numAmount, location: location.trim(), category }),
      })

      if (res.status === 401) {
        setError('Vous devez etre connecte pour analyser un devis.')
        setLoading(false)
        return
      }
      if (res.status === 402) {
        setNoCredits(true)
        setLoading(false)
        return
      }

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Erreur lors de l\'analyse.')
        setLoading(false)
        return
      }

      setResult(data)
    } catch {
      setError('Erreur de connexion. Reessayez.')
    } finally {
      setLoading(false)
    }
  }

  /* ═══ MARKET RANGE BAR ═══ */
  function MarketBar({ result: r }: { result: DevisResult }) {
    const { low, high } = r.market_range
    const range = high - low
    const visualLow = low - range * 0.2
    const visualHigh = high + range * 0.2
    const totalRange = visualHigh - visualLow

    const barLowPct = ((low - visualLow) / totalRange) * 100
    const barWidthPct = ((high - low) / totalRange) * 100
    const amountNum = parseFloat(amount)
    const amountPct = Math.min(100, Math.max(0, ((amountNum - visualLow) / totalRange) * 100))

    const verdictCfg = VERDICT_CONFIG[r.verdict]

    return (
      <div style={{ marginTop: 20, marginBottom: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,.4)' }}>{fmt(Math.round(visualLow))} EUR</span>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,.4)' }}>{fmt(Math.round(visualHigh))} EUR</span>
        </div>
        <div style={{ position: 'relative', height: 32, background: 'rgba(255,255,255,.04)', borderRadius: 8, overflow: 'visible' }}>
          {/* Market range zone */}
          <div style={{
            position: 'absolute', top: 4, bottom: 4,
            left: `${barLowPct}%`, width: `${barWidthPct}%`,
            background: 'rgba(52,211,153,.1)', border: '1px solid rgba(52,211,153,.2)',
            borderRadius: 6,
          }} />
          {/* Amount marker */}
          <div style={{
            position: 'absolute', top: -4, left: `${amountPct}%`,
            transform: 'translateX(-50%)',
            width: 3, height: 40, borderRadius: 2,
            background: verdictCfg.color,
            boxShadow: `0 0 8px ${verdictCfg.color}`,
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
          <span style={{ fontSize: 11, color: 'rgba(52,211,153,.7)' }}>Fourchette marche : {fmt(low)} - {fmt(high)} EUR</span>
          <span style={{ fontSize: 11, color: verdictCfg.color, fontWeight: 700 }}>Votre devis : {fmt(amountNum)} EUR</span>
        </div>
      </div>
    )
  }

  /* ═══ RENDER ═══ */
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Nav */}
      <nav className="nav">
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span className="heading-md text-gold" style={{ fontSize: 20 }}>HOWNER</span>
        </Link>
        <Link href={isLoggedIn ? '/compte' : '/login'} className="btn-primary" style={{ padding: '8px 20px', fontSize: 13 }}>
          {isLoggedIn ? 'Mon compte' : 'Se connecter'}
        </Link>
      </nav>

      {/* Banner for non-logged-in users */}
      {isLoggedIn === false && (
        <div style={{
          background: 'linear-gradient(90deg, rgba(207,175,75,.08), rgba(207,175,75,.03))',
          borderBottom: '1px solid rgba(207,175,75,.1)',
          padding: '10px 20px', textAlign: 'center',
        }}>
          <span style={{ fontSize: 13, color: 'var(--a)', fontWeight: 600 }}>
            1 credit + 1 ticket offerts a l&apos;inscription
          </span>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', marginLeft: 8 }}>—</span>
          <Link href="/login" style={{ fontSize: 13, color: '#fff', fontWeight: 700, marginLeft: 8, textDecoration: 'underline', textUnderlineOffset: 3 }}>
            S&apos;inscrire gratuitement
          </Link>
        </div>
      )}

      <div className="container" style={{ maxWidth: 720, paddingTop: 40, paddingBottom: 80 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 className="heading-lg" style={{ marginBottom: 8 }}>
            Analyse de devis <span className="text-gold">IA</span>
          </h1>
          <p className="text-muted text-sm" style={{ lineHeight: 1.7 }}>
            Votre devis est-il au bon prix ? L&apos;IA vous repond en 10 secondes.
          </p>
        </div>

        {/* Form */}
        {!result && (
          <form onSubmit={handleSubmit}>
            <div className="card" style={{ padding: '28px 24px' }}>
              {/* Category */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'rgba(255,255,255,.7)' }}>
                  Categorie de travaux
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as Category)}
                  style={{
                    width: '100%', padding: '12px 14px', borderRadius: 10,
                    background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)',
                    color: '#fff', fontSize: 14, fontFamily: 'var(--b)',
                    outline: 'none', appearance: 'none', cursor: 'pointer',
                  }}
                >
                  {CATEGORIES.map(c => (
                    <option key={c.value} value={c.value} style={{ background: '#1E2228', color: '#fff' }}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'rgba(255,255,255,.7)' }}>
                  Ville
                </label>
                <input
                  type="text"
                  placeholder="Ex: Bayonne, Paris, Lyon..."
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  style={{
                    width: '100%', padding: '12px 14px', borderRadius: 10,
                    background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)',
                    color: '#fff', fontSize: 14, fontFamily: 'var(--b)', outline: 'none',
                  }}
                />
              </div>

              {/* Amount */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'rgba(255,255,255,.7)' }}>
                  Montant du devis (EUR)
                </label>
                <input
                  type="number"
                  placeholder="Ex: 8500"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  min={1}
                  style={{
                    width: '100%', padding: '12px 14px', borderRadius: 10,
                    background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)',
                    color: '#fff', fontSize: 14, fontFamily: 'var(--b)', outline: 'none',
                  }}
                />
              </div>

              {/* Description */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'rgba(255,255,255,.7)' }}>
                  Decrivez les travaux
                </label>
                <textarea
                  placeholder="Ex: Renovation complete de la salle de bain, remplacement baignoire par douche italienne, double vasque, carrelage sol et murs..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={4}
                  style={{
                    width: '100%', padding: '12px 14px', borderRadius: 10,
                    background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)',
                    color: '#fff', fontSize: 14, fontFamily: 'var(--b)', outline: 'none',
                    resize: 'vertical', lineHeight: 1.6,
                  }}
                />
              </div>

              {/* Error */}
              {error && (
                <div style={{
                  padding: '10px 14px', borderRadius: 8, marginBottom: 16,
                  background: 'rgba(248,113,113,.08)', border: '1px solid rgba(248,113,113,.2)',
                  fontSize: 13, color: '#f87171',
                }}>
                  {error}
                </div>
              )}

              {/* No credits */}
              {noCredits && (
                <div style={{
                  padding: '14px 18px', borderRadius: 10, marginBottom: 16,
                  background: 'rgba(251,146,60,.06)', border: '1px solid rgba(251,146,60,.15)',
                  textAlign: 'center',
                }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#fb923c', marginBottom: 8 }}>
                    Vous n&apos;avez plus de credits
                  </p>
                  <Link href="/credits" style={{
                    display: 'inline-block', padding: '8px 24px', borderRadius: 8,
                    background: 'var(--a)', color: '#0a0e1a', fontWeight: 700, fontSize: 13,
                    textDecoration: 'none',
                  }}>
                    Acheter des credits
                  </Link>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{
                  width: '100%', padding: '14px 0', fontSize: 15,
                  opacity: loading ? 0.6 : 1, cursor: loading ? 'wait' : 'pointer',
                }}
              >
                {loading ? 'Analyse en cours...' : 'Analyser mon devis — 1 credit'}
              </button>

              <p className="text-muted text-xs text-center" style={{ marginTop: 10 }}>
                1 credit = 1 analyse. Chaque credit achete vous offre 1 ticket pour le tirage.
              </p>
            </div>
          </form>
        )}

        {/* Loading animation */}
        {loading && (
          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <div style={{
              width: 40, height: 40, margin: '0 auto 16px',
              border: '3px solid rgba(207,175,75,.15)', borderTopColor: 'var(--a)',
              borderRadius: '50%', animation: 'spin 0.8s linear infinite',
            }} />
            <p className="text-muted text-sm">Analyse du marche en cours...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Verdict badge */}
            {(() => {
              const cfg = VERDICT_CONFIG[result.verdict]
              return (
                <div className="card" style={{ padding: '28px 24px', textAlign: 'center' }}>
                  <div style={{
                    display: 'inline-block', padding: '10px 28px', borderRadius: 12,
                    background: cfg.bg, border: `1px solid ${cfg.border}`,
                    fontSize: 20, fontWeight: 700, color: cfg.color,
                    fontFamily: 'var(--d)',
                  }}>
                    {cfg.label}
                  </div>
                  <div className="mono" style={{ marginTop: 12, fontSize: 13, color: cfg.color }}>
                    {result.deviation_percent > 0 ? '+' : ''}{result.deviation_percent}% par rapport au marche
                  </div>

                  {/* Market range bar */}
                  <MarketBar result={result} />
                </div>
              )
            })()}

            {/* Analysis */}
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: '#fff' }}>Analyse</h3>
              <p className="text-muted text-sm" style={{ lineHeight: 1.8 }}>{result.analysis}</p>
            </div>

            {/* Top companies */}
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: '#fff' }}>Entreprises recommandees</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {result.top_companies.map((c, i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '12px 16px', borderRadius: 10,
                    background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.05)',
                  }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{c.name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                        <div style={{ display: 'flex', gap: 2 }}>
                          {[1, 2, 3, 4, 5].map(s => (
                            <span key={s} style={{ fontSize: 11, color: s <= Math.round(c.rating) ? 'var(--a)' : 'rgba(255,255,255,.15)' }}>
                              &#9733;
                            </span>
                          ))}
                        </div>
                        <span className="text-muted text-xs">{c.rating}/5</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="mono text-gold" style={{ fontSize: 15, fontWeight: 700 }}>{fmt(c.avg_price)} EUR</div>
                      <div className="text-muted text-xs">prix moyen</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: '#fff' }}>Recommandations</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {result.recommendations.map((r, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: 6, flexShrink: 0, marginTop: 1,
                      background: 'rgba(207,175,75,.1)', border: '1px solid rgba(207,175,75,.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, fontWeight: 700, color: 'var(--a)',
                    }}>
                      {i + 1}
                    </div>
                    <p className="text-muted text-sm" style={{ lineHeight: 1.6 }}>{r}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* New analysis button */}
            <div style={{ textAlign: 'center', marginTop: 8 }}>
              <button
                onClick={() => { setResult(null); setError(''); setNoCredits(false) }}
                className="btn-secondary"
                style={{ padding: '12px 32px', fontSize: 14 }}
              >
                Nouvelle analyse
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
