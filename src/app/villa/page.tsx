'use client'

import Nav from '@/components/Nav'
import Link from 'next/link'
import { useState } from 'react'

const specs = ['149m²', '4 chambres', 'R+1', 'Terrain inclus', 'Boucau Haut', 'Pays Basque']

const steps = [
  { num: '01', title: 'Inscris-toi', desc: '1 ticket gratuit', icon: '\u2713' },
  { num: '02', title: 'Ach\u00E8te des crédits', desc: '1 ticket par crédit', icon: '\u25C8' },
  { num: '03', title: 'Parraine tes amis', desc: '1 ticket par ami', icon: '\u2605' },
]

const rules = [
  {
    title: 'Organisateur',
    content: 'Affinity House Factory SAS, SIRET 982 581 506 00010, sise \u00E0 Anglet (64600). Jeu-concours organisé conformément \u00E0 la législation fran\u00E7aise en vigueur.',
  },
  {
    title: 'Conditions de participation',
    content: 'Résider en France métropolitaine, \u00EAtre \u00E2gé(e) de 18 ans ou plus, un seul compte par personne physique. Toute tentative de fraude entra\u00EEne la disqualification immédiate.',
  },
  {
    title: 'Mécanique du tirage',
    content: 'Le tirage au sort est déclenché automatiquement lorsque le seuil de 200\u202F000 tickets est atteint. Chaque ticket dispose d\u2019une chance égale.',
  },
  {
    title: 'Contr\u00F4le et vérification',
    content: 'Le tirage est supervisé par un huissier de justice. Le gagnant devra fournir une pi\u00E8ce d\u2019identité valide pour la vérification de son éligibilité.',
  },
  {
    title: 'Participation gratuite',
    content: '1 ticket offert \u00E0 l\u2019inscription. Parrainage illimité : chaque ami inscrit via votre lien vous rapporte 1 ticket supplémentaire.',
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

export default function VillaPage() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div style={{ minHeight: '100vh', background: '#060a13', color: '#fff' }}>
      <Nav />

      {/* HERO */}
      <section style={{ textAlign: 'center', padding: '80px 20px 40px' }}>
        <div style={{
          display: 'inline-block',
          fontFamily: 'var(--m)',
          fontSize: 10,
          letterSpacing: 4,
          color: 'var(--a)',
          textTransform: 'uppercase' as const,
          background: 'rgba(207,175,75,.08)',
          border: '1px solid rgba(207,175,75,.15)',
          borderRadius: 20,
          padding: '6px 18px',
          marginBottom: 28,
        }}>
          Jeu-concours Howner
        </div>
        <h1 style={{
          fontFamily: 'var(--d)',
          fontSize: 'clamp(42px, 8vw, 72px)',
          fontWeight: 700,
          color: '#fff',
          margin: '0 0 12px',
          lineHeight: 1.05,
          letterSpacing: -1,
        }}>
          Villa Boucau
        </h1>
        <p style={{
          fontFamily: 'var(--b)',
          fontSize: 'clamp(16px, 3vw, 22px)',
          color: 'rgba(255,255,255,.45)',
          fontWeight: 400,
          margin: '0 0 36px',
        }}>
          Le lot du jeu concours
        </p>

        {/* SPECS TAGS */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginBottom: 44 }}>
          {specs.map(s => (
            <span key={s} style={{
              fontFamily: 'var(--m)',
              fontSize: 12,
              color: 'var(--a)',
              background: 'rgba(207,175,75,.06)',
              border: '1px solid rgba(207,175,75,.12)',
              borderRadius: 8,
              padding: '8px 16px',
              letterSpacing: 0.5,
            }}>
              {s}
            </span>
          ))}
        </div>

        {/* PRICE */}
        <div style={{
          fontFamily: 'var(--d)',
          fontSize: 'clamp(48px, 10vw, 84px)',
          fontWeight: 800,
          background: 'linear-gradient(135deg, #cfaf4b 0%, #e8d58c 40%, #cfaf4b 70%, #b8932e 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          lineHeight: 1.1,
          marginBottom: 8,
        }}>
          695 000€
        </div>
        <p style={{
          fontFamily: 'var(--m)',
          fontSize: 11,
          color: 'rgba(255,255,255,.25)',
          letterSpacing: 1,
          marginTop: 0,
        }}>
          Valeur estimée du lot
        </p>
      </section>

      {/* PHOTO GALLERY */}
      <section style={{ maxWidth: 800, margin: '0 auto', padding: '0 20px 40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 6, marginBottom: 8, borderRadius: 14, overflow: 'hidden' }}>
          <img src="https://lh3.googleusercontent.com/d/1A9yVRhLP_Iv8kmmrbpf_uPkfjoPUil8c" alt="Villa Boucau - Extérieur piscine" style={{ width: '100%', height: 320, objectFit: 'cover', display: 'block' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <img src="https://lh3.googleusercontent.com/d/1IPKfEMgg1UPxG_Tkh5hQ_Ym4qnZbEmLf" alt="Villa Boucau - Vue arrière" style={{ width: '100%', height: 157, objectFit: 'cover', display: 'block' }} />
            <img src="https://lh3.googleusercontent.com/d/1PhHHRCnpSuveWSUnHxBxiD4Cc_Jyeglx" alt="Villa Boucau - Vue latérale" style={{ width: '100%', height: 157, objectFit: 'cover', display: 'block' }} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
          <img src="https://lh3.googleusercontent.com/d/1tkeKSJf80s53aSPJt7NAtAV8st9s7va2" alt="Intérieur - Cuisine" style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 10, display: 'block' }} />
          <img src="https://lh3.googleusercontent.com/d/1Gt6edrAlJQK4j4noXBGg6asDxi3Q7ECZ" alt="Intérieur - Salon" style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 10, display: 'block' }} />
          <img src="https://lh3.googleusercontent.com/d/1nblqBWNbwN2BTjAwvIm0I-1N7tXS9CMe" alt="Intérieur - Chambre" style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 10, display: 'block' }} />
          <img src="https://lh3.googleusercontent.com/d/1jg2irqsMMIbX23xYHh4Y6JRjxnfdPl5c" alt="Terrain à Boucau" style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 10, display: 'block', border: '2px solid rgba(207,175,75,.2)' }} />
        </div>
        <div style={{ textAlign: 'center', marginTop: 8 }}>
          <span style={{ fontFamily: 'var(--b)', fontSize: 10, color: 'rgba(255,255,255,.25)' }}>📍 Terrain + Construction neuve par Affinity Home · Boucau Haut, Pays Basque</span>
        </div>
      </section>

      {/* DIVIDER */}
      <div style={{ width: 60, height: 1, background: 'linear-gradient(90deg, transparent, var(--a), transparent)', margin: '0 auto 50px' }} />

      {/* DESCRIPTION */}
      <section style={{ maxWidth: 700, margin: '0 auto', padding: '0 20px 60px', textAlign: 'center' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
          {['Architecte intégré', 'Finitions Porcelanosa', 'Construction LSF', 'Clé en main', 'Livrée par Affinity Home'].map(item => (
            <span key={item} style={{
              fontFamily: 'var(--b)',
              fontSize: 13,
              color: 'rgba(255,255,255,.6)',
              padding: '10px 20px',
              background: 'rgba(255,255,255,.03)',
              border: '1px solid rgba(255,255,255,.06)',
              borderRadius: 10,
            }}>
              {item}
            </span>
          ))}
        </div>
      </section>

      {/* COMMENT PARTICIPER */}
      <section style={{ maxWidth: 800, margin: '0 auto', padding: '0 20px 80px' }}>
        <h2 style={{
          fontFamily: 'var(--d)',
          fontSize: 'clamp(28px, 5vw, 40px)',
          fontWeight: 700,
          textAlign: 'center',
          marginBottom: 48,
          color: '#fff',
        }}>
          Comment participer
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
          {steps.map(step => (
            <div key={step.num} style={{
              background: 'rgba(255,255,255,.02)',
              border: '1px solid rgba(255,255,255,.06)',
              borderRadius: 16,
              padding: '36px 28px',
              textAlign: 'center',
              transition: 'border-color .3s',
            }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'rgba(207,175,75,.08)',
                border: '1px solid rgba(207,175,75,.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 18px',
                fontFamily: 'var(--m)',
                fontSize: 16,
                color: 'var(--a)',
              }}>
                {step.num}
              </div>
              <h3 style={{
                fontFamily: 'var(--b)',
                fontSize: 16,
                fontWeight: 700,
                color: '#fff',
                margin: '0 0 8px',
              }}>
                {step.title}
              </h3>
              <p style={{
                fontFamily: 'var(--m)',
                fontSize: 12,
                color: 'var(--a)',
                margin: 0,
                letterSpacing: 0.3,
              }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* REGLEMENT */}
      <section style={{ maxWidth: 700, margin: '0 auto', padding: '0 20px 80px' }}>
        <h2 style={{
          fontFamily: 'var(--d)',
          fontSize: 'clamp(24px, 4vw, 36px)',
          fontWeight: 700,
          textAlign: 'center',
          marginBottom: 36,
          color: '#fff',
        }}>
          R\u00E8glement du jeu concours
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {rules.map((rule, i) => (
            <div key={i} style={{
              background: open === i ? 'rgba(207,175,75,.04)' : 'rgba(255,255,255,.02)',
              border: `1px solid ${open === i ? 'rgba(207,175,75,.15)' : 'rgba(255,255,255,.05)'}`,
              borderRadius: 12,
              overflow: 'hidden',
              transition: 'all .3s',
            }}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#fff',
                }}
              >
                <span style={{
                  fontFamily: 'var(--b)',
                  fontSize: 14,
                  fontWeight: 600,
                  color: open === i ? 'var(--a)' : 'rgba(255,255,255,.7)',
                  textAlign: 'left',
                }}>
                  {rule.title}
                </span>
                <span style={{
                  fontFamily: 'var(--m)',
                  fontSize: 14,
                  color: 'var(--a)',
                  transform: open === i ? 'rotate(45deg)' : 'rotate(0deg)',
                  transition: 'transform .3s',
                }}>
                  +
                </span>
              </button>
              {open === i && (
                <div style={{
                  padding: '0 20px 16px',
                  fontFamily: 'var(--b)',
                  fontSize: 13,
                  lineHeight: 1.7,
                  color: 'rgba(255,255,255,.45)',
                }}>
                  {rule.content}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ textAlign: 'center', padding: '0 20px 80px' }}>
        <div style={{
          maxWidth: 500,
          margin: '0 auto',
          padding: '48px 32px',
          background: 'rgba(207,175,75,.03)',
          border: '1px solid rgba(207,175,75,.1)',
          borderRadius: 20,
        }}>
          <h3 style={{
            fontFamily: 'var(--d)',
            fontSize: 26,
            fontWeight: 700,
            color: '#fff',
            margin: '0 0 8px',
          }}>
            Tente ta chance
          </h3>
          <p style={{
            fontFamily: 'var(--b)',
            fontSize: 13,
            color: 'rgba(255,255,255,.4)',
            margin: '0 0 28px',
          }}>
            Inscription gratuite \u00B7 1 ticket offert
          </p>
          <Link href="/login" style={{
            display: 'inline-block',
            padding: '14px 36px',
            background: 'linear-gradient(135deg, var(--a), #b8932e)',
            borderRadius: 10,
            fontFamily: 'var(--b)',
            fontWeight: 700,
            fontSize: 14,
            color: '#0a0e1a',
            textDecoration: 'none',
            boxShadow: '0 4px 20px rgba(207,175,75,.25)',
            letterSpacing: 0.3,
          }}>
            S&apos;inscrire gratuitement
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,.04)',
        padding: '32px 20px',
        textAlign: 'center',
      }}>
        <p style={{
          fontFamily: 'var(--m)',
          fontSize: 10,
          color: 'rgba(255,255,255,.2)',
          lineHeight: 1.8,
          maxWidth: 600,
          margin: '0 auto',
        }}>
          Affinity House Factory SAS &middot; SIRET 982 581 506 00010 &middot; Anglet (64600)
          <br />
          Jeu-concours régi par le droit fran\u00E7ais &middot; Directive EU 2005/29/CE
          <br />
          R\u00E8glement complet disponible sur demande &middot; Données traitées conformément au RGPD
        </p>
        <p style={{
          fontFamily: 'var(--m)',
          fontSize: 9,
          color: 'rgba(255,255,255,.1)',
          marginTop: 16,
        }}>
          &copy; {new Date().getFullYear()} Howner
        </p>
      </footer>
    </div>
  )
}
