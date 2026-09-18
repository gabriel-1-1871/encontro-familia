'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginAdmin() {
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const router = useRouter()

  async function entrar(e) {
    e.preventDefault()
    setErro('')
    setCarregando(true)

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senha }),
    })

    setCarregando(false)

    if (!res.ok) {
      setErro('Senha incorreta. Tente novamente.')
      return
    }

    router.push('/admin/dashboard')
    router.refresh()
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <p className="font-body text-sm uppercase tracking-[0.2em] text-gold-dark">
        Área da organização
      </p>
      <h1 className="mt-3 font-display text-3xl italic text-pine">Entrar</h1>

      <form onSubmit={entrar} className="mt-8 space-y-4">
        <div>
          <label htmlFor="senha" className="font-body text-sm text-ink/70">
            Senha
          </label>
          <input
            id="senha"
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-pine/20 bg-white px-4 py-3 font-body text-ink outline-none focus:border-gold"
          />
        </div>

        {erro && <p className="font-body text-sm text-red-700">{erro}</p>}

        <button
          type="submit"
          disabled={carregando}
          className="w-full rounded-full bg-pine px-6 py-3 font-body text-sm font-semibold text-paper transition hover:bg-pine-dark disabled:opacity-60"
        >
          {carregando ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </main>
  )
}
