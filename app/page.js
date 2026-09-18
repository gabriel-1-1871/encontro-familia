import Link from 'next/link'
import Cabecalho from '@/components/Cabecalho'
import { supabasePublico } from '@/lib/supabase'

export const revalidate = 0

function formatarData(dataISO) {
  if (!dataISO) return null
  // dataISO vem como "YYYY-MM-DD" — monta a data em UTC-neutro para não
  // "voltar um dia" por causa do fuso horário do navegador/servidor.
  const [ano, mes, dia] = dataISO.split('-')
  const data = new Date(Number(ano), Number(mes) - 1, Number(dia))
  return data.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

async function buscarConfig() {
  const supabase = supabasePublico()
  const { data } = await supabase.from('configuracoes').select('*').eq('id', 1).single()
  return data
}

export default async function Home() {
  const config = await buscarConfig()
  const dataFormatada = formatarData(config?.data_evento)

  return (
    <>
      <Cabecalho ativo="/" />

      <main>
        <section className="mx-auto max-w-5xl px-6 pt-20 pb-16">
          <p className="font-body text-sm uppercase tracking-[0.2em] text-gold-dark">
            Bem-vindos
          </p>
          <h1 className="mt-4 max-w-2xl font-display text-5xl italic leading-tight text-pine sm:text-6xl">
            Um encontro pra reunir todo mundo de novo.
          </h1>

          {dataFormatada && (
            <p className="mt-5 inline-block rounded-full bg-pine px-5 py-2 font-body text-sm text-paper">
              📅 {dataFormatada}
            </p>
          )}

          <p className="mt-6 max-w-xl font-body text-lg text-ink/80">
            Aqui a família acompanha as fotos do encontro, participa do
            bingo e da rifa, e garante a inscrição — tudo atualizado
            direto pela organização.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/inscricao"
              className="rounded-full bg-pine px-6 py-3 font-body text-sm font-semibold text-paper transition hover:bg-pine-dark"
            >
              Fazer inscrição
            </Link>
            <Link
              href="/galeria"
              className="rounded-full border border-pine px-6 py-3 font-body text-sm font-semibold text-pine transition hover:bg-pine/5"
            >
              Ver as fotos
            </Link>
          </div>
        </section>

        <div className="divisor-varal mx-6" />

        <section className="mx-auto max-w-5xl px-6 py-16">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/bingo" className="rounded-2xl border border-pine/15 p-6 transition hover:border-gold">
              <h2 className="font-display text-xl italic text-pine">Bingo</h2>
              <p className="mt-2 font-body text-sm text-ink/70">
                Preço da cartela, como funciona e os prêmios.
              </p>
            </Link>
            <Link href="/rifa" className="rounded-2xl border border-pine/15 p-6 transition hover:border-gold">
              <h2 className="font-display text-xl italic text-pine">Rifa</h2>
              <p className="mt-2 font-body text-sm text-ink/70">
                Escolha e acompanhe os números disponíveis.
              </p>
            </Link>
            <Link href="/chacara" className="rounded-2xl border border-pine/15 p-6 transition hover:border-gold">
              <h2 className="font-display text-xl italic text-pine">Chácara</h2>
              <p className="mt-2 font-body text-sm text-ink/70">
                Endereço, mapa e como chegar.
              </p>
            </Link>
            <Link href="/inscricao" className="rounded-2xl border border-pine/15 p-6 transition hover:border-gold">
              <h2 className="font-display text-xl italic text-pine">Inscrição</h2>
              <p className="mt-2 font-body text-sm text-ink/70">
                Confirme presença e pague pelo Pix com QR Code.
              </p>
            </Link>
          </div>
        </section>
      </main>

      <footer className="mx-auto max-w-5xl px-6 py-10 text-center font-body text-xs text-ink/50">
        Encontro de Família ·{' '}
        <Link href="/admin/login" className="hover:text-ink/80">
          área da organização
        </Link>
      </footer>
    </>
  )
}
