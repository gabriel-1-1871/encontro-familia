'use client'

import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import Cabecalho from '@/components/Cabecalho'

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function Inscricao() {
  const [form, setForm] = useState({ nome: '', telefone: '', quantidade_pessoas: 1, observacao: '' })
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')
  const [resultado, setResultado] = useState(null)
  const [copiado, setCopiado] = useState(false)

  async function enviar(e) {
    e.preventDefault()
    setErro('')
    setEnviando(true)

    const res = await fetch('/api/inscricoes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const dados = await res.json()

    setEnviando(false)

    if (!res.ok) {
      setErro(dados.erro || 'Não foi possível concluir a inscrição.')
      return
    }

    setResultado(dados)
  }

  async function copiarPix() {
    if (!resultado?.pixPayload) return
    await navigator.clipboard.writeText(resultado.pixPayload)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2500)
  }

  return (
    <>
      <Cabecalho ativo="/inscricao" />

      <main className="mx-auto max-w-2xl px-6 py-16">
        <p className="font-body text-sm uppercase tracking-[0.2em] text-gold-dark">Presença</p>
        <h1 className="mt-3 font-display text-4xl italic text-pine">Inscrição</h1>

        {!resultado ? (
          <>
            <p className="mt-4 font-body text-ink/70">
              Confirme sua presença no encontro. Se houver taxa de
              inscrição, você recebe um QR Code Pix pra pagar na hora.
            </p>

            <form onSubmit={enviar} className="mt-8 space-y-4">
              <div>
                <label className="font-body text-sm text-ink/70">Nome completo</label>
                <input
                  type="text"
                  required
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-pine/20 bg-white px-4 py-3 font-body text-ink outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="font-body text-sm text-ink/70">Telefone / WhatsApp</label>
                <input
                  type="text"
                  value={form.telefone}
                  onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                  placeholder="(62) 99999-8888"
                  className="mt-1 w-full rounded-lg border border-pine/20 bg-white px-4 py-3 font-body text-ink outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="font-body text-sm text-ink/70">Quantidade de pessoas (incluindo você)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={form.quantidade_pessoas}
                  onChange={(e) => setForm({ ...form, quantidade_pessoas: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-pine/20 bg-white px-4 py-3 font-body text-ink outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="font-body text-sm text-ink/70">Observação (opcional)</label>
                <textarea
                  rows={3}
                  value={form.observacao}
                  onChange={(e) => setForm({ ...form, observacao: e.target.value })}
                  placeholder="Ex: vou levar mais 2 crianças, alguma restrição alimentar…"
                  className="mt-1 w-full rounded-lg border border-pine/20 bg-white px-4 py-3 font-body text-ink outline-none focus:border-gold"
                />
              </div>

              {erro && <p className="font-body text-sm text-red-700">{erro}</p>}

              <button
                type="submit"
                disabled={enviando}
                className="w-full rounded-full bg-pine px-6 py-3 font-body text-sm font-semibold text-paper transition hover:bg-pine-dark disabled:opacity-60"
              >
                {enviando ? 'Enviando…' : 'Confirmar inscrição'}
              </button>
            </form>
          </>
        ) : (
          <div className="mt-8 rounded-2xl border border-pine/15 bg-white p-8 text-center">
            <p className="font-display text-2xl italic text-pine">Inscrição confirmada!</p>
            <p className="mt-2 font-body text-sm text-ink/60">
              Guarde seu código — ele ajuda a organização a confirmar seu pagamento.
            </p>
            <p className="mt-4 inline-block rounded-full bg-paper-dark px-5 py-2 font-mono text-lg tracking-widest text-pine">
              {resultado.inscricao.codigo}
            </p>

            <div className="mt-6 flex justify-between rounded-xl bg-pine px-6 py-4 text-left text-paper">
              <span className="font-body text-sm">Total a pagar</span>
              <span className="font-display text-xl italic">
                {formatarMoeda(resultado.inscricao.valor_total)}
              </span>
            </div>

            {resultado.pixPayload ? (
              <div className="mt-8">
                <p className="font-body text-sm text-ink/70">
                  Escaneie com o app do seu banco para pagar via Pix:
                </p>
                <div className="mt-4 flex justify-center rounded-xl bg-white p-4">
                  <QRCodeSVG value={resultado.pixPayload} size={220} />
                </div>
                <button
                  onClick={copiarPix}
                  className="mt-4 w-full rounded-full border border-pine px-6 py-3 font-body text-sm font-semibold text-pine transition hover:bg-pine/5"
                >
                  {copiado ? 'Código copiado!' : 'Copiar código Pix (copia e cola)'}
                </button>
              </div>
            ) : (
              <p className="mt-6 font-body text-sm text-ink/60">
                O pagamento ainda não está configurado — a organização vai
                combinar com você a forma de pagamento diretamente.
              </p>
            )}
          </div>
        )}
      </main>
    </>
  )
}
