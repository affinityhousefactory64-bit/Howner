'use client'

import Nav from '@/components/Nav'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import VideoPlaceholder from '@/components/VideoPlaceholder'

const specs = ['149 m²', '4 chambres', 'R+1', 'Terrain inclus', 'Boucau Haut', 'Pays Basque']

const steps = [
  { num: '01', title: 'Inscrivez-vous', desc: '1 ticket gratuit' },
  { num: '02', title: 'Achetez des crédits', desc: '1 ticket par crédit' },
  { num: '03', title: 'Parrainez vos proches', desc: '1 ticket par filleul' },
]

const construction = [
  'Architecte intégré',
  'Finitions Porcelanosa',
  'Construction LSF',
  'Clé en main',
  'Construite par Affinity Home',
]

const rules = [
  {
    title: 'Organisateur',
    content: 'Affinity House Factory SAS, SIRET 982 581 506 00010, sise à Anglet (64600). Jeu-concours organisé conformément à la législation française en vigueur.',
  },
  {
    title: 'Conditions de participation',
    content: 'Résider en France métropolitaine, être âgé(e) de 18 ans ou plus, un seul compte par personne physique. Toute tentative de fraude entraîne la disqualification immédiate.',
  },
  {
    title: 'Mécanique du tirage',
    content: 'Le tirage au sort est déclenché automatiquement lorsque le seuil de 200 000 tickets est atteint. Chaque ticket dispose d’une chance égale.',
  },
  {
    title: 'Contrôle et vérification',
    content: 'Le tirage est supervisé par un huissier de justice. Le gagnant devra fournir une pièce d’identité valide pour la vérification de son éligibilité.',
  },
  {
    title: 'Participation gratuite',
    content: '1 ticket offert à l’inscription. Parrainage illimité : chaque ami inscrit via votre lien vous rapporte 1 ticket supplémentaire.',
  },
  {
    title: 'Conformité européenne',
    content: 'Ce jeu-concours respecte la Directive EU 2005/29/CE relative aux pratiques commerciales déloyales.',
  },
  {
    title: 'Conseil juridique',
    content: 'Cabinet Hashtag Avocats, Paris.',
  },
]

const TOTAL = 200000
const INIT = 4283

