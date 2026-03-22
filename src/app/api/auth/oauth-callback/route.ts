import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { createSession } from '@/lib/auth'

function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export async function POST(req: NextRequest) {
  try {
    const { email, phone, name, avatar_url, auth_provider, referralCode, supabase_uid } = await req.json()

    if (!email && !phone) {
      return NextResponse.json({ error: 'Email ou telephone requis' }, { status: 400 })
    }

    // Check if user already exists (by email or phone)
    let existingUser = null
    if (email) {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()
      existingUser = data
    }
    if (!existingUser && phone) {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('phone', phone)
        .single()
      existingUser = data
    }

    if (existingUser) {
      // Update avatar and auth provider if missing
      const updates: Record<string, string> = {}
      if (!existingUser.avatar_url && avatar_url) updates.avatar_url = avatar_url
      if (!existingUser.auth_provider && auth_provider) updates.auth_provider = auth_provider
      if (supabase_uid && !existingUser.supabase_uid) updates.supabase_uid = supabase_uid

      if (Object.keys(updates).length > 0) {
        await supabase.from('users').update(updates).eq('id', existingUser.id)
      }

      await createSession(existingUser.id)
      return NextResponse.json({ user: existingUser, isNew: false })
    }

    // Handle referral
    let referredBy: string | null = null
    if (referralCode) {
      const { data: referrer } = await supabase
        .from('users')
        .select('id, tickets')
        .eq('referral_code', referralCode)
        .single()

      if (referrer) {
        referredBy = referrer.id
        await supabase
          .from('users')
          .update({ tickets: referrer.tickets + 1 })
          .eq('id', referrer.id)

        try {
          await supabase.from('activity_log').insert({
            user_id: referrer.id,
            action: 'referral',
            details: { bonus: '1 ticket' },
          })
        } catch { /* ignore */ }
      }
    }

    // Create new user
    const newReferralCode = generateReferralCode()
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        phone: phone || '',
        email: email || null,
        name: name || '',
        type: 'particulier',
        pro_category: null,
        avatar_url: avatar_url || null,
        auth_provider: auth_provider || null,
        supabase_uid: supabase_uid || null,
        credits: 0,
        tickets: 1,
        free_listing_used: false,
        referral_code: newReferralCode,
        referred_by: referredBy,
      })
      .select()
      .single()

    if (error) {
      console.error('User creation error:', error)
      return NextResponse.json({ error: 'Erreur création compte' }, { status: 500 })
    }

    // Log activity
    try {
      await supabase.from('activity_log').insert({
        user_id: newUser.id,
        action: 'signup',
        details: { name: name || 'Anonyme', provider: auth_provider },
      })
    } catch { /* ignore */ }

    await createSession(newUser.id)
    return NextResponse.json({ user: newUser, isNew: true })
  } catch (error) {
    console.error('OAuth callback error:', error)
    return NextResponse.json({ error: 'Erreur d\'authentification' }, { status: 500 })
  }
}
