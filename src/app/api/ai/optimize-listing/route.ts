import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth'
import { getAnthropic } from '@/lib/claude'

interface OptimizeBody {
  title: string
  description: string
  listing_type: string
  location: string
  price: number
}

interface OptimizeResult {
  optimized_title: string
  optimized_description: string
  tips: string[]
}

export async function POST(req: NextRequest) {
  try {
    // 1. Auth check
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non connecte' }, { status: 401 })
    }

    // 2. Parse & validate body
    const body: OptimizeBody = await req.json()
    const { title, description, listing_type, location, price } = body

    if (!title || !description || !listing_type || !location) {
      return NextResponse.json(
        { error: 'Champs requis : title, description, listing_type, location' },
        { status: 400 }
      )
    }

    // 3. Credit check & deduction
    const { data: user } = await supabase
      .from('users')
      .select('credits, tickets')
      .eq('id', session.userId)
      .single()

    if (!user || user.credits < 1) {
      return NextResponse.json({ error: 'Pas assez de credits' }, { status: 402 })
    }

    // Deduct 1 credit, add 1 ticket
    await supabase
      .from('users')
      .update({ credits: user.credits - 1, tickets: user.tickets + 1 })
      .eq('id', session.userId)

    // Log credit usage
    await supabase.from('credit_usage').insert({
      user_id: session.userId,
      action: 'optimize_listing',
    })

    // Log activity
    await supabase.from('activity_log').insert({
      user_id: session.userId,
      action: 'optimize_listing',
      details: { title, listing_type, location, price },
    })

    // 4. Call Claude API
    const anthropic = getAnthropic()

    const aiResponse = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: `Tu es un expert en copywriting immobilier francais. Reecris le titre et la description de cette annonce pour maximiser les clics et les reservations. Retourne un JSON strict avec ce format exact :
{
  "optimized_title": "string",
  "optimized_description": "string",
  "tips": ["string", "string", "string"]
}
Le titre optimisé doit être accrocheur et court (max 80 caractères). La description doit être engageante, structurée, et mettre en valeur les points forts. Les tips sont 3 conseils concrets pour améliorer l'annonce. Réponds UNIQUEMENT en JSON valide.`,
      messages: [
        {
          role: 'user',
          content: `Optimise cette annonce immobilière :

Titre : ${title}
Description : ${description}
Type : ${listing_type}
Localisation : ${location}
Prix : ${price ? price + ' €' : 'Non renseigné'}

Reponds uniquement en JSON.`,
        },
      ],
    })

    // 5. Parse AI response
    const textBlock = aiResponse.content.find((b) => b.type === 'text')
    if (!textBlock || textBlock.type !== 'text') {
      return NextResponse.json(
        { error: "L'IA n'a pas pu generer de reponse" },
        { status: 500 }
      )
    }

    let result: OptimizeResult
    try {
      const raw = textBlock.text.replace(/```json?\s*/g, '').replace(/```\s*/g, '').trim()
      result = JSON.parse(raw) as OptimizeResult
    } catch {
      return NextResponse.json(
        { error: 'Erreur de parsing de la reponse IA' },
        { status: 500 }
      )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Optimize listing API error:', error)
    return NextResponse.json(
      { error: "Erreur serveur lors de l'optimisation" },
      { status: 500 }
    )
  }
}
