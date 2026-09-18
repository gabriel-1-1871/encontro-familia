import Cabecalho from '@/components/Cabecalho'
import { supabasePublico } from '@/lib/supabase'
import Image from 'next/image'

export const revalidate = 0

async function buscarFotos() {
  const supabase = supabasePublico()
  const { data } = await supabase
    .from('fotos')
    .select('*')
    .order('created_at', { ascending: false })
  return data || []
}

export default async function Galeria() {
  const fotos = await buscarFotos()

  return (
    <>
      <Cabecalho ativo="/galeria" />

      <main className="mx-auto max-w-5xl px-6 py-16">
        <p className="font-body text-sm uppercase tracking-[0.2em] text-gold-dark">Álbum</p>
        <h1 className="mt-3 font-display text-4xl italic text-pine">Fotos do encontro</h1>

        {fotos.length === 0 ? (
          <p className="mt-10 font-body text-ink/60">
            Ainda não tem fotos por aqui. Assim que a organização subir as
            primeiras, elas aparecem nesta página.
          </p>
        ) : (
          <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3">
            {fotos.map((foto) => (
              <figure key={foto.id} className="cantoneira relative">
                <div className="relative aspect-square w-full overflow-hidden bg-paper-dark">
                  <Image
                    src={foto.url}
                    alt={foto.legenda || 'Foto do encontro de família'}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, 33vw"
                  />
                </div>
                {foto.legenda && (
                  <figcaption className="mt-2 font-body text-sm text-ink/70">
                    {foto.legenda}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        )}
      </main>
    </>
  )
}
