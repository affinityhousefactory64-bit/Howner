'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import VideoPlaceholder from '@/components/VideoPlaceholder'

/* ═══ CONSTANTS ═══ */
const TOTAL = 200000
const INIT = 47382

const FAQ_DATA = [
  { q: 'C\u2019est quoi Howner ?', a: 'Howner est une plateforme immobilière intelligente. Elle compare toutes les offres de location et vente, analyse vos devis travaux grâce à l\u2019IA, et trouve le bon professionnel pour vous. Chaque crédit acheté vous offre un ticket pour participer au tirage d\u2019une villa à 695 000\u202F€.' },
  { q: 'Comment fonctionnent les crédits ?', a: '1 crédit = 1 action. Comparer les offres immo, analyser un devis, ou lancer une recherche de professionnel. Chaque crédit acheté vous offre aussi 1 ticket pour le tirage de la villa. Votre premier crédit est offert à l\u2019inscription.' },
  { q: 'C\u2019est quoi le tirage de la villa ?', a: 'Quand 200 000 tickets sont distribués, un tirage au sort a lieu en direct, filmé, sous le contrôle d\u2019un huissier de justice. Le gagnant repart avec la villa. Puis un nouveau cycle démarre avec une nouvelle villa.' },
  { q: 'C\u2019est légal ?', a: 'Oui. Jeu concours promotionnel conforme à la Directive Européenne 2005/29/CE. On vend des crédits pour des services réels (comparaison, analyse, recherche). Les tickets sont offerts en bonus. Participation gratuite possible via inscription et parrainage.' },
  { q: 'La villa est réelle ?', a: 'Oui. Villa Boucau — 149m², 4 chambres, piscine, R+1, Boucau Haut, Pays Basque. Construite par Affinity House Factory SAS (SIRET 982 581 506 00010). Finitions Porcelanosa, construction LSF, clé en main. Valeur : 695 000\u202F€.' },
  { q: 'Je peux participer gratuitement ?', a: 'Oui. L\u2019inscription est gratuite et vous offre 1 crédit + 1 ticket. Le parrainage vous donne 1 crédit + 1 ticket pour chaque ami inscrit, sans limite.' },
]

/* ═══ SCROLL REVEAL ═══ */
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

