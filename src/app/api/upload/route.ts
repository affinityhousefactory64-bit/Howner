// Supabase Storage bucket setup — run once in Supabase SQL Editor:
// INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true);

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic']
const VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm']
const ALLOWED_TYPES = [...PHOTO_TYPES, ...VIDEO_TYPES]

const MAX_PHOTO_SIZE = 5 * 1024 * 1024 // 5 MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024 // 50 MB

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non connecté' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const listingId = (formData.get('listingId') as string) || 'profile'

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 })
    }

    // Validate type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Type de fichier non autorisé. Utilisez JPG, PNG, WebP, HEIC, MP4, MOV ou WebM.' },
        { status: 400 },
      )
    }

    // Validate size
    const isVideo = VIDEO_TYPES.includes(file.type)
    const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_PHOTO_SIZE
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `Fichier trop volumineux. Maximum ${isVideo ? '50' : '5'} Mo.` },
        { status: 400 },
      )
    }

    // Build storage path
    const ext = file.name.split('.').pop()?.toLowerCase() || 'bin'
    const timestamp = Date.now()
    const safeName = file.name
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .substring(0, 80)
    const storagePath = `${session.userId}/${listingId}/${timestamp}-${safeName}`

    // Convert File to Buffer for upload
    const buffer = Buffer.from(await file.arrayBuffer())

    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: 'Erreur lors de l\'upload' }, { status: 500 })
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('media')
      .getPublicUrl(storagePath)

    return NextResponse.json({ url: publicUrlData.publicUrl })
  } catch (error) {
    console.error('Upload route error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
