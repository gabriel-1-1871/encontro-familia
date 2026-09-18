import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function DELETE(req, { params }) {
  const { id } = await params

  const supabase = supabaseAdmin()

  const { error } = await supabase
    .from('fotos')
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