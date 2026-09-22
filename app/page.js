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
  {/* HERO */}
  <section className="px-4 pt-6 sm:px-6 sm:pt-10">
    <div className="relative mx-auto min-h-[620px] max-w-6xl overflow-hidden rounded-[2rem] shadow-xl">
      
      {/* Imagem */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/images/home/encontro-familia.png')",
        }}
      />

      {/* Camada escura para o texto ficar legível */}
      <div className="absolute inset-0 bg-black/45" />

      {/* Conteúdo */}
      <div className="relative flex min-h-[620px] items-end">
        <div className="w-full max-w-3xl px-6 pb-10 sm:px-10 sm:pb-12 lg:px-14 lg:pb-14">

          <p className="font-body text-sm font-semibold uppercase tracking-[0.25em] text-white/90">
            Encontro de Família Martins
          </p>

          <h1 className="mt-4 font-display text-4xl italic leading-tight text-white sm:text-5xl lg:text-6xl">
            Diferentes galhos,
            <br />
            a mesma raiz.
          </h1>

          <p className="mt-5 max-w-2xl font-body text-base leading-relaxed text-white/90 sm:text-lg">
            Um encontro para reunir histórias, abraços, lembranças e novas
            memórias. Porque família é onde cada geração encontra seu lugar.
          </p>

          {dataFormatada && (
            <div className="mt-6 inline-flex rounded-full bg-pine/95 px-5 py-2.5 font-body text-sm font-semibold text-paper shadow-lg">
              📅 {dataFormatada}
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/inscricao"
              className="rounded-full bg-paper px-6 py-3 font-body text-sm font-semibold text-pine shadow-lg transition hover:-translate-y-0.5 hover:bg-white"
            >
              Fazer inscrição
            </Link>

            <Link
              href="/galeria"
              className="rounded-full border border-white/70 bg-black/20 px-6 py-3 font-body text-sm font-semibold text-white backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white/15"
            >
              Ver as fotos
            </Link>
          </div>

        </div>
      </div>
    </div>
  </section>

  {/* FRASE */}
  <section className="mx-auto max-w-5xl px-6 py-16 text-center">
    <p className="font-body text-sm uppercase tracking-[0.2em] text-gold-dark">
      Nossa família
    </p>

    <h2 className="mx-auto mt-3 max-w-2xl font-display text-3xl italic leading-tight text-pine sm:text-4xl">
      Uma história feita de muitas histórias.
    </h2>

    <p className="mx-auto mt-5 max-w-2xl font-body text-base leading-relaxed text-ink/70">
      Aqui você pode acompanhar as novidades do encontro, conferir as fotos,
      participar do bingo, escolher seu número da rifa e confirmar sua
      presença.
    </p>
  </section>

  <div className="divisor-varal mx-6" />

  {/* ACESSOS PRINCIPAIS */}
  <section className="mx-auto max-w-6xl px-6 py-16">
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

      <Link
        href="/bingo"
        className="group rounded-2xl border border-pine/15 bg-paper p-6 transition duration-300 hover:-translate-y-1 hover:border-gold hover:shadow-lg"
      >
        <div className="text-3xl">🎱</div>

        <h2 className="mt-4 font-display text-xl italic text-pine">
          Bingo
        </h2>

        <p className="mt-2 font-body text-sm leading-relaxed text-ink/70">
          Confira o valor da cartela, participe e descubra os prêmios.
        </p>

        <span className="mt-5 inline-block font-body text-sm font-semibold text-pine transition group-hover:translate-x-1">
          Participar →
        </span>
      </Link>

      <Link
        href="/rifa"
        className="group rounded-2xl border border-pine/15 bg-paper p-6 transition duration-300 hover:-translate-y-1 hover:border-gold hover:shadow-lg"
      >
        <div className="text-3xl">🎟️</div>

        <h2 className="mt-4 font-display text-xl italic text-pine">
          Rifa
        </h2>

        <p className="mt-2 font-body text-sm leading-relaxed text-ink/70">
          Escolha seu número e acompanhe quais números ainda estão disponíveis.
        </p>

        <span className="mt-5 inline-block font-body text-sm font-semibold text-pine transition group-hover:translate-x-1">
          Ver números →
        </span>
      </Link>

      <Link
        href="/chacara"
        className="group rounded-2xl border border-pine/15 bg-paper p-6 transition duration-300 hover:-translate-y-1 hover:border-gold hover:shadow-lg"
      >
        <div className="text-3xl">🌳</div>

        <h2 className="mt-4 font-display text-xl italic text-pine">
          Chácara
        </h2>

        <p className="mt-2 font-body text-sm leading-relaxed text-ink/70">
          Veja o endereço, localização e informações sobre o local do encontro.
        </p>

        <span className="mt-5 inline-block font-body text-sm font-semibold text-pine transition group-hover:translate-x-1">
          Como chegar →
        </span>
      </Link>

      <Link
        href="/inscricao"
        className="group rounded-2xl border border-pine/15 bg-paper p-6 transition duration-300 hover:-translate-y-1 hover:border-gold hover:shadow-lg"
      >
        <div className="text-3xl">❤️</div>

        <h2 className="mt-4 font-display text-xl italic text-pine">
          Inscrição
        </h2>

        <p className="mt-2 font-body text-sm leading-relaxed text-ink/70">
          Confirme sua presença e faça o pagamento pelo Pix.
        </p>

        <span className="mt-5 inline-block font-body text-sm font-semibold text-pine transition group-hover:translate-x-1">
          Confirmar presença →
        </span>
      </Link>

    </div>
  </section>
</main>
      

      <footer className="mx-auto max-w-5xl px-6 py-10 text-center font-body text-xs text-ink/50">
        Encontro de Família Martins 2027 ·{' '}
        <Link href="/admin/login" className="hover:text-ink/80">
          área da organização
        </Link>
      </footer>
    </>
  )
}
