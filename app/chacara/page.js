import Cabecalho from '@/components/Cabecalho'
import Image from 'next/image'
import { supabasePublico } from '@/lib/supabase'

export const revalidate = 0

function formatarData(dataISO) {
  if (!dataISO) return null
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
  const { data } = await supabase
    .from('configuracoes')
    .select('data_evento, endereco_chacara, mapa_embed_url, imagem_mapa_url')
    .eq('id', 1)
    .single()
  return data
}

export default async function Chacara() {
  const config = await buscarConfig()
  const dataFormatada = formatarData(config?.data_evento)

  return (
    <>
      <Cabecalho ativo="/chacara" />

      <main className="mx-auto max-w-5xl px-6 py-16">
        <p className="font-body text-sm uppercase tracking-[0.2em] text-gold-dark">Local</p>
        <h1 className="mt-3 font-display text-4xl italic text-pine">A chácara do encontro</h1>

        <div className="mt-6 flex flex-wrap gap-3">
          {dataFormatada && (
            <span className="rounded-full bg-pine px-5 py-2 font-body text-sm text-paper">
              📅 {dataFormatada}
            </span>
          )}
          {config?.endereco_chacara && (
            <span className="rounded-full border border-pine/20 px-5 py-2 font-body text-sm text-ink/80">
              📍 {config.endereco_chacara}
            </span>
          )}
        </div>

        {!config?.endereco_chacara && !config?.mapa_embed_url && !config?.imagem_mapa_url && (
          <p className="mt-8 font-body text-ink/60">
            A organização ainda vai adicionar o endereço e o mapa da chácara — volte em breve.
          </p>
        )}

        {config?.imagem_mapa_url && (
          <div className="mt-10">
            <h2 className="font-display text-2xl italic text-pine">Mini-mapa da chácara</h2>
            <p className="mt-1 font-body text-sm text-ink/60">
              Onde fica cada área do espaço no dia do encontro.
            </p>
            <div className="relative mt-4 aspect-[4/3] w-full overflow-hidden rounded-2xl border border-pine/15 bg-white sm:aspect-[16/9]">
              <Image
                src={config.imagem_mapa_url}
                alt="Mini-mapa ilustrado da chácara"
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 900px"
              />
            </div>
          </div>
        )}

        {config?.mapa_embed_url && (
          <div className="mt-10">
            <h2 className="font-display text-2xl italic text-pine">Como chegar</h2>
            <div className="mt-4 aspect-video w-full overflow-hidden rounded-2xl border border-pine/15">
              <iframe
                src={config.mapa_embed_url}
                title="Mapa de localização da chácara"
                className="h-full w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        )}
      </main>
    </>
  )
}
