//app/api/config/route.js
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// Usamos o cliente admin também para o GET (não só o PUT). Isso é uma
// rota de servidor, então a service role key nunca chega no navegador
// de qualquer forma — e isso nos permite AUTO-CRIAR a linha de
// configuração se ela ainda não existir, em vez de simplesmente falhar.
//
// Antes, se a linha com id=1 não existisse em "configuracoes" (ex:
// alguém rodou uma versão antiga do supabase-schema.sql, ou a linha foi
// apagada sem querer), o GET usava .single() — que dá erro quando não
// encontra nada — e a tela de Configurações ficava travada em
// "Carregando…" pra sempre, sem avisar por quê. O PUT tinha o mesmo
// problema: .update().eq('id', 1) não altera nenhuma linha se ela não
// existe, e o .single() seguinte também falhava — só que o botão
// "Salvar" não checava isso, então parecia que "não dava em nada".

async function garantirLinhaDeConfig(supabase) {
  const { data, error } = await supabase.from('configuracoes').select('*').eq('id', 1).maybeSingle()

  if (error) throw error
  if (data) return data

  // Linha não existe ainda — cria com valores em branco em vez de
  // quebrar. Isso também cobre o caso de o script SQL ter sido rodado
  // antes de a linha padrão existir.
  const { data: novaLinha, error: erroInsercao } = await supabase
    .from('configuracoes')
    .insert({ id: 1 })
    .select()
    .single()

  if (erroInsercao) throw erroInsercao
  return novaLinha
}

export async function GET() {
  try {
    const supabase = supabaseAdmin()
    const config = await garantirLinhaDeConfig(supabase)
    return NextResponse.json({ config })
  } catch (error) {
    return NextResponse.json(
      {
        erro:
          'Não foi possível carregar as configurações. Confirme que a tabela "configuracoes" existe no Supabase (rode o supabase-schema.sql atualizado). Detalhe técnico: ' +
          error.message,
      },
      { status: 500 }
    )
  }
}

export async function PUT(req) {
  const dados = await req.json()

  // Lista branca de colunas editáveis — evita que um payload malicioso
  // tente sobrescrever colunas fora do esperado.
  const camposPermitidos = [
    'data_evento',
    'data_fim',
    'endereco_chacara',
    'mapa_embed_url',
    'imagem_mapa_url',
    'pix_chave',
    'pix_nome_recebedor',
    'pix_cidade',
    'bingo_preco_cartela',
    'bingo_descricao',
    'rifa_preco_numero',
    'inscricao_valor_por_pessoa',
  ]

  const atualizacao = { id: 1 }
  for (const campo of camposPermitidos) {
    if (campo in dados) atualizacao[campo] = dados[campo]
  }

  try {
    const supabase = supabaseAdmin()

    // upsert em vez de update: se a linha id=1 já existe, atualiza; se
    // não existe (por qualquer motivo), CRIA com esses valores — nunca
    // falha silenciosamente só porque a linha ainda não tinha sido
    // criada.
    const { data, error } = await supabase
      .from('configuracoes')
      .upsert(atualizacao, { onConflict: 'id' })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ config: data })
  } catch (error) {
    return NextResponse.json(
      { erro: 'Não foi possível salvar. Detalhe técnico: ' + error.message },
      { status: 500 }
    )
  }
}
