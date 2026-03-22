'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/lib/context'
import Nav from '@/components/Nav'
import LocationInput from '@/components/LocationInput'
import Link from 'next/link'

interface EstimationResult {
  priceLow: number
  priceHigh: number
  pricePerM2: number
  trend: 'hausse' | 'stable' | 'baisse'
  confidence: 'haute' | 'moyenne' | 'faible'
  analysis: string
  comparables?: { address: string; price: number; surface: number; date: string }[]
}

const TREND_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  hausse: { bg: 'rgba(52,211,153,.1)', color: '#34d399', label: 'Hausse' },
  stable: { bg: 'rgba(251,191,36,.1)', color: '#fbbf24', label: 'Stable' },
  baisse: { bg: 'rgba(248,113,113,.1)', color: '#f87171', label: 'Baisse' },
}

const CONFIDENCE_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  haute: { bg: 'rgba(52,211,153,.1)', color: '#34d399', label: 'Haute' },
  moyenne: { bg: 'rgba(251,191,36,.1)', color: '#fbbf24', label: 'Moyenne' },
  faible: { bg: 'rgba(255,255,255,.06)', color: 'rgba(255,255,255,.4)', label: 'Faible' },
}

export default function EstimationPage() {
  const { user, loading, refresh } = useUser()
  const router = useRouter()

  const [address, setAddress] = useState('')
  const [type, setType] = useState<'appartement' | 'maison'>('appartement')
  const [surface, setSurface] = useState('')
  const [rooms, setRooms] = useState('')
  const [floor, setFloor] = useState('')
  const [estimating, setEstimating] = useState(false)
  const [result, setResult] = useState<EstimationResult | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [loading, user, router])

  if (loading || !user) return (
    <div className="loading-page">
      <div className="loading-text">Chargement...</div>
    </div>
  )

  const isFirstEstimation = !user.free_listing_used
  const canEstimate = address && surface && rooms

  async function handleEstimate() {
    if (!canEstimate) {
      setError('Veuillez remplir tous les champs obligatoires')
      return
    }
    if (!isFirstEstimation && user!.credits < 1) {
      setError('Credits insuffisants. Achetez un pack pour continuer.')
      return
    }

    setEstimating(true)
    setError('')
    setResult(null)

    try {
      const res = await fetch('/api/ai/estimation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          surface: parseInt(surface),
          rooms: parseInt(rooms),
          type,
          floor: floor ? parseInt(floor) : null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur lors de l\'estimation')
      setResult(data)
      await refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur')
    } finally {
      setEstimating(false)
    }
  }

  function buildPosterLink() {
    if (!result) return '/poster'
    const avg = Math.round((result.priceLow + result.priceHigh) / 2)
    const params = new URLSearchParams({ price: String(avg) })
    return `/poster?${params}`
  }

  return (
    <div className="page">
      <Nav />
      <div className="content-narrow">
        <h1 className="heading-lg mb-8">Estimation immobilière</h1>
        <p className="text-xs text-muted" style={{ marginBottom: 24 }}>
          Estimez la valeur de votre bien grâce aux données DVF et à l'IA
        </p>

        {/* Form */}
        {!result && !estimating && (
          <>
            <label className="form-label">Adresse *</label>
            <LocationInput
              value={address}
              onChange={(city) => setAddress(city)}
              placeholder="Ex : Bayonne, Biarritz, Anglet..."
              className="mb-12"
            />

            <label className="form-label">Type</label>
            <div className="flex gap-6 mb-14 flex-wrap">
              <button
                onClick={() => setType('appartement')}
                className={`chip-btn ${type === 'appartement' ? 'selected' : ''}`}
              >
                Appartement
              </button>
              <button
                onClick={() => setType('maison')}
                className={`chip-btn ${type === 'maison' ? 'selected' : ''}`}
              >
                Maison
              </button>
            </div>

            <div className="immo-fields">
              <div>
                <label className="form-label">Surface m2 *</label>
                <input
                  type="number"
                  placeholder="68"
                  value={surface}
                  onChange={e => setSurface(e.target.value)}
                />
              </div>
              <div>
                <label className="form-label">Pièces *</label>
                <input
                  type="number"
                  placeholder="3"
                  value={rooms}
                  onChange={e => setRooms(e.target.value)}
                />
              </div>
              {type === 'appartement' && (
                <div>
                  <label className="form-label">Etage</label>
                  <input
                    type="number"
                    placeholder="2"
                    value={floor}
                    onChange={e => setFloor(e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* Cost info */}
            <div className={`cost-bar mb-14 ${isFirstEstimation ? 'free' : 'paid'}`}>
              <span className="text-xs" style={{ color: isFirstEstimation ? '#34d399' : 'var(--a)', fontWeight: 700 }}>
                {isFirstEstimation ? 'Gratuit (1re estimation)' : '1 credit = 1 estimation + 1 ticket offert'}
              </span>
              {!isFirstEstimation && (
                <span className="text-xs" style={{ color: '#34d399', fontWeight: 600 }}>+1 ticket</span>
              )}
            </div>

            {/* Submit */}
            <button
              onClick={handleEstimate}
              disabled={!canEstimate || (!isFirstEstimation && user.credits < 1)}
              className={`btn-primary full-width ${!canEstimate ? 'opacity-50' : ''}`}
              style={{ padding: '13px 0', fontSize: 14, cursor: 'pointer' }}
            >
              {isFirstEstimation ? 'Estimer gratuitement' : 'Estimer mon bien — 1 credit'}
            </button>

            {!isFirstEstimation && user.credits < 1 && (
              <Link href="/credits" className="text-xs text-gold" style={{ display: 'block', textAlign: 'center', marginTop: 10, textDecoration: 'none', fontWeight: 700 }}>
                Acheter des credits
              </Link>
            )}

            {error && <div className="error-box">{error}</div>}
          </>
        )}

        {/* Loading state */}
        {estimating && (
          <div className="card" style={{ padding: '32px 24px', textAlign: 'center', animation: 'pulse 2s ease-in-out infinite' }}>
            <div className="text-gold" style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>
              Analyse en cours...
            </div>
            <div className="text-xs text-muted">
              Interrogation des données DVF et analyse IA
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div style={{ animation: 'fadeInUp 0.4s ease' }}>
            {/* Price range */}
            <div className="card" style={{ padding: '28px 24px', marginBottom: 12, textAlign: 'center' }}>
              <div className="text-xs text-muted" style={{ marginBottom: 8 }}>Estimation</div>
              <div className="mono text-gold" style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.2 }}>
                {result.priceLow.toLocaleString('fr-FR')} € — {result.priceHigh.toLocaleString('fr-FR')} €
              </div>
              <div className="mono text-muted" style={{ fontSize: 14, marginTop: 6 }}>
                {result.pricePerM2.toLocaleString('fr-FR')} €/m²
              </div>
            </div>

            {/* Badges */}
            <div className="flex gap-6 mb-14" style={{ justifyContent: 'center' }}>
              {/* Trend badge */}
              {(() => {
                const t = TREND_STYLES[result.trend]
                return (
                  <span className="badge" style={{
                    background: t.bg,
                    color: t.color,
                    border: `1px solid ${t.color}30`,
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '4px 12px',
                  }}>
                    Tendance : {t.label}
                  </span>
                )
              })()}
              {/* Confidence badge */}
              {(() => {
                const c = CONFIDENCE_STYLES[result.confidence]
                return (
                  <span className="badge" style={{
                    background: c.bg,
                    color: c.color,
                    border: `1px solid ${c.color}30`,
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '4px 12px',
                  }}>
                    Confiance : {c.label}
                  </span>
                )
              })()}
            </div>

            {/* Analysis */}
            <div className="card" style={{ padding: '20px', marginBottom: 12 }}>
              <div className="text-xs" style={{ color: 'rgba(255,255,255,.6)', lineHeight: 1.7 }}>
                {result.analysis}
              </div>
            </div>

            {/* Comparable sales */}
            {result.comparables && result.comparables.length > 0 && (
              <div className="card" style={{ padding: '20px', marginBottom: 16 }}>
                <div className="text-xs text-muted" style={{ marginBottom: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Ventes comparables
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {result.comparables.map((comp, i) => (
                    <div key={i} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '8px 0',
                      borderBottom: i < result.comparables!.length - 1 ? '1px solid rgba(255,255,255,.04)' : 'none',
                    }}>
                      <div>
                        <div className="text-xs" style={{ color: 'rgba(255,255,255,.5)' }}>{comp.address}</div>
                        <div className="text-xs" style={{ color: 'rgba(255,255,255,.25)', marginTop: 2 }}>
                          {comp.surface} m2 -- {comp.date}
                        </div>
                      </div>
                      <div className="mono text-gold" style={{ fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap' }}>
                        {comp.price.toLocaleString('fr-FR')} €
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTAs */}
            <Link
              href={buildPosterLink()}
              className="btn-primary full-width"
              style={{ padding: '13px 0', fontSize: 14, textDecoration: 'none', display: 'block', textAlign: 'center', marginBottom: 8 }}
            >
              Poster une annonce avec ce prix
            </Link>
            <button
              onClick={() => { setResult(null); setError('') }}
              className="text-xs text-muted"
              style={{
                display: 'block', width: '100%', textAlign: 'center',
                marginTop: 6, background: 'none', border: 'none', cursor: 'pointer',
                textDecoration: 'underline', textUnderlineOffset: 3,
              }}
            >
              Nouvelle estimation
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
