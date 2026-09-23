//app/chacara/page.js
import Cabecalho from '@/components/Cabecalho'
import GaleriaChacara from '@/components/GaleriaChacara'
import Image from 'next/image'
import { supabasePublico } from '@/lib/supabase'

export const revalidate = 0

function formatarData(dataInicioISO, dataFimISO) {
  if (!dataInicioISO) return null

  const formatarDiaUnico = (umaDataISO) => {
    const [ano, mes, dia] = umaDataISO.split('-')

    const data = new Date(
      Number(ano),
      Number(mes) - 1,
      Number(dia)
    )

    return data.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }

  const inicioFormatado = formatarDiaUnico(dataInicioISO)

  if (dataFimISO) {
    const fimFormatado = formatarDiaUnico(dataFimISO)

    return `${inicioFormatado} a ${fimFormatado}`
  }

  return inicioFormatado
}
async function buscarConfig() {
  const supabase = supabasePublico()

  const { data } = await supabase
    .from('configuracoes')
    .select(
      'data_evento,data_fim,endereco_chacara,mapa_embed_url,imagem_mapa_url'
    )
    .eq('id', 1)
    .single()

  return data
}

export default async function Chacara() {
  const config = await buscarConfig()
  const dataFormatada = formatarData(config?.data_evento, config?.data_fim)

  return (
    <>
      <Cabecalho ativo="/chacara" />

      <main>
        {/* HERO */}
        <section className="relative isolate overflow-hidden">
          <div className="relative h-[60vh] min-h-[460px] w-full">
            <Image
              src="/images/chacara/chacara.jpg"
              alt="Chácara onde será realizado o encontro da família"
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/5" />

            <div className="absolute inset-x-0 bottom-0 mx-auto max-w-6xl px-6 pb-10 sm:pb-14">
              <p className="font-body text-sm uppercase tracking-[0.25em] text-white/80">
                O lugar do nosso encontro
              </p>

              <h1 className="mt-3 max-w-3xl font-display text-4xl italic leading-tight text-white sm:text-5xl md:text-6xl">
                A chácara do encontro
              </h1>

              <p className="mt-4 max-w-2xl font-body text-base leading-relaxed text-white/85 sm:text-lg">
                Um espaço para reunir a família, compartilhar histórias,
                aproveitar o dia e criar novas lembranças juntos.
              </p>
            </div>
          </div>
        </section>

        {/* INFORMAÇÕES */}
        <section className="mx-auto max-w-6xl px-6 py-14 sm:py-20">
          <div className="grid gap-5 md:grid-cols-2">
            {dataFormatada && (
              <div className="rounded-3xl border border-pine/10 bg-paper-dark/40 p-6">
                <p className="font-body text-xs font-semibold uppercase tracking-[0.2em] text-gold-dark">
                  Data do encontro
                </p>

                <p className="mt-3 font-display text-2xl italic text-pine">
                  {dataFormatada}
                </p>

                <p className="mt-2 font-body text-sm text-ink/60">
                  Reserve esta data para estar com a família.
                </p>
              </div>
            )}

            {config?.endereco_chacara && (
              <div className="rounded-3xl border border-pine/10 bg-paper-dark/40 p-6">
                <p className="font-body text-xs font-semibold uppercase tracking-[0.2em] text-gold-dark">
                  Localização
                </p>

                <p className="mt-3 font-display text-2xl italic text-pine">
                  Chácara
                </p>

                <p className="mt-2 font-body text-sm leading-relaxed text-ink/70">
                  {config.endereco_chacara}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* SOBRE O LOCAL */}
        <section className="bg-pine py-16 text-paper sm:py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid gap-10 md:grid-cols-[1fr_1.2fr] md:items-center">
              <div>
                <p className="font-body text-sm uppercase tracking-[0.2em] text-gold">
                  Nosso espaço
                </p>

                <h2 className="mt-3 font-display text-3xl italic sm:text-4xl">
                  Um dia para estar presente
                </h2>
              </div>

              <p className="font-body text-base leading-relaxed text-paper/75 sm:text-lg">
                Mais do que um endereço, a chácara será o cenário de um dia
                dedicado à convivência. Um lugar para conversar sem pressa,
                reunir diferentes gerações e aproveitar os momentos simples
                que acabam virando as melhores lembranças.
              </p>
            </div>
          </div>
        </section>

        {/* GALERIA DA CHÁCARA */}
        <GaleriaChacara />


        {/* MINI-MAPA */}
        {config?.imagem_mapa_url && (
          <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
            <div className="max-w-2xl">
              <p className="font-body text-sm uppercase tracking-[0.2em] text-gold-dark">
                Dentro da chácara
              </p>

              <h2 className="mt-3 font-display text-3xl italic text-pine sm:text-4xl">
                Mini-mapa do espaço
              </h2>

              <p className="mt-3 font-body text-base leading-relaxed text-ink/65">
                Confira a organização das áreas da chácara para se
                familiarizar com o espaço antes do encontro.
              </p>
            </div>

            <div className="relative mt-8 aspect-[4/3] w-full overflow-hidden rounded-[2rem] border border-pine/10 bg-white shadow-sm sm:aspect-[16/9]">
              <Image
                src={config.imagem_mapa_url}
                alt="Mini-mapa ilustrado da chácara"
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 1200px"
              />
            </div>
          </section>
        )}

        {/* COMO CHEGAR */}
        {config?.mapa_embed_url && (
          <section className="bg-paper-dark/50 py-16 sm:py-20">
            <div className="mx-auto max-w-6xl px-6">
              <div className="grid gap-10 lg:grid-cols-[0.8fr_1.5fr] lg:items-center">
                <div>
                  <p className="font-body text-sm uppercase tracking-[0.2em] text-gold-dark">
                    Localização
                  </p>

                  <h2 className="mt-3 font-display text-3xl italic text-pine sm:text-4xl">
                    Como chegar
                  </h2>

                  {config?.endereco_chacara && (
                    <p className="mt-5 font-body text-base leading-relaxed text-ink/70">
                      {config.endereco_chacara}
                    </p>
                  )}

                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      config?.endereco_chacara || ''
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex items-center justify-center rounded-full bg-pine px-6 py-3 font-body text-sm font-semibold text-paper transition hover:-translate-y-0.5 hover:bg-pine-light"
                  >
                    📍 Abrir no Google Maps
                  </a>
                </div>

                <div className="overflow-hidden rounded-[2rem] border border-pine/10 bg-white shadow-lg">
                  <div className="aspect-video">
                    <iframe
                      src={config.mapa_embed_url}
                      title="Mapa de localização da chácara"
                      className="h-full w-full"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* RODAPÉ DA PÁGINA */}
        <section className="mx-auto max-w-4xl px-6 py-16 text-center sm:py-20">
          <p className="font-display text-2xl italic text-pine sm:text-3xl">
            Nos encontramos lá. 🌿
          </p>

          <p className="mx-auto mt-4 max-w-2xl font-body text-sm leading-relaxed text-ink/60 sm:text-base">
            Prepare-se para um dia de família, histórias, comida boa e
            momentos que merecem ser guardados.
          </p>
        </section>
      </main>
    </>
  )
}