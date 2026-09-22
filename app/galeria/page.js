import Cabecalho from '@/components/Cabecalho'
import GaleriaFotos from '@/components/GaleriaFotos'
import { supabasePublico } from '@/lib/supabase'

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

    <main className="mx-auto max-w-6xl px-6 py-16">

      {/* CABEÇALHO */}
      <section className="max-w-2xl">
        <p className="font-body text-sm uppercase tracking-[0.2em] text-gold-dark">
          Álbum
        </p>

        <h1 className="mt-3 font-display text-4xl italic leading-tight text-pine sm:text-5xl">
          Fotos do encontro
        </h1>

        <p className="mt-5 font-body text-base leading-relaxed text-ink/70 sm:text-lg">
          Cada foto guarda um pedaço da nossa história. Aqui ficam registradas
          as lembranças dos encontros, das pessoas e dos momentos que fazem
          parte da família Martins.
        </p>
      </section>

      {/* GALERIA INTERATIVA */}
      <GaleriaFotos fotos={fotos} />

    </main>
  </>
)
}