import Cabecalho from '@/components/Cabecalho'
import Image from 'next/image'
import { supabasePublico } from '@/lib/supabase'

export const revalidate = 0

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

async function buscarDados() {
  const supabase = supabasePublico()
  const [{ data: config }, { data: premios }] = await Promise.all([
    supabase.from('configuracoes').select('bingo_preco_cartela, bingo_descricao').eq('id', 1).single(),
    supabase.from('premios_bingo').select('*').order('ordem', { ascending: true }),
  ])
  return { config, premios: premios || [] }
}

export default async function Bingo() {
  const { config, premios } = await buscarDados()

  return (
    <>
      <Cabecalho ativo="/bingo" />

      <main className="mx-auto max-w-5xl px-6 py-16">
        <p className="font-body text-sm uppercase tracking-[0.2em] text-gold-dark">Diversão</p>
        <h1 className="mt-3 font-display text-4xl italic text-pine">Bingo do encontro</h1>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl bg-pine px-8 py-8 text-paper">
            <p className="font-body text-sm uppercase tracking-wide text-paper/70">
              Preço da cartela
            </p>
            <p className="mt-2 font-display text-4xl italic">
              {config?.bingo_preco_cartela ? formatarMoeda(config.bingo_preco_cartela) : 'A definir'}
            </p>
          </div>

          <div className="rounded-2xl border border-pine/15 px-8 py-8">
            <p className="font-body text-sm uppercase tracking-wide text-ink/50">Como funciona</p>
            <p className="mt-3 font-body text-ink/80 whitespace-pre-line">
              {config?.bingo_descricao ||
                'A organização ainda vai detalhar como funciona o bingo — volte em breve.'}
            </p>
          </div>
        </div>

        <h2 className="mt-14 font-display text-2xl italic text-pine">Prêmios</h2>

        {premios.length === 0 ? (
          <p className="mt-6 font-body text-ink/60">Os prêmios ainda serão anunciados.</p>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {premios.map((premio) => (
              <div key={premio.id} className="cantoneira relative overflow-hidden rounded-lg border border-pine/10 bg-white">
                {premio.imagem_url && (
                  <div className="relative aspect-video w-full bg-paper-dark">
                    <Image
                      src={premio.imagem_url}
                      alt={premio.nome}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, 33vw"
                    />
                  </div>
                )}
                <div className="p-5">
                  <h3 className="font-display text-lg italic text-pine">{premio.nome}</h3>
                  {premio.descricao && (
                    <p className="mt-1 font-body text-sm text-ink/70">{premio.descricao}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  )
}
