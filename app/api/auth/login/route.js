import { NextResponse } from 'next/server'
import { gerarTokenSessao, senhaCorreta, NOME_COOKIE, VALIDADE_MS } from '@/lib/auth'

export async function POST(req) {
  const { senha } = await req.json()

  if (!senhaCorreta(senha)) {
    return NextResponse.json({ erro: 'Senha incorreta.' }, { status: 401 })
  }

  const token = gerarTokenSessao()
  const res = NextResponse.json({ ok: true })
  res.cookies.set(NOME_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: VALIDADE_MS / 1000,
  })
  return res
}
