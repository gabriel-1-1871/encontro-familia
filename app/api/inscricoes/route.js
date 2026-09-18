import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabasePublico, supabaseAdmin } from '@/lib/supabase'
import { tokenValido, NOME_COOKIE } from '@/lib/auth'
import { gerarPayloadPix, gerarCodigoInscricao } from '@/lib/pix'

async function requisicaoEhDeAdmin() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(NOME_COOKIE)?.value
    return tokenValido(token)
  } catch {
    return false
  }
}

// Listagem completa (com telefone e status) — só admin. Protegido
// também pelo middleware, esta checagem aqui é uma segunda camada.
export async function GET() {
  const ehAdmin = await requisicaoEhDeAdmin()
  if (!ehAdmin) {
    return NextResponse.json({ erro: 'Não autorizado.' }, { status: 401 })
  }

  const supabase = supabaseAdmin()
  const { data, error } = await supabase
    .from('inscricoes')
    .select('*')
    .order('criado_em', { ascending: false })

  if (error) {
    return NextResponse.json({ erro: error.message }, { status: 500 })
  }
  return NextResponse.json({ inscricoes: data })
}

export async function POST(req) {
  const { nome, telefone, quantidade_pessoas, observacao } = await req.json()

  if (!nome || !quantidade_pessoas || Number(quantidade_pessoas) < 1) {
    return NextResponse.json(
      { erro: 'Informe seu nome e a quantidade de pessoas (mínimo 1).' },
      { status: 400 }
    )
  }

  const supabaseAd = supabaseAdmin()

  const { data: config, error: erroConfig } = await supabaseAd
    .from('configuracoes')
    .select('inscricao_valor_por_pessoa, pix_chave, pix_nome_recebedor, pix_cidade')
    .eq('id', 1)
    .single()

  if (erroConfig) {
    return NextResponse.json({ erro: erroConfig.message }, { status: 500 })
  }

  const valorPorPessoa = Number(config.inscricao_valor_por_pessoa || 0)
  const valorTotal = valorPorPessoa * Number(quantidade_pessoas)

  // Gera um código único, tentando de novo em caso de colisão rara
  let codigo = gerarCodigoInscricao()
  for (let tentativas = 0; tentativas < 5; tentativas++) {
    const { data: existente } = await supabaseAd
      .from('inscricoes')
      .select('id')
      .eq('codigo', codigo)
      .maybeSingle()
    if (!existente) break
    codigo = gerarCodigoInscricao()
  }

  const { data: inscricao, error } = await supabaseAd
    .from('inscricoes')
    .insert({
      codigo,
      nome,
      telefone: telefone || null,
      quantidade_pessoas: Number(quantidade_pessoas),
      valor_total: valorTotal,
      observacao: observacao || null,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ erro: error.message }, { status: 500 })
  }

  // Só gera o payload do PIX se o organizador já configurou a chave.
  // Sem isso, a inscrição é salva do mesmo jeito — só não mostra QR Code.
  let pixPayload = null
  if (config.pix_chave && valorTotal > 0) {
    pixPayload = gerarPayloadPix({
      chave: config.pix_chave,
      nomeRecebedor: config.pix_nome_recebedor || 'Encontro de Familia',
      cidade: config.pix_cidade || 'Brasil',
      valor: valorTotal,
      identificador: inscricao.codigo,
    })
  }

  return NextResponse.json({ inscricao, pixPayload })
}
