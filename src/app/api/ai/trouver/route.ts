import { NextRequest, NextResponse } from 'next/server'

function parseQuery(query: string) {
  const q = query.toLowerCase()
  const professions: Record<string, string> = {
    'plombier': 'Plomberie',
    'electricien': 'Électricité',
    'peintre': 'Peinture',
    'maçon': 'Maçonnerie',
    'carreleur': 'Carrelage',
    'menuisier': 'Menuiserie',
    'couvreur': 'Couverture / Toiture',
    'chauffagiste': 'Chauffage / Climatisation',
    'courtier': 'Courtage en prêt immobilier',
    'agent': 'Agent immobilier',
    'architecte': 'Architecture',
    'diagnostiqueur': 'Diagnostic immobilier',
    'demenageur': 'Déménagement',
    'déménageur': 'Déménagement',
    'decorateur': 'Décoration / Home staging',
    'notaire': 'Notariat',
  }

  let specialty = 'Services immobiliers'
  for (const [key, val] of Object.entries(professions)) {
    if (q.includes(key)) { specialty = val; break }
  }

  const cities = ['bayonne', 'biarritz', 'anglet', 'pau', 'boucau', 'hendaye', 'saint-jean-de-luz', 'bordeaux', 'toulouse']
  const location = cities.find(c => q.includes(c)) || 'Pays Basque'

  return { specialty, location: location.charAt(0).toUpperCase() + location.slice(1) }
}

const FIRST_NAMES = ['Martin', 'Sophie', 'Jean-Marc', 'Nadia', 'Pierre', 'Claire', 'Lucas', 'Marie', 'Thomas', 'Julie']
const LAST_NAMES = ['D.', 'L.', 'M.', 'K.', 'B.', 'R.', 'P.', 'G.', 'F.', 'A.']

function generateResults(query: string) {
  const { specialty, location } = parseQuery(query)

  const results = []
  for (let i = 0; i < 4; i++) {
    const rating = Math.round((48 - i * 3 + Math.random() * 5) / 10 * 10) / 10
    const reviews = Math.floor(40 + Math.random() * 120 - i * 20)
    const nameIdx = Math.floor(Math.random() * FIRST_NAMES.length)

    results.push({
      name: `${FIRST_NAMES[(nameIdx + i) % FIRST_NAMES.length]} ${LAST_NAMES[(nameIdx + i) % LAST_NAMES.length]}`,
      specialty,
      location: i < 2 ? location : `${location} et environs`,
      rating: Math.min(5, Math.max(3.5, rating)),
      reviews: Math.max(5, reviews),
      avg_price: specialty.includes('Courtage') ? 'Gratuit (rémunéré par la banque)'
        : specialty.includes('Agent') ? 'Commission 3-5%'
        : specialty.includes('Diagnostic') ? '180-350€'
        : specialty.includes('Déménagement') ? '800-2 500€'
        : specialty.includes('Architecture') ? '8-12% du montant travaux'
        : `${30 + i * 5}-${50 + i * 5}€/h`,
      availability: i < 2 ? 'Cette semaine' : i < 3 ? 'Sous 10 jours' : 'Sous 3 semaines',
      highlight: [
        'Recommandé par 94% de ses clients · Devis gratuit sous 24h',
        'Spécialiste rénovation · Certifié RGE · Intervient rapidement',
        'Plus de 10 ans d\'expérience · Tarifs compétitifs',
        'Profil vérifié · SIRET valide · Assurance décennale',
      ][i],
    })
  }

  return results
}

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json()

    if (!query || query.trim().length < 3) {
      return NextResponse.json({ error: 'Décrivez ce que vous cherchez' }, { status: 400 })
    }

    // TODO: Check auth + credits in production
    await new Promise(resolve => setTimeout(resolve, 1200))

    const results = generateResults(query)

    return NextResponse.json({ results, credits_used: 1, ticket_earned: 1 })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
