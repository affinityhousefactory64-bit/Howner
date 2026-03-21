'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/lib/context'
import Nav from '@/components/Nav'
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

export default function PosterPage() {
  const { user, loading, refresh } = useUser()
  const router = useRouter()
  const [category, setCategory] = useState('')
  const [subcategory, setSubcategory] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [price, setPrice] = useState('')
  const [surface, setSurface] = useState('')
  const [rooms, setRooms] = useState('')
  const [posting, setPosting] = useState(false)
  const [success, setSuccess] = useState<{ message: string; usedCredit: boolean } | null>(null)
  const [error, setError] = useState('')

  if (loading) return (
    <div className="loading-page">
      <div className="loading-text">Chargement...</div>
    </div>
  )

  if (!user) {
    router.push('/login')
    return null
  }

  const selectedCat = CATEGORIES.find(c => c.id === category)
  const isFree = !user.free_listing_used
  const showImmoFields = category === 'immo' && ['vente', 'location'].includes(subcategory)

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
            <button key={c.id} onClick={() => { setCategory(c.id); setSubcategory('') }}
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
                <button key={s.id} onClick={() => setSubcategory(s.id)}
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
        <input type="text" placeholder="Ex : Bayonne · Petit Bayonne" value={location} onChange={e => setLocation(e.target.value)}
          className="mb-12" />

        {/* Immo fields */}
        {showImmoFields && (
          <div className="immo-fields">
            <div>
              <label className="form-label">Prix (€)</label>
              <input type="number" placeholder="245000" value={price} onChange={e => setPrice(e.target.value)} />
            </div>
            <div>
              <label className="form-label">Surface (m²)</label>
              <input type="number" placeholder="68" value={surface} onChange={e => setSurface(e.target.value)} />
            </div>
            <div>
              <label className="form-label">Pièces</label>
              <input type="number" placeholder="3" value={rooms} onChange={e => setRooms(e.target.value)} />
            </div>
          </div>
        )}

        {/* Description */}
        <label className="form-label">Description</label>
        <textarea placeholder="Décrivez votre annonce en détail..." value={description} onChange={e => setDescription(e.target.value)} rows={4}
          className="mb-14" style={{ resize: 'vertical', lineHeight: 1.6 }} />

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