/* ═══ LIVE NOTIFICATIONS ═══ */
function LiveNotif() {
  const msgs = [
    { text: 'Thomas a comparé 23 offres à Bayonne', sub: '1 crédit utilisé · +1 ticket', color: '#cfaf4b' },
    { text: 'Marie s\u2019est inscrite', sub: '1 crédit offert · +1 ticket offert', color: '#34d399' },
    { text: 'Pierre a analysé un devis plomberie', sub: 'Résultat : devis 18% au-dessus du marché', color: '#f472b6' },
    { text: 'Sophie a acheté un Pack 10', sub: '+10 crédits · +10 tickets offerts', color: '#f59e0b' },
    { text: 'Lucas a trouvé un courtier à Biarritz', sub: '4.8 étoiles · 92 dossiers traités', color: '#3b82f6' },
    { text: 'La jauge vient de dépasser 47 000', sub: 'Plus que 153 000 tickets avant le tirage', color: '#a855f7' },
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

/* ═══ STICKY CTA ═══ */
function StickyCTA() {
  const [v, setV] = useState(false)
  useEffect(() => {
    const h = () => setV(window.scrollY > 500)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])
  return (
    <div className={`sticky-cta${v ? ' visible' : ''}`}>
      <span className="text-muted text-xs" style={{ fontWeight: 600 }}>Villa 695 000€ à gagner</span>
      <a href="#packs" className="btn-primary btn-shine" style={{ padding: '10px 24px', fontSize: 13 }}>Acheter des crédits</a>
    </div>
  )
}

/* ═══ MAIN ═══ */
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
      {/* ══ NAV ══ */}
      <nav className="nav">
        <Link href="/" style={{ textDecoration: 'none' }}><span className="heading-md text-gold" style={{ fontSize: 20 }}>HOWNER</span></Link>
        <div className="nav-gauge" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 80, height: 4, borderRadius: 10, background: 'rgba(255,255,255,.06)', overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 10, background: 'var(--a)', width: `${pct}%`, transition: 'width 1s' }} />
          </div>
          <span className="mono text-gold" style={{ fontSize: 9 }}>{gauge.toLocaleString()}/{TOTAL / 1000}K</span>
        </div>
        <Link href="/login" className="btn-primary" style={{ padding: '8px 20px', fontSize: 13 }}>Essayer gratuit</Link>
      </nav>

      {/* ══ HERO ══ */}
      <section style={{ position: 'relative', minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(/villa/exterior-1.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.3)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%', background: 'linear-gradient(to top, var(--bg), transparent)' }} />
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '0 20px', maxWidth: 740 }}>
          <h1 className="heading-xl" style={{ marginBottom: 16, fontSize: 'clamp(32px, 7vw, 60px)' }}>
            Devenez <span className="text-gold">propriétaire.</span>
          </h1>
          <p style={{ fontSize: 'clamp(14px, 2.5vw, 18px)', color: 'rgba(255,255,255,.7)', marginBottom: 12, lineHeight: 1.7 }}>
            Comparez toutes les offres immo. Vérifiez vos devis en 1 clic.<br />
            Trouvez le bon pro instantanément.
          </p>
          <p className="text-gold" style={{ fontSize: 'clamp(13px, 2vw, 16px)', fontWeight: 700, marginBottom: 28 }}>
            + chaque crédit acheté vous offre 1 ticket pour gagner une villa à 695 000€
          </p>
          <Link href="/login" className="btn-primary btn-shine" style={{ padding: '16px 48px', fontSize: 16 }}>
            Essayer gratuitement — 1 crédit offert
          </Link>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,.3)', marginTop: 12 }}>
            Inscription gratuite · 1 crédit + 1 ticket offerts · Aucun engagement
          </p>
        </div>
      </section>

      {/* ══ 3 OUTILS ══ */}
      <Reveal>
        <section className="section" style={{ paddingTop: 48, paddingBottom: 48 }}>
          <div className="container text-center">
            <h2 className="heading-lg" style={{ marginBottom: 8 }}>3 outils. 1 crédit chacun.</h2>
            <p className="text-muted text-sm" style={{ marginBottom: 32 }}>Chaque utilisation vous offre aussi 1 ticket pour le tirage de la villa.</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, maxWidth: 900, margin: '0 auto' }}>
              {/* Comparateur */}
              <div className="card" style={{ padding: '28px 24px', textAlign: 'left' }}>
                <div style={{ fontSize: 28, marginBottom: 12, lineHeight: 1 }}>&#x1F50D;</div>
                <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>Comparateur immo</div>
                <p className="text-muted text-sm" style={{ marginBottom: 16, lineHeight: 1.6 }}>
                  Location annuelle, saisonnière, achat — comparez toutes les offres de tous les marchés en une recherche.
                </p>
                <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)' }}>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', fontStyle: 'italic' }}>
                    &quot;T3 Bayonne max 800€/mois&quot; → 23 offres triées par rapport qualité/prix
                  </p>
                </div>
                <div className="text-gold text-xs" style={{ marginTop: 12, fontWeight: 700 }}>1 crédit = 1 recherche</div>
              </div>

              {/* IA Devis */}
              <div className="card-gold" style={{ padding: '28px 24px', textAlign: 'left' }}>
                <div style={{ fontSize: 28, marginBottom: 12, lineHeight: 1 }}>&#x1F4CA;</div>
                <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>Analyse de devis IA</div>
                <p className="text-muted text-sm" style={{ marginBottom: 16, lineHeight: 1.6 }}>
                  Uploadez ou décrivez votre devis. L&apos;IA vous dit si c&apos;est le bon prix et vous recommande les meilleures entreprises.
                </p>
                <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(207,175,75,.04)', border: '1px solid rgba(207,175,75,.1)' }}>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', fontStyle: 'italic' }}>
                    &quot;Salle de bain 8 500€ Bayonne&quot; → &quot;22% au-dessus du marché. Prix juste : 6 500-7 200€&quot;
                  </p>
                </div>
                <div className="text-gold text-xs" style={{ marginTop: 12, fontWeight: 700 }}>1 crédit = 1 analyse</div>
              </div>

              {/* Chat IA */}
              <div className="card" style={{ padding: '28px 24px', textAlign: 'left' }}>
                <div style={{ fontSize: 28, marginBottom: 12, lineHeight: 1 }}>&#x1F4AC;</div>
                <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>Trouve pour moi</div>
                <p className="text-muted text-sm" style={{ marginBottom: 16, lineHeight: 1.6 }}>
                  Dites ce que vous cherchez. L&apos;IA trouve le bon pro, le bon bien, la bonne offre — en quelques secondes.
                </p>
                <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)' }}>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', fontStyle: 'italic' }}>
                    &quot;Plombier Anglet chauffe-eau max 2 000€ cette semaine&quot; → 3 pros triés par note et prix
                  </p>
                </div>
                <div className="text-gold text-xs" style={{ marginTop: 12, fontWeight: 700 }}>1 crédit = 1 demande</div>
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      {/* ══ JAUGE FOMO ══ */}
      <Reveal>
        <section className="section section-mid" style={{ paddingTop: 48, paddingBottom: 48 }}>
          <div className="container text-center" style={{ maxWidth: 600 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#34d399', boxShadow: '0 0 12px #34d399', animation: 'pulse 2s infinite' }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#34d399' }}>Tirage en cours — Cycle 1</span>
            </div>
            <div className="mono" style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 700, color: '#fff', marginBottom: 4 }}>
              {gauge.toLocaleString()}
            </div>
            <div className="text-muted" style={{ fontSize: 14, marginBottom: 16 }}>tickets sur 200 000</div>
            <div className="gauge-bar" style={{ height: 14, marginBottom: 16 }}>
              <div className="gauge-fill" style={{ width: `${pct}%` }} />
            </div>
            <p className="mono" style={{ fontSize: 15, color: '#f472b6', fontWeight: 700, marginBottom: 8 }}>
              Plus que {(TOTAL - gauge).toLocaleString()} avant le tirage
            </p>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,.3)', letterSpacing: 2, textTransform: 'uppercase' }}>
              Tirage filmé en direct · Huissier de justice · Le gagnant repart avec les clés
            </p>
          </div>
        </section>
      </Reveal>

      {/* ══ COMMENT ÇA MARCHE ══ */}
      <Reveal>
        <section className="section" style={{ paddingTop: 48, paddingBottom: 48 }}>
          <div className="container text-center">
            <h2 className="heading-lg" style={{ marginBottom: 32 }}>Comment ça marche</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24, maxWidth: 900, margin: '0 auto' }}>
              {[
                { step: '1', title: 'Inscrivez-vous', desc: 'Gratuit. 1 crédit offert + 1 ticket offert. Testez immédiatement.' },
                { step: '2', title: 'Utilisez vos crédits', desc: 'Comparez des offres, analysez un devis, ou trouvez un pro. 1 crédit = 1 action.' },
                { step: '3', title: 'Achetez des packs', desc: 'Plus de crédits = plus d\u2019actions + plus de tickets offerts pour le tirage.' },
                { step: '4', title: 'Le tirage a lieu', desc: 'À 200 000 tickets. En direct. Sous huissier. Le gagnant repart avec la villa.' },
              ].map(s => (
                <div key={s.step} className="card" style={{ padding: '24px 20px', textAlign: 'center' }}>
                  <div className="mono text-gold" style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>{s.step}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{s.title}</div>
                  <div className="text-muted text-sm" style={{ lineHeight: 1.6 }}>{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </Reveal>

      {/* ══ PACKS CRÉDITS ══ */}
      <Reveal>
        <section className="section section-mid" id="packs" style={{ paddingTop: 48, paddingBottom: 48 }}>
          <div className="container text-center">
            <h2 className="heading-lg" style={{ marginBottom: 8 }}>Packs de crédits</h2>
            <p className="text-muted text-sm" style={{ marginBottom: 8 }}>
              1 crédit = 1 comparaison, 1 analyse de devis, ou 1 recherche de pro
            </p>
            <p className="text-gold text-xs" style={{ fontWeight: 700, marginBottom: 32 }}>
              + 1 ticket OFFERT par crédit acheté pour le tirage de la villa
            </p>

            <div className="packs-grid" style={{ maxWidth: 900, margin: '0 auto' }}>
              {[
                { n: 1, price: '9€', per: '9€', t: 1 },
                { n: 5, price: '39€', per: '7,80€', t: 5, save: 13 },
                { n: 10, price: '69€', per: '6,90€', t: 10, save: 23, pop: true },
                { n: 20, price: '119€', per: '5,95€', t: 20, save: 34 },
              ].map((pk, i) => (
                <div key={i} className={`pack-card${pk.pop ? ' popular' : ''}`}>
                  {pk.pop && <div className="pack-badge">Populaire</div>}
                  <div className="mono" style={{ fontSize: 40, fontWeight: 700 }}>{pk.n}</div>
                  <div className="text-muted text-sm" style={{ marginBottom: 8 }}>crédit{pk.n > 1 ? 's' : ''}</div>
                  <div className="text-gold" style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--d)', marginBottom: 4 }}>{pk.price}</div>
                  <div className="text-muted text-xs" style={{ marginBottom: 8 }}>{pk.per}/crédit</div>
                  {pk.save && <div style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 6, background: 'rgba(52,211,153,.08)', border: '1px solid rgba(52,211,153,.15)', fontSize: 11, fontWeight: 700, color: '#34d399', marginBottom: 8 }}>-{pk.save}%</div>}
                  <div style={{ marginBottom: 12 }}>
                    <span className="badge text-gold" style={{ background: 'rgba(207,175,75,.1)', fontSize: 12 }}>+{pk.t} ticket{pk.t > 1 ? 's' : ''} offert{pk.t > 1 ? 's' : ''}</span>
                  </div>
                  <Link href="/login" className="btn-primary" style={{ width: '100%', padding: '10px 0', fontSize: 13 }}>Acheter</Link>
                </div>
              ))}
            </div>
            <p className="text-muted text-xs" style={{ marginTop: 20 }}>Les crédits n&apos;expirent jamais. Utilisez-les quand vous voulez.</p>
          </div>
        </section>
      </Reveal>

      {/* ══ LA VILLA ══ */}
      <Reveal>
        <section className="section" style={{ paddingTop: 48, paddingBottom: 24 }}>
          <div className="container text-center">
            <h2 className="heading-lg" style={{ marginBottom: 8 }}>La villa à gagner</h2>
            <p className="text-muted text-sm" style={{ marginBottom: 24 }}>
              Villa Boucau — 149m² · 4 chambres · Piscine · R+1 · Pays Basque
            </p>
            <div style={{ maxWidth: 700, margin: '0 auto', borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(207,175,75,.12)', position: 'relative' }}>
              <img src="/villa/exterior-1.jpg" alt="Villa Boucau — 695 000€" style={{ width: '100%', height: 'auto', display: 'block' }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,.8))', padding: '40px 20px 16px', textAlign: 'center' }}>
                <span className="mono text-gold" style={{ fontSize: 24, fontWeight: 700 }}>695 000€</span>
                <span className="text-muted text-xs" style={{ marginLeft: 12 }}>Construite par Affinity House Factory · Finitions Porcelanosa</span>
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      {/* ══ VIDEO ══ */}
      <Reveal>
        <section className="section" style={{ paddingTop: 16, paddingBottom: 48 }}>
          <div className="container" style={{ maxWidth: 640 }}>
            <VideoPlaceholder title="Découvrez la Villa Boucau" subtitle="Vidéo promo — bientôt disponible" />
          </div>
        </section>
      </Reveal>

      {/* ══ POUR LES PROS ══ */}
      <Reveal>
        <section className="section section-mid" style={{ paddingTop: 48, paddingBottom: 48 }}>
          <div className="container" style={{ maxWidth: 700 }}>
            <h2 className="heading-lg text-center" style={{ marginBottom: 8 }}>Vous êtes professionnel ?</h2>
            <p className="text-muted text-sm text-center" style={{ marginBottom: 28 }}>
              Agent immo, courtier, artisan, architecte, diagnostiqueur, déménageur — rejoignez le réseau Howner.
            </p>
            <div className="card" style={{ padding: '28px 24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>Soyez trouvé, pas noyé</div>
                  <p className="text-muted text-sm" style={{ lineHeight: 1.6 }}>Les membres Howner vous trouvent grâce à l&apos;IA. Pas 10 concurrents par demande comme sur Travaux.com.</p>
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>Votre profil, pas votre agence</div>
                  <p className="text-muted text-sm" style={{ lineHeight: 1.6 }}>Les clients choisissent VOUS. Votre nom, vos avis, vos réalisations.</p>
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>Tickets offerts aussi</div>
                  <p className="text-muted text-sm" style={{ lineHeight: 1.6 }}>Chaque abonnement pro vous donne des tickets pour le tirage. Vous aussi, vous pouvez gagner la villa.</p>
                </div>
              </div>
              <div className="text-center" style={{ marginTop: 24 }}>
                <Link href="/login" className="btn-primary" style={{ padding: '12px 32px', fontSize: 14 }}>Devenir Pro Howner — dès 39€/mois</Link>
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      {/* ══ CONFIANCE ══ */}
      <Reveal>
        <section className="section" style={{ paddingTop: 32, paddingBottom: 32 }}>
          <div className="container">
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 40, textAlign: 'center' }}>
              {[
                { t: 'Huissier de justice', d: 'Tirage filmé sous contrôle' },
                { t: 'Directive EU 2005/29/CE', d: 'Jeu concours conforme' },
                { t: 'Paiement Stripe', d: 'Sécurisé et chiffré' },
                { t: 'Tickets OFFERTS', d: 'Jamais vendus · Toujours en bonus' },
                { t: 'Inscription gratuite', d: '1 crédit + 1 ticket offerts' },
              ].map((x, i) => (
                <div key={i} style={{ minWidth: 130, maxWidth: 160 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{x.t}</div>
                  <div className="text-muted text-xs">{x.d}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </Reveal>

      {/* ══ FAQ ══ */}
      <Reveal>
        <section className="section section-mid" style={{ paddingTop: 48, paddingBottom: 48 }}>
          <div className="container" style={{ maxWidth: 700 }}>
            <h2 className="heading-lg text-center" style={{ marginBottom: 32 }}>Questions fréquentes</h2>
            {FAQ_DATA.map((faq, i) => (
              <div key={i} className="card" style={{ padding: 0, cursor: 'pointer', marginBottom: 8 }} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{faq.q}</span>
                  <span className="text-gold" style={{ fontSize: 18, transition: 'transform .2s', transform: openFaq === i ? 'rotate(45deg)' : 'none' }}>+</span>
                </div>
                {openFaq === i && <div style={{ padding: '0 20px 16px' }}><p className="text-muted text-sm" style={{ lineHeight: 1.7 }}>{faq.a}</p></div>}
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      {/* ══ CTA FINAL ══ */}
      <section style={{ position: 'relative', padding: '80px 20px', textAlign: 'center', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(/villa/exterior-1.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.2)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p className="mono text-gold" style={{ fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 700, marginBottom: 8 }}>695 000€</p>
          <h2 className="heading-lg" style={{ marginBottom: 16 }}>Cette villa peut être à vous.</h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,.5)', marginBottom: 24 }}>
            1 crédit offert à l&apos;inscription · Chaque crédit = 1 ticket offert · À partir de 9€
          </p>
          <Link href="/login" className="btn-primary btn-shine" style={{ padding: '16px 48px', fontSize: 16 }}>Essayer gratuitement</Link>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,.06)', padding: '32px 0', textAlign: 'center' }}>
        <div className="container">
          <p className="text-muted text-xs" style={{ lineHeight: 2 }}>
            Affinity House Factory SAS · SIRET 982 581 506 00010 · Anglet, Pays Basque<br />
            Jeu concours promotionnel · Directive EU 2005/29/CE · Huissier de justice<br />
            Participation gratuite possible · Tickets offerts en bonus · Jamais vendus
          </p>
          <p className="text-muted text-xs" style={{ marginTop: 8 }}>© 2025 Howner</p>
        </div>
      </footer>

      <LiveNotif />
      <StickyCTA />

      <style>{`@media(max-width:639px){.nav-gauge{display:none!important}}`}</style>
    </>
  )
}
