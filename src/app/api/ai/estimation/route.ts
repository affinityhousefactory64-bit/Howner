import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth'
import { getAnthropic } from '@/lib/claude'

interface EstimationBody {
  address: string
  surface: number
  rooms: number
  type: 'appartement' | 'maison'
  floor?: number
  freeEstimate?: boolean
}

interface DVFMutation {
  code_postal?: string
  valeur_fonciere?: number
  surface_reelle_bati?: number
  type_local?: string
  date_mutation?: string
  adresse_nom_voie?: string
  nombre_pieces_principales?: number
}

interface EstimationResult {
  estimation_low: number
  estimation_high: number
  price_per_m2: number
  trend: 'hausse' | 'stable' | 'baisse'
  confidence: 'haute' | 'moyenne' | 'faible'
  analysis: string
  comparable_sales: { address: string; price: number; surface: number; date: string }[]
}

// Extract postal code from a French address string
function extractPostalCode(address: string): string | null {
  const match = address.match(/\b(\d{5})\b/)
  return match ? match[1] : null
}

// Fetch DVF (Demandes de Valeurs Foncières) data from public API
async function fetchDVFData(
  postalCode: string,
  type: 'appartement' | 'maison'
): Promise<DVFMutation[]> {
  try {
    const typeLocal = type === 'appartement' ? 'Appartement' : 'Maison'
    const url = `https://api.dvf.etalab.gouv.fr/mutations?code_postal=${postalCode}&type_local=${typeLocal}`
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) })

    if (!response.ok) return []

    const data = await response.json()
    // Return the most recent mutations (up to 20)
    const mutations = Array.isArray(data) ? data : data.mutations ?? data.results ?? []
    return mutations.slice(0, 20) as DVFMutation[]
  } catch {
    // DVF API failure is non-blocking
    return []
  }
}

// Build a fallback estimation when the AI call fails
function buildFallbackEstimation(surface: number, type: string): EstimationResult {
  // Very rough French average prices per m2 as of 2024
  const avgPriceM2 = type === 'appartement' ? 3500 : 2800
  const mid = surface * avgPriceM2
  return {
    estimation_low: Math.round(mid * 0.85),
    estimation_high: Math.round(mid * 1.15),
    price_per_m2: avgPriceM2,
    trend: 'stable',
    confidence: 'faible',
    analysis:
      "Estimation approximative basée sur les moyennes nationales. Aucune donnée DVF locale n'a pu être récupérée et l'analyse IA n'a pas abouti. Consultez un professionnel pour une estimation fiable.",
    comparable_sales: [],
  }
}

export async function POST(req: NextRequest) {
  try {
    // 1. Auth check
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non connecté' }, { status: 401 })
    }

    // 2. Parse & validate body
    const body: EstimationBody = await req.json()
    const { address, surface, rooms, type, floor, freeEstimate } = body

    if (!address || !surface || !rooms || !type) {
      return NextResponse.json(
        { error: 'Champs requis : address, surface, rooms, type' },
        { status: 400 }
      )
    }

    if (!['appartement', 'maison'].includes(type)) {
      return NextResponse.json(
        { error: 'Type doit être "appartement" ou "maison"' },
        { status: 400 }
      )
    }

    // 3. Credit check & deduction (skip if freeEstimate)
    if (!freeEstimate) {
      const { data: user } = await supabase
        .from('users')
        .select('credits, tickets')
        .eq('id', session.userId)
        .single()

      if (!user || user.credits < 1) {
        return NextResponse.json({ error: 'Pas assez de crédits' }, { status: 402 })
      }

      // Deduct 1 credit, add 1 ticket
      await supabase
        .from('users')
        .update({ credits: user.credits - 1, tickets: user.tickets + 1 })
        .eq('id', session.userId)

      // Log credit usage
      await supabase.from('credit_usage').insert({
        user_id: session.userId,
        action: 'estimation',
      })

      // Log activity
      await supabase.from('activity_log').insert({
        user_id: session.userId,
        action: 'estimation',
        details: { address, surface, rooms, type },
      })
    }

    // 4. Fetch DVF data
    const postalCode = extractPostalCode(address)
    let dvfData: DVFMutation[] = []
    if (postalCode) {
      dvfData = await fetchDVFData(postalCode, type)
    }

    // 5. Build DVF context for the prompt
    let dvfContext = ''
    if (dvfData.length > 0) {
      const sales = dvfData
        .filter((m) => m.valeur_fonciere && m.surface_reelle_bati)
        .map(
          (m) =>
            `- ${m.adresse_nom_voie || 'Adresse inconnue'}: ${m.valeur_fonciere}€, ${m.surface_reelle_bati}m², ${m.nombre_pieces_principales || '?'} pièces, ${m.date_mutation || 'date inconnue'}`
        )
        .join('\n')
      if (sales) {
        dvfContext = `\n\nVentes récentes DVF dans le secteur (code postal ${postalCode}):\n${sales}`
      }
    }

    // 6. Call Claude API
    const anthropic = getAnthropic()
    const propertyDesc = [
      `Adresse : ${address}`,
      `Type : ${type}`,
      `Surface : ${surface} m²`,
      `Nombre de pièces : ${rooms}`,
      floor !== undefined ? `Étage : ${floor}` : null,
    ]
      .filter(Boolean)
      .join('\n')

    const aiResponse = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: `Tu es un expert en estimation immobilière en France. Tu analyses les données de marché (DVF - Demandes de Valeurs Foncières) et les caractéristiques du bien pour fournir une estimation de prix réaliste. Réponds UNIQUEMENT en JSON valide, sans texte avant ou après. Le JSON doit respecter exactement ce format :
{
  "estimation_low": number,
  "estimation_high": number,
  "price_per_m2": number,
  "trend": "hausse" | "stable" | "baisse",
  "confidence": "haute" | "moyenne" | "faible",
  "analysis": "string avec 2-3 phrases expliquant l'estimation",
  "comparable_sales": [{ "address": "", "price": 0, "surface": 0, "date": "" }]
}
Si tu n'as pas de données DVF, base-toi sur ta connaissance des prix immobiliers français et indique une confidence "faible". Les prix doivent être en euros.`,
      messages: [
        {
          role: 'user',
          content: `Estime le prix de ce bien immobilier :\n\n${propertyDesc}${dvfContext}\n\nRéponds uniquement en JSON.`,
        },
      ],
    })

    // 7. Parse AI response
    const textBlock = aiResponse.content.find((b) => b.type === 'text')
    if (!textBlock || textBlock.type !== 'text') {
      return NextResponse.json(buildFallbackEstimation(surface, type))
    }

    let estimation: EstimationResult
    try {
      // Strip potential markdown code fences
      const raw = textBlock.text.replace(/```json?\s*/g, '').replace(/```\s*/g, '').trim()
      estimation = JSON.parse(raw) as EstimationResult
    } catch {
      // JSON parse failed — return fallback
      return NextResponse.json(buildFallbackEstimation(surface, type))
    }

    return NextResponse.json(estimation)
  } catch (error) {
    console.error('Estimation API error:', error)
    // Return fallback instead of raw 500
    return NextResponse.json(
      {
        error: 'Erreur serveur lors de l\'estimation',
        fallback: buildFallbackEstimation(
          (typeof (error as Record<string, unknown>)?.surface === 'number'
            ? (error as Record<string, unknown>).surface
            : 50) as number,
          'appartement'
        ),
      },
      { status: 500 }
    )
  }
}
