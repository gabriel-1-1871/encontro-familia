'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

const fotos = [
  {
    src: '/images/chacara/chacara.jpg',
    alt: 'Chácara do encontro da família',
  },
  {
    src: '/images/chacara/chacara-2.jpg',
    alt: 'Espaço da chácara',
  },
  {
    src: '/images/chacara/chacara-3.jpg',
    alt: 'Área da chácara',
  },
  {
    src: '/images/chacara/chacara-4.jpg',
    alt: 'Espaço de convivência da chácara',
  },
  {
    src: '/images/chacara/chacara-5.jpg',
    alt: 'Paisagem da chácara',
  },
  {
    src: '/images/chacara/chacara-6.jpg',
    alt: 'Área externa da chácara',
  },
  {
    src: '/images/chacara/chacara-7.jpg',
    alt: 'Espaço do encontro',
  },
  {
    src: '/images/chacara/chacara-8.jpg',
    alt: 'Chácara do encontro',
  },
  {
    src: '/images/chacara/chacara-9.jpg',
    alt: 'Detalhe da chácara',
  }
]

export default function GaleriaChacara() {
  const [fotoSelecionada, setFotoSelecionada] = useState(null)

  useEffect(() => {
    if (fotoSelecionada === null) {
      document.body.style.overflow = ''
      return
    }

    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setFotoSelecionada(null)
      }

      if (event.key === 'ArrowRight') {
        setFotoSelecionada((atual) =>
          atual === fotos.length - 1 ? 0 : atual + 1
        )
      }

      if (event.key === 'ArrowLeft') {
        setFotoSelecionada((atual) =>
          atual === 0 ? fotos.length - 1 : atual - 1
        )
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [fotoSelecionada])

  return (
    <>
      <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <div className="max-w-2xl">
          <p className="font-body text-sm uppercase tracking-[0.2em] text-gold-dark">
            Um pouco do lugar
          </p>

          <h2 className="mt-3 font-display text-3xl italic text-pine sm:text-4xl">
            Conheça a chácara
          </h2>

          <p className="mt-4 font-body text-base leading-relaxed text-ink/65">
            Algumas imagens do espaço onde vamos viver nossos momentos juntos.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {fotos.map((foto, index) => (
            <button
              key={foto.src}
              type="button"
              onClick={() => setFotoSelecionada(index)}
              className={`group relative overflow-hidden rounded-3xl bg-paper-dark shadow-sm ${
                index === 0 ? 'sm:col-span-2 lg:col-span-2' : ''
              }`}
            >
              <div
                className={`relative ${
                  index === 0
                    ? 'aspect-[16/9]'
                    : 'aspect-[4/3]'
                }`}
              >
                <Image
                  src={foto.src}
                  alt={foto.alt}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                  sizes={
                    index === 0
                      ? '(max-width: 640px) 100vw, (max-width: 1024px) 66vw, 800px'
                      : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px'
                  }
                />

                <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/15" />

                <div className="absolute bottom-4 right-4 rounded-full bg-black/50 px-3 py-2 text-sm text-white opacity-0 backdrop-blur-sm transition group-hover:opacity-100">
                  🔍 Ampliar
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {fotoSelecionada !== null && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setFotoSelecionada(null)}
        >
          <button
            type="button"
            onClick={() => setFotoSelecionada(null)}
            className="absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-2xl text-white backdrop-blur-sm transition hover:bg-white/20"
            aria-label="Fechar imagem"
          >
            ×
          </button>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()

              setFotoSelecionada((atual) =>
                atual === 0 ? fotos.length - 1 : atual - 1
              )
            }}
            className="absolute left-3 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-2xl text-white backdrop-blur-sm transition hover:bg-white/20 sm:left-6"
            aria-label="Foto anterior"
          >
            ‹
          </button>

          <div
            className="relative h-[80vh] w-full max-w-6xl"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={fotos[fotoSelecionada].src}
              alt={fotos[fotoSelecionada].alt}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()

              setFotoSelecionada((atual) =>
                atual === fotos.length - 1 ? 0 : atual + 1
              )
            }}
            className="absolute right-3 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-2xl text-white backdrop-blur-sm transition hover:bg-white/20 sm:right-6"
            aria-label="Próxima foto"
          >
            ›
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-4 py-2 font-body text-sm text-white backdrop-blur-sm">
            {fotoSelecionada + 1} / {fotos.length}
          </div>
        </div>
      )}
    </>
  )
}