'use client'

import { useEffect, useState } from 'react'

export default function RifaGrade() {
  const [numeros, setNumeros] = useState([])
  const [carregando, setCarregando] = useState(true)

  async function carregar() {
    const res = await fetch('/api/rifa')
    const dados = await res.json()
    setNumeros(dados.numeros || [])
    setCarregando(false)
  }

  useEffect(() => {
    carregar()
    const intervalo = setInterval(carregar, 8000)
    return () => clearInterval(intervalo)
  }, [])

  if (carregando) {
    return <p className="font-body text-ink/50">Carregando números…</p>
  }

  return (
    <div className="grade-rifa">
      {numeros.map((item) => (
        <div
          key={item.numero}
          className={`numero-rifa ${item.status === 'vendido' ? 'vendido' : ''}`}
          title={item.status === 'vendido' ? 'Já vendido' : 'Disponível'}
        >
          {item.numero}
        </div>
      ))}
    </div>
  )
}
