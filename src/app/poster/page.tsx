'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/lib/context'
import Nav from '@/components/Nav'
import Link from 'next/link'

const CATEGORIES = [
  { id: 'immo', label: '🏠 Immobilier', subs: [
    { id: 'vente', label: 'Je vends un bien' },
    { id: 'location', label: 'Je loue un bien' },
    { id: 'recherche_achat', label: 'Je cherche à acheter' },
    { id: 'recherche_location', label: 'Je cherche à louer' },
  ]},
  { id: 'service', label: '🔧 Services', subs: [
    { id: 'offre_service', label: 'Je propose mes services' },
  ]},
  { id: 'demande', label: '📋 Demandes', subs: [
    { id: 'recherche_service', label: 'Je cherche un pro' },
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
    <div style={{ minHeight: '100vh', background: '#060a13', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: 'var(--b)', color: 'rgba(255,255,255,.3)' }}>Chargement...</div>
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
      setError('Remplis tous les champs obligatoires')
      return
    }
    if (!isFree && user!.credits < 1) {
      setError('Pas assez de crédits. Achète un pack !')
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
      <div style={{ minHeight: '100vh', background: '#060a13', color: '#fff' }}>
        <Nav />
        <div style={{ maxWidth: 480, margin: '0 auto', padding: '60px 18px', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>{success.usedCredit ? '🎟️' : '🎉'}</div>
          <h1 style={{ fontFamily: 'var(--d)', fontSize: 26, fontWeight: 800, marginBottom: 8 }}>{success.message}</h1>
          {success.usedCredit && (
            <p style={{ fontFamily: 'var(--b)', fontSize: 13, color: '#34d399', fontWeight: 700, marginBottom: 20 }}>+1 ticket pour le jeu concours</p>
          )}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/annonces" style={{ padding: '12px 24px', background: 'linear-gradient(135deg, var(--a), #b8932e)', borderRadius: 9, fontFamily: 'var(--b)', fontWeight: 700, fontSize: 12, color: '#0a0e1a', textDecoration: 'none' }}>
              Voir les annonces
            </Link>
            <Link href="/compte" style={{ padding: '12px 24px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 9, fontFamily: 'var(--b)', fontWeight: 600, fontSize: 12, color: 'rgba(255,255,255,.5)', textDecoration: 'none' }}>
              Mon compte
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#060a13', color: '#fff' }}>
      <Nav />
      <div style={{ maxWidth: 520, margin: '0 auto', padding: '28px 18px 60px' }}>
        <h1 style={{ fontFamily: 'var(--d)', fontSize: 26, fontWeight: 800, marginBottom: 4 }}>Poster une annonce</h1>
        <p style={{ fontFamily: 'var(--b)', fontSize: 12, color: 'rgba(255,255,255,.35)', marginBottom: 20 }}>
          {isFree
            ? '🎁 Ta 1ère annonce est gratuite !'
            : `💳 1 crédit par annonce · Tu as ${user.credits} crédit${user.credits > 1 ? 's' : ''} · +1 ticket par annonce`
          }
        </p>

        {/* Catégorie */}
        <label style={{ fontFamily: 'var(--b)', fontSize: 10, color: 'rgba(255,255,255,.35)', display: 'block', marginBottom: 6, fontWeight: 600 }}>Catégorie *</label>
        <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
          {CATEGORIES.map(c => (
            <button key={c.id} onClick={() => { setCategory(c.id); setSubcategory('') }}
              style={{ padding: '8px 14px', borderRadius: 8, cursor: 'pointer', border: 'none',
                background: category === c.id ? 'rgba(207,175,75,.1)' : 'rgba(255,255,255,.03)',
                outline: category === c.id ? '1px solid rgba(207,175,75,.25)' : '1px solid rgba(255,255,255,.06)',
                fontFamily: 'var(--b)', fontSize: 12, fontWeight: category === c.id ? 700 : 500,
                color: category === c.id ? 'var(--a)' : 'rgba(255,255,255,.4)',
              }}>{c.label}</button>
          ))}
        </div>

        {/* Sous-catégorie */}
        {selectedCat && (
          <>
            <label style={{ fontFamily: 'var(--b)', fontSize: 10, color: 'rgba(255,255,255,.35)', display: 'block', marginBottom: 6, fontWeight: 600 }}>Type *</label>
            <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
              {selectedCat.subs.map(s => (
                <button key={s.id} onClick={() => setSubcategory(s.id)}
                  style={{ padding: '7px 12px', borderRadius: 7, cursor: 'pointer', border: 'none',
                    background: subcategory === s.id ? 'rgba(207,175,75,.08)' : 'rgba(255,255,255,.02)',
                    outline: subcategory === s.id ? '1px solid rgba(207,175,75,.2)' : '1px solid rgba(255,255,255,.05)',
                    fontFamily: 'var(--b)', fontSize: 11, fontWeight: subcategory === s.id ? 700 : 500,
                    color: subcategory === s.id ? 'var(--a)' : 'rgba(255,255,255,.35)',
                  }}>{s.label}</button>
              ))}
            </div>
          </>
        )}

        {/* Titre */}
        <label style={{ fontFamily: 'var(--b)', fontSize: 10, color: 'rgba(255,255,255,.35)', display: 'block', marginBottom: 6, fontWeight: 600 }}>Titre *</label>
        <input type="text" placeholder="Ex: T3 lumineux avec terrasse" value={title} onChange={e => setTitle(e.target.value)}
          style={{ width: '100%', padding: '11px 14px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 9, color: '#fff', fontFamily: 'var(--b)', fontSize: 13, outline: 'none', marginBottom: 12 }} />

        {/* Localisation */}
        <label style={{ fontFamily: 'var(--b)', fontSize: 10, color: 'rgba(255,255,255,.35)', display: 'block', marginBottom: 6, fontWeight: 600 }}>Localisation *</label>
        <input type="text" placeholder="Ex: Bayonne · Petit Bayonne" value={location} onChange={e => setLocation(e.target.value)}
          style={{ width: '100%', padding: '11px 14px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 9, color: '#fff', fontFamily: 'var(--b)', fontSize: 13, outline: 'none', marginBottom: 12 }} />

        {/* Immo fields */}
        {showImmoFields && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
            <div>
              <label style={{ fontFamily: 'var(--b)', fontSize: 10, color: 'rgba(255,255,255,.35)', display: 'block', marginBottom: 4, fontWeight: 600 }}>Prix (€)</label>
              <input type="number" placeholder="245000" value={price} onChange={e => setPrice(e.target.value)}
                style={{ width: '100%', padding: '9px 10px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 8, color: '#fff', fontFamily: 'var(--m)', fontSize: 12, outline: 'none' }} />
            </div>
            <div>
              <label style={{ fontFamily: 'var(--b)', fontSize: 10, color: 'rgba(255,255,255,.35)', display: 'block', marginBottom: 4, fontWeight: 600 }}>Surface (m²)</label>
              <input type="number" placeholder="68" value={surface} onChange={e => setSurface(e.target.value)}
                style={{ width: '100%', padding: '9px 10px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 8, color: '#fff', fontFamily: 'var(--m)', fontSize: 12, outline: 'none' }} />
            </div>
            <div>
              <label style={{ fontFamily: 'var(--b)', fontSize: 10, color: 'rgba(255,255,255,.35)', display: 'block', marginBottom: 4, fontWeight: 600 }}>Pièces</label>
              <input type="number" placeholder="3" value={rooms} onChange={e => setRooms(e.target.value)}
                style={{ width: '100%', padding: '9px 10px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 8, color: '#fff', fontFamily: 'var(--m)', fontSize: 12, outline: 'none' }} />
            </div>
          </div>
        )}

        {/* Description */}
        <label style={{ fontFamily: 'var(--b)', fontSize: 10, color: 'rgba(255,255,255,.35)', display: 'block', marginBottom: 6, fontWeight: 600 }}>Description</label>
        <textarea placeholder="Décris ton annonce en détail..." value={description} onChange={e => setDescription(e.target.value)} rows={4}
          style={{ width: '100%', padding: '11px 14px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 9, color: '#fff', fontFamily: 'var(--b)', fontSize: 13, outline: 'none', resize: 'vertical', marginBottom: 14, lineHeight: 1.6 }} />

        {/* Cost info */}
        <div style={{ padding: '12px 14px', background: isFree ? 'rgba(52,211,153,.05)' : 'rgba(207,175,75,.04)', border: `1px solid ${isFree ? 'rgba(52,211,153,.12)' : 'rgba(207,175,75,.1)'}`, borderRadius: 10, marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--b)', fontSize: 12, color: isFree ? '#34d399' : 'var(--a)', fontWeight: 700 }}>
            {isFree ? '🎁 Gratuit (1ère annonce)' : '💳 Coût : 1 crédit'}
          </span>
          {!isFree && (
            <span style={{ fontFamily: 'var(--b)', fontSize: 10, color: '#34d399', fontWeight: 600 }}>+1 ticket 🎟️</span>
          )}
        </div>

        {/* Submit */}
        <button onClick={handleSubmit} disabled={posting || !category || !subcategory || !title || !location || (!isFree && user.credits < 1)}
          style={{
            width: '100%', padding: '13px 0',
            background: posting ? 'rgba(207,175,75,.3)' : 'linear-gradient(135deg, var(--a), #b8932e)',
            border: 'none', borderRadius: 10,
            color: '#0a0e1a', fontFamily: 'var(--b)', fontWeight: 800, fontSize: 14,
            cursor: posting ? 'wait' : 'pointer',
            boxShadow: '0 3px 14px rgba(207,175,75,.2)',
          }}>
          {posting ? 'Publication...' : isFree ? '🎁 Publier gratuitement' : '📢 Publier (1 crédit)'}
        </button>

        {!isFree && user.credits < 1 && (
          <Link href="/credits" style={{ display: 'block', textAlign: 'center', marginTop: 10, fontFamily: 'var(--b)', fontSize: 12, color: 'var(--a)', textDecoration: 'none', fontWeight: 700 }}>
            Acheter des crédits →
          </Link>
        )}

        {error && (
          <div style={{ marginTop: 10, padding: '10px 14px', background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.15)', borderRadius: 8, fontFamily: 'var(--b)', fontSize: 12, color: '#ef4444' }}>{error}</div>
        )}
      </div>
    </div>
  )
}
