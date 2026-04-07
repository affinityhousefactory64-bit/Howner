'use client'

import { useState } from 'react'
import Link from 'next/link'
import Nav from '@/components/Nav'

/* ═══ MOCK DATA ═══ */
const MOCK = {
  name: 'Jean',
  credits: 3,
  tickets: 4,
  referral_code: 'ABC123',
  referrals_count: 2,
  referral_credits_earned: 2,
  ticket_history: [
    { id: '1', label: 'Inscription', tickets: 1, date: '2026-03-01' },
    { id: '2', label: 'Parrainage — Marie', tickets: 1, date: '2026-03-05' },
    { id: '3', label: 'Achat Pack 1', tickets: 1, date: '2026-03-10' },
    { id: '4', label: 'Parrainage — Lucas', tickets: 1, date: '2026-03-15' },
  ],
}

const GAUGE_TOTAL = 200000

/* ═══ PLACEHOLDER API ═══ */
async function useCredit(_action: string, _query: string) {
  // TODO: call /api/credits/use
  return { success: true }
}

async function logout() {
  // TODO: call /api/auth/logout
  window.location.href = '/login'
}

/* ═══ PAGE ═══ */
export default function ComptePage() {
  const user = MOCK

  const [copied, setCopied] = useState(false)

  // Tool inputs
  const [searchQuery, setSearchQuery] = useState('')
  const [devisText, setDevisText] = useState('')
  const [findQuery, setFindQuery] = useState('')

  const referralUrl = `https://howner.vercel.app/?ref=${user.referral_code}`
  const gaugePct = Math.min((user.tickets / GAUGE_TOTAL) * 100, 100)

  function copyReferral() {
    navigator.clipboard.writeText(referralUrl).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function shareWhatsApp() {
    const text = encodeURIComponent(`Rejoignez Howner et gagnez 1 ticket pour la villa a 695 000€ ! ${referralUrl}`)
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  function shareSMS() {
    const text = encodeURIComponent(`Rejoignez Howner et gagnez 1 ticket pour la villa a 695 000€ ! ${referralUrl}`)
    window.open(`sms:?body=${text}`, '_blank')
  }

  async function handleSearch() {
    if (!searchQuery.trim()) return
    await useCredit('comparateur', searchQuery)
    setSearchQuery('')
  }

  async function handleDevis() {
    if (!devisText.trim()) return
    await useCredit('devis', devisText)
    setDevisText('')
  }

  async function handleFind() {
    if (!findQuery.trim()) return
    await useCredit('trouve', findQuery)
    setFindQuery('')
  }

  return (
    <div className="page">
      <Nav />
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 16px' }}>

        {/* ── HEADER ── */}
        <div style={{ paddingTop: 32, marginBottom: 32 }}>
          <h1 className="heading-lg" style={{ marginBottom: 4 }}>Mon compte</h1>
          <p style={{ fontSize: 14, color: '#6b7280' }}>
            Bonjour, {user.name}
          </p>
        </div>

        {/* ── CREDITS + TICKETS ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div className="card-gold" style={{ padding: '20px 16px', textAlign: 'center', borderRadius: 16 }}>
            <div className="mono" style={{ fontSize: 40, fontWeight: 700, color: 'var(--a)', lineHeight: 1 }}>
              {user.credits}
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', letterSpacing: 2, textTransform: 'uppercase', marginTop: 8 }}>
              Mes credits
            </div>
          </div>
          <div className="card" style={{ padding: '20px 16px', textAlign: 'center', borderRadius: 16, borderColor: 'rgba(52,211,153,.12)', background: 'rgba(52,211,153,.03)' }}>
            <div className="mono" style={{ fontSize: 40, fontWeight: 700, color: '#34d399', lineHeight: 1 }}>
              {user.tickets}
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', letterSpacing: 2, textTransform: 'uppercase', marginTop: 8 }}>
              Mes tickets
            </div>
          </div>
        </div>
        <div style={{ marginBottom: 32 }}>
          <Link href="/credits" className="btn-primary" style={{ width: '100%', padding: '14px 0', fontSize: 14, textAlign: 'center' }}>
            Acheter des credits
          </Link>
        </div>

        {/* ── UTILISER UN CREDIT ── */}
        <div style={{ marginBottom: 32 }}>
          <h2 className="heading-md" style={{ marginBottom: 16 }}>Utiliser un credit</h2>

          {/* Comparateur immo */}
          <div className="card" style={{ padding: '20px 18px', marginBottom: 12, borderRadius: 14 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#e4e4e7', marginBottom: 4 }}>Comparateur immo</div>
            <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 12, lineHeight: 1.5 }}>
              Location, achat, saisonnier — comparez toutes les offres en une recherche.
            </p>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Ex : T3 Bayonne max 800€/mois"
              style={{
                width: '100%',
                padding: '10px 14px',
                fontSize: 13,
                background: 'rgba(255,255,255,.05)',
                border: '1px solid rgba(255,255,255,.1)',
                borderRadius: 10,
                color: '#e4e4e7',
                outline: 'none',
                marginBottom: 10,
                fontFamily: 'var(--b)',
              }}
            />
            <button onClick={handleSearch} className="btn-primary" style={{ width: '100%', padding: '10px 0', fontSize: 13 }}>
              Rechercher — 1 credit
            </button>
          </div>

          {/* Analyse de devis */}
          <div className="card-gold" style={{ padding: '20px 18px', marginBottom: 12, borderRadius: 14 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#e4e4e7', marginBottom: 4 }}>Analyse de devis</div>
            <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 12, lineHeight: 1.5 }}>
              Decrivez votre devis. L&apos;IA vous dit si c&apos;est le bon prix.
            </p>
            <textarea
              value={devisText}
              onChange={e => setDevisText(e.target.value)}
              placeholder="Ex : Salle de bain complete 8 500€ a Bayonne, pose + fourniture"
              rows={3}
              style={{
                width: '100%',
                padding: '10px 14px',
                fontSize: 13,
                background: 'rgba(255,255,255,.05)',
                border: '1px solid rgba(207,175,75,.15)',
                borderRadius: 10,
                color: '#e4e4e7',
                outline: 'none',
                marginBottom: 10,
                fontFamily: 'var(--b)',
                resize: 'vertical',
                lineHeight: 1.5,
              }}
            />
            <button onClick={handleDevis} className="btn-primary" style={{ width: '100%', padding: '10px 0', fontSize: 13 }}>
              Analyser — 1 credit
            </button>
          </div>

          {/* Trouve pour moi */}
          <div className="card" style={{ padding: '20px 18px', marginBottom: 0, borderRadius: 14 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#e4e4e7', marginBottom: 4 }}>Trouve pour moi</div>
            <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 12, lineHeight: 1.5 }}>
              Dites ce que vous cherchez. L&apos;IA trouve le bon pro ou la bonne offre.
            </p>
            <input
              type="text"
              value={findQuery}
              onChange={e => setFindQuery(e.target.value)}
              placeholder="Ex : Plombier Anglet chauffe-eau max 2 000€"
              style={{
                width: '100%',
                padding: '10px 14px',
                fontSize: 13,
                background: 'rgba(255,255,255,.05)',
                border: '1px solid rgba(255,255,255,.1)',
                borderRadius: 10,
                color: '#e4e4e7',
                outline: 'none',
                marginBottom: 10,
                fontFamily: 'var(--b)',
              }}
            />
            <button onClick={handleFind} className="btn-primary" style={{ width: '100%', padding: '10px 0', fontSize: 13 }}>
              Chercher — 1 credit
            </button>
          </div>
        </div>

        {/* ── MON PARRAINAGE ── */}
        <div style={{ marginBottom: 32 }}>
          <h2 className="heading-md" style={{ marginBottom: 16 }}>Mon parrainage</h2>
          <div className="card" style={{ padding: '20px 18px', borderRadius: 14 }}>
            {/* Referral link */}
            <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 6 }}>
              Votre lien de parrainage
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(255,255,255,.05)',
              border: '1px solid rgba(255,255,255,.08)',
              borderRadius: 10,
              padding: '10px 12px',
              marginBottom: 12,
            }}>
              <span className="mono" style={{
                fontSize: 11,
                color: '#6b7280',
                flex: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {referralUrl}
              </span>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <button onClick={copyReferral} className="btn-primary" style={{ flex: 1, padding: '10px 0', fontSize: 12 }}>
                {copied ? 'Copie !' : 'Copier le lien'}
              </button>
              <button onClick={shareWhatsApp} className="btn-secondary" style={{ flex: 1, padding: '10px 0', fontSize: 12 }}>
                WhatsApp
              </button>
              <button onClick={shareSMS} className="btn-secondary" style={{ flex: 1, padding: '10px 0', fontSize: 12 }}>
                SMS
              </button>
            </div>

            {/* Stats */}
            <div style={{
              padding: '12px 14px',
              background: 'rgba(255,255,255,.04)',
              borderRadius: 10,
              border: '1px solid rgba(255,255,255,.08)',
              textAlign: 'center',
            }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#6b7280' }}>
                {user.referrals_count} ami{user.referrals_count > 1 ? 's' : ''} parraine{user.referrals_count > 1 ? 's' : ''}
              </span>
              <span style={{ fontSize: 13, color: '#d1d5db', margin: '0 10px' }}>·</span>
              <span className="text-gold" style={{ fontSize: 13, fontWeight: 700 }}>
                {user.referral_credits_earned} credit{user.referral_credits_earned > 1 ? 's' : ''} gagne{user.referral_credits_earned > 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        {/* ── MES TICKETS ── */}
        <div style={{ marginBottom: 32 }}>
          <h2 className="heading-md" style={{ marginBottom: 16 }}>Mes tickets</h2>
          <div className="card" style={{ padding: '20px 18px', borderRadius: 14 }}>
            {/* Count */}
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#e4e4e7' }}>
                Vous avez {user.tickets} ticket{user.tickets > 1 ? 's' : ''}
              </div>
              <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>
                pour le tirage de la villa a 695 000€
              </div>
            </div>

            {/* Mini gauge */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span className="mono" style={{ fontSize: 11, color: 'var(--a)', fontWeight: 700 }}>{user.tickets}</span>
                <span className="mono" style={{ fontSize: 11, color: '#9ca3af' }}>{(GAUGE_TOTAL / 1000).toFixed(0)}K</span>
              </div>
              <div className="gauge-bar" style={{ height: 6 }}>
                <div className="gauge-fill" style={{ width: `${Math.max(gaugePct, 0.5)}%` }} />
              </div>
            </div>

            {/* History */}
            <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 10 }}>
              Historique
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {user.ticket_history.map(h => (
                <div key={h.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 10px',
                  background: 'rgba(255,255,255,.04)',
                  borderRadius: 8,
                  border: '1px solid rgba(255,255,255,.08)',
                }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#e4e4e7' }}>{h.label}</div>
                    <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 2 }}>
                      {new Date(h.date).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                  <span className="mono" style={{ fontSize: 12, color: '#34d399', fontWeight: 700 }}>
                    +{h.tickets}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── DECONNEXION ── */}
        <div style={{ textAlign: 'center', paddingBottom: 48 }}>
          <button
            onClick={logout}
            style={{
              background: 'none',
              border: 'none',
              color: '#9ca3af',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              padding: '12px 24px',
              fontFamily: 'var(--b)',
            }}
          >
            Se deconnecter
          </button>
        </div>

      </div>
    </div>
  )
}
