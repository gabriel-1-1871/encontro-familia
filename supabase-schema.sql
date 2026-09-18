-- Rode este script inteiro em: Supabase > SQL Editor > New query > Run
-- Este script pode ser rodado tanto em um projeto novo quanto em um que já
-- tinha as tabelas antigas (fotos, contribuicoes) — usa "if not exists" e
-- não apaga dados existentes.

create extension if not exists "pgcrypto";

-- ============================================================
-- TABELAS JÁ EXISTENTES (fotos e contribuições financeiras)
-- ============================================================

create table if not exists fotos (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  legenda text,
  created_at timestamptz not null default now()
);

create table if not exists contribuicoes (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  valor numeric not null,
  descricao text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- CONFIGURAÇÕES GERAIS (linha única, editada pelo admin)
-- ============================================================

create table if not exists configuracoes (
  id int primary key default 1,
  data_evento date,
  endereco_chacara text,
  mapa_embed_url text,        -- link de incorporação do Google Maps
  imagem_mapa_url text,       -- mapa/croqui ilustrado da chácara (upload)
  pix_chave text,
  pix_nome_recebedor text,
  pix_cidade text,
  bingo_preco_cartela numeric,
  bingo_descricao text,
  rifa_preco_numero numeric,
  rifa_total_numeros int not null default 100,
  inscricao_valor_por_pessoa numeric,
  constraint configuracoes_linha_unica check (id = 1)
);

insert into configuracoes (id) values (1)
  on conflict (id) do nothing;

-- ============================================================
-- BINGO — prêmios
-- ============================================================

create table if not exists premios_bingo (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  descricao text,
  imagem_url text,
  ordem int not null default 0,
  created_at timestamptz not null default now()
);

-- ============================================================
-- RIFA — números
-- ============================================================

create table if not exists numeros_rifa (
  numero int primary key,
  status text not null default 'livre', -- livre | vendido
  comprador_nome text,
  comprador_telefone text,
  atualizado_em timestamptz not null default now()
);

-- Preenche os números de 1 a 100 (ou o total configurado), só se a
-- tabela ainda estiver vazia
insert into numeros_rifa (numero)
select gerar from generate_series(1, 100) as gerar
where not exists (select 1 from numeros_rifa);

-- ============================================================
-- INSCRIÇÕES
-- ============================================================

create table if not exists inscricoes (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  nome text not null,
  telefone text,
  quantidade_pessoas int not null default 1,
  valor_total numeric not null default 0,
  status text not null default 'pendente', -- pendente | pago
  observacao text,
  criado_em timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table fotos enable row level security;
alter table contribuicoes enable row level security;
alter table configuracoes enable row level security;
alter table premios_bingo enable row level security;
alter table numeros_rifa enable row level security;
alter table inscricoes enable row level security;

-- Leitura pública nas tabelas de conteúdo/exibição.
-- IMPORTANTE: "contribuicoes" (extrato financeiro) NÃO tem policy de
-- leitura pública — só a service role key (usada nas rotas /api do
-- servidor, protegidas por login de admin) consegue ler. Isso é o que
-- torna o saldo "só para administradores".

drop policy if exists "Leitura publica de fotos" on fotos;
create policy "Leitura publica de fotos" on fotos for select using (true);

drop policy if exists "Leitura publica de configuracoes" on configuracoes;
create policy "Leitura publica de configuracoes" on configuracoes for select using (true);

drop policy if exists "Leitura publica de premios" on premios_bingo;
create policy "Leitura publica de premios" on premios_bingo for select using (true);

drop policy if exists "Leitura publica de numeros da rifa" on numeros_rifa;
create policy "Leitura publica de numeros da rifa" on numeros_rifa for select using (true);

-- Inscrições: a leitura pública fica limitada a colunas não sensíveis
-- via a view abaixo; a tabela em si não é exposta por completo.

-- View pública de inscrições — mostra só o que é seguro expor (nomes e
-- contagem), nunca telefone nem status de pagamento.
create or replace view inscricoes_publicas as
  select id, nome, quantidade_pessoas, criado_em
  from inscricoes;

grant select on inscricoes_publicas to anon;

-- ------------------------------------------------------------
-- Depois de rodar este script, crie/confirme o bucket de storage:
-- Supabase > Storage > New bucket
--   Nome: fotos-encontro
--   Public bucket: ativado (ligado)
-- (o mesmo bucket serve para fotos da galeria, imagem do mapa da
--  chácara e imagens de prêmios do bingo — organizados em pastas)
-- ------------------------------------------------------------
