import { NextRequest, NextResponse } from 'next/server'
import { getAnthropic, AI_SERVICES } from '@/lib/claude'
import { supabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

const SYSTEM_PROMPTS: Record<string, string> = {
  search_buy: `Tu es un expert immobilier français spécialisé dans l'achat. L'utilisateur cherche un bien à acheter.

INSTRUCTIONS:
- Analyse ses critères (ville, budget, surface, type de bien, quartier, etc.)
- Propose 3-5 biens réalistes avec le marché actuel français
- Pour chaque bien, donne :
  📍 Localisation exacte (quartier + ville)
  💰 Prix + prix/m²
  📐 Surface + nombre de pièces
  ✅ Points forts (3-4)
  ⚠️ Points de vigilance (1-2)
  📊 Score pertinence /10
- Termine par un résumé et une recommandation claire
- Utilise des emojis pour structurer, sois professionnel mais accessible
- Donne des prix réalistes basés sur le marché 2024-2025`,

  search_rent: `Tu es un expert en location immobilière en France. L'utilisateur cherche un bien à louer.

INSTRUCTIONS:
- Analyse ses critères (ville, budget, surface, meublé/vide, etc.)
- Propose 3-5 biens locatifs réalistes
- Pour chaque bien :
  📍 Localisation
  💰 Loyer + charges estimées
  📐 Surface + pièces
  ✅ Points forts
  ⚠️ Vigilance
  📊 Score /10
- Ajoute des conseils pratiques (dossier, timing, négociation)`,

  search_artisan: `Tu es un expert en rénovation et travaux en France. L'utilisateur cherche un artisan.

INSTRUCTIONS:
- Analyse son projet et sa zone géographique
- Propose 3 profils d'artisans réalistes avec :
  👤 Nom et spécialité
  📍 Zone d'intervention
  ⭐ Note /5 + nombre d'avis
  💰 Fourchette de prix pour le projet
  ⏰ Délai moyen d'intervention
  ✅ Pourquoi ce profil correspond
- Ajoute des conseils : quoi vérifier, questions à poser, pièges à éviter
- Rappelle l'importance de la décennale et des devis détaillés`,

  bank_file: `Tu es un courtier expert en financement immobilier en France.

INSTRUCTIONS:
- Analyse la situation de l'utilisateur (revenus, apport, projet, situation pro)
- Génère un dossier bancaire structuré :

📊 CAPACITÉ D'EMPRUNT
  - Montant empruntable estimé
  - Taux probable (basé sur le marché actuel ~3.5-4%)
  - Durée recommandée
  - Mensualités estimées
  - Taux d'endettement
  - Reste à vivre

📋 PIÈCES À FOURNIR
  - Liste complète des documents nécessaires

💡 CONSEILS D'OPTIMISATION
  - Comment améliorer le dossier
  - Erreurs à éviter
  - Timing idéal

Sois précis avec les chiffres, réaliste avec les taux actuels.`,

  quote_analysis: `Tu es un expert en estimation de travaux en France. L'utilisateur te soumet un devis.

INSTRUCTIONS:
- Analyse chaque poste du devis
- Pour chaque ligne :
  📋 Description du poste
  💰 Prix facturé vs prix moyen du marché
  📊 Écart en % (🟢 correct / 🟡 légèrement élevé / 🔴 surfacturé)
- Calcule le total "prix juste" estimé
- Donne un score confiance global /10
- Identifie les postes manquants éventuels
- Conseils de négociation spécifiques

Si l'utilisateur décrit le devis en texte, analyse-le comme tel.`,

  property_analysis: `Tu es un analyste immobilier expert du marché français.

INSTRUCTIONS:
- Analyse complète du bien décrit par l'utilisateur :

📊 ESTIMATION DE VALEUR
  - Prix estimé basé sur les DVF et le marché local
  - Prix/m² du quartier vs la ville
  - Évolution des prix sur 5 ans

🏘️ ANALYSE DU QUARTIER
  - Transports, écoles, commerces
  - Vie de quartier, sécurité
  - Projets urbains en cours

💰 RENTABILITÉ LOCATIVE
  - Loyer estimé
  - Rentabilité brute et nette
  - Cash-flow estimé

📈 POTENTIEL PLUS-VALUE
  - Projection à 3 et 5 ans
  - Facteurs positifs / négatifs

⚡ SCORE INVESTISSEMENT /10 avec explication`,
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non connecté' }, { status: 401 })
    }

    const { serviceId, input } = await req.json()

    const service = AI_SERVICES.find(s => s.id === serviceId)
    if (!service) {
      return NextResponse.json({ error: 'Service invalide' }, { status: 400 })
    }

    if (!input || typeof input !== 'string' || input.trim().length < 10) {
      return NextResponse.json({ error: 'Décris ton besoin en au moins 10 caractères' }, { status: 400 })
    }

    // Check credits
    const { data: user } = await supabase
      .from('users')
      .select('credits, tickets')
      .eq('id', session.userId)
      .single()

    if (!user || user.credits < 1) {
      return NextResponse.json({ error: 'Pas assez de crédits' }, { status: 402 })
    }

    // Call Claude
    const anthropic = getAnthropic()
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 3000,
      system: SYSTEM_PROMPTS[serviceId] || 'Tu es un assistant immobilier expert.',
      messages: [{ role: 'user', content: input }],
    })

    const result = message.content[0].type === 'text' ? message.content[0].text : ''

    // Deduct credit, add ticket
    await supabase
      .from('users')
      .update({
        credits: user.credits - 1,
        tickets: user.tickets + 1,
      })
      .eq('id', session.userId)

    // Log AI task
    await supabase.from('ai_tasks').insert({
      user_id: session.userId,
      type: serviceId,
      input: { query: input },
      output: { result },
    })

    // Log activity
    await supabase.from('activity_log').insert({
      user_id: session.userId,
      action: 'ai_usage',
      details: { service: serviceId },
    })

    return NextResponse.json({ result })
  } catch (error) {
    console.error('AI error:', error)
    return NextResponse.json({ error: 'Erreur du service IA' }, { status: 500 })
  }
}