export default function VillaPage() {
  const [open, setOpen] = useState<number | null>(null)
  const [gaugeCount, setGaugeCount] = useState(INIT)

  useEffect(() => {
    const tick = () => setGaugeCount(p => Math.min(TOTAL, p + Math.floor(Math.random() * 3) + 1))
    const schedule = (): ReturnType<typeof setTimeout> => {
      const delay = 5000 + Math.random() * 3000
      return setTimeout(() => { tick(); timerId = schedule() }, delay)
    }
    let timerId = schedule()
    return () => clearTimeout(timerId)
  }, [])

  const gaugePct = (gaugeCount / TOTAL) * 100
  const remaining = TOTAL - gaugeCount

  return (
    <div className="page">
      <Nav />

      {/* HERO */}
      <section className="section text-center" style={{ padding: '60px 16px 40px' }}>
        <div className="badge mb-24" style={{
          color: 'var(--a)',
          background: 'rgba(207,175,75,.08)',
          border: '1px solid rgba(207,175,75,.15)',
        }}>
          <span className="mono" style={{ fontSize: 10, letterSpacing: 4, textTransform: 'uppercase' }}>
            Jeu-concours Howner
          </span>
        </div>
        <h1 className="heading-xl mb-12" style={{ letterSpacing: -1 }}>
          Villa Boucau
        </h1>
        <p className="text-muted" style={{ fontSize: 'clamp(16px, 3vw, 22px)', fontWeight: 400, margin: '0 0 36px' }}>
          Le lot du jeu concours
        </p>

        {/* SPECS TAGS */}
        <div className="flex flex-wrap justify-center gap-8" style={{ marginBottom: 44 }}>
          {specs.map(s => (
            <span key={s} className="badge mono" style={{
              fontSize: 11,
              color: 'var(--a)',
              background: 'rgba(207,175,75,.06)',
              border: '1px solid rgba(207,175,75,.12)',
              borderRadius: 8,
              padding: '8px 14px',
              letterSpacing: 0.5,
            }}>
              {s}
            </span>
          ))}
        </div>

        {/* PRICE */}
        <div className="price-hero">695 000€</div>
        <p className="mono text-xs" style={{ color: '#9ca3af', letterSpacing: 1, marginTop: 0 }}>
          Valeur estimée du lot
        </p>
      </section>

      {/* VIDEO */}
      <section className="content-narrow" style={{ paddingBottom: 30 }}>
        <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(207,175,75,.15)', background: '#000', aspectRatio: '9/16', maxHeight: 500, margin: '0 auto' }}>
          <iframe
            src="https://drive.google.com/file/d/1HHinz5llZ3LHbovBf8r20cD5tGhR5zET/preview"
            style={{ width: '100%', height: '100%', border: 'none' }}
            allow="autoplay"
            title="Villa Boucau — Visite vidéo"
          />
        </div>
        <div className="text-center" style={{ marginTop: 8 }}>
          <span className="text-xs text-muted">Visite virtuelle de la Villa Boucau</span>
        </div>

        {/* Video placeholder — remplacer par YouTube/vidéo quand disponible */}
        <div style={{ marginTop: 24 }}>
          <VideoPlaceholder title="Visite de la Villa Boucau" subtitle="Vidéo promo — bientôt disponible" aspectRatio="16/9" />
        </div>
      </section>

      {/* PHOTO GALLERY */}
      <section className="content-wide" style={{ paddingBottom: 40 }}>
        <div className="gallery-main">
          <img src="/villa/exterior-1.jpg" alt="Villa Boucau — Extérieur piscine" className="gallery-img" />
          <div className="gallery-side">
            <img src="/villa/exterior-2.jpg" alt="Villa Boucau — Vue arrière" className="gallery-side-img" />
            <img src="/villa/lateral.jpg" alt="Villa Boucau — Vue latérale" className="gallery-side-img" />
          </div>
        </div>
        <div className="gallery-thumbs">
          <img src="/villa/cuisine.jpg" alt="Intérieur — Cuisine" className="gallery-thumb" />
          <img src="/villa/salon.jpg" alt="Intérieur — Salon" className="gallery-thumb" />
          <img src="/villa/chambre.jpg" alt="Intérieur — Chambre" className="gallery-thumb" />
          <img src="/villa/terrain.jpg" alt="Terrain à Boucau" className="gallery-thumb" style={{ border: '2px solid rgba(207,175,75,.2)' }} />
        </div>
        <div className="text-center" style={{ marginTop: 8 }}>
          <span className="text-xs" style={{ color: '#9ca3af' }}>Terrain + Construction neuve par Affinity Home · Boucau Haut, Pays Basque</span>
        </div>
      </section>

      {/* DIVIDER */}
      <div className="divider-gold" />

      {/* CONSTRUCTION DETAILS */}
      <section className="content-medium text-center" style={{ paddingBottom: 60 }}>
        <div className="flex flex-wrap justify-center gap-10">
          {construction.map(item => (
            <span key={item} className="card" style={{ padding: '10px 18px', borderRadius: 10, fontSize: 13, color: '#6b7280' }}>
              {item}
            </span>
          ))}
        </div>
      </section>

      {/* COMMENT PARTICIPER */}
      <section className="content-wide" style={{ paddingBottom: 80 }}>
        <h2 className="heading-lg text-center" style={{ marginBottom: 48 }}>
          Comment participer
        </h2>
        <div className="grid-3">
          {steps.map(step => (
            <div key={step.num} className="card text-center" style={{ padding: '36px 24px' }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: 'rgba(207,175,75,.08)', border: '1px solid rgba(207,175,75,.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 18px',
              }}>
                <span className="mono" style={{ fontSize: 16, color: 'var(--a)' }}>{step.num}</span>
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#e4e4e7', margin: '0 0 8px' }}>
                {step.title}
              </h3>
              <p className="mono text-xs text-gold" style={{ margin: 0, letterSpacing: 0.3 }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* TRUST SIGNALS */}
      <section className="content-medium" style={{ paddingBottom: 60 }}>
        <div className="grid-3" style={{ gap: 12 }}>
          {[
            { label: 'Huissier de justice', desc: 'Tirage supervisé et certifié' },
            { label: 'Notaire', desc: 'Transfert de propriété sécurisé' },
            { label: 'Remboursement', desc: 'Annulation si seuil non atteint' },
          ].map((s, i) => (
            <div key={i} className="card text-center" style={{ padding: '20px 16px' }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#e4e4e7', marginBottom: 4 }}>{s.label}</div>
              <div className="text-xs text-muted">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* REGLEMENT */}
      <section className="content-medium" style={{ paddingBottom: 80 }}>
        <h2 className="heading-lg text-center" style={{ marginBottom: 36 }}>
          Règlement du jeu concours
        </h2>
        <div className="flex flex-col gap-6">
          {rules.map((rule, i) => (
            <div key={i} className={`accordion-item ${open === i ? 'open' : ''}`}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="accordion-trigger"
              >
                <span className="accordion-title">{rule.title}</span>
                <span className="accordion-icon">+</span>
              </button>
              {open === i && (
                <div className="accordion-body">{rule.content}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* PARTICIPEZ AU TIRAGE */}
      <section style={{ padding: '0 16px 80px' }}>
        <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
          <h2 className="heading-lg" style={{ marginBottom: 12 }}>Participez au tirage</h2>
          <p className="text-muted text-sm" style={{ maxWidth: 420, margin: '0 auto 28px', lineHeight: 1.7 }}>
            Inscrivez-vous gratuitement et recevez votre premier ticket.
          </p>

          {/* Gauge */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10 }}>
              <div className="glow-dot" />
              <span className="text-muted text-xs" style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Tirage en cours</span>
            </div>
            <div style={{ marginBottom: 10 }}>
              <span className="counter-num text-gold" style={{ fontSize: 24 }}>{gaugeCount.toLocaleString()}</span>
              <span className="mono text-muted" style={{ fontSize: 14 }}> / {TOTAL.toLocaleString()} tickets</span>
            </div>
            <div className="gauge-bar" style={{ height: 10, marginBottom: 10 }}>
              <div className="gauge-fill" style={{ width: `${gaugePct}%` }} />
            </div>
            <p className="mono" style={{ fontSize: 12, color: '#f472b6', fontWeight: 700 }}>
              Plus que {remaining.toLocaleString()} tickets avant le tirage
            </p>
          </div>

          <Link href="/login" className="btn-primary btn-shine" style={{ padding: '16px 40px', fontSize: 15 }}>
            S&apos;inscrire — c&apos;est gratuit
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="page-footer">
        <p>
          Affinity House Factory SAS · SIRET 982 581 506 00010 · Anglet (64600)
          <br />
          Jeu-concours régi par le droit français · Directive EU 2005/29/CE
          <br />
          Règlement complet disponible sur demande · Données traitées conformément au RGPD
        </p>
        <p style={{ fontSize: 9, color: '#d1d5db', marginTop: 16 }}>
          &copy; {new Date().getFullYear()} Howner
        </p>
      </footer>
    </div>
  )
}
