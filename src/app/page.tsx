'use client'

import { useState, useEffect, useRef, RefObject } from 'react'
import Link from 'next/link'

/* ═══ CONSTANTS ═══ */
const TOTAL = 200000
const INIT = 4283

/* ═══ HOOKS ═══ */
function useVis(ref: RefObject<HTMLElement | null>, t = 0.1) {
  const [v, setV] = useState(false)
  useEffect(() => {
    if (!ref.current) return
    const o = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setV(true) },
      { threshold: t }
    )
    o.observe(ref.current)
    return () => o.disconnect()
  }, [ref, t])
  return v
}

/* ═══ LIVE ACTIVITY TICKER ═══ */
const FAKE_ACTIVITIES = [
  { icon: '🎟️', text: 'Marie L. vient de s\'inscrire', sub: '+1 ticket offert', time: 'il y a 12s' },
  { icon: '📢', text: 'Thomas D. a posté une annonce', sub: 'Annonce gratuite', time: 'il y a 34s' },
  { icon: '💳', text: 'Julie R. a acheté 5 crédits', sub: '+5 tickets bonus', time: 'il y a 1min' },
  { icon: '🎁', text: 'Karim B. a parrainé un ami', sub: '+1 ticket chacun', time: 'il y a 2min' },
  { icon: '🚀', text: 'Sophie M. a boosté son annonce', sub: '+1 ticket bonus', time: 'il y a 3min' },
  { icon: '💳', text: 'Pierre V. a acheté 10 crédits', sub: '+10 tickets', time: 'il y a 4min' },
  { icon: '🎟️', text: 'Lea C. vient de s\'inscrire', sub: '+1 ticket', time: 'il y a 5min' },
  { icon: '🔔', text: 'Marc F. a active une alerte', sub: '+1 ticket bonus', time: 'il y a 6min' },
  { icon: '📢', text: 'Nadia K. a poste 2 annonces', sub: '+2 tickets bonus', time: 'il y a 7min' },
  { icon: '💳', text: 'Antoine G. a acheté 20 crédits', sub: '+20 tickets', time: 'il y a 8min' },
  { icon: '⚡', text: '14 personnes ont acheté des crédits', sub: 'cette heure', time: 'il y a 9min' },
]

