'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useUser } from '@/lib/context'
import Nav from '@/components/Nav'
import MediaUpload from '@/components/MediaUpload'
import LocationInput from '@/components/LocationInput'
import Link from 'next/link'

const CATEGORIES = [
  { id: 'immo', label: 'Immobilier', subs: [
    { id: 'vente', label: 'Je vends un bien' },
    { id: 'location', label: 'Je loue un bien' },
    { id: 'recherche_achat', label: 'Je cherche à acheter' },
    { id: 'recherche_location', label: 'Je cherche à louer' },
  ]},
  { id: 'service', label: 'Services', subs: [
    { id: 'offre_service', label: 'Je propose mes services' },
  ]},
  { id: 'demande', label: 'Demandes', subs: [
    { id: 'recherche_service', label: 'Je cherche un professionnel' },
  ]},
]

interface PriceSuggestion {
  priceLow: number
  priceHigh: number
  pricePerM2: number
}

export default function PosterPageWrapper() {
  return (
    <Suspense fallback={<div className="loading-page"><div className="loading-text">Chargement...</div></div>}>
      <PosterPage />
    </Suspense>
  )
}

function PosterPage() {
  const { user, loading, refresh } = useUser()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [category, setCategory] = useState('')
  const [subcategory, setSubcategory] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [price, setPrice] = useState('')
  const [surface, setSurface] = useState('')
  const [rooms, setRooms] = useState('')
  const [externalLink, setExternalLink] = useState('')
  // Immo extra fields
  const [propertyType, setPropertyType] = useState('')
  const [bedrooms, setBedrooms] = useState('')
  const [floor, setFloor] = useState('')
  const [dpe, setDpe] = useState('')
  // Service fields
  const [proTariff, setProTariff] = useState('')
  const [proAvailability, setProAvailability] = useState('')
  // Demande fields
  const [urgency, setUrgency] = useState('')
  const [photos, setPhotos] = useState<string[]>([])
  const [video, setVideo] = useState<string>('')
  const [posting, setPosting] = useState(false)
  const [success, setSuccess] = useState<{ message: string; usedCredit: boolean } | null>(null)
  const [error, setError] = useState('')

  // Price suggestion state
  const [estimating, setEstimating] = useState(false)
  const [suggestion, setSuggestion] = useState<PriceSuggestion | null>(null)
  const [estimateError, setEstimateError] = useState('')

  // Pre-fill price from query params (coming from estimation page)
  useEffect(() => {
    const prePrice = searchParams.get('price')
    if (prePrice) setPrice(prePrice)
  }, [searchParams])

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [loading, user, router])

  if (loading || !user) return (
    <div className="loading-page">
      <div className="loading-text">Chargement...</div>
    </div>
  )

  const selectedCat = CATEGORIES.find(c => c.id === category)
  const isFree = !user.free_listing_used
  const showImmoFields = category === 'immo' && ['vente', 'location'].includes(subcategory)
  const showServiceFields = category === 'service'
  const showDemandeFields = category === 'demande'
  const showBedrooms = showImmoFields && ['appartement', 'maison'].includes(propertyType)
  const showFloor = showImmoFields && propertyType === 'appartement'
  const showEstimateButton = category === 'immo' && subcategory === 'vente' && location && surface && rooms && !suggestion

  async function handleEstimatePrice() {
    setEstimating(true)
    setEstimateError('')
    setSuggestion(null)
    try {
      const res = await fetch('/api/ai/estimation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: location,
          surface: parseInt(surface),
          rooms: parseInt(rooms),
          type: 'appartement',
          freeEstimate: true,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur')
      setSuggestion({ priceLow: data.priceLow, priceHigh: data.priceHigh, pricePerM2: data.pricePerM2 })
    } catch (e) {
      setEstimateError(e instanceof Error ? e.message : 'Erreur')
    } finally {
      setEstimating(false)
    }
  }

  function applySuggestedPrice() {
    if (!suggestion) return
    const avg = Math.round((suggestion.priceLow + suggestion.priceHigh) / 2)
    setPrice(String(avg))
  }

  async function handleSubmit() {
    if (!category || !subcategory || !title || !location) {
      setError('Veuillez remplir tous les champs obligatoires')
      return
    }
    if (!isFree && user!.credits < 1) {
      setError('Crédits insuffisants. Achetez un pack pour continuer.')
      return
    }

    setPosting(true)
    setError('')
    try {
      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category, subcategory, title, description, location,
          price: price ? parseInt(price) : null,
          surface: surface ? parseInt(surface) : null,
          rooms: rooms ? parseInt(rooms) : null,
          external_link: externalLink || null,
          property_type: propertyType || null,
          bedrooms: bedrooms ? parseInt(bedrooms) : null,
          floor: floor ? parseInt(floor) : null,
          dpe: dpe || null,
          pro_tariff: proTariff || null,
          pro_availability: proAvailability || null,
          urgency: urgency || null,
          photos: photos.length > 0 ? photos : null,
          video: video || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSuccess({ message: data.message, usedCredit: data.usedCredit })
      await refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur')
    } finally {
      setPosting(false)
    }
  }

  if (success) {
    return (
      <div className="page">
        <Nav />
        <div className="content-narrow text-center" style={{ paddingTop: 60 }}>
          <h1 className="heading-lg mb-8">{success.message}</h1>
          {success.usedCredit && (
            <p className="text-sm mb-20" style={{ color: '#34d399', fontWeight: 700 }}>+1 ticket OFFERT pour le jeu concours</p>
          )}
          <div className="flex gap-8 justify-center flex-wrap">
            <Link href="/annonces" className="btn-primary" style={{ padding: '12px 24px', fontSize: 12 }}>
              Voir les annonces
            </Link>
            <Link href="/compte" className="btn-secondary" style={{ padding: '12px 24px', fontSize: 12 }}>
              Mon compte
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const isDisabled = posting || !category || !subcategory || !title || !location || (!isFree && user.credits < 1)

  return (
    <div className="page">
      <Nav />
      <div className="content-narrow">
        <h1 className="heading-lg mb-8">Poster une annonce</h1>
        <p className="text-xs text-muted mb-20">
          {isFree
            ? 'Votre 1re annonce est gratuite !'
            : `1 crédit par annonce · Vous avez ${user.credits} crédit${user.credits > 1 ? 's' : ''} · +1 ticket par annonce`
          }
        </p>

        {/* Catégorie */}
        <label className="form-label">Catégorie *</label>
        <div className="flex gap-6 mb-14 flex-wrap">
          {CATEGORIES.map(c => (
            <button key={c.id} onClick={() => { setCategory(c.id); setSubcategory(''); setSuggestion(null); setEstimateError('') }}
              className={`filter-chip ${category === c.id ? 'active' : ''}`}
              style={{ fontSize: 12 }}>
              {c.label}
            </button>
          ))}
        </div>

        {/* Sous-catégorie */}
        {selectedCat && (
          <>
            <label className="form-label">Type *</label>
            <div className="flex gap-6 mb-14 flex-wrap">
              {selectedCat.subs.map(s => (
                <button key={s.id} onClick={() => { setSubcategory(s.id); setSuggestion(null); setEstimateError('') }}
                  className={`chip-btn ${subcategory === s.id ? 'selected' : ''}`}>
                  {s.label}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Titre */}
        <label className="form-label">Titre *</label>
        <input type="text" placeholder="Ex : T3 lumineux avec terrasse" value={title} onChange={e => setTitle(e.target.value)}
          className="mb-12" />

        {/* Localisation */}
        <label className="form-label">Localisation *</label>
        <LocationInput
          value={location}
          onChange={(city) => { setLocation(city); setSuggestion(null) }}
          placeholder="Ex : Bayonne, Biarritz, Anglet..."
          className="mb-12"
        />

        {/* Immo fields */}
        {showImmoFields && (
          <>
            <div className="immo-fields">
              <div>
                <label className="form-label">Prix (€)</label>
                <input type="number" placeholder="245000" value={price} onChange={e => setPrice(e.target.value)} />
              </div>
              <div>
                <label className="form-label">Surface (m2)</label>
                <input type="number" placeholder="68" value={surface} onChange={e => { setSurface(e.target.value); setSuggestion(null) }} />
              </div>
              <div>
                <label className="form-label">Pièces</label>
                <input type="number" placeholder="3" value={rooms} onChange={e => { setRooms(e.target.value); setSuggestion(null) }} />
              </div>
            </div>

            {/* Price suggestion for vente */}
            {showEstimateButton && !estimating && (
              <button
                onClick={handleEstimatePrice}
                style={{
                  display: 'inline-block',
                  background: 'none',
                  border: '1px solid rgba(207,175,75,.2)',
                  borderRadius: 8,
                  padding: '5px 12px',
                  fontSize: 11,
                  fontFamily: 'var(--b)',
                  fontWeight: 600,
                  color: 'var(--a)',
                  cursor: 'pointer',
                  marginBottom: 12,
                }}
              >
                Estimer le prix -- gratuit
              </button>
            )}

            {estimating && (
              <div className="text-xs" style={{ color: 'var(--a)', fontWeight: 600, marginBottom: 12, animation: 'pulse 1.5s ease-in-out infinite' }}>
                Estimation en cours...
              </div>
            )}

            {suggestion && (
              <div style={{
                background: 'rgba(207,175,75,.04)',
                border: '1px solid rgba(207,175,75,.12)',
                borderRadius: 10,
                padding: '10px 14px',
                marginBottom: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 8,
              }}>
                <div className="text-xs" style={{ color: 'rgba(255,255,255,.6)' }}>
                  <span style={{ fontWeight: 700, color: 'var(--a)' }}>
                    Prix suggéré : {suggestion.priceLow.toLocaleString('fr-FR')} € — {suggestion.priceHigh.toLocaleString('fr-FR')} €
                  </span>
                  <span style={{ marginLeft: 6, color: 'rgba(255,255,255,.35)' }}>
                    {suggestion.pricePerM2.toLocaleString('fr-FR')} €/m²
                  </span>
                </div>
                <button
                  onClick={applySuggestedPrice}
                  style={{
                    background: 'rgba(207,175,75,.15)',
                    border: '1px solid rgba(207,175,75,.25)',
                    borderRadius: 6,
                    padding: '4px 10px',
                    fontSize: 10,
                    fontFamily: 'var(--b)',
                    fontWeight: 700,
                    color: 'var(--a)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Utiliser
                </button>
              </div>
            )}

            {estimateError && (
              <div className="text-xs" style={{ color: '#f87171', marginBottom: 12 }}>{estimateError}</div>
            )}

            {/* Type de bien */}
            <label className="form-label">Type de bien</label>
            <div className="flex gap-6 mb-14 flex-wrap">
              {['Appartement', 'Maison', 'Terrain', 'Local commercial', 'Parking'].map(t => {
                const val = t.toLowerCase().replace(' ', '_')
                return (
                  <button key={val} onClick={() => setPropertyType(val)}
                    className={`chip-btn ${propertyType === val ? 'selected' : ''}`}>
                    {t}
                  </button>
                )
              })}
            </div>

            {/* Nombre de chambres */}
            {showBedrooms && (
              <>
                <label className="form-label">Nombre de chambres</label>
                <input type="number" placeholder="2" value={bedrooms} onChange={e => setBedrooms(e.target.value)}
                  className="mb-12" />
              </>
            )}

            {/* Étage */}
            {showFloor && (
              <>
                <label className="form-label">Étage</label>
                <input type="number" placeholder="3" value={floor} onChange={e => setFloor(e.target.value)}
                  className="mb-12" />
              </>
            )}

            {/* DPE */}
            <label className="form-label">DPE</label>
            <div className="flex gap-6 mb-14 flex-wrap">
              {['A', 'B', 'C', 'D', 'E', 'F', 'G'].map(grade => (
                <button key={grade} onClick={() => setDpe(grade)}
                  className={`chip-btn ${dpe === grade ? 'selected' : ''}`}>
                  {grade}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Service fields */}
        {showServiceFields && subcategory && (
          <>
            <label className="form-label">Tarif indicatif</label>
            <input type="text" placeholder="Ex: 45€/h ou 500€ forfait" value={proTariff} onChange={e => setProTariff(e.target.value)}
              className="mb-12" />

            <label className="form-label">Disponibilité</label>
            <input type="text" placeholder="Ex: Disponible immédiatement" value={proAvailability} onChange={e => setProAvailability(e.target.value)}
              className="mb-12" />
          </>
        )}

        {/* Demande fields */}
        {showDemandeFields && subcategory && (
          <>
            <label className="form-label">Urgence</label>
            <div className="flex gap-6 mb-14 flex-wrap">
              {[{ id: 'normal', label: 'Normal' }, { id: 'urgent', label: 'Urgent' }].map(u => (
                <button key={u.id} onClick={() => setUrgency(u.id)}
                  className={`chip-btn ${urgency === u.id ? 'selected' : ''}`}>
                  {u.label}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Description */}
        <label className="form-label">Description</label>
        <textarea placeholder="Décrivez votre annonce en détail..." value={description} onChange={e => setDescription(e.target.value)} rows={4}
          className="mb-14" style={{ resize: 'vertical', lineHeight: 1.6 }} />

        {/* Photos */}
        <label className="form-label">Photos</label>
        <div className="text-xs" style={{ color: 'rgba(255,255,255,.3)', marginBottom: 8 }}>
          Ajoutez des photos pour 5x plus de visibilité
        </div>
        <div className="mb-14">
          <MediaUpload type="photo" maxFiles={10} onUpload={urls => setPhotos(urls)} />
        </div>

        {/* Vidéo */}
        <label className="form-label">Vidéo (optionnel)</label>
        <div className="mb-14">
          <MediaUpload type="video" maxFiles={1} maxSizeMB={50} onUpload={urls => setVideo(urls[0] || '')} />
        </div>

        {/* External link */}
        <label className="form-label">Lien externe (optionnel)</label>
        <div className="text-xs text-muted" style={{ marginBottom: 6 }}>Collez un lien LeBonCoin, SeLoger ou autre</div>
        <input type="url" placeholder="https://www.leboncoin.fr/..." value={externalLink} onChange={e => setExternalLink(e.target.value)}
          className="mb-14" />

        {/* Cost info */}
        <div className={`cost-bar mb-14 ${isFree ? 'free' : 'paid'}`}>
          <span className="text-xs" style={{ color: isFree ? '#34d399' : 'var(--a)', fontWeight: 700 }}>
            {isFree ? 'Gratuit (1re annonce)' : 'Coût : 1 crédit'}
          </span>
          {!isFree && (
            <span className="text-xs" style={{ color: '#34d399', fontWeight: 600 }}>+1 ticket</span>
          )}
        </div>

        {/* Submit */}
        <button onClick={handleSubmit} disabled={isDisabled}
          className={`btn-primary full-width ${isDisabled ? 'opacity-50' : ''}`}
          style={{ padding: '13px 0', fontSize: 14, cursor: posting ? 'wait' : 'pointer' }}>
          {posting ? 'Publication...' : isFree ? 'Publier gratuitement' : 'Publier (1 crédit)'}
        </button>

        {!isFree && user.credits < 1 && (
          <Link href="/credits" className="text-xs text-gold" style={{ display: 'block', textAlign: 'center', marginTop: 10, textDecoration: 'none', fontWeight: 700 }}>
            Acheter des crédits →
          </Link>
        )}

        {error && <div className="error-box">{error}</div>}
      </div>
    </div>
  )
}
