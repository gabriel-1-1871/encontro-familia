import Link from 'next/link'

export default function Cabecalho({ ativo }) {
  const itens = [
    { href: '/', label: 'Início' },
    { href: '/galeria', label: 'Fotos' },
    { href: '/bingo', label: 'Bingo' },
    { href: '/rifa', label: 'Rifa' },
    { href: '/chacara', label: 'Chácara' },
    { href: '/inscricao', label: 'Inscrição' },
  ]

  return (
    <header className="border-b border-pine/15">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-y-3 px-6 py-5">
        <Link href="/" className="font-display text-lg italic text-pine">
          Encontro de Família
        </Link>
        <nav className="flex flex-wrap gap-5 font-body text-sm">
          {itens.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={
                ativo === item.href
                  ? 'font-semibold text-pine border-b-2 border-gold pb-1'
                  : 'text-pine/70 hover:text-pine pb-1'
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
