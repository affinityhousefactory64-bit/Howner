import { NextRequest, NextResponse } from 'next/server'
import { getAnthropic, AI_SERVICES } from '@/lib/claude'
import { supabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

const SYSTEM_PROMPTS: Record<string, string> = {
  search_buy: `Tu es un expert immobilier français. L'utilisateur cherche un bien à acheter. Analyse ses critères (ville, budget, surface, type de bien) et propose 3-5 biens fictifs mais réalistes avec : titre, localisation, prix, surface, nombre de pièces, points forts, points faibles, et un score de pertinence /10. Utilise des données réalistes du marché français.`,
  search_rent: `Tu es un expert en location immobilière en France. L'utilisateur cherche un bien à louer. Analyse ses critères et propose 3-5 biens locatifs réalistes avec : titre, localisation, loyer mensuel, surface, charges estimées, points forts, et un score /10.`,
  search_artisan: `Tu es un expert en rénovation et travaux en France. L'utilisateur cherche un artisan. Analyse son projet et sa zone, puis propose 3 profils d'artisans fictifs mais réalistes avec : nom, spécialité, zone d'intervention, note /5, nombre d'avis, fourchette de prix, délai moyen, et pourquoi il correspond au projet.`,
  bank_file: `Tu es un courtier expert en financement immobilier en France. L'utilisateur veut monter un dossier bancaire. Analyse sa situation (revenus, apport, projet) et génère un dossier complet avec : capacité d'emprunt estimée, taux probable, durée recommandée, mensualités, reste à vivre, taux d'endettement, et les pièces à fournir. Ajoute des conseils pour optimiser le dossier.`,
  quote_analysis: `Tu es un expert en estimation de travaux en France. L'utilisateur te donne un devis d'artisan. Analyse chaque poste : compare au prix moyen du marché, signale les postes trop chers ou sous-estimés, calcule un total "prix juste", et donne un avis global avec un score confiance /10.`,
  property_analysis: `Tu es un analyste immobilier expert du marché français. L'utilisateur te donne les infos d'un bien. Fournis : estimation de valeur (basée sur les DVF), analyse du quartier (transports, écoles, commerces), rentabilité locative brute et nette estimée, potentiel de plus-value à 5 ans, points de vigilance. Donne un score investissement /10.`,
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non connecté' }, { status: 401 })
    }

    const { serviceId, input } = await req.json()

    // Validate service
    const service = AI_SERVICES.find((s) => s.id === serviceId)
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
      max_tokens: 2000,
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

    return NextResponse.json({ result })
  } catch (error) {
    console.error('AI error:', error)
    return NextResponse.json({ error: 'Erreur du service IA' }, { status: 500 })
  }
}