function LiveTicker() {
  const [current, setCurrent] = useState(0)
  const [show, setShow] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setShow(false)
      setTimeout(() => {
        setCurrent(i => (i + 1) % FAKE_ACTIVITIES.length)
        setShow(true)
      }, 400)
    }, 3500)
    return () => clearInterval(interval)
  }, [])

  const a = FAKE_ACTIVITIES[current]

  return (
    <div style={{ position: 'fixed', bottom: 20, left: 20, zIndex: 90, maxWidth: 300, opacity: show ? 1 : 0, transform: show ? 'translateY(0)' : 'translateY(10px)', transition: 'all .4s cubic-bezier(.16,1,.3,1)' }}>
      <div style={{ background: 'rgba(10,14,26,.92)', backdropFilter: 'blur(20px)', border: '1px solid rgba(207,175,75,.12)', borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 8px 32px rgba(0,0,0,.5)' }}>
        <span style={{ fontSize: 18 }}>{a.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--b)', fontSize: 11, color: '#fff', fontWeight: 600, lineHeight: 1.3 }}>{a.text}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
            <span style={{ fontFamily: 'var(--b)', fontSize: 9, color: '#34d399', fontWeight: 700 }}>{a.sub}</span>
            <span style={{ fontFamily: 'var(--b)', fontSize: 8, color: 'rgba(255,255,255,.2)' }}>{a.time}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══ GAUGE ═══ */
function Gauge({ mini }: { mini?: boolean }) {
  const [n, setN] = useState(INIT)
  const ref = useRef<HTMLDivElement>(null)
  const vis = useVis(ref)

  useEffect(() => {
    const id = setInterval(
      () => setN(p => Math.min(TOTAL, p + Math.floor(Math.random() * 3) + 1)),
      5e3 + Math.random() * 5e3
    )
    return () => clearInterval(id)
  }, [])

  const pct = (n / TOTAL) * 100

  if (mini)
    return (
      <div ref={ref} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ width: 70, height: 3, borderRadius: 10, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 10, background: 'var(--a)', width: `${pct}%`, transition: 'width 1s' }} />
        </div>
        <span style={{ fontFamily: 'var(--m)', fontSize: 8, color: 'var(--a)' }}>
          {n.toLocaleString()}/{TOTAL / 1000}K
        </span>
      </div>
    )

  return (
    <div ref={ref} style={{ maxWidth: 500, width: '100%', opacity: vis ? 1 : 0, transform: vis ? 'none' : 'translateY(10px)', transition: 'all .8s cubic-bezier(.16,1,.3,1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', boxShadow: '0 0 8px #34d399', animation: 'pulse 2s infinite' }} />
          <span style={{ fontFamily: 'var(--b)', fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Tirage en cours</span>
        </div>
        <span style={{ fontFamily: 'var(--m)', fontSize: 12, color: 'var(--a)', fontWeight: 700 }}>
          {n.toLocaleString()} / {TOTAL.toLocaleString()}
        </span>
      </div>
      <div style={{ height: 8, borderRadius: 10, background: 'rgba(255,255,255,0.05)', overflow: 'hidden', position: 'relative' }}>
        <div style={{ height: '100%', borderRadius: 10, background: 'linear-gradient(90deg, var(--a), #f5e6a3)', width: vis ? `${pct}%` : '0%', transition: 'width 2.5s cubic-bezier(.16,1,.3,1)', boxShadow: '0 0 16px rgba(207,175,75,0.3)' }} />
      </div>
      <div style={{ marginTop: 6, textAlign: 'center', fontFamily: 'var(--b)', fontSize: 9, color: 'rgba(255,255,255,0.2)', letterSpacing: 2, fontWeight: 600 }}>
        TIRAGE SOUS HUISSIER DE JUSTICE DES 200 000 TICKETS ATTEINTS
      </div>
    </div>
  )
}

/* ═══ COUNTER ═══ */
function Ct({ end, label, suffix = '' }: { end: number; label: string; suffix?: string }) {
  const [v, setV] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const vis = useVis(ref)

  useEffect(() => {
    if (!vis) return
    const t0 = Date.now()
    const go = () => {
      const p = Math.min(1, (Date.now() - t0) / 1800)
      setV(Math.floor((1 - Math.pow(1 - p, 4)) * end))
      if (p < 1) requestAnimationFrame(go)
    }
    go()
  }, [vis, end])

  return (
    <div ref={ref} style={{ textAlign: 'center' }}>
      <div style={{ fontFamily: 'var(--m)', fontSize: 26, color: 'var(--a)', fontWeight: 700 }}>{v.toLocaleString()}{suffix}</div>
      <div style={{ fontFamily: 'var(--b)', fontSize: 9, color: 'rgba(255,255,255,.25)', letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 3, fontWeight: 600 }}>{label}</div>
    </div>
  )
}

/* ═══ STEP CARD ═══ */
function StepCard({ step, icon, title, desc, bonus, index }: { step: number; icon: string; title: string; desc: string; bonus: string; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const vis = useVis(ref)
  return (
    <div ref={ref} style={{ flex: '1 1 200px', maxWidth: 250, background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 14, padding: '20px 16px', position: 'relative', opacity: vis ? 1 : 0, transform: vis ? 'none' : 'translateY(16px)', transition: `all .6s cubic-bezier(.16,1,.3,1) ${index * 0.1}s` }}>
      <div style={{ position: 'absolute', top: -10, left: 16, width: 22, height: 22, borderRadius: '50%', background: 'var(--a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--m)', fontSize: 10, fontWeight: 700, color: '#0a0e1a' }}>{step}</div>
      <div style={{ fontSize: 28, marginBottom: 10, marginTop: 4 }}>{icon}</div>
      <div style={{ fontFamily: 'var(--b)', fontWeight: 700, fontSize: 14, color: '#fff', marginBottom: 4 }}>{title}</div>
      <div style={{ fontFamily: 'var(--b)', fontSize: 11, color: 'rgba(255,255,255,.35)', lineHeight: 1.6, marginBottom: 8 }}>{desc}</div>
      <div style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 6, background: 'rgba(52,211,153,.08)', border: '1px solid rgba(52,211,153,.15)', fontFamily: 'var(--b)', fontSize: 10, fontWeight: 700, color: '#34d399' }}>{bonus}</div>
    </div>
  )
}

/* ═══ CREDIT USAGE CARD ═══ */
function CreditCard({ icon, title, desc, detail, index }: { icon: string; title: string; desc: string; detail: string; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const vis = useVis(ref)
  const [h, setH] = useState(false)
  return (
    <div
      ref={ref}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        flex: '1 1 200px', maxWidth: 240, padding: '20px 16px',
        background: h ? 'rgba(207,175,75,.04)' : 'rgba(255,255,255,.015)',
        border: h ? '1px solid rgba(207,175,75,.15)' : '1px solid rgba(255,255,255,.05)',
        borderRadius: 12, cursor: 'pointer',
        opacity: vis ? 1 : 0, transform: vis ? (h ? 'translateY(-2px)' : 'none') : 'translateY(16px)',
        transition: `all .5s cubic-bezier(.16,1,.3,1) ${index * 0.08}s`,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <span style={{ fontSize: 28 }}>{icon}</span>
        <span style={{ padding: '2px 8px', borderRadius: 5, background: 'rgba(207,175,75,.08)', border: '1px solid rgba(207,175,75,.15)', fontFamily: 'var(--m)', fontSize: 8, fontWeight: 700, color: 'var(--a)' }}>1 cr</span>
      </div>
      <div style={{ fontFamily: 'var(--b)', fontWeight: 700, fontSize: 13, color: '#fff', marginBottom: 4 }}>{title}</div>
      <div style={{ fontFamily: 'var(--b)', fontSize: 11, color: 'rgba(255,255,255,.35)', lineHeight: 1.5, marginBottom: 4 }}>{desc}</div>
      <div style={{ fontFamily: 'var(--b)', fontSize: 10, color: 'rgba(255,255,255,.22)', lineHeight: 1.4, marginBottom: 8 }}>{detail}</div>
      <div style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 6, background: 'rgba(52,211,153,.08)', border: '1px solid rgba(52,211,153,.15)', fontFamily: 'var(--b)', fontSize: 10, fontWeight: 700, color: '#34d399' }}>+1 ticket bonus</div>
    </div>
  )
}

/* ═══ LISTING PREVIEW ═══ */
function ListingPreview() {
  const ref = useRef<HTMLDivElement>(null)
  const vis = useVis(ref)
  const items = [
    { cat: 'Vente', title: 'T3 lumineux centre-ville', loc: 'Bayonne', price: '245 000€', info: '68m\u00B2 \u00B7 2 ch \u00B7 DPE C', pro: false },
    { cat: 'Location', title: 'T2 meuble standing', loc: 'Anglet \u00B7 Chambre d\'Amour', price: '890€/mois', info: '45m\u00B2 \u00B7 1 ch \u00B7 Parking', pro: false },
    { cat: 'Service', title: 'Menuiserie Ospital', loc: 'Anglet \u00B7 Artisan', price: 'Devis gratuit', info: 'Cuisines \u00B7 Agencement \u00B7 Decennale', pro: true },
    { cat: 'Demande', title: 'Couple cherche T3', loc: 'Bayonne \u00B7 900-1200€', price: 'Recherche active', info: 'Parking \u00B7 Ecole \u00B7 Disponible', pro: false },
  ]
  const colors: Record<string, string> = { Vente: '#cfaf4b', Location: '#60a5fa', Service: '#34d399', Demande: '#a78bfa' }

  return (
    <div ref={ref} style={{ maxWidth: 520, width: '100%', margin: '0 auto', opacity: vis ? 1 : 0, transform: vis ? 'none' : 'translateY(18px)', transition: 'all .8s cubic-bezier(.16,1,.3,1)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {items.map((l, i) => (
          <div key={i} style={{ padding: '12px 14px', background: l.pro ? 'rgba(207,175,75,0.03)' : 'rgba(255,255,255,0.015)', border: `1px solid ${l.pro ? 'rgba(207,175,75,0.1)' : 'rgba(255,255,255,0.05)'}`, borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                <span style={{ padding: '2px 7px', borderRadius: 4, background: `${colors[l.cat]}12`, border: `1px solid ${colors[l.cat]}25`, fontSize: 8, fontWeight: 700, color: colors[l.cat], fontFamily: 'var(--b)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{l.cat}</span>
                {l.pro && <span style={{ padding: '2px 6px', borderRadius: 4, background: 'rgba(207,175,75,0.08)', fontSize: 7, fontWeight: 700, color: 'var(--a)', fontFamily: 'var(--b)', letterSpacing: 0.5 }}>PRO</span>}
              </div>
              <div style={{ fontFamily: 'var(--b)', fontWeight: 700, fontSize: 13, color: '#fff', marginBottom: 2 }}>{l.title}</div>
              <div style={{ fontFamily: 'var(--b)', fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>{l.loc}</div>
              <div style={{ fontFamily: 'var(--b)', fontSize: 10, color: 'rgba(255,255,255,0.22)', marginTop: 2 }}>{l.info}</div>
            </div>
            <div style={{ fontFamily: 'var(--m)', fontSize: 14, color: 'var(--a)', fontWeight: 700, flexShrink: 0 }}>{l.price}</div>
          </div>
        ))}
      </div>
      <div style={{ textAlign: 'center', marginTop: 10 }}>
        <Link href="/annonces" style={{ fontFamily: 'var(--b)', fontSize: 11, color: 'var(--a)', textDecoration: 'none', fontWeight: 600 }}>
          Voir toutes les annonces &rarr;
        </Link>
      </div>
    </div>
  )
}

/* ═══ MATCH DEMO ═══ */
interface Profile {
  type: string
  c: string
  name: string
  sub: string
  price: string | null
  tags: string[]
}

function MatchDemo() {
  const ps: Profile[] = [
    { type: 'Vendeur', c: '#cfaf4b', name: 'Villa T4 vue mer', sub: 'Biarritz \u00B7 Particulier', price: '785 000€', tags: ['142m\u00B2', '4 ch', 'Jardin', 'Vue mer'] },
    { type: 'Promoteur', c: '#a78bfa', name: 'Programme Les Allees', sub: 'Bayonne \u00B7 4 lots dispo', price: 'Des 195K€', tags: ['T2\u2192T4', 'RT2020', 'PTZ'] },
    { type: 'Artisan', c: '#34d399', name: 'Menuiserie Ospital', sub: 'Anglet \u00B7 Super Pro', price: null, tags: ['Cuisines', 'Agencement', 'Decennale'] },
    { type: 'Locataire', c: '#60a5fa', name: 'Couple + enfant', sub: 'Cherche T3 \u00B7 Bayonne \u00B7 900-1200€', price: null, tags: ['Parking', 'Ecole', 'Dispo'] },
    { type: 'Courtier', c: '#f472b6', name: 'Cabinet Duval', sub: 'Pays Basque \u00B7 203 avis', price: null, tags: ['Taux 3.2%', 'PTZ', 'Dossier 48h'] },
  ]

  const [i, setI] = useState(0)
  const [ox, setOx] = useState(0)
  const [sx, setSx] = useState<number | null>(null)
  const [sw, setSw] = useState<'l' | 'r' | null>(null)
  const [match, setMatch] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const vis = useVis(ref)

  const end = () => {
    if (Math.abs(ox) > 80) {
      const dir = ox > 0 ? 'r' : 'l'
      setSw(dir)
      if (dir === 'r') {
        setMatch(true)
        setTimeout(() => setMatch(false), 1400)
      }
      setTimeout(() => {
        setSw(null)
        setOx(0)
        setI(j => (j + 1) % ps.length)
      }, 280)
    } else {
      setOx(0)
    }
    setSx(null)
  }

  const p = ps[i]
  const tx = sw === 'r' ? 400 : sw === 'l' ? -400 : ox

  return (
    <div ref={ref} style={{ maxWidth: 340, width: '100%', margin: '0 auto', opacity: vis ? 1 : 0, transform: vis ? 'none' : 'translateY(18px)', transition: 'all .8s cubic-bezier(.16,1,.3,1)' }}>
      {match && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(10px)', animation: 'fadeIn .3s' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 44, marginBottom: 8 }}>💞</div>
            <div style={{ fontFamily: 'var(--d)', fontSize: 26, fontWeight: 700, background: 'linear-gradient(135deg, var(--a), #f5e6a3)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>It&apos;s a Match !</div>
            <div style={{ fontFamily: 'var(--b)', fontSize: 13, color: 'rgba(255,255,255,.5)', marginTop: 4 }}>{p.name}</div>
            <div style={{ fontFamily: 'var(--b)', fontSize: 10, color: 'rgba(255,255,255,.25)', marginTop: 6 }}>Contact gratuit apres match mutuel</div>
          </div>
        </div>
      )}
      <div style={{ position: 'relative', height: 190, marginBottom: 12 }}>
        <div style={{ position: 'absolute', width: '93%', left: '3.5%', top: 10, height: 175, background: 'rgba(255,255,255,.008)', border: '1px solid rgba(255,255,255,.03)', borderRadius: 13 }} />
        <div
          onMouseDown={e => setSx(e.clientX)}
          onMouseMove={e => { if (sx !== null) setOx(e.clientX - sx) }}
          onMouseUp={end}
          onMouseLeave={() => { if (sx !== null) end() }}
          onTouchStart={e => setSx(e.touches[0].clientX)}
          onTouchMove={e => { if (sx !== null) setOx(e.touches[0].clientX - sx) }}
          onTouchEnd={end}
          style={{ position: 'absolute', width: '100%', transform: `translateX(${tx}px) rotate(${ox * 0.06}deg)`, opacity: sw ? 0 : 1, transition: sw ? 'all .28s' : ox === 0 ? 'all .28s' : 'none', cursor: 'grab', userSelect: 'none' }}
        >
          <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '18px 16px', position: 'relative' }}>
            {ox > 35 && <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(52,211,153,.15)', border: '2px solid #34d399', borderRadius: 7, padding: '2px 12px', fontFamily: 'var(--b)', fontWeight: 800, fontSize: 13, color: '#34d399', transform: 'rotate(-10deg)' }}>MATCH</div>}
            {ox < -35 && <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(239,68,68,.12)', border: '2px solid #ef4444', borderRadius: 7, padding: '2px 12px', fontFamily: 'var(--b)', fontWeight: 800, fontSize: 13, color: '#ef4444', transform: 'rotate(10deg)' }}>PASSER</div>}
            <div style={{ display: 'inline-block', padding: '2px 7px', borderRadius: 4, background: `${p.c}12`, border: `1px solid ${p.c}25`, fontSize: 8, fontWeight: 700, color: p.c, fontFamily: 'var(--b)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>{p.type}</div>
            <div style={{ fontFamily: 'var(--b)', fontWeight: 700, fontSize: 15, color: '#fff', marginBottom: 1 }}>{p.name}</div>
            <div style={{ fontFamily: 'var(--b)', fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 6 }}>{p.sub}</div>
            {p.price && <div style={{ fontFamily: 'var(--m)', fontSize: 18, color: 'var(--a)', marginBottom: 6 }}>{p.price}</div>}
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {p.tags.map((t, j) => (
                <span key={j} style={{ padding: '2px 6px', borderRadius: 4, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', fontSize: 9, color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--b)' }}>{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 14 }}>
        <button onClick={() => { setSw('l'); setTimeout(() => { setSw(null); setI(j => (j + 1) % ps.length) }, 280) }} style={{ width: 42, height: 42, borderRadius: '50%', background: 'rgba(239,68,68,.06)', border: '1.5px solid rgba(239,68,68,.16)', color: '#ef4444', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>&#10005;</button>
        <button onClick={() => { setSw('r'); setMatch(true); setTimeout(() => setMatch(false), 1400); setTimeout(() => { setSw(null); setI(j => (j + 1) % ps.length) }, 280) }} style={{ width: 42, height: 42, borderRadius: '50%', background: 'rgba(52,211,153,.06)', border: '1.5px solid rgba(52,211,153,.16)', color: '#34d399', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>&hearts;</button>
      </div>
    </div>
  )
}

/* ═══ PRICING PACK CARD ═══ */
function PackCard({ credits, price, perCredit, discount, tickets, hl, badge, idx }: {
  credits: number; price: string; perCredit: string; discount?: string; tickets: number; hl?: boolean; badge?: string; idx: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const vis = useVis(ref)
  const [h, setH] = useState(false)

  return (
    <div
      ref={ref}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        background: hl ? 'linear-gradient(160deg, rgba(207,175,75,.08), rgba(10,14,26,.95))' : 'rgba(255,255,255,.015)',
        border: hl ? '1px solid rgba(207,175,75,.3)' : '1px solid rgba(255,255,255,.05)',
        borderRadius: 14, padding: '22px 16px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', overflow: 'hidden',
        transform: vis ? (h ? 'translateY(-4px)' : 'none') : 'translateY(18px)',
        opacity: vis ? 1 : 0, transition: `all .5s cubic-bezier(.16,1,.3,1) ${idx * 0.06}s`,
        flex: '1 1 140px', maxWidth: 180, minWidth: 130,
        boxShadow: hl ? '0 8px 32px rgba(207,175,75,.08)' : 'none',
        textAlign: 'center',
      }}
    >
      {badge && (
        <div style={{ position: 'absolute', top: 8, right: -22, background: 'var(--a)', color: '#0a0e1a', fontSize: 7, fontWeight: 800, letterSpacing: 1.5, padding: '2px 28px', transform: 'rotate(45deg)', fontFamily: 'var(--b)' }}>{badge}</div>
      )}
      <div style={{ fontFamily: 'var(--m)', fontSize: 28, color: '#fff', fontWeight: 700, lineHeight: 1 }}>{credits}</div>
      <div style={{ fontFamily: 'var(--b)', fontSize: 10, color: 'rgba(255,255,255,.35)', marginTop: 2, marginBottom: 8 }}>{credits === 1 ? 'credit' : 'credits'}</div>
      <div style={{ fontFamily: 'var(--m)', fontSize: 22, color: 'var(--a)', fontWeight: 700 }}>{price}</div>
      <div style={{ fontFamily: 'var(--b)', fontSize: 9, color: 'rgba(255,255,255,.3)', marginTop: 2 }}>{perCredit}/credit</div>
      {discount && <div style={{ fontFamily: 'var(--b)', fontSize: 9, color: '#f472b6', fontWeight: 700, marginTop: 2 }}>{discount}</div>}
      <div style={{ marginTop: 8, display: 'inline-block', padding: '3px 10px', borderRadius: 6, background: 'rgba(52,211,153,.08)', border: '1px solid rgba(52,211,153,.15)', fontFamily: 'var(--b)', fontSize: 10, fontWeight: 700, color: '#34d399' }}>+{tickets} ticket{tickets > 1 ? 's' : ''}</div>
      <Link href="/login" style={{
        width: '100%', padding: '9px 0', textAlign: 'center', display: 'block', textDecoration: 'none', marginTop: 12,
        background: hl ? 'linear-gradient(135deg, var(--a), #b8932e)' : 'rgba(255,255,255,.04)',
        border: hl ? 'none' : '1px solid rgba(255,255,255,.08)', borderRadius: 8,
        color: hl ? '#0a0e1a' : 'rgba(255,255,255,.6)', fontFamily: 'var(--b)', fontWeight: 700, fontSize: 11,
      }}>
        Acheter
      </Link>
    </div>
  )
}

/* ═══ FAQ ═══ */
function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const vis = useVis(ref)
  const [open, setOpen] = useState(false)

  return (
    <div ref={ref} onClick={() => setOpen(!open)} style={{ marginBottom: 6, padding: '14px 16px', background: open ? 'rgba(207,175,75,.03)' : 'rgba(255,255,255,.015)', border: open ? '1px solid rgba(207,175,75,.1)' : '1px solid rgba(255,255,255,.04)', borderRadius: 10, cursor: 'pointer', opacity: vis ? 1 : 0, transform: vis ? 'none' : 'translateY(8px)', transition: `all .4s ease ${index * 0.04}s` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: 'var(--b)', fontWeight: 700, fontSize: 13, color: '#fff' }}>{q}</div>
        <span style={{ color: 'var(--a)', fontSize: 14, transform: open ? 'rotate(45deg)' : 'none', transition: 'transform .2s' }}>+</span>
      </div>
      {open && (
        <div style={{ fontFamily: 'var(--b)', fontSize: 11, color: 'rgba(255,255,255,.4)', lineHeight: 1.6, marginTop: 8 }}>{a}</div>
      )}
    </div>
  )
}

/* ═══ TESTIMONIALS ═══ */
function Testimonials() {
  const ref = useRef<HTMLDivElement>(null)
  const vis = useVis(ref)
  const items = [
    { name: 'Marie L.', type: 'Particulier', text: "J'ai poste mon annonce gratuitement et j'ai eu 3 contacts en 48h grace au matching. J'ai pris des credits pour booster, ca a tout accelere.", stars: 5 },
    { name: 'Thomas M.', type: 'Artisan', text: "En tant qu'artisan, les leads arrivent tout seuls via le matching. J'ai poste mon profil et en 1 semaine j'avais 3 demandes de devis.", stars: 5 },
    { name: 'Sophie R.', type: 'Particulier', text: "J'adore le systeme de tickets. Chaque credit achete me rapproche du tirage. J'ai deja 12 tickets, et mon annonce est boostee en tete.", stars: 5 },
  ]

  return (
    <div ref={ref} style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', maxWidth: 700, margin: '0 auto', opacity: vis ? 1 : 0, transform: vis ? 'none' : 'translateY(18px)', transition: 'all .8s cubic-bezier(.16,1,.3,1)' }}>
      {items.map((t, i) => (
        <div key={i} style={{ flex: '1 1 200px', maxWidth: 220, background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 12, padding: '16px 14px' }}>
          <div style={{ fontFamily: 'var(--b)', fontSize: 12, color: 'var(--a)', marginBottom: 6 }}>{'★'.repeat(t.stars)}</div>
          <div style={{ fontFamily: 'var(--b)', fontSize: 11, color: 'rgba(255,255,255,.45)', lineHeight: 1.6, marginBottom: 10 }}>&ldquo;{t.text}&rdquo;</div>
          <div style={{ fontFamily: 'var(--b)', fontWeight: 700, fontSize: 11, color: '#fff' }}>{t.name}</div>
          <div style={{ fontFamily: 'var(--b)', fontSize: 9, color: 'rgba(255,255,255,.25)' }}>{t.type}</div>
        </div>
      ))}
    </div>
  )
}

/* ═══════════════════════════════════════════════ */
/* ═══ MAIN PAGE ═══ */
/* ═══════════════════════════════════════════════ */
export default function Howner() {
  const [pro, setPro] = useState(false)
  const [sY, setSY] = useState(0)

  useEffect(() => {
    const h = () => setSY(window.scrollY)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  const faqs = [
    { q: "C'est quoi Howner ?", a: "Howner est une plateforme immobiliere qui te permet de poster des annonces, scroller les biens du marche, matcher avec des pros et particuliers, et gagner des tickets pour le tirage d'une villa a 695 000€. L'inscription est gratuite, ta 1ere annonce aussi." },
    { q: "C'est quoi un credit ?", a: "1 credit = 1 action premium : poster une annonce supplementaire, booster une annonce en tete pendant 24h, ou activer une alerte prioritaire pendant 30 jours. Chaque credit achete te donne aussi 1 ticket bonus pour le jeu concours." },
    { q: "Qu'est-ce qui est gratuit ?", a: "L'inscription, ta 1ere annonce, le scroll illimite des annonces, le matching illimite, et le contact apres match mutuel. Tu recois aussi 1 ticket offert a l'inscription." },
    { q: "C'est quoi le jeu concours ?", a: "Chaque credit achete = 1 ticket. Chaque parrainage = 1 ticket. 1 ticket offert a l'inscription. A 200 000 tickets distribues, tirage en direct sous huissier de justice. Le gagnant remporte la villa." },
    { q: "Comment fonctionne le matching ?", a: "Tu swipes les profils (vendeurs, acheteurs, artisans, promoteurs, courtiers). Quand c'est un match mutuel, vous pouvez vous contacter gratuitement. Aucun credit necessaire pour matcher." },
    { q: "C'est legal ?", a: "Oui. Jeu concours conforme a la Directive Europeenne 2005/29/CE. Tirage sous controle d'huissier de justice. Participation gratuite possible via inscription (1 ticket offert)." },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#060a13', color: '#fff', overflowX: 'hidden' }}>

      {/* ═══ 1. TICKER BAR ═══ */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, background: 'linear-gradient(90deg, var(--a), #e8c84a, var(--a))', padding: '5px 0', overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: 50, whiteSpace: 'nowrap', animation: 'slide 40s linear infinite', fontFamily: 'var(--b)', fontSize: 10, fontWeight: 700, color: '#0a0e1a', letterSpacing: 0.5, textTransform: 'uppercase' }}>
          {[...Array(3)].map((_, i) => (
            <span key={i} style={{ display: 'flex', gap: 50 }}>
              <span>🏠 Villa 695 000&#8364; a gagner</span>
              <span>🎟️ 1 ticket offert a l&apos;inscription</span>
              <span>📢 1ere annonce gratuite</span>
              <span>💞 Matching illimite et gratuit</span>
              <span>⚡ Tirage des 200 000 tickets &middot; Huissier de justice</span>
            </span>
          ))}
        </div>
      </div>

      {/* ═══ 2. NAV ═══ */}
      <nav style={{ position: 'fixed', top: 24, left: 0, right: 0, zIndex: 100, padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: sY > 80 ? 'rgba(6,10,19,.95)' : 'transparent', backdropFilter: sY > 80 ? 'blur(16px)' : 'none', borderBottom: sY > 80 ? '1px solid rgba(255,255,255,.04)' : 'none', transition: 'all .4s' }}>
        <span style={{ fontFamily: 'var(--m)', fontWeight: 700, fontSize: 16, color: 'var(--a)', letterSpacing: 2 }}>HOWNER</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Gauge mini />
          <Link href="/login" style={{ padding: '7px 16px', background: 'linear-gradient(135deg, var(--a), #b8932e)', borderRadius: 7, fontFamily: 'var(--b)', fontWeight: 700, fontSize: 10, color: '#0a0e1a', textDecoration: 'none', boxShadow: '0 2px 8px rgba(207,175,75,.2)' }}>
            Je participe
          </Link>
        </div>
      </nav>

      {/* ═══ 3. HERO ═══ */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '120px 20px 60px', position: 'relative' }}>
        {/* Ambient glow */}
        <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(207,175,75,.06) 0%, transparent 65%)', top: '35%', left: '50%', transform: `translate(-50%,-50%) translateY(${sY * 0.04}px)`, pointerEvents: 'none' }} />

        <div style={{ animation: 'fadeIn .8s cubic-bezier(.16,1,.3,1)', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1 }}>

          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(207,175,75,.06)', border: '1px solid rgba(207,175,75,.15)', borderRadius: 100, padding: '5px 16px', marginBottom: 24 }}>
            <span style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--a)', fontFamily: 'var(--b)', fontWeight: 700 }}>🎁 Inscription gratuite &middot; 1 ticket offert &middot; 1ere annonce gratuite</span>
          </div>

          {/* Headline */}
          <h1 style={{ fontFamily: 'var(--d)', fontSize: 'clamp(36px, 6vw, 68px)', fontWeight: 800, lineHeight: 1, maxWidth: 680, marginBottom: 16 }}>
            <span style={{ color: 'rgba(255,255,255,.95)' }}>Gagnez cette</span><br />
            <span style={{ background: 'linear-gradient(135deg, var(--a), #f5e6a3, var(--a))', backgroundSize: '200% auto', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'shimmer 5s linear infinite' }}>villa a 695 000&#8364;</span>
          </h1>

          {/* Villa specs */}
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
            {['149m\u00B2', '4 chambres', 'Boucau', 'Pays Basque'].map((t, i) => (
              <span key={i} style={{ padding: '4px 10px', borderRadius: 100, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)', fontSize: 10, color: 'rgba(255,255,255,.4)', fontFamily: 'var(--b)', fontWeight: 600 }}>{t}</span>
            ))}
          </div>

          {/* Sub text */}
          <p style={{ fontFamily: 'var(--b)', fontSize: 'clamp(12px, 1.5vw, 15px)', color: 'rgba(255,255,255,.4)', maxWidth: 480, lineHeight: 1.7, marginBottom: 28 }}>
            Postez vos annonces, trouvez des biens, matchez avec des pros.
            Chaque credit vous rapproche du tirage.
          </p>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 32 }}>
            <Link href="/login" style={{ padding: '14px 28px', background: 'linear-gradient(135deg, var(--a), #b8932e)', border: 'none', borderRadius: 10, color: '#0a0e1a', fontFamily: 'var(--b)', fontWeight: 800, fontSize: 14, textDecoration: 'none', boxShadow: '0 4px 20px rgba(207,175,75,.3)', display: 'flex', alignItems: 'center', gap: 8 }}>
              🎁 S&apos;inscrire gratuitement
            </Link>
            <Link href="/annonces" style={{ padding: '14px 24px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 10, color: 'rgba(255,255,255,.6)', fontFamily: 'var(--b)', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
              Voir les annonces
            </Link>
          </div>

          {/* Gauge */}
          <Gauge />

          {/* Trust badges */}
          <div style={{ marginTop: 20, display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
            {['📢 Annonces gratuites', '💞 Matching gratuit', '🎟️ Jeu concours', '⚖️ Huissier'].map((t, i) => (
              <span key={i} style={{ fontSize: 9, color: 'rgba(255,255,255,.2)', fontFamily: 'var(--b)', fontWeight: 500 }}>{t}</span>
            ))}
          </div>
        </div>

        {/* Scroll hint */}
        <div style={{ position: 'absolute', bottom: 30, left: '50%', transform: 'translateX(-50%)', animation: 'pulse 2s infinite' }}>
          <div style={{ width: 20, height: 30, borderRadius: 10, border: '1.5px solid rgba(255,255,255,.15)', display: 'flex', justifyContent: 'center', paddingTop: 6 }}>
            <div style={{ width: 2, height: 6, borderRadius: 2, background: 'rgba(255,255,255,.25)', animation: 'fadeIn 1.5s infinite' }} />
          </div>
        </div>
      </section>

      {/* ═══ 4. STATS ═══ */}
      <section style={{ padding: '40px 20px', borderTop: '1px solid rgba(255,255,255,.04)', borderBottom: '1px solid rgba(255,255,255,.04)', background: 'rgba(255,255,255,.008)' }}>
        <div style={{ maxWidth: 650, margin: '0 auto', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 16 }}>
          <Ct end={1247} label="Annonces" suffix="+" />
          <Ct end={4283} label="Tickets distribues" />
          <Ct end={312} label="Matchs realises" />
          <Ct end={89} label="Pros inscrits" />
        </div>
      </section>

      {/* ═══ 5. HOW IT WORKS ═══ */}
      <section style={{ padding: '70px 20px', maxWidth: 900, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <h2 style={{ fontFamily: 'var(--d)', fontSize: 'clamp(22px, 3.5vw, 32px)', fontWeight: 800, color: '#fff', marginBottom: 6 }}>Comment gagner des tickets ?</h2>
          <p style={{ fontFamily: 'var(--b)', fontSize: 12, color: 'rgba(255,255,255,.3)' }}>Plus tu as de tickets, plus tu as de chances de gagner la villa.</p>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
          <StepCard step={1} icon="🎟️" title="Inscris-toi" desc="Cree ton compte en 30 secondes. C'est gratuit." bonus="+1 ticket gratuit + 1ere annonce gratuite" index={0} />
          <StepCard step={2} icon="💳" title="Achete des credits" desc="Poste des annonces, booste-les, active des alertes. Chaque credit = 1 ticket." bonus="+1 ticket par credit achete" index={1} />
          <StepCard step={3} icon="🎁" title="Parraine" desc="Invite tes amis. Chacun recoit un ticket bonus gratuit." bonus="+1 ticket par ami inscrit" index={2} />
        </div>
      </section>

      {/* ═══ 6. WHAT CREDITS DO ═══ */}
      <section style={{ padding: '60px 20px', maxWidth: 800, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <h2 style={{ fontFamily: 'var(--d)', fontSize: 'clamp(22px, 3.5vw, 32px)', fontWeight: 800, color: '#fff', marginBottom: 6 }}>A quoi servent les credits ?</h2>
          <p style={{ fontFamily: 'var(--b)', fontSize: 12, color: 'rgba(255,255,255,.3)', maxWidth: 460, margin: '0 auto' }}>1 credit = 1 action premium + 1 ticket bonus pour le jeu concours.</p>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
          <CreditCard icon="📢" title="Poster une annonce" desc="Au-dela de ta 1ere annonce gratuite, chaque annonce supplementaire coute 1 credit." detail="Vente, location, service, demande... toutes categories." index={0} />
          <CreditCard icon="🚀" title="Booster une annonce" desc="Passe ton annonce en tete de liste pendant 24 heures." detail="Visibilite maximale. Ideal pour vendre ou louer vite." index={1} />
          <CreditCard icon="🔔" title="Alerte prioritaire" desc="Recois une notification immediate des qu'un bien ou un profil correspond a tes criteres." detail="Active pendant 30 jours. Ne rate plus rien." index={2} />
        </div>
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 18px', borderRadius: 8, background: 'rgba(52,211,153,.04)', border: '1px solid rgba(52,211,153,.1)' }}>
            <span style={{ fontFamily: 'var(--b)', fontSize: 11, color: '#34d399', fontWeight: 700 }}>Rappel : scroll illimite + matching + contact apres match = toujours GRATUIT</span>
          </div>
        </div>
      </section>

      {/* ═══ 7. LISTING PREVIEW ═══ */}
      <section style={{ padding: '60px 20px', maxWidth: 640, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'var(--d)', fontSize: 'clamp(22px, 3.5vw, 30px)', fontWeight: 800, color: '#fff', marginBottom: 6 }}>Toutes les annonces. Un seul endroit.</h2>
          <p style={{ fontFamily: 'var(--b)', fontSize: 12, color: 'rgba(255,255,255,.3)' }}>Vente, location, services, demandes. Scroll gratuit et illimite.</p>
        </div>
        <ListingPreview />
      </section>

      {/* ═══ 8. MATCHING ═══ */}
      <section style={{ padding: '60px 20px', maxWidth: 600, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'var(--d)', fontSize: 'clamp(22px, 3.5vw, 30px)', fontWeight: 800, color: '#fff', marginBottom: 6 }}>Matching immobilier gratuit</h2>
          <p style={{ fontFamily: 'var(--b)', fontSize: 12, color: 'rgba(255,255,255,.3)' }}>Swipe, matche, contacte. Aucun credit necessaire.</p>
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 10 }}>
            {['👤↔👤', '👤↔🏢', '🏢↔🏢'].map((t, i) => (
              <span key={i} style={{ padding: '3px 10px', borderRadius: 6, background: 'rgba(207,175,75,.04)', border: '1px solid rgba(207,175,75,.1)', fontFamily: 'var(--b)', fontSize: 10, color: 'rgba(255,255,255,.35)' }}>{t}</span>
            ))}
          </div>
        </div>
        <MatchDemo />
      </section>

      {/* ═══ 9. TESTIMONIALS ═══ */}
      <section style={{ padding: '60px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'var(--d)', fontSize: 'clamp(22px, 3.5vw, 30px)', fontWeight: 800, color: '#fff', marginBottom: 6 }}>Ce qu&apos;ils en pensent</h2>
        </div>
        <Testimonials />
      </section>

      {/* ═══ 10. PRICING ═══ */}
      <section style={{ padding: '60px 20px', maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 16 }}>
          <button onClick={() => setPro(false)} style={{ padding: '8px 16px', background: !pro ? 'rgba(207,175,75,.1)' : 'rgba(255,255,255,.02)', border: !pro ? '1px solid rgba(207,175,75,.3)' : '1px solid rgba(255,255,255,.06)', borderRadius: 8, color: !pro ? 'var(--a)' : 'rgba(255,255,255,.4)', fontFamily: 'var(--b)', fontWeight: !pro ? 700 : 500, fontSize: 11, cursor: 'pointer' }}>👤 Standard</button>
          <button onClick={() => setPro(true)} style={{ padding: '8px 16px', background: pro ? 'rgba(207,175,75,.1)' : 'rgba(255,255,255,.02)', border: pro ? '1px solid rgba(207,175,75,.3)' : '1px solid rgba(255,255,255,.06)', borderRadius: 8, color: pro ? 'var(--a)' : 'rgba(255,255,255,.4)', fontFamily: 'var(--b)', fontWeight: pro ? 700 : 500, fontSize: 11, cursor: 'pointer' }}>🏢 Pro</button>
        </div>

        {!pro ? (
          <>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <h2 style={{ fontFamily: 'var(--d)', fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 800, color: '#fff', marginBottom: 4 }}>Packs credits &middot; Standard</h2>
              <p style={{ fontFamily: 'var(--b)', fontSize: 11, color: 'rgba(255,255,255,.3)' }}>1 credit = 1 annonce, 1 boost ou 1 alerte + 1 ticket bonus.</p>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
              <PackCard idx={0} credits={1} price="9€" perCredit="9€" tickets={1} />
              <PackCard idx={1} credits={5} price="39€" perCredit="7,80€" discount="-13%" tickets={5} hl badge="POPULAIRE" />
              <PackCard idx={2} credits={10} price="69€" perCredit="6,90€" discount="-23%" tickets={10} />
              <PackCard idx={3} credits={20} price="119€" perCredit="5,95€" discount="-34%" tickets={20} badge="BEST" />
            </div>
          </>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <h2 style={{ fontFamily: 'var(--d)', fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 800, color: '#fff', marginBottom: 4 }}>Packs credits &middot; Pro</h2>
              <p style={{ fontFamily: 'var(--b)', fontSize: 11, color: 'rgba(255,255,255,.3)' }}>Volume pour les agents, artisans, promoteurs. Pas d&apos;abonnement.</p>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
              <PackCard idx={0} credits={10} price="59€" perCredit="5,90€" discount="-34%" tickets={10} />
              <PackCard idx={1} credits={30} price="149€" perCredit="4,97€" discount="-45%" tickets={30} hl badge="TOP PRO" />
              <PackCard idx={2} credits={50} price="229€" perCredit="4,58€" discount="-49%" tickets={50} />
              <PackCard idx={3} credits={100} price="399€" perCredit="3,99€" discount="-56%" tickets={100} badge="BEST" />
            </div>
          </>
        )}

        {/* Free reminder */}
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <p style={{ fontFamily: 'var(--b)', fontSize: 10, color: 'rgba(255,255,255,.2)' }}>
            Rappel : 1ere annonce gratuite &middot; Scroll illimite &middot; Matching illimite &middot; Contact apres match mutuel
          </p>
        </div>
      </section>

      {/* ═══ 11. VILLA SECTION ═══ */}
      <section style={{ padding: '60px 20px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontFamily: 'var(--m)', fontSize: 9, letterSpacing: 3, color: 'var(--a)', textTransform: 'uppercase', marginBottom: 8 }}>Lot du jeu concours &middot; Terrain + construction</div>
            <h2 style={{ fontFamily: 'var(--d)', fontSize: 'clamp(24px, 4vw, 34px)', fontWeight: 800, color: '#fff', marginBottom: 6 }}>Villa Boucau</h2>
            <div style={{ fontFamily: 'var(--m)', fontSize: 36, color: 'var(--a)', fontWeight: 700 }}>695 000&#8364;</div>
          </div>
          {/* Video */}
          <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(207,175,75,.12)', background: '#000', aspectRatio: '9/16', maxHeight: 380, maxWidth: 214, margin: '0 auto 16px' }}>
            <iframe src="https://drive.google.com/file/d/1HHinz5llZ3LHbovBf8r20cD5tGhR5zET/preview" style={{ width: '100%', height: '100%', border: 'none' }} allow="autoplay" title="Villa Boucau" />
          </div>
          {/* Image gallery */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 6, marginBottom: 12, borderRadius: 14, overflow: 'hidden' }}>
            <img src="https://lh3.googleusercontent.com/d/1A9yVRhLP_Iv8kmmrbpf_uPkfjoPUil8c" alt="Villa Boucau - Exterieur" style={{ width: '100%', height: 280, objectFit: 'cover', display: 'block' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <img src="https://lh3.googleusercontent.com/d/1tkeKSJf80s53aSPJt7NAtAV8st9s7va2" alt="Villa Boucau - Interieur cuisine" style={{ width: '100%', height: 137, objectFit: 'cover', display: 'block', borderRadius: '0 14px 0 0' }} />
              <img src="https://lh3.googleusercontent.com/d/1Gt6edrAlJQK4j4noXBGg6asDxi3Q7ECZ" alt="Villa Boucau - Interieur salon" style={{ width: '100%', height: 137, objectFit: 'cover', display: 'block' }} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 16 }}>
            <img src="https://lh3.googleusercontent.com/d/1IPKfEMgg1UPxG_Tkh5hQ_Ym4qnZbEmLf" alt="Villa Boucau - Vue arriere" style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 10, display: 'block' }} />
            <img src="https://lh3.googleusercontent.com/d/1nblqBWNbwN2BTjAwvIm0I-1N7tXS9CMe" alt="Villa Boucau - Chambre" style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 10, display: 'block' }} />
            <img src="https://lh3.googleusercontent.com/d/1jg2irqsMMIbX23xYHh4Y6JRjxnfdPl5c" alt="Terrain Boucau" style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 10, display: 'block' }} />
          </div>
          {/* Specs */}
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
            {['149m²', '4 chambres', 'R+1', 'Terrain inclus', 'Boucau Haut', 'Pays Basque'].map((t, i) => (
              <span key={i} style={{ padding: '4px 12px', borderRadius: 100, background: 'rgba(207,175,75,.04)', border: '1px solid rgba(207,175,75,.1)', fontSize: 10, color: 'var(--a)', fontFamily: 'var(--b)', fontWeight: 600 }}>{t}</span>
            ))}
          </div>
          <p style={{ fontFamily: 'var(--b)', fontSize: 12, color: 'rgba(255,255,255,.4)', lineHeight: 1.6, textAlign: 'center', maxWidth: 500, margin: '0 auto 16px' }}>Architecte integre &middot; Finitions Porcelanosa &middot; Construction LSF &middot; Cle en main &middot; Livree par Affinity Home</p>
          <div style={{ textAlign: 'center' }}>
            <Link href="/villa" style={{ display: 'inline-block', padding: '12px 28px', background: 'linear-gradient(135deg, var(--a), #b8932e)', borderRadius: 10, fontFamily: 'var(--b)', fontWeight: 700, fontSize: 13, color: '#0a0e1a', textDecoration: 'none', boxShadow: '0 3px 14px rgba(207,175,75,.2)' }}>
              Decouvrir la villa &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ 12. FAQ ═══ */}
      <section style={{ padding: '50px 20px', maxWidth: 500, margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'var(--d)', fontSize: 24, fontWeight: 800, color: '#fff', textAlign: 'center', marginBottom: 20 }}>FAQ</h2>
        {faqs.map((faq, i) => (
          <FAQItem key={i} q={faq.q} a={faq.a} index={i} />
        ))}
      </section>

      {/* ═══ 13. FINAL CTA ═══ */}
      <section style={{ padding: '50px 20px 70px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--d)', fontSize: 'clamp(22px, 4vw, 34px)', fontWeight: 800, color: '#fff', marginBottom: 8 }}>1 ticket offert. 1ere annonce gratuite.</h2>
        <p style={{ fontFamily: 'var(--b)', fontSize: 13, color: 'rgba(255,255,255,.3)', marginBottom: 20 }}>Gratuit &middot; Pas de carte bancaire &middot; Tirage sous huissier</p>
        <Link href="/login" style={{ padding: '14px 32px', background: 'linear-gradient(135deg, var(--a), #b8932e)', border: 'none', borderRadius: 10, color: '#0a0e1a', fontFamily: 'var(--b)', fontWeight: 800, fontSize: 14, textDecoration: 'none', boxShadow: '0 4px 20px rgba(207,175,75,.25)', display: 'inline-block' }}>
          🎁 C&apos;est parti — Inscription gratuite
        </Link>
      </section>

      {/* ═══ 14. FOOTER ═══ */}
      <footer style={{ padding: '24px 20px', borderTop: '1px solid rgba(255,255,255,.04)', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--m)', fontSize: 11, color: 'var(--a)', marginBottom: 6, letterSpacing: 2 }}>HOWNER</div>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 10 }}>
          <Link href="/annonces" style={{ fontFamily: 'var(--b)', fontSize: 10, color: 'rgba(255,255,255,.25)', textDecoration: 'none' }}>Annonces</Link>
          <Link href="/match" style={{ fontFamily: 'var(--b)', fontSize: 10, color: 'rgba(255,255,255,.25)', textDecoration: 'none' }}>Matching</Link>
          <Link href="/villa" style={{ fontFamily: 'var(--b)', fontSize: 10, color: 'rgba(255,255,255,.25)', textDecoration: 'none' }}>La Villa</Link>
          <Link href="/login" style={{ fontFamily: 'var(--b)', fontSize: 10, color: 'rgba(255,255,255,.25)', textDecoration: 'none' }}>Connexion</Link>
          <Link href="/cgv" style={{ fontFamily: 'var(--b)', fontSize: 10, color: 'rgba(255,255,255,.25)', textDecoration: 'none' }}>CGV</Link>
          <Link href="/mentions" style={{ fontFamily: 'var(--b)', fontSize: 10, color: 'rgba(255,255,255,.25)', textDecoration: 'none' }}>Mentions legales</Link>
          <Link href="/reglement" style={{ fontFamily: 'var(--b)', fontSize: 10, color: 'rgba(255,255,255,.25)', textDecoration: 'none' }}>Reglement du jeu</Link>
        </div>
        <div style={{ fontFamily: 'var(--b)', fontSize: 8, color: 'rgba(255,255,255,.1)', lineHeight: 1.8 }}>
          Affinity House Factory SAS &middot; SIRET 982 581 506 00010 &middot; Anglet, France
          <br />Jeu concours gratuit &middot; Directive EU 2005/29/CE &middot; Huissier de justice
          <br />Reglement complet sur demande &middot; Verification d&apos;identite requise
        </div>
      </footer>

      {/* ═══ 15. LIVE TICKER ═══ */}
      <LiveTicker />
    </div>
  )
}
