import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

/* ═══ TYPES ═══ */
type Category =
  | 'plomberie'
  | 'electricite'
  | 'peinture'
  | 'maconnerie'
  | 'cuisine'
  | 'salle_de_bain'
  | 'toiture'
  | 'chauffage'
  | 'renovation_complete'
  | 'autre'

type Verdict = 'correct' | 'surcote' | 'sous_cote' | 'bonne_affaire'

interface DevisRequest {
  description: string
  amount: number
  location: string
  category: Category
}

interface DevisResponse {
  verdict: Verdict
  market_range: { low: number; high: number }
  deviation_percent: number
  analysis: string
  recommendations: string[]
  top_companies: { name: string; rating: number; avg_price: number }[]
}

/* ═══ MARKET DATA (MVP — hardcoded ranges per category, euros) ═══ */
const MARKET_DATA: Record<Category, { base_low: number; base_high: number; unit: string }> = {
  plomberie:           { base_low: 1200, base_high: 4500, unit: 'intervention' },
  electricite:         { base_low: 2000, base_high: 7000, unit: 'intervention' },
  peinture:            { base_low: 800,  base_high: 3500, unit: 'intervention' },
  maconnerie:          { base_low: 3000, base_high: 12000, unit: 'intervention' },
  cuisine:             { base_low: 5000, base_high: 18000, unit: 'installation' },
  salle_de_bain:       { base_low: 4000, base_high: 14000, unit: 'installation' },
  toiture:             { base_low: 5000, base_high: 20000, unit: 'intervention' },
  chauffage:           { base_low: 3000, base_high: 10000, unit: 'installation' },
  renovation_complete: { base_low: 15000, base_high: 60000, unit: 'chantier' },
  autre:               { base_low: 1000, base_high: 8000, unit: 'intervention' },
}

/* Regional price multiplier based on city keywords */
function getRegionalMultiplier(location: string): number {
  const loc = location.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  if (/paris|neuilly|boulogne.billancourt|levallois/.test(loc)) return 1.35
  if (/lyon|marseille|bordeaux|toulouse|nice|nantes/.test(loc)) return 1.15
  if (/lille|strasbourg|montpellier|rennes/.test(loc)) return 1.08
  if (/biarritz|bayonne|anglet|pays.basque|saint.jean.de.luz/.test(loc)) return 1.12
  return 1.0
}

/* ═══ CATEGORY LABELS (for analysis text) ═══ */
const CATEGORY_LABELS: Record<Category, string> = {
  plomberie: 'plomberie',
  electricite: 'electricite',
  peinture: 'peinture',
  maconnerie: 'maconnerie',
  cuisine: 'cuisine equipee',
  salle_de_bain: 'salle de bain',
  toiture: 'toiture',
  chauffage: 'chauffage',
  renovation_complete: 'renovation complete',
  autre: 'travaux divers',
}

