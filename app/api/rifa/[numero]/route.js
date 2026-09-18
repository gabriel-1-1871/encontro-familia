import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function PATCH(req, { params }) {
  const { numero: numeroParam } = await params

  const numero = Number(numeroParam)

  const {
    status,
    comprador_nome,
    comprador_telefone,
  } = await req.json()

  // Impede que NaN, números decimais ou números inválidos
  // sejam enviados para a coluna INTEGER do Supabase.
  if (!Number.isInteger(numero) || numero < 1) {
    return NextResponse.json(
      { erro: 'Número da rifa inválido.' },
      { status: 400 }
    )
  }

  if (!['livre', 'vendido'].includes(status)) {
    return NextResponse.json(
      { erro: 'Status inválido.' },
      { status: 400 }
    )
  }

  const supabase = supabaseAdmin()

  // Só altera o número se ele ainda estiver no estado esperado.
  // Isso evita que duas pessoas vendam o mesmo número ao mesmo tempo.
  const statusEsperadoAntes =
    status === 'vendido' ? 'livre' : 'vendido'

  const { data, error } = await supabase
    .from('numeros_rifa')
    .update({
      status,
      comprador_nome:
        status === 'vendido'
          ? comprador_nome || null
          : null,

      comprador_telefone:
        status === 'vendido'
          ? comprador_telefone || null
          : null,

      atualizado_em: new Date().toISOString(),
    })
    .eq('numero', numero)
    .eq('status', statusEsperadoAntes)
    .select()
    .maybeSingle()

  if (error) {
    return NextResponse.json(
      { erro: error.message },
      { status: 500 }
    )
  }

  if (!data) {
    return NextResponse.json(
      {
        erro:
          'Esse número já foi alterado por outra pessoa. Atualize a página.',
      },
      { status: 409 }
    )
  }

  return NextResponse.json({
    numero: data,
  })
}