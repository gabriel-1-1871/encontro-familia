import crypto from 'crypto'

const NOME_COOKIE = 'encontro_admin_sessao'
const VALIDADE_MS = 1000 * 60 * 60 * 24 * 7 // 7 dias

function segredo() {
  const s = process.env.SESSION_SECRET
  if (!s) {
    throw new Error('SESSION_SECRET não configurado nas variáveis de ambiente.')
  }
  return s
}

function assinar(valor) {
  return crypto.createHmac('sha256', segredo()).update(valor).digest('hex')
}

export function gerarTokenSessao() {
  const expira = Date.now() + VALIDADE_MS
  const base = String(expira)
  const assinatura = assinar(base)
  return `${base}.${assinatura}`
}

export function tokenValido(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return false
  const [base, assinatura] = token.split('.')
  const esperada = assinar(base)
  const assinaturaOk =
    assinatura &&
    assinatura.length === esperada.length &&
    crypto.timingSafeEqual(Buffer.from(assinatura), Buffer.from(esperada))
  if (!assinaturaOk) return false
  const expira = Number(base)
  return Number.isFinite(expira) && Date.now() < expira
}

export function senhaCorreta(senhaEnviada) {
  const esperada = process.env.ADMIN_PASSWORD || ''
  if (!esperada) return false
  const a = Buffer.from(String(senhaEnviada || ''))
  const b = Buffer.from(esperada)
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(a, b)
}

export { NOME_COOKIE, VALIDADE_MS }
