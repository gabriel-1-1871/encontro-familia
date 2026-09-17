import { NextResponse } from 'next/server'

const NOME_COOKIE = 'encontro_admin_sessao'

// O middleware roda no Edge Runtime, que não tem o módulo 'crypto' do
// Node — usamos o Web Crypto global (crypto.subtle) para refazer a
// verificação de assinatura do cookie aqui.
async function tokenValido(token, segredo) {
  if (!token || !token.includes('.')) return false
  const [base, assinatura] = token.split('.')
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(segredo),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const buf = await crypto.subtle.sign('HMAC', key, encoder.encode(base))
  const esperada = Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  if (esperada !== assinatura) return false
  const expira = Number(base)
  return Number.isFinite(expira) && Date.now() < expira
}

// Rotas de PÁGINA que exigem login de admin (não só API)
const PAGINAS_ADMIN = ['/admin/dashboard', '/financeiro']

// Rotas de API que são de LEITURA pública mesmo com o restante protegido
const API_LEITURA_PUBLICA = [
  '/api/bingo',
  '/api/rifa',
  '/api/config',
]

export async function proxy(req) {
  const { pathname } = req.nextUrl

  const ehPaginaAdmin = PAGINAS_ADMIN.some((rota) => pathname.startsWith(rota))

  const ehApiFinanceiroLeitura = pathname.startsWith('/api/financeiro') && req.method === 'GET'
  const ehApiInscricoesLeitura = pathname === '/api/inscricoes' && req.method === 'GET'
  const ehApiInscricoesCriacao = pathname === '/api/inscricoes' && req.method === 'POST'

  const ehApiLeituraPublicaLivre =
    API_LEITURA_PUBLICA.some((rota) => pathname.startsWith(rota)) && req.method === 'GET'

  const protegeApiEscrita =
    (pathname.startsWith('/api/fotos') ||
      pathname.startsWith('/api/financeiro') ||
      pathname.startsWith('/api/upload') ||
      pathname.startsWith('/api/bingo') ||
      pathname.startsWith('/api/rifa') ||
      pathname.startsWith('/api/config') ||
      pathname.startsWith('/api/inscricoes')) &&
    req.method !== 'GET' &&
    !ehApiInscricoesCriacao

  const precisaProteger =
    ehPaginaAdmin ||
    ehApiFinanceiroLeitura ||
    ehApiInscricoesLeitura ||
    protegeApiEscrita

  if (!precisaProteger || ehApiLeituraPublicaLivre) {
    return NextResponse.next()
  }

  const token = req.cookies.get(NOME_COOKIE)?.value
  const segredo = process.env.SESSION_SECRET || ''
  const ok = segredo && (await tokenValido(token, segredo))

  if (!ok) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ erro: 'Não autorizado.' }, { status: 401 })
    }
    const url = req.nextUrl.clone()
    url.pathname = '/admin/login'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/dashboard/:path*',
    '/financeiro/:path*',
    '/api/fotos/:path*',
    '/api/financeiro/:path*',
    '/api/upload/:path*',
    '/api/bingo/:path*',
    '/api/rifa/:path*',
    '/api/config/:path*',
    '/api/inscricoes/:path*',
  ],
}
