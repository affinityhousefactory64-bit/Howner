'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

/* === CONSTANTS === */
const TOTAL = 200000
const INIT = 47382

const FAQ_DATA = [
  { q: "C'est quoi Howner ?", a: "Howner est une plateforme immobilière avec des outils IA. Vous achetez des crédits pour rechercher des biens, analyser des devis ou trouver un pro. Chaque crédit acheté vous offre 1 ticket pour le tirage d'une villa à 695 000€." },
  { q: 'Comment je participe au tirage ?', a: "Inscrivez-vous gratuitement (1 crédit + 1 ticket offerts). Achetez des crédits pour utiliser nos outils IA. Chaque crédit = 1 ticket. Quand 200 000 tickets sont distribués, le tirage a lieu en direct sous huissier." },
  { q: "C'est légal ?", a: "Oui. Jeu concours promotionnel conforme à la Directive Européenne 2005/29/CE. On vend des crédits pour des services réels. Les tickets sont offerts en bonus. Participation gratuite possible via inscription et parrainage." },
  { q: 'La villa est réelle ?', a: "Oui. Villa Boucau — 149m², 4 chambres, piscine, Boucau Haut, Pays Basque. Construite par Affinity House Factory SAS (SIRET 982 581 506 00010). Valeur : 695 000€." },
  { q: 'Et si le seuil de 200 000 tickets ne se remplit pas ?', a: "Pas de limite de temps. Le tirage a lieu dès que 200 000 tickets sont distribués. Que ce soit en 6 mois ou 18 mois." },
  { q: "C'est quoi un crédit ?", a: "1 crédit = 1 action sur la plateforme. Rechercher un bien sur tous les portails, analyser un devis travaux, trouver un pro qualifié, estimer un bien. Et chaque crédit acheté vous offre 1 ticket pour le tirage." },
]

/* === SCROLL REVEAL === */
function Reveal({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('visible'); obs.disconnect() } },
      { threshold: 0.1 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return <div ref={ref} className="reveal">{children}</div>
}

/* === LIVE NOTIFICATIONS === */
function LiveNotif() {
  const msgs = [
    { text: "Sophie a acheté un Pack 10", sub: '+10 crédits + 10 tickets offerts', color: '#f59e0b' },
    { text: "Marie s'est inscrite", sub: '1 crédit offert + 1 ticket offert', color: '#34d399' },
    { text: 'Pierre a analysé un devis plomberie', sub: 'Résultat : 18% au-dessus du marché', color: '#f472b6' },
    { text: 'Thomas a recherché un T3 à Bayonne', sub: '12 biens trouvés en 8 secondes', color: '#cfaf4b' },
    { text: 'La jauge vient de dépasser 47 000', sub: 'Plus que 153 000 avant le tirage', color: '#a855f7' },
  ]
  const [i, setI] = useState(0)
  const [show, setShow] = useState(true)
  useEffect(() => {
    const t = setInterval(() => {
      setShow(false)
      setTimeout(() => { setI(p => (p + 1) % msgs.length); setShow(true) }, 400)
    }, 4000)
    return () => clearInterval(t)
  }, [])
  const m = msgs[i]
  return (
    <div className="live-notif" style={{ opacity: show ? 1 : 0, transform: show ? 'translateY(0)' : 'translateY(10px)', transition: 'all .4s', borderLeft: `3px solid ${m.color}` }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: m.color, flexShrink: 0 }} />
      <div>
        <div style={{ fontSize: 12, fontWeight: 600 }}>{m.text}</div>
        <div style={{ fontSize: 10, color: '#34d399', fontWeight: 700, marginTop: 2 }}>{m.sub}</div>
      </div>
    </div>
  )
}

/* === STICKY CTA === */
function StickyCTA() {
  const [v, setV] = useState(false)
  useEffect(() => {
    const h = () => setV(window.scrollY > 600)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])
  return (
    <div className={`sticky-cta${v ? ' visible' : ''}`}>
      <span className="text-muted text-xs" style={{ fontWeight: 600 }}>{"Villa 695 000€ à gagner"}</span>
      <Link href="/login" className="btn-primary btn-shine" style={{ padding: '10px 24px', fontSize: 13 }}>{"Participer — dès 9€"}</Link>
    </div>
  )
}

