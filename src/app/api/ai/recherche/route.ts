import { NextRequest, NextResponse } from 'next/server'

// MVP: Generate realistic mock results based on query analysis
// In V2: integrate real estate APIs (DVF, data.gouv, etc.)

function parseQuery(query: string) {
  const q = query.toLowerCase()
  const isRent = q.includes('louer') || q.includes('location') || q.includes('€/mois') || q.includes('mois')
  const isSeasonal = q.includes('saisonni') || q.includes('juillet') || q.includes('août') || q.includes('semaine') || q.includes('vacances')
  const isBuy = q.includes('achat') || q.includes('acheter') || q.includes('vente') || !isRent

  // Extract location
  const cities = ['bayonne', 'biarritz', 'anglet', 'pau', 'boucau', 'hendaye', 'saint-jean-de-luz', 'bordeaux', 'toulouse', 'paris', 'lyon', 'marseille']
  const location = cities.find(c => q.includes(c)) || 'Pays Basque'

  // Extract property type
  const types = [
    { key: 'studio', label: 'Studio' },
    { key: 't2', label: 'T2' },
    { key: 't3', label: 'T3' },
    { key: 't4', label: 'T4' },
    { key: 'maison', label: 'Maison' },
    { key: 'villa', label: 'Villa' },
    { key: 'terrain', label: 'Terrain' },
    { key: 'appartement', label: 'Appartement' },
  ]
  const propertyType = types.find(t => q.includes(t.key))?.label || 'Bien'

  return { isRent, isSeasonal, isBuy, location, propertyType }
}

function generateResults(query: string) {
  const { isRent, isSeasonal, location, propertyType } = parseQuery(query)
  const loc = location.charAt(0).toUpperCase() + location.slice(1)

  if (isSeasonal) {
    return [
      { title: `${propertyType} vue mer — ${loc}`, price: '890€/sem', location: loc, surface: '45m² · 2 pièces', source: 'Airbnb', score: 9, highlight: 'Annulation gratuite · Wifi · Parking' },
      { title: `Appartement centre-ville — ${loc}`, price: '720€/sem', location: loc, surface: '38m² · 2 pièces', source: 'Booking', score: 8, highlight: 'Plage à 200m · Climatisation' },
      { title: `Studio cosy rénové — ${loc}`, price: '560€/sem', location: loc, surface: '25m² · 1 pièce', source: 'Abritel', score: 8, highlight: 'Rénové 2024 · Terrasse' },
      { title: `Maison avec jardin — ${loc}`, price: '1 450€/sem', location: `${loc} périphérie`, surface: '85m² · 4 pièces', source: 'Airbnb', score: 7, highlight: 'Jardin 200m² · BBQ · 4 couchages' },
      { title: `T2 plein centre — ${loc}`, price: '650€/sem', location: `${loc} centre`, surface: '35m² · 2 pièces', source: 'PAP Vacances', score: 7, highlight: 'Commerces à pied · Balcon' },
    ]
  }

  if (isRent) {
    return [
      { title: `${propertyType} lumineux rénové — ${loc}`, price: '720€/mois', location: loc, surface: '55m² · 3 pièces', source: 'LeBonCoin', score: 9, highlight: 'DPE B · Parking inclus · Libre immédiatement' },
      { title: `${propertyType} centre historique — ${loc}`, price: '680€/mois', location: `${loc} centre`, surface: '48m² · 2 pièces', source: 'SeLoger', score: 8, highlight: 'Charme · Poutres · Cave' },
      { title: `${propertyType} neuf avec terrasse — ${loc}`, price: '850€/mois', location: `${loc} sud`, surface: '62m² · 3 pièces', source: 'PAP', score: 8, highlight: 'Neuf 2024 · Terrasse 12m² · DPE A' },
      { title: `${propertyType} meublé — ${loc}`, price: '750€/mois', location: loc, surface: '42m² · 2 pièces', source: 'LeBonCoin', score: 7, highlight: 'Meublé · Cuisine équipée · Wifi' },
      { title: `${propertyType} résidence calme — ${loc}`, price: '620€/mois', location: `${loc} nord`, surface: '45m² · 2 pièces', source: 'SeLoger', score: 7, highlight: 'Résidence sécurisée · Digicode · Gardien' },
      { title: `${propertyType} avec garage — ${loc}`, price: '790€/mois', location: loc, surface: '58m² · 3 pièces', source: 'Bien\'ici', score: 6, highlight: 'Garage fermé · Balcon · Ascenseur' },
    ]
  }

  // Buy
  return [
    { title: `${propertyType} avec vue — ${loc}`, price: '285 000€', location: loc, surface: '75m² · 4 pièces', source: 'SeLoger', score: 9, highlight: 'Vue dégagée · Lumineux · Bon DPE' },
    { title: `${propertyType} rénové centre — ${loc}`, price: '315 000€', location: `${loc} centre`, surface: '82m² · 4 pièces', source: 'LeBonCoin', score: 8, highlight: 'Rénové 2023 · Parquet · Cave' },
    { title: `${propertyType} neuf — ${loc}`, price: '342 000€', location: `${loc} sud`, surface: '70m² · 3 pièces', source: 'PAP', score: 8, highlight: 'VEFA · Livraison 2025 · DPE A · Parking' },
    { title: `${propertyType} à rénover — ${loc}`, price: '195 000€', location: loc, surface: '65m² · 3 pièces', source: 'LeBonCoin', score: 7, highlight: 'Prix bas · Potentiel rénovation · Quartier calme' },
    { title: `${propertyType} avec terrasse — ${loc}`, price: '358 000€', location: `${loc} plages`, surface: '88m² · 4 pièces', source: 'SeLoger', score: 7, highlight: 'Terrasse 20m² · Dernier étage · Ascenseur' },
    { title: `${propertyType} investisseur — ${loc}`, price: '165 000€', location: `${loc} périphérie`, surface: '40m² · 2 pièces', source: 'Bien\'ici', score: 6, highlight: 'Idéal investissement · Loué 650€/mois · Rentabilité 4.7%' },
  ]
}

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json()

    if (!query || query.trim().length < 3) {
      return NextResponse.json({ error: 'Décrivez ce que vous recherchez (minimum 3 caractères)' }, { status: 400 })
    }

    // TODO: Check auth + credits in production
    // For MVP: return results directly

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500))

    const results = generateResults(query)

    return NextResponse.json({ results, credits_used: 1, ticket_earned: 1 })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
