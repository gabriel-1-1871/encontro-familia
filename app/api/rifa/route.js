import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabasePublico } from '@/lib/supabase'
import { tokenValido, NOME_COOKIE } from '@/lib/auth'

async function requisicaoEhDeAdmin() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(NOME_COOKIE)?.value
    return tokenValido(token)
  } catch {
    return false
  }
}

export async function GET() {
  const ehAdmin = await requisicaoEhDeAdmin()
  const supabase = supabasePublico()

  // Para o público: só número e status (cor do quadradinho).
  // Para o admin logado: também quem comprou, para conseguir conferir
  // pagamento e tirar dúvida de parente por telefone.
  const colunas = ehAdmin ? '*' : 'numero, status'

  const { data, error } = await supabase
    .from('numeros_rifa')
    .select(colunas)
    .order('numero', { ascending: true })

  if (error) {
    return NextResponse.json({ erro: error.message }, { status: 500 })
  }
  return NextResponse.json({ numeros: data, admin: ehAdmin })
}
