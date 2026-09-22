'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

export default function GaleriaFotos({ fotos }) {
  const [fotoSelecionada, setFotoSelecionada] = useState(null)

  function abrirFoto(index) {
    setFotoSelecionada(index)
  }

  function fecharFoto() {
    setFotoSelecionada(null)
  }

  function fotoAnterior() {
    setFotoSelecionada((atual) => {
      if (atual === null) return null

      return atual === 0 ? fotos.length - 1 : atual - 1
    })
  }

  function proximaFoto() {
    setFotoSelecionada((atual) => {
      if (atual === null) return null

      return atual === fotos.length - 1 ? 0 : atual + 1
    })
  }

  useEffect(() => {
    if (fotoSelecionada === null) return

    function tratarTeclado(event) {
      if (event.key === 'Escape') {
        fecharFoto()
      }

      if (event.key === 'ArrowLeft') {
        fotoAnterior()
      }

      if (event.key === 'ArrowRight') {
        proximaFoto()
      }
    }

    document.addEventListener('keydown', tratarTeclado)

    const scrollOriginal = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', tratarTeclado)
      document.body.style.overflow = scrollOriginal
    }
  }, [fotoSelecionada])

  if (!fotos || fotos.length === 0) {
    return (
      <section className="mt-14 rounded-3xl border border-pine/10 bg-paper-dark/40 px-6 py-16 text-center">
        <div className="text-5xl">📸</div>

        <h2 className="mt-5 font-display text-2xl italic text-pine">
          O álbum ainda está vazio
        </h2>

        <p className="mx-auto mt-3 max-w-md font-body text-sm leading-relaxed text-ink/60">
          Assim que a organização adicionar as primeiras fotos, elas
          aparecerão aqui.
        </p>
      </section>
    )
  }

  return (
    <>
      {/* FOTO DE DESTAQUE */}
      {fotos[0] && (
        <button
          type="button"
          onClick={() => abrirFoto(0)}
          className="group relative block w-full overflow-hidden rounded-[2rem] bg-paper-dark text-left shadow-lg"
          aria-label="Abrir foto em tamanho grande"
        >
          <div className="relative aspect-[16/9] w-full overflow-hidden">
            <Image
              src={fotos[0].url}
              alt={
                fotos[0].legenda ||
                'Foto do encontro de família'
              }
              fill
              priority
              className="object-cover transition duration-700 group-hover:scale-105"
              sizes="(max-width: 1024px) 100vw, 1200px"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

            <div className="absolute right-5 top-5 rounded-full bg-black/35 px-4 py-2 font-body text-xs font-semibold text-white backdrop-blur-sm">
              🔍 Ampliar
            </div>

            {fotos[0].legenda && (
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                <p className="font-body text-sm font-medium text-white/90 sm:text-base">
                  {fotos[0].legenda}
                </p>
              </div>
            )}
          </div>
        </button>
      )}

      {/* RESTANTE DAS FOTOS */}
      {fotos.length > 1 && (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {fotos.slice(1).map((foto, indice) => {
            const indiceReal = indice + 1

            return (
              <button
                key={foto.id}
                type="button"
                onClick={() => abrirFoto(indiceReal)}
                className="group overflow-hidden rounded-2xl bg-paper text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                aria-label={`Abrir foto ${indiceReal + 1}`}
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-paper-dark">
                  <Image
                    src={foto.url}
                    alt={
                      foto.legenda ||
                      'Foto do encontro de família'
                    }
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />

                  <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/10" />
                </div>

                {foto.legenda && (
                  <div className="px-4 py-3 font-body text-sm leading-relaxed text-ink/70">
                    {foto.legenda}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* VISUALIZAÇÃO AMPLIADA */}
      {fotoSelecionada !== null && fotos[fotoSelecionada] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          onClick={fecharFoto}
          role="dialog"
          aria-modal="true"
          aria-label="Visualização ampliada da foto"
        >
          {/* Botão fechar */}
          <button
            type="button"
            onClick={fecharFoto}
            className="absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-2xl text-white backdrop-blur-md transition hover:bg-white/20"
            aria-label="Fechar"
          >
            ×
          </button>

          {/* Foto anterior */}
          {fotos.length > 1 && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                fotoAnterior()
              }}
              className="absolute left-3 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-3xl text-white backdrop-blur-md transition hover:bg-white/20 sm:left-6"
              aria-label="Foto anterior"
            >
              ‹
            </button>
          )}

          {/* Conteúdo da foto */}
          <div
            className="relative flex h-full w-full max-w-6xl flex-col items-center justify-center"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative h-[75vh] w-full">
              <Image
                src={fotos[fotoSelecionada].url}
                alt={
                  fotos[fotoSelecionada].legenda ||
                  'Foto do encontro de família'
                }
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>

            <div className="mt-3 text-center">
              {fotos[fotoSelecionada].legenda && (
                <p className="font-body text-sm text-white/85">
                  {fotos[fotoSelecionada].legenda}
                </p>
              )}

              <p className="mt-1 font-body text-xs text-white/50">
                {fotoSelecionada + 1} de {fotos.length}
              </p>
            </div>
          </div>

          {/* Próxima foto */}
          {fotos.length > 1 && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                proximaFoto()
              }}
              className="absolute right-3 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-3xl text-white backdrop-blur-md transition hover:bg-white/20 sm:right-6"
              aria-label="Próxima foto"
            >
              ›
            </button>
          )}
        </div>
      )}
    </>
  )
}