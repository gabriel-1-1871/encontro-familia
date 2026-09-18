import { NextResponse } from 'next/server'
import { supabasePublico, supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const supabase = supabasePublico()
  const { data, error } = await supabase
    .from('fotos')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ erro: error.message }, { status: 500 })
  }
  return NextResponse.json({ fotos: data })
}

export async function POST(req) {
  const { url, legenda } = await req.json()
  if (!url) {
    return NextResponse.json({ erro: 'URL da foto é obrigatória.' }, { status: 400 })
  }

  const supabase = supabaseAdmin()
  const { data, error } = await supabase
    .from('fotos')
    .insert({ url, legenda: legenda || null })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ erro: error.message }, { status: 500 })
  }
  return NextResponse.json({ foto: data })
}