/* ═══ FICTIONAL COMPANIES PER CATEGORY ═══ */
const COMPANIES: Record<Category, { name: string; rating: number; price_factor: number }[]> = {
  plomberie: [
    { name: 'Plomberie Express 64', rating: 4.8, price_factor: 0.92 },
    { name: 'Artisan Duval & Fils', rating: 4.6, price_factor: 0.88 },
    { name: 'SOS Plombier Sud-Ouest', rating: 4.5, price_factor: 0.95 },
  ],
  electricite: [
    { name: 'Elec Pro Atlantique', rating: 4.7, price_factor: 0.90 },
    { name: 'Voltaire Installations', rating: 4.6, price_factor: 0.93 },
    { name: 'Lumiere & Co', rating: 4.4, price_factor: 0.87 },
  ],
  peinture: [
    { name: 'Peintures Basques', rating: 4.9, price_factor: 0.88 },
    { name: 'ColorPro Renovation', rating: 4.5, price_factor: 0.91 },
    { name: 'Atelier Finitions', rating: 4.4, price_factor: 0.85 },
  ],
  maconnerie: [
    { name: 'Batir Sud-Ouest', rating: 4.7, price_factor: 0.90 },
    { name: 'Maconnerie Larralde', rating: 4.6, price_factor: 0.92 },
    { name: 'Pierre & Beton SARL', rating: 4.3, price_factor: 0.88 },
  ],
  cuisine: [
    { name: 'Cuisines d\'Aquitaine', rating: 4.8, price_factor: 0.91 },
    { name: 'L\'Atelier Cuisine Pro', rating: 4.6, price_factor: 0.88 },
    { name: 'Design Cuisine 64', rating: 4.5, price_factor: 0.93 },
  ],
  salle_de_bain: [
    { name: 'Bain & Douche Pro', rating: 4.7, price_factor: 0.89 },
    { name: 'Reno Salle de Bain', rating: 4.6, price_factor: 0.92 },
    { name: 'Aqua Design Basque', rating: 4.4, price_factor: 0.86 },
  ],
  toiture: [
    { name: 'Toitures du Pays Basque', rating: 4.8, price_factor: 0.91 },
    { name: 'Couverture Atlantique', rating: 4.5, price_factor: 0.88 },
    { name: 'Toit Renov 64', rating: 4.4, price_factor: 0.93 },
  ],
  chauffage: [
    { name: 'Thermi Confort', rating: 4.7, price_factor: 0.90 },
    { name: 'Eco Chauffage Sud', rating: 4.6, price_factor: 0.87 },
    { name: 'Chaleur & Energie', rating: 4.5, price_factor: 0.92 },
  ],
  renovation_complete: [
    { name: 'Renov Habitat 64', rating: 4.8, price_factor: 0.90 },
    { name: 'Batir & Renover SARL', rating: 4.6, price_factor: 0.88 },
    { name: 'Maison Neuve Atlantique', rating: 4.5, price_factor: 0.92 },
  ],
  autre: [
    { name: 'Multi-Services Bayonne', rating: 4.6, price_factor: 0.90 },
    { name: 'Artisan Polyvalent 64', rating: 4.5, price_factor: 0.88 },
    { name: 'Pro Travaux Sud-Ouest', rating: 4.3, price_factor: 0.91 },
  ],
}

const VALID_CATEGORIES: Category[] = [
  'plomberie', 'electricite', 'peinture', 'maconnerie', 'cuisine',
  'salle_de_bain', 'toiture', 'chauffage', 'renovation_complete', 'autre',
]