/* === MAIN === */
export default function Home() {
  const [gauge, setGauge] = useState(INIT)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  useEffect(() => {
    const tick = () => setGauge(p => Math.min(TOTAL, p + Math.floor(Math.random() * 3) + 1))
    const go = () => { const d = 5000 + Math.random() * 3000; return setTimeout(() => { tick(); id = go() }, d) }
    let id = go()
    return () => clearTimeout(id)
  }, [])

  const pct = (gauge / TOTAL) * 100

  return (
    <>
      {/* === TICKER === */}
      <div className="ticker-bar">
        <div className="ticker-content">
          {['VILLA 695 000€ A GAGNER', '1 CREDIT + 1 TICKET OFFERTS', 'OUTILS IA IMMOBILIERS', 'TIRAGE SOUS HUISSIER', 'A PARTIR DE 9€',
            'VILLA 695 000€ A GAGNER', '1 CREDIT + 1 TICKET OFFERTS', 'OUTILS IA IMMOBILIERS', 'TIRAGE SOUS HUISSIER', 'A PARTIR DE 9€',
          ].map((msg, i) => (
            <span className="ticker-item" key={i}>{msg}</span>
          ))}
        </div>
      </div>

      {/* === NAV === */}
      <nav className="nav">
        <Link href="/" style={{ fontFamily: 'var(--d)', fontWeight: 800, fontSize: 18, color: 'var(--a)', textDecoration: 'none', letterSpacing: 1 }}>
          HOWNER
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 60, height: 4, borderRadius: 10, background: 'rgba(255,255,255,.08)', overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 10, background: 'linear-gradient(90deg, var(--accent), var(--a))', width: `${pct}%`, transition: 'width 1s' }} />
          </div>
          <span className="mono" style={{ fontSize: 9, color: '#6b7280' }}>
            {gauge.toLocaleString()}/{TOTAL / 1000}K
          </span>
        </div>
        <Link href="/login" className="btn-primary" style={{ padding: '8px 20px', fontSize: 12 }}>
          Participer
        </Link>
      </nav>

      {/* ============================================ */}
      {/* SECTION 1 — HERO : LA VILLA                 */}
      {/* ============================================ */}
      <section style={{ position: 'relative', overflow: 'hidden', paddingTop: 80, paddingBottom: 60 }}>
        <div className="gradient-mesh">
          <div className="blob blob-1" />
          <div className="blob blob-2" />
          <div className="blob blob-3" />
        </div>

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '0 20px' }}>
          {/* Badge */}
          <div style={{
            display: 'inline-block', padding: '6px 16px', borderRadius: 20,
            border: '1px solid rgba(207,175,75,.25)', background: 'rgba(207,175,75,.08)',
            fontSize: 12, fontWeight: 700, color: 'var(--a)', letterSpacing: 1.5, marginBottom: 32,
          }}>
            CYCLE 1 — TIRAGE EN COURS
          </div>

          {/* H1 */}
          <h1 className="hero-massive" style={{ marginBottom: 0 }}>Cette villa peut</h1>
          <h1 className="hero-massive gradient-text" style={{ marginBottom: 32 }}>{"être à vous."}</h1>

          {/* Villa photo */}
          <div style={{
            maxWidth: 760, margin: '0 auto 24px', borderRadius: 20, overflow: 'hidden',
            border: '1px solid rgba(207,175,75,.15)', boxShadow: '0 20px 60px rgba(0,0,0,.5)',
            position: 'relative',
          }}>
            <img src="/villa/exterior-1.jpg" alt="Villa Boucau — 695 000€" style={{ width: '100%', height: 'auto', display: 'block' }} />
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              background: 'linear-gradient(transparent, rgba(0,0,0,.8))',
              padding: '60px 24px 20px',
              display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center',
            }}>
              {['149m²', '4 chambres', 'Piscine', 'R+1', 'Pays Basque'].map(spec => (
                <span key={spec} style={{
                  padding: '4px 14px', borderRadius: 20,
                  background: 'rgba(255,255,255,.12)', backdropFilter: 'blur(8px)',
                  color: '#fff', fontSize: 12, fontWeight: 600,
                }}>{spec}</span>
              ))}
            </div>
          </div>

          {/* Prix */}
          <div className="price-hero">695 000€</div>
          <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 24 }}>
            Construite par Affinity House Factory · Finitions Porcelanosa · Clé en main
          </p>

          {/* Value prop ultra simple */}
          <p style={{ fontSize: 18, color: '#e4e4e7', fontWeight: 600, marginBottom: 8 }}>
            1 crédit acheté = 1 ticket pour le tirage
          </p>
          <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 32 }}>
            Utilisez vos crédits pour rechercher un bien, analyser un devis, ou trouver un pro.
          </p>

          {/* CTA */}
          <Link href="/login" className="btn-primary btn-shine" style={{ padding: '18px 52px', fontSize: 17 }}>
            {"Participer — dès 9€"}
          </Link>
          <p style={{ fontSize: 12, color: '#4a4a5a', marginTop: 16 }}>
            {"Inscription gratuite · 1 crédit + 1 ticket offerts · Aucun engagement"}
          </p>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 2 — JAUGE FOMO                      */}
      {/* ============================================ */}
      <Reveal>
        <section className="section section-mid" style={{ paddingTop: 60, paddingBottom: 60 }}>
          <div className="container text-center" style={{ maxWidth: 600 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
              <div className="glow-dot" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#34d399' }}>Tirage en cours — Cycle 1</span>
            </div>
            <div className="mono" style={{ fontSize: 'clamp(36px, 8vw, 56px)', fontWeight: 700, color: '#e4e4e7', marginBottom: 4 }}>
              {gauge.toLocaleString()}
            </div>
            <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 16 }}>tickets sur 200 000</p>
            <div className="gauge-bar" style={{ height: 12, marginBottom: 16 }}>
              <div className="gauge-fill" style={{ width: `${pct}%` }} />
            </div>
            <p className="mono fomo-pulse" style={{ fontSize: 14, color: '#f472b6', fontWeight: 700, marginBottom: 8 }}>
              Plus que {(TOTAL - gauge).toLocaleString()} avant le tirage
            </p>
            <p style={{ fontSize: 11, color: '#4a4a5a', letterSpacing: 1 }}>
              TIRAGE EN DIRECT · HUISSIER DE JUSTICE · LE GAGNANT REPART AVEC LES CLES
            </p>
          </div>
        </section>
      </Reveal>

      {/* ============================================ */}
      {/* SECTION 3 — COMMENT CA MARCHE               */}
      {/* ============================================ */}
      <Reveal>
        <section className="section">
          <div className="container text-center">
            <h2 className="heading-lg" style={{ marginBottom: 48 }}>Comment ça marche</h2>
            <div className="grid-4" style={{ maxWidth: 900, margin: '0 auto' }}>
              {[
                { step: '1', title: 'Inscrivez-vous', desc: "Gratuit. 1 crédit + 1 ticket offerts." },
                { step: '2', title: 'Achetez des crédits', desc: "Packs de 1 à 20 crédits. Dès 9€." },
                { step: '3', title: 'Utilisez vos crédits', desc: "Recherche IA, analyse devis, matching pro." },
                { step: '4', title: 'Gagnez la villa', desc: "Chaque crédit = 1 ticket pour le tirage." },
              ].map(s => (
                <div key={s.step} className="glass glow-hover" style={{ padding: 24, textAlign: 'center' }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12, margin: '0 auto 12px',
                    background: 'linear-gradient(135deg, var(--accent), var(--a))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18, fontWeight: 800, color: '#0a0b0d',
                  }}>{s.step}</div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#e4e4e7', marginBottom: 6 }}>{s.title}</h3>
                  <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </Reveal>

      {/* ============================================ */}
      {/* SECTION 4 — PACKS CREDITS                   */}
      {/* ============================================ */}
      <Reveal>
        <section id="packs" className="section section-mid" style={{ position: 'relative' }}>
          <div className="container text-center">
            <h2 className="heading-lg" style={{ marginBottom: 8 }}>Packs crédits</h2>
            <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>
              1 crédit = 1 recherche, 1 analyse, ou 1 mise en relation
            </p>
            <p className="text-gold" style={{ fontSize: 14, fontWeight: 700, marginBottom: 48 }}>
              + 1 ticket OFFERT par crédit pour le tirage de la villa à 695 000€
            </p>

            <div className="packs-grid" style={{ maxWidth: 800, margin: '0 auto' }}>
              {[
                { n: 1, price: '9€', per: '9€', t: 1 },
                { n: 5, price: '39€', per: '7,80€', t: 5, save: 13 },
                { n: 10, price: '69€', per: '6,90€', t: 10, save: 23, pop: true },
                { n: 20, price: '119€', per: '5,95€', t: 20, save: 34 },
              ].map(pack => (
                <div key={pack.n} className={`pack-card${pack.pop ? ' popular' : ''}`}>
                  {pack.pop && <div className="pack-badge">POPULAIRE</div>}
                  <div className="mono" style={{ fontSize: 36, fontWeight: 700, color: '#e4e4e7', marginBottom: 4 }}>{pack.n}</div>
                  <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>{"crédit" + (pack.n > 1 ? "s" : "")}</div>
                  <div className="text-gradient" style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--d)', marginBottom: 4 }}>{pack.price}</div>
                  <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 8 }}>{pack.per}/crédit</div>
                  {pack.save && (
                    <div style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 6, background: 'rgba(52,211,153,.1)', border: '1px solid rgba(52,211,153,.15)', fontSize: 11, fontWeight: 700, color: '#34d399', marginBottom: 8 }}>
                      -{pack.save}%
                    </div>
                  )}
                  <div style={{ marginBottom: 12 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--a)', padding: '3px 10px', borderRadius: 8, background: 'rgba(207,175,75,.1)', border: '1px solid rgba(207,175,75,.15)' }}>
                      +{pack.t} ticket{pack.t > 1 ? 's' : ''}
                    </span>
                  </div>
                  <Link href="/login" className="btn-primary" style={{ width: '100%', padding: '10px 0', fontSize: 13 }}>
                    Acheter
                  </Link>
                </div>
              ))}
            </div>

            <p style={{ fontSize: 13, color: '#4a4a5a', marginTop: 24 }}>
              Les crédits servent à : rechercher un bien sur tous les portails, analyser un devis travaux, trouver un pro qualifié, estimer un bien.
            </p>
            <p style={{ fontSize: 12, color: '#3a3a4a', marginTop: 8 }}>
              Pas d'abonnement. Les crédits n'expirent jamais.
            </p>
          </div>
        </section>
      </Reveal>

      {/* ============================================ */}
      {/* SECTION 5 — CONFIANCE                       */}
      {/* ============================================ */}
      <Reveal>
        <section className="section" style={{ paddingTop: 40, paddingBottom: 40 }}>
          <div className="container text-center">
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px 24px', fontSize: 12, color: '#6b7280', fontWeight: 500, lineHeight: 2 }}>
              <span>Huissier de justice</span>
              <span>Directive EU 2005/29/CE</span>
              <span>Paiement Stripe sécurisé</span>
              <span>Tickets OFFERTS, jamais vendus</span>
            </div>
            <p style={{ fontSize: 11, color: '#4a4a5a', marginTop: 12 }}>
              Affinity House Factory SAS · SIRET 982 581 506 00010 · Anglet, Pays Basque
            </p>
          </div>
        </section>
      </Reveal>

      {/* ============================================ */}
      {/* SECTION 6 — FAQ + CTA FINAL                 */}
      {/* ============================================ */}
      <Reveal>
        <section className="section section-mid">
          <div className="container" style={{ maxWidth: 700 }}>
            <h2 className="heading-lg text-center" style={{ marginBottom: 48 }}>Questions fréquentes</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {FAQ_DATA.map((faq, i) => (
                <div key={i} className={`accordion-item${openFaq === i ? ' open' : ''}`} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <button className="accordion-trigger">
                    <span className="accordion-title">{faq.q}</span>
                    <span className="accordion-icon">+</span>
                  </button>
                  {openFaq === i && (
                    <div className="accordion-body">{faq.a}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </Reveal>

      {/* CTA FINAL */}
      <Reveal>
        <section className="section" style={{ position: 'relative' }}>
          <div className="gradient-mesh" style={{ opacity: 0.5 }}>
            <div className="blob blob-1" />
            <div className="blob blob-2" />
          </div>
          <div className="container text-center" style={{ position: 'relative', zIndex: 1 }}>
            <h2 className="heading-lg" style={{ marginBottom: 12 }}>{"Cette villa peut être à vous."}</h2>
            <p style={{ fontSize: 15, color: '#6b7280', marginBottom: 32 }}>
              {"1 crédit offert à l'inscription. Aucun engagement."}
            </p>
            <Link href="/login" className="btn-primary btn-shine" style={{ padding: '18px 48px', fontSize: 17 }}>
              {"Participer — dès 9€"}
            </Link>
          </div>
        </section>
      </Reveal>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,.04)', padding: '32px 0' }}>
        <div className="container text-center">
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 20, marginBottom: 16 }}>
            {[
              { label: 'Agent IA', href: '/chat' },
              { label: 'Recherche', href: '/recherche' },
              { label: 'Devis', href: '/devis' },
              { label: 'Villa', href: '/villa' },
            ].map(link => (
              <Link key={link.href} href={link.href} style={{ fontSize: 12, color: '#6b7280', textDecoration: 'none' }}>{link.label}</Link>
            ))}
          </div>
          <p style={{ fontSize: 10, color: '#4a4a5a', lineHeight: 1.8, marginBottom: 8 }}>
            Affinity House Factory SAS · SIRET 982 581 506 00010 · Anglet, Pays Basque
          </p>
          <p style={{ fontSize: 10, color: '#3a3a4a' }}>© 2025 Howner. Tous droits réservés.</p>
        </div>
      </footer>

      {/* LIVE NOTIF + STICKY CTA */}
      <LiveNotif />
      <StickyCTA />
    </>
  )
}
