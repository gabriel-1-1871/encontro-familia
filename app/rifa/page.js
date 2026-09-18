import Cabecalho from '@/components/Cabecalho'
import RifaGrade from '@/components/RifaGrade'
import { supabasePublico } from '@/lib/supabase'

export const revalidate = 0

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

async function buscarConfig() {
  const supabase = supabasePublico()
  const { data } = await supabase
    .from('configuracoes')
    .select('rifa_preco_numero, rifa_total_numeros, pix_chave')
    .eq('id', 1)
    .single()
  return data
}

export default async function Rifa() {
  const config = await buscarConfig()

  return (
    <>
      <Cabecalho ativo="/rifa" />

      <main className="mx-auto max-w-5xl px-6 py-16">
        <p className="font-body text-sm uppercase tracking-[0.2em] text-gold-dark">Sorteio</p>
        <h1 className="mt-3 font-display text-4xl italic text-pine">Rifa do encontro</h1>

        <div className="mt-6 flex flex-wrap gap-6">
          <div className="rounded-2xl bg-pine px-6 py-4 text-paper">
            <p className="font-body text-xs uppercase tracking-wide text-paper/70">
              Preço por número
            </p>
            <p className="font-display text-2xl italic">
              {config?.rifa_preco_numero ? formatarMoeda(config.rifa_preco_numero) : 'A definir'}
            </p>
          </div>
          <div className="flex items-center gap-2 font-body text-sm text-ink/70">
            <span className="numero-rifa" style={{ width: 22, height: 22, fontSize: '0.6rem' }} />
            livre
            <span className="numero-rifa vendido ml-3" style={{ width: 22, height: 22, fontSize: '0.6rem' }} />
            vendido
          </div>
        </div>

        <p className="mt-6 max-w-xl font-body text-sm text-ink/70">
          Para reservar um número, fale com a organização — ela confirma
          o pagamento e marca o número pra você. Assim que alguém compra,
          o quadradinho muda de cor aqui pra todo mundo ver.
        </p>

        <div className="mt-10">
          <RifaGrade />
        </div>
      </main>
    </>
  )
}