/* ═══ ANALYSIS GENERATOR ═══ */
function analyzeDevis(body: DevisRequest): DevisResponse {
  const { amount, category, location, description } = body
  const market = MARKET_DATA[category]
  const multiplier = getRegionalMultiplier(location)

  const low = Math.round(market.base_low * multiplier)
  const high = Math.round(market.base_high * multiplier)

  // Scale range based on amount magnitude (larger jobs = wider range)
  const midpoint = (low + high) / 2
  const scaleFactor = amount > midpoint * 2 ? 1.8 : amount > midpoint ? 1.3 : 1.0
  const adjustedLow = Math.round(low * scaleFactor)
  const adjustedHigh = Math.round(high * scaleFactor)

  const marketMid = (adjustedLow + adjustedHigh) / 2
  const deviation = ((amount - marketMid) / marketMid) * 100
  const deviationRounded = Math.round(deviation)

  // Determine verdict
  let verdict: Verdict
  if (deviation <= -15) {
    verdict = 'bonne_affaire'
  } else if (deviation >= 25) {
    verdict = 'surcote'
  } else if (deviation >= 10) {
    verdict = 'sous_cote' // slightly overpriced but we use sous_cote for "above market"
    verdict = 'surcote'
  } else if (deviation <= -5) {
    verdict = 'sous_cote'
  } else {
    verdict = 'correct'
  }

  // Refine: bonne_affaire only when clearly below
  if (deviation <= -15) verdict = 'bonne_affaire'
  else if (deviation <= -5) verdict = 'sous_cote'
  else if (deviation <= 10) verdict = 'correct'
  else verdict = 'surcote'

  const label = CATEGORY_LABELS[category]
  const loc = location || 'votre secteur'

  // Generate analysis text
  let analysis: string
  switch (verdict) {
    case 'bonne_affaire':
      analysis = `Ce devis de ${amount.toLocaleString('fr-FR')} EUR pour des travaux de ${label} a ${loc} est nettement en dessous des prix du marche local (${adjustedLow.toLocaleString('fr-FR')} - ${adjustedHigh.toLocaleString('fr-FR')} EUR). C'est une bonne affaire. Verifiez cependant que la qualite des materiaux et les garanties sont bien incluses dans ce tarif.`
      break
    case 'sous_cote':
      analysis = `Ce devis de ${amount.toLocaleString('fr-FR')} EUR pour des travaux de ${label} a ${loc} est legerement en dessous de la moyenne du marche (${adjustedLow.toLocaleString('fr-FR')} - ${adjustedHigh.toLocaleString('fr-FR')} EUR). Le tarif est competitif. Assurez-vous que toutes les prestations necessaires sont bien detaillees dans le devis.`
      break
    case 'correct':
      analysis = `Ce devis de ${amount.toLocaleString('fr-FR')} EUR pour des travaux de ${label} a ${loc} est dans la fourchette du marche (${adjustedLow.toLocaleString('fr-FR')} - ${adjustedHigh.toLocaleString('fr-FR')} EUR). Le prix est coherent avec les tarifs pratiques dans votre region. Comparez tout de meme avec 2-3 autres artisans.`
      break
    case 'surcote':
      analysis = `Ce devis de ${amount.toLocaleString('fr-FR')} EUR pour des travaux de ${label} a ${loc} est au-dessus de la moyenne du marche (${adjustedLow.toLocaleString('fr-FR')} - ${adjustedHigh.toLocaleString('fr-FR')} EUR). Le tarif est ${deviationRounded > 25 ? 'significativement' : 'legerement'} eleve. Nous recommandons de demander des devis complementaires.`
      break
  }

  // Generate recommendations
  const recommendations: string[] = []
  if (verdict === 'surcote') {
    recommendations.push('Demandez au moins 2 devis supplementaires pour comparer les tarifs.')
    recommendations.push('Verifiez que le devis detaille bien chaque poste (main d\'oeuvre, materiaux, deplacements).')
    recommendations.push('Negociez en mentionnant les prix du marche local pour ce type de travaux.')
  } else if (verdict === 'bonne_affaire' || verdict === 'sous_cote') {
    recommendations.push('Verifiez les garanties (decennale, biennale) et les assurances de l\'artisan.')
    recommendations.push('Assurez-vous que tous les materiaux sont de qualite equivalente a ceux du marche.')
    recommendations.push('Demandez un planning detaille avec les delais de realisation.')
  } else {
    recommendations.push('Le prix est correct mais comparez toujours avec 2-3 devis supplementaires.')
    recommendations.push('Verifiez que le devis inclut bien le nettoyage du chantier et l\'evacuation des gravats.')
    recommendations.push('Demandez les references de chantiers similaires realises par l\'artisan.')
  }

  // Generate top companies
  const companiesData = COMPANIES[category]
  const topCompanies = companiesData.map(c => ({
    name: c.name,
    rating: c.rating,
    avg_price: Math.round(marketMid * c.price_factor),
  }))

  return {
    verdict,
    market_range: { low: adjustedLow, high: adjustedHigh },
    deviation_percent: deviationRounded,
    analysis,
    recommendations,
    top_companies: topCompanies,
  }
}

/* ═══ POST HANDLER ═══ */
export async function POST(req: NextRequest) {
  try {
    // 1. Auth
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non connecte' }, { status: 401 })
    }

    // 2. Parse body
    const body: DevisRequest = await req.json()
    const { description, amount, location, category } = body

    if (!description || !amount || !location || !category) {
      return NextResponse.json(
        { error: 'Champs requis : description, amount, location, category' },
        { status: 400 }
      )
    }

    if (!VALID_CATEGORIES.includes(category)) {
      return NextResponse.json({ error: 'Categorie invalide' }, { status: 400 })
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'Le montant doit etre un nombre positif' }, { status: 400 })
    }

    // 3. Check credits
    const { data: user } = await supabase
      .from('users')
      .select('credits, tickets')
      .eq('id', session.userId)
      .single()

    if (!user || user.credits < 1) {
      return NextResponse.json({ error: 'Pas assez de credits' }, { status: 402 })
    }

    // 4. Analyze
    const result = analyzeDevis(body)

    // 5. Deduct 1 credit, add 1 ticket
    await supabase
      .from('users')
      .update({ credits: user.credits - 1, tickets: user.tickets + 1 })
      .eq('id', session.userId)

    // 6. Log credit usage
    await supabase.from('credit_usage').insert({
      user_id: session.userId,
      action: 'devis_analysis',
    })

    // 7. Log AI task
    await supabase.from('ai_tasks').insert({
      user_id: session.userId,
      type: 'devis_analysis',
      input: { description, amount, location, category },
      output: result,
    })

    // 8. Log activity
    await supabase.from('activity_log').insert({
      user_id: session.userId,
      action: 'devis_analysis',
      details: { category, amount, location },
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Devis analysis error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
