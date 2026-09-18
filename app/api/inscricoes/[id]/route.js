import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function PATCH(req, { params }) {
  const { id } = await params
  const { status } = await req.json()

  if (!['pendente', 'pago'].includes(status)) {
    return NextResponse.json(
      { erro: 'Status inválido.' },
      { status: 400 }
    )
  }

  const supabase = supabaseAdmin()

  const { data, error } = await supabase
    .from('inscricoes')
    .update({ status })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json(
      { erro: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json({ inscricao: data })
}

export async function DELETE(req, { params }) {
  const { id } = await params

  const supabase = supabaseAdmin()

  const { error } = await supabase
    .from('inscricoes')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json(
      { erro: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json({ ok: true })
}