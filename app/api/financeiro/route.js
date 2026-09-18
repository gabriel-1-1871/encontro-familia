import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// Esta rota inteira (GET incluso) é protegida pelo middleware — só
// quem está logado como admin chega até aqui. Por isso usamos sempre
// o cliente admin: a tabela "contribuicoes" nem tem policy de leitura
// pública no banco (ver supabase-schema.sql), então nem faria sentido
// tentar ler com o cliente público.

export async function GET() {
  const supabase = supabaseAdmin()
  const { data, error } = await supabase
    .from('contribuicoes')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ erro: error.message }, { status: 500 })
  }

  const saldo = data.reduce((soma, item) => soma + Number(item.valor), 0)
  return NextResponse.json({ contribuicoes: data, saldo })
}

export async function POST(req) {
  const { nome, valor, descricao } = await req.json()

  if (!nome || valor === undefined || valor === null || isNaN(Number(valor))) {
    return NextResponse.json({ erro: 'Nome e valor são obrigatórios.' }, { status: 400 })
  }

  const supabase = supabaseAdmin()
  const { data, error } = await supabase
    .from('contribuicoes')
    .insert({ nome, valor: Number(valor), descricao: descricao || null })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ erro: error.message }, { status: 500 })
  }
  return NextResponse.json({ contribuicao: data })
}
