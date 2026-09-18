'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function DashboardAdmin() {
  const router = useRouter()
  const [abaAtiva, setAbaAtiva] = useState('fotos')

  const abas = [
    { id: 'fotos', label: 'Fotos' },
    { id: 'financeiro', label: 'Financeiro' },
    { id: 'bingo', label: 'Bingo' },
    { id: 'rifa', label: 'Rifa' },
    { id: 'inscricoes', label: 'Inscrições' },
    { id: 'config', label: 'Configurações' },
  ]

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-body text-sm uppercase tracking-[0.2em] text-gold-dark">
            Área da organização
          </p>
          <h1 className="mt-2 font-display text-3xl italic text-pine">Painel</h1>
        </div>
        <button
          onClick={async () => {
            await fetch('/api/auth/logout', { method: 'POST' })
            router.push('/admin/login')
            router.refresh()
          }}
          className="font-body text-sm text-ink/60 hover:text-ink"
        >
          Sair
        </button>
      </div>

      <div className="mt-8 flex flex-wrap gap-2 border-b border-pine/15">
        {abas.map((aba) => (
          <button
            key={aba.id}
            onClick={() => setAbaAtiva(aba.id)}
            className={
              'px-4 py-3 font-body text-sm font-medium ' +
              (abaAtiva === aba.id
                ? 'border-b-2 border-gold text-pine'
                : 'text-ink/50 hover:text-ink')
            }
          >
            {aba.label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {abaAtiva === 'fotos' && <PainelFotos />}
        {abaAtiva === 'financeiro' && <PainelFinanceiro />}
        {abaAtiva === 'bingo' && <PainelBingo />}
        {abaAtiva === 'rifa' && <PainelRifa />}
        {abaAtiva === 'inscricoes' && <PainelInscricoes />}
        {abaAtiva === 'config' && <PainelConfig />}
      </div>
    </main>
  )
}

// ---------------------------------------------------------------------------
// FOTOS
// ---------------------------------------------------------------------------

function PainelFotos() {
  const [fotos, setFotos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [legenda, setLegenda] = useState('')
  const [erro, setErro] = useState('')

  async function carregar() {
    setCarregando(true)
    const res = await fetch('/api/fotos')
    const dados = await res.json()
    setFotos(dados.fotos || [])
    setCarregando(false)
  }

  useEffect(() => {
    carregar()
  }, [])

  async function enviarFoto(e) {
    const arquivo = e.target.files?.[0]
    if (!arquivo) return

    setErro('')
    setEnviando(true)

    const formData = new FormData()
    formData.append('arquivo', arquivo)
    formData.append('pasta', 'galeria')

    const resUpload = await fetch('/api/upload', { method: 'POST', body: formData })
    const dadosUpload = await resUpload.json()

    if (!resUpload.ok) {
      setErro(dadosUpload.erro || 'Erro ao enviar a foto.')
      setEnviando(false)
      return
    }

    const resFoto = await fetch('/api/fotos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: dadosUpload.url, legenda }),
    })

    if (!resFoto.ok) {
      const d = await resFoto.json()
      setErro(d.erro || 'Erro ao salvar a foto.')
    } else {
      setLegenda('')
      await carregar()
    }

    setEnviando(false)
    e.target.value = ''
  }

  async function excluirFoto(id) {
    if (!confirm('Excluir esta foto?')) return
    await fetch(`/api/fotos/${id}`, { method: 'DELETE' })
    await carregar()
  }

  return (
    <div>
      <div className="rounded-xl border border-pine/15 bg-white p-6">
        <label className="font-body text-sm text-ink/70">Legenda (opcional)</label>
        <input
          type="text"
          value={legenda}
          onChange={(e) => setLegenda(e.target.value)}
          placeholder="Ex: churrasco de sábado"
          className="mt-1 w-full rounded-lg border border-pine/20 px-4 py-2 font-body text-ink outline-none focus:border-gold"
        />

        <label className="mt-4 flex cursor-pointer items-center justify-center rounded-full bg-pine px-6 py-3 font-body text-sm font-semibold text-paper transition hover:bg-pine-dark">
          {enviando ? 'Enviando…' : 'Escolher foto e enviar'}
          <input type="file" accept="image/*" onChange={enviarFoto} disabled={enviando} className="hidden" />
        </label>

        {erro && <p className="mt-3 font-body text-sm text-red-700">{erro}</p>}
      </div>

      <div className="mt-8">
        {carregando ? (
          <p className="font-body text-ink/50">Carregando…</p>
        ) : fotos.length === 0 ? (
          <p className="font-body text-ink/50">Nenhuma foto enviada ainda.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {fotos.map((foto) => (
              <div key={foto.id} className="group relative overflow-hidden rounded-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={foto.url} alt={foto.legenda || ''} className="aspect-square w-full object-cover" />
                <button
                  onClick={() => excluirFoto(foto.id)}
                  className="absolute inset-x-0 bottom-0 bg-ink/70 py-1.5 font-body text-xs text-paper opacity-0 transition group-hover:opacity-100"
                >
                  Excluir
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// FINANCEIRO
// ---------------------------------------------------------------------------

function PainelFinanceiro() {
  const [contribuicoes, setContribuicoes] = useState([])
  const [saldo, setSaldo] = useState(0)
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [form, setForm] = useState({ nome: '', valor: '', descricao: '' })

  async function carregar() {
    setCarregando(true)
    const res = await fetch('/api/financeiro')
    const dados = await res.json()
    setContribuicoes(dados.contribuicoes || [])
    setSaldo(dados.saldo || 0)
    setCarregando(false)
  }

  useEffect(() => {
    carregar()
  }, [])

  async function adicionar(e) {
    e.preventDefault()
    setErro('')
    setSalvando(true)

    const res = await fetch('/api/financeiro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    setSalvando(false)

    if (!res.ok) {
      const d = await res.json()
      setErro(d.erro || 'Erro ao salvar.')
      return
    }

    setForm({ nome: '', valor: '', descricao: '' })
    await carregar()
  }

  async function excluir(id) {
    if (!confirm('Excluir esta contribuição?')) return
    await fetch(`/api/financeiro/${id}`, { method: 'DELETE' })
    await carregar()
  }

  return (
    <div>
      <p className="font-body text-sm text-ink/60">
        Este saldo é visível só aqui no painel — a página pública de
        financeiro exige login, então só quem tem a senha de admin
        consegue ver.
      </p>

      <div className="mt-4 rounded-xl bg-pine px-6 py-6 text-paper">
        <p className="font-body text-sm uppercase tracking-wide text-paper/70">Saldo atual</p>
        <p className="mt-1 font-display text-3xl italic">{formatarMoeda(saldo)}</p>
      </div>

      <form onSubmit={adicionar} className="mt-6 grid gap-4 rounded-xl border border-pine/15 bg-white p-6 sm:grid-cols-2">
        <div>
          <label className="font-body text-sm text-ink/70">Nome</label>
          <input
            type="text"
            required
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            className="mt-1 w-full rounded-lg border border-pine/20 px-4 py-2 font-body text-ink outline-none focus:border-gold"
          />
        </div>
        <div>
          <label className="font-body text-sm text-ink/70">Valor (R$)</label>
          <input
            type="number"
            step="0.01"
            required
            value={form.valor}
            onChange={(e) => setForm({ ...form, valor: e.target.value })}
            className="mt-1 w-full rounded-lg border border-pine/20 px-4 py-2 font-body text-ink outline-none focus:border-gold"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="font-body text-sm text-ink/70">Descrição (opcional)</label>
          <input
            type="text"
            value={form.descricao}
            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
            className="mt-1 w-full rounded-lg border border-pine/20 px-4 py-2 font-body text-ink outline-none focus:border-gold"
          />
        </div>

        {erro && <p className="font-body text-sm text-red-700 sm:col-span-2">{erro}</p>}

        <button
          type="submit"
          disabled={salvando}
          className="rounded-full bg-pine px-6 py-3 font-body text-sm font-semibold text-paper transition hover:bg-pine-dark disabled:opacity-60 sm:col-span-2"
        >
          {salvando ? 'Salvando…' : 'Adicionar contribuição'}
        </button>
      </form>

      <div className="mt-8">
        {carregando ? (
          <p className="font-body text-ink/50">Carregando…</p>
        ) : contribuicoes.length === 0 ? (
          <p className="font-body text-ink/50">Nenhuma contribuição registrada ainda.</p>
        ) : (
          <ul className="divide-y divide-pine/10">
            {contribuicoes.map((item) => (
              <li key={item.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-body font-medium text-ink">{item.nome}</p>
                  {item.descricao && <p className="font-body text-sm text-ink/60">{item.descricao}</p>}
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-display text-lg italic text-pine">{formatarMoeda(item.valor)}</p>
                  <button onClick={() => excluir(item.id)} className="font-body text-xs text-ink/40 hover:text-red-700">
                    Excluir
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// BINGO
// ---------------------------------------------------------------------------

function PainelBingo() {
  const [preco, setPreco] = useState('')
  const [descricao, setDescricao] = useState('')
  const [salvandoConfig, setSalvandoConfig] = useState(false)
  const [premios, setPremios] = useState([])
  const [novoPremio, setNovoPremio] = useState({ nome: '', descricao: '' })
  const [enviandoImagem, setEnviandoImagem] = useState(false)
  const [mensagemConfig, setMensagemConfig] = useState('')

  async function carregar() {
    const [resConfig, resPremios] = await Promise.all([fetch('/api/config'), fetch('/api/bingo')])
    const config = (await resConfig.json()).config
    const dadosPremios = (await resPremios.json()).premios
    setPreco(config?.bingo_preco_cartela ?? '')
    setDescricao(config?.bingo_descricao ?? '')
    setPremios(dadosPremios || [])
  }

  useEffect(() => {
    carregar()
  }, [])

  async function salvarConfig(e) {
    e.preventDefault()
    setSalvandoConfig(true)
    setMensagemConfig('')

    const res = await fetch('/api/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bingo_preco_cartela: preco === '' ? null : Number(preco),
        bingo_descricao: descricao,
      }),
    })

    setSalvandoConfig(false)

    if (res.ok) {
      setMensagemConfig('Salvo.')
      setTimeout(() => setMensagemConfig(''), 2500)
    } else {
      const dadosErro = await res.json().catch(() => ({}))
      setMensagemConfig(dadosErro.erro || 'Erro ao salvar. Tente de novo.')
    }
  }

  async function adicionarPremio(e) {
    e.preventDefault()
    if (!novoPremio.nome.trim()) return

    let imagem_url = null
    const arquivo = document.getElementById('imagem-premio').files?.[0]
    if (arquivo) {
      setEnviandoImagem(true)
      const formData = new FormData()
      formData.append('arquivo', arquivo)
      formData.append('pasta', 'bingo')
      const resUpload = await fetch('/api/upload', { method: 'POST', body: formData })
      const dadosUpload = await resUpload.json()
      imagem_url = dadosUpload.url
      setEnviandoImagem(false)
    }

    await fetch('/api/bingo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...novoPremio, imagem_url, ordem: premios.length }),
    })

    setNovoPremio({ nome: '', descricao: '' })
    document.getElementById('imagem-premio').value = ''
    await carregar()
  }

  async function excluirPremio(id) {
    if (!confirm('Excluir este prêmio?')) return
    await fetch(`/api/bingo/${id}`, { method: 'DELETE' })
    await carregar()
  }

  return (
    <div>
      <form onSubmit={salvarConfig} className="rounded-xl border border-pine/15 bg-white p-6">
        <h2 className="font-display text-lg italic text-pine">Preço e regras</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="font-body text-sm text-ink/70">Preço da cartela (R$)</label>
            <input
              type="number"
              step="0.01"
              value={preco}
              onChange={(e) => setPreco(e.target.value)}
              className="mt-1 w-full rounded-lg border border-pine/20 px-4 py-2 font-body text-ink outline-none focus:border-gold"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="font-body text-sm text-ink/70">Como funciona</label>
          <textarea
            rows={4}
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Ex: cada cartela tem 24 números, marcados conforme a organização sorteia. Quem completar a cartela primeiro grita BINGO e ganha o prêmio da rodada."
            className="mt-1 w-full rounded-lg border border-pine/20 px-4 py-2 font-body text-ink outline-none focus:border-gold"
          />
        </div>
        <button
          type="submit"
          disabled={salvandoConfig}
          className="mt-4 rounded-full bg-pine px-6 py-3 font-body text-sm font-semibold text-paper transition hover:bg-pine-dark disabled:opacity-60"
        >
          {salvandoConfig ? 'Salvando…' : 'Salvar'}
        </button>
        {mensagemConfig && (
          <p className={`mt-3 font-body text-sm ${mensagemConfig === 'Salvo.' ? 'text-pine' : 'text-red-700'}`}>
            {mensagemConfig}
          </p>
        )}
      </form>

      <h2 className="mt-10 font-display text-lg italic text-pine">Prêmios</h2>

      <form onSubmit={adicionarPremio} className="mt-4 grid gap-4 rounded-xl border border-pine/15 bg-white p-6 sm:grid-cols-2">
        <div>
          <label className="font-body text-sm text-ink/70">Nome do prêmio</label>
          <input
            type="text"
            value={novoPremio.nome}
            onChange={(e) => setNovoPremio({ ...novoPremio, nome: e.target.value })}
            className="mt-1 w-full rounded-lg border border-pine/20 px-4 py-2 font-body text-ink outline-none focus:border-gold"
          />
        </div>
        <div>
          <label className="font-body text-sm text-ink/70">Imagem (opcional)</label>
          <input id="imagem-premio" type="file" accept="image/*" className="mt-1 w-full text-sm" />
        </div>
        <div className="sm:col-span-2">
          <label className="font-body text-sm text-ink/70">Descrição (opcional)</label>
          <input
            type="text"
            value={novoPremio.descricao}
            onChange={(e) => setNovoPremio({ ...novoPremio, descricao: e.target.value })}
            className="mt-1 w-full rounded-lg border border-pine/20 px-4 py-2 font-body text-ink outline-none focus:border-gold"
          />
        </div>
        <button
          type="submit"
          disabled={enviandoImagem}
          className="rounded-full bg-pine px-6 py-3 font-body text-sm font-semibold text-paper transition hover:bg-pine-dark disabled:opacity-60 sm:col-span-2"
        >
          {enviandoImagem ? 'Enviando imagem…' : 'Adicionar prêmio'}
        </button>
      </form>

      <ul className="mt-6 divide-y divide-pine/10">
        {premios.map((premio) => (
          <li key={premio.id} className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              {premio.imagem_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={premio.imagem_url} alt="" className="h-12 w-12 rounded object-cover" />
              )}
              <div>
                <p className="font-body font-medium text-ink">{premio.nome}</p>
                {premio.descricao && <p className="font-body text-sm text-ink/60">{premio.descricao}</p>}
              </div>
            </div>
            <button onClick={() => excluirPremio(premio.id)} className="font-body text-xs text-ink/40 hover:text-red-700">
              Excluir
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ---------------------------------------------------------------------------
// RIFA
// ---------------------------------------------------------------------------

function PainelRifa() {
  const [preco, setPreco] = useState('')
  const [salvandoConfig, setSalvandoConfig] = useState(false)
  const [numeros, setNumeros] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [numeroSelecionado, setNumeroSelecionado] = useState(null)
  const [compradorNome, setCompradorNome] = useState('')
  const [compradorTelefone, setCompradorTelefone] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [mensagemPreco, setMensagemPreco] = useState('')

  async function carregar() {
    setCarregando(true)
    const [resConfig, resNumeros] = await Promise.all([fetch('/api/config'), fetch('/api/rifa')])
    const config = (await resConfig.json()).config
    const dadosNumeros = (await resNumeros.json()).numeros
    setPreco(config?.rifa_preco_numero ?? '')
    setNumeros(dadosNumeros || [])
    setCarregando(false)
  }

  useEffect(() => {
    carregar()
  }, [])

  async function salvarPreco(e) {
    e.preventDefault()
    setSalvandoConfig(true)
    setMensagemPreco('')

    const res = await fetch('/api/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rifa_preco_numero: preco === '' ? null : Number(preco) }),
    })

    setSalvandoConfig(false)

    if (res.ok) {
      setMensagemPreco('Preço salvo.')
      setTimeout(() => setMensagemPreco(''), 2500)
    } else {
      const dadosErro = await res.json().catch(() => ({}))
      setMensagemPreco(dadosErro.erro || 'Erro ao salvar o preço. Tente de novo.')
    }
  }

  function abrirNumero(item) {
    setMensagem('')
    if (item.status === 'vendido') {
      liberarNumero(item.numero)
      return
    }
    setNumeroSelecionado(item.numero)
    setCompradorNome('')
    setCompradorTelefone('')
  }

  async function confirmarVenda(e) {
    e.preventDefault()
    const res = await fetch(`/api/rifa/${numeroSelecionado}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'vendido',
        comprador_nome: compradorNome,
        comprador_telefone: compradorTelefone,
      }),
    })

    if (!res.ok) {
      const d = await res.json()
      setMensagem(d.erro || 'Erro ao marcar número.')
      return
    }

    setNumeroSelecionado(null)
    await carregar()
  }

  async function liberarNumero(numero) {
    if (!confirm(`Liberar o número ${numero}?`)) return
    const res = await fetch(`/api/rifa/${numero}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'livre' }),
    })
    if (!res.ok) {
      const d = await res.json()
      alert(d.erro || 'Erro ao liberar número.')
      return
    }
    await carregar()
  }

  const vendidos = numeros.filter((n) => n.status === 'vendido')

  return (
    <div>
      <form onSubmit={salvarPreco} className="rounded-xl border border-pine/15 bg-white p-6">
        <h2 className="font-display text-lg italic text-pine">Preço por número</h2>
        <div className="mt-4 flex items-end gap-4">
          <div className="flex-1">
            <label className="font-body text-sm text-ink/70">Valor (R$)</label>
            <input
              type="number"
              step="0.01"
              value={preco}
              onChange={(e) => setPreco(e.target.value)}
              className="mt-1 w-full rounded-lg border border-pine/20 px-4 py-2 font-body text-ink outline-none focus:border-gold"
            />
          </div>
          <button
            type="submit"
            disabled={salvandoConfig}
            className="rounded-full bg-pine px-6 py-3 font-body text-sm font-semibold text-paper transition hover:bg-pine-dark disabled:opacity-60"
          >
            {salvandoConfig ? 'Salvando…' : 'Salvar'}
          </button>
        </div>
        {mensagemPreco && (
          <p className={`mt-3 font-body text-sm ${mensagemPreco === 'Preço salvo.' ? 'text-pine' : 'text-red-700'}`}>
            {mensagemPreco}
          </p>
        )}
      </form>

      <p className="mt-6 font-body text-sm text-ink/60">
        {vendidos.length} de {numeros.length} números vendidos. Clique num
        número livre pra marcar como vendido; clique num vendido pra
        liberar de novo.
      </p>

      {carregando ? (
        <p className="mt-6 font-body text-ink/50">Carregando…</p>
      ) : (
        <div className="mt-4 grade-rifa">
          {numeros.map((item) => (
            <button
              key={item.numero}
              onClick={() => abrirNumero(item)}
              className={`numero-rifa clicavel ${item.status === 'vendido' ? 'vendido' : ''}`}
              title={item.status === 'vendido' ? `Vendido${item.comprador_nome ? ' — ' + item.comprador_nome : ''}` : 'Livre'}
            >
              {item.numero}
            </button>
          ))}
        </div>
      )}

      {numeroSelecionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4">
          <form onSubmit={confirmarVenda} className="w-full max-w-sm rounded-xl bg-white p-6">
            <h3 className="font-display text-xl italic text-pine">Número {numeroSelecionado}</h3>
            <label className="mt-4 block font-body text-sm text-ink/70">Nome do comprador</label>
            <input
              type="text"
              required
              value={compradorNome}
              onChange={(e) => setCompradorNome(e.target.value)}
              className="mt-1 w-full rounded-lg border border-pine/20 px-4 py-2 font-body text-ink outline-none focus:border-gold"
            />
            <label className="mt-4 block font-body text-sm text-ink/70">Telefone (opcional)</label>
            <input
              type="text"
              value={compradorTelefone}
              onChange={(e) => setCompradorTelefone(e.target.value)}
              className="mt-1 w-full rounded-lg border border-pine/20 px-4 py-2 font-body text-ink outline-none focus:border-gold"
            />
            {mensagem && <p className="mt-3 font-body text-sm text-red-700">{mensagem}</p>}
            <div className="mt-5 flex gap-3">
              <button type="submit" className="flex-1 rounded-full bg-pine px-6 py-3 font-body text-sm font-semibold text-paper">
                Confirmar venda
              </button>
              <button
                type="button"
                onClick={() => setNumeroSelecionado(null)}
                className="rounded-full border border-pine px-6 py-3 font-body text-sm font-semibold text-pine"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// INSCRIÇÕES
// ---------------------------------------------------------------------------

function PainelInscricoes() {
  const [inscricoes, setInscricoes] = useState([])
  const [carregando, setCarregando] = useState(true)

  async function carregar() {
    setCarregando(true)
    const res = await fetch('/api/inscricoes')
    const dados = await res.json()
    setInscricoes(dados.inscricoes || [])
    setCarregando(false)
  }

  useEffect(() => {
    carregar()
  }, [])

  async function alternarStatus(inscricao) {
    const novoStatus = inscricao.status === 'pago' ? 'pendente' : 'pago'
    await fetch(`/api/inscricoes/${inscricao.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: novoStatus }),
    })
    await carregar()
  }

  async function excluir(id) {
    if (!confirm('Excluir esta inscrição?')) return
    await fetch(`/api/inscricoes/${id}`, { method: 'DELETE' })
    await carregar()
  }

  const totalPessoas = inscricoes.reduce((soma, i) => soma + i.quantidade_pessoas, 0)
  const totalPago = inscricoes.filter((i) => i.status === 'pago').reduce((soma, i) => soma + Number(i.valor_total), 0)

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-pine/15 bg-white p-5">
          <p className="font-body text-xs uppercase tracking-wide text-ink/50">Inscrições</p>
          <p className="font-display text-2xl italic text-pine">{inscricoes.length}</p>
        </div>
        <div className="rounded-xl border border-pine/15 bg-white p-5">
          <p className="font-body text-xs uppercase tracking-wide text-ink/50">Pessoas confirmadas</p>
          <p className="font-display text-2xl italic text-pine">{totalPessoas}</p>
        </div>
        <div className="rounded-xl bg-pine p-5 text-paper">
          <p className="font-body text-xs uppercase tracking-wide text-paper/70">Recebido (pagos)</p>
          <p className="font-display text-2xl italic">{formatarMoeda(totalPago)}</p>
        </div>
      </div>

      <div className="mt-8">
        {carregando ? (
          <p className="font-body text-ink/50">Carregando…</p>
        ) : inscricoes.length === 0 ? (
          <p className="font-body text-ink/50">Nenhuma inscrição ainda.</p>
        ) : (
          <ul className="divide-y divide-pine/10">
            {inscricoes.map((i) => (
              <li key={i.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div>
                  <p className="font-body font-medium text-ink">
                    {i.nome} <span className="text-ink/50">· {i.quantidade_pessoas} pessoa(s)</span>
                  </p>
                  <p className="font-body text-sm text-ink/60">
                    {i.telefone || 'sem telefone'} · código{' '}
                    <span className="font-mono">{i.codigo}</span>
                  </p>
                  {i.observacao && <p className="font-body text-sm text-ink/50">{i.observacao}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-display text-lg italic text-pine">{formatarMoeda(i.valor_total)}</span>
                  <button
                    onClick={() => alternarStatus(i)}
                    className={
                      'rounded-full px-4 py-1.5 font-body text-xs font-semibold ' +
                      (i.status === 'pago' ? 'bg-pine text-paper' : 'border border-pine/30 text-ink/60')
                    }
                  >
                    {i.status === 'pago' ? 'Pago ✓' : 'Marcar como pago'}
                  </button>
                  <button onClick={() => excluir(i.id)} className="font-body text-xs text-ink/40 hover:text-red-700">
                    Excluir
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// CONFIGURAÇÕES (chácara, data, pix, inscrição)
// ---------------------------------------------------------------------------

function PainelConfig() {
  const [config, setConfig] = useState(null)
  const [salvando, setSalvando] = useState(false)
  const [enviandoMapa, setEnviandoMapa] = useState(false)
  const [mensagem, setMensagem] = useState('')
  const [erroCarregamento, setErroCarregamento] = useState('')

  async function carregar() {
    setErroCarregamento('')
    try {
      const res = await fetch('/api/config')
      const dados = await res.json()
      if (!res.ok || !dados.config) {
        setErroCarregamento(dados.erro || 'Não foi possível carregar as configurações.')
        return
      }
      setConfig(dados.config)
    } catch {
      setErroCarregamento('Erro de conexão ao carregar as configurações. Verifique sua internet e tente de novo.')
    }
  }

  useEffect(() => {
    carregar()
  }, [])

  async function salvar(e) {
    e.preventDefault()
    setSalvando(true)
    setMensagem('')

    const res = await fetch('/api/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    })

    setSalvando(false)

    if (res.ok) {
      setMensagem('Configurações salvas.')
      setTimeout(() => setMensagem(''), 2500)
    } else {
      const dadosErro = await res.json().catch(() => ({}))
      setMensagem(dadosErro.erro || 'Erro ao salvar. Tente novamente em alguns segundos.')
    }
  }

  async function enviarImagemMapa(e) {
    const arquivo = e.target.files?.[0]
    if (!arquivo) return

    setEnviandoMapa(true)
    const formData = new FormData()
    formData.append('arquivo', arquivo)
    formData.append('pasta', 'chacara')

    const res = await fetch('/api/upload', { method: 'POST', body: formData })
    const dados = await res.json()
    setEnviandoMapa(false)

    if (res.ok) {
      setConfig({ ...config, imagem_mapa_url: dados.url })
    }
  }

  if (erroCarregamento) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <p className="font-body text-sm text-red-700">{erroCarregamento}</p>
        <button
          onClick={carregar}
          className="mt-4 rounded-full border border-red-300 px-5 py-2 font-body text-sm font-semibold text-red-700 hover:bg-red-100"
        >
          Tentar de novo
        </button>
      </div>
    )
  }

  if (!config) return <p className="font-body text-ink/50">Carregando…</p>

  return (
    <form onSubmit={salvar} className="space-y-8">
      <section className="rounded-xl border border-pine/15 bg-white p-6">
        <h2 className="font-display text-lg italic text-pine">Data e local</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="font-body text-sm text-ink/70">Data do encontro</label>
            <input
              type="date"
              value={config.data_evento || ''}
              onChange={(e) => setConfig({ ...config, data_evento: e.target.value })}
              className="mt-1 w-full rounded-lg border border-pine/20 px-4 py-2 font-body text-ink outline-none focus:border-gold"
            />
          </div>
          <div>
            <label className="font-body text-sm text-ink/70">Endereço da chácara</label>
            <input
              type="text"
              value={config.endereco_chacara || ''}
              onChange={(e) => setConfig({ ...config, endereco_chacara: e.target.value })}
              className="mt-1 w-full rounded-lg border border-pine/20 px-4 py-2 font-body text-ink outline-none focus:border-gold"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="font-body text-sm text-ink/70">
            Link de incorporação do Google Maps (opcional)
          </label>
          <input
            type="text"
            value={config.mapa_embed_url || ''}
            onChange={(e) => setConfig({ ...config, mapa_embed_url: e.target.value })}
            placeholder='Google Maps > Compartilhar > Incorporar um mapa > copie só a URL de dentro do src="..."'
            className="mt-1 w-full rounded-lg border border-pine/20 px-4 py-2 font-body text-ink outline-none focus:border-gold"
          />
        </div>

        <div className="mt-4">
          <label className="font-body text-sm text-ink/70">Mini-mapa ilustrado da chácara (imagem)</label>
          <input type="file" accept="image/*" onChange={enviarImagemMapa} disabled={enviandoMapa} className="mt-1 w-full text-sm" />
          {config.imagem_mapa_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={config.imagem_mapa_url} alt="" className="mt-3 max-h-40 rounded-lg border border-pine/15" />
          )}
        </div>
      </section>

      <section className="rounded-xl border border-pine/15 bg-white p-6">
        <h2 className="font-display text-lg italic text-pine">Recebimento via Pix</h2>
        <p className="mt-1 font-body text-sm text-ink/60">
          Usado para gerar o QR Code de pagamento da inscrição.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="font-body text-sm text-ink/70">Chave Pix</label>
            <input
              type="text"
              value={config.pix_chave || ''}
              onChange={(e) => setConfig({ ...config, pix_chave: e.target.value })}
              placeholder="CPF, e-mail, telefone ou chave aleatória"
              className="mt-1 w-full rounded-lg border border-pine/20 px-4 py-2 font-body text-ink outline-none focus:border-gold"
            />
          </div>
          <div>
            <label className="font-body text-sm text-ink/70">Nome do recebedor</label>
            <input
              type="text"
              value={config.pix_nome_recebedor || ''}
              onChange={(e) => setConfig({ ...config, pix_nome_recebedor: e.target.value })}
              className="mt-1 w-full rounded-lg border border-pine/20 px-4 py-2 font-body text-ink outline-none focus:border-gold"
            />
          </div>
          <div>
            <label className="font-body text-sm text-ink/70">Cidade do recebedor</label>
            <input
              type="text"
              value={config.pix_cidade || ''}
              onChange={(e) => setConfig({ ...config, pix_cidade: e.target.value })}
              className="mt-1 w-full rounded-lg border border-pine/20 px-4 py-2 font-body text-ink outline-none focus:border-gold"
            />
          </div>
          <div>
            <label className="font-body text-sm text-ink/70">Valor da inscrição por pessoa (R$)</label>
            <input
              type="number"
              step="0.01"
              value={config.inscricao_valor_por_pessoa ?? ''}
              onChange={(e) =>
                setConfig({
                  ...config,
                  inscricao_valor_por_pessoa: e.target.value === '' ? null : Number(e.target.value),
                })
              }
              className="mt-1 w-full rounded-lg border border-pine/20 px-4 py-2 font-body text-ink outline-none focus:border-gold"
            />
          </div>
        </div>
      </section>

      {mensagem && <p className="font-body text-sm text-pine">{mensagem}</p>}

      <button
        type="submit"
        disabled={salvando}
        className="rounded-full bg-pine px-6 py-3 font-body text-sm font-semibold text-paper transition hover:bg-pine-dark disabled:opacity-60"
      >
        {salvando ? 'Salvando…' : 'Salvar configurações'}
      </button>
    </form>
  )
}
