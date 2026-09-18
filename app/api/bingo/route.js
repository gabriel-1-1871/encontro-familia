import { NextResponse } from 'next/server'
import { supabasePublico, supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const supabase = supabasePublico()
  const { data, error } = await supabase
    .from('premios_bingo')
    .select('*')
    .order('ordem', { ascending: true })

  if (error) {
    return NextResponse.json({ erro: error.message }, { status: 500 })
  }
  return NextResponse.json({ premios: data })
}

export async function POST(req) {
  const { nome, descricao, imagem_url, ordem } = await req.json()
  if (!nome) {
    return NextResponse.json({ erro: 'Nome do prêmio é obrigatório.' }, { status: 400 })
  }

  const supabase = supabaseAdmin()
  const { data, error } = await supabase
    .from('premios_bingo')
    .insert({ nome, descricao: descricao || null, imagem_url: imagem_url || null, ordem: ordem ?? 0 })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ erro: error.message }, { status: 500 })
  }
  return NextResponse.json({ premio: data })
}
