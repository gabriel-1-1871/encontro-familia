import Cabecalho from '@/components/Cabecalho'
import { supabaseAdmin } from '@/lib/supabase'

export const revalidate = 0

function formatarMoeda(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatarData(iso) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

async function buscarContribuicoes() {
  // Esta página só é alcançada por quem já passou pelo middleware de
  // admin — por isso usa o cliente admin diretamente (a tabela não tem
  // policy de leitura pública no banco, ver supabase-schema.sql).
  const supabase = supabaseAdmin()
  const { data } = await supabase
    .from('contribuicoes')
    .select('*')
    .order('created_at', { ascending: false })
  return data || []
}

export default async function Financeiro() {
  const contribuicoes = await buscarContribuicoes()
  const saldo = contribuicoes.reduce((soma, item) => soma + Number(item.valor), 0)

  return (
    <>
      <Cabecalho ativo="/financeiro" />

      <main className="mx-auto max-w-5xl px-6 py-16">
        <p className="font-body text-sm uppercase tracking-[0.2em] text-gold-dark">
          Área restrita · organização
        </p>
        <h1 className="mt-3 font-display text-4xl italic text-pine">Arrecadação do encontro</h1>

        <div className="mt-10 rounded-2xl bg-pine px-8 py-10 text-paper">
          <p className="font-body text-sm uppercase tracking-wide text-paper/70">
            Saldo atual
          </p>
          <p className="mt-2 font-display text-5xl italic">{formatarMoeda(saldo)}</p>
        </div>

        <h2 className="mt-14 font-display text-2xl italic text-pine">Histórico</h2>

        {contribuicoes.length === 0 ? (
          <p className="mt-6 font-body text-ink/60">
            Ainda não há contribuições registradas.
          </p>
        ) : (
          <ul className="mt-6 divide-y divide-pine/10">
            {contribuicoes.map((item) => (
              <li key={item.id} className="flex items-center justify-between py-4">
                <div>
                  <p className="font-body font-medium text-ink">{item.nome}</p>
                  {item.descricao && (
                    <p className="font-body text-sm text-ink/60">{item.descricao}</p>
                  )}
                  <p className="font-body text-xs text-ink/40">
                    {formatarData(item.created_at)}
                  </p>
                </div>
                <p className="font-display text-lg italic text-pine">
                  {formatarMoeda(Number(item.valor))}
                </p>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  )
}
