# Encontro de Família — site

Site com área pública e área de administração para o encontro de
família: fotos, bingo, rifa, mapa da chácara, inscrição com pagamento
Pix e controle financeiro — tudo editável pelo painel, sem precisar
mexer em código.

## Novidades desta versão

- **Bingo** (`/bingo`) — preço da cartela, regras e lista de prêmios (com foto).
- **Rifa** (`/rifa`) — grade com os números (padrão: 100), que mudam de
  cor conforme são vendidos. Só o administrador marca um número como
  vendido (evita bagunça/duplicidade) — feito em Painel > Rifa, com
  proteção para dois cliques simultâneos não venderem o mesmo número
  duas vezes.
- **Chácara** (`/chacara`) — endereço, data do encontro, mapa do Google
  incorporado e um mini-mapa ilustrado do espaço (upload de imagem).
- **Financeiro agora é só para administradores** — antes o saldo era
  público; agora `/financeiro` exige login, tanto a página quanto a
  API.
- **Inscrição** (`/inscricao`) — formulário de presença que gera um
  código único e, se o Pix estiver configurado, um **QR Code Pix real**
  (o mesmo "Copia e Cola" que qualquer banco lê) já com o valor certo e
  o código da inscrição embutido como referência. Isso não confirma o
  pagamento sozinho — o administrador confere no extrato e marca como
  "pago" em Painel > Inscrições, usando o código para bater a conferência.

## Instalação

1. Instale o Python... não, calma — é Node.js: https://nodejs.org (versão 18+)
2. Nesta pasta:
   ```
   npm install
   ```
3. Configure o Supabase (veja abaixo) e crie `.env.local` a partir de `.env.example`.
4. `npm run dev` e acesse http://localhost:3000

## Configurar o Supabase

1. Crie um projeto em https://supabase.com.
2. **SQL Editor > New query**: cole todo o conteúdo de `supabase-schema.sql`
   e rode. Esse script cria/atualiza todas as tabelas (inclusive as
   novas: configurações, prêmios do bingo, números da rifa, inscrições)
   e ajusta as permissões — inclusive removendo a leitura pública do
   financeiro.
3. **Storage > New bucket**: nome `fotos-encontro`, marque **Public bucket**.
   (esse único bucket guarda fotos da galeria, imagens de prêmios do
   bingo e o mini-mapa da chácara, cada um em sua própria pasta).
4. **Project Settings > API**: copie os 3 valores (Project URL, anon
   public key, service_role key) para o `.env.local`/Vercel.

## Primeiros passos depois de publicar

Entre em `/admin/login` com a senha definida em `ADMIN_PASSWORD` e, em
**Painel > Configurações**, preencha:

- Data do encontro e endereço da chácara
- Sua chave Pix, nome e cidade (necessário pro QR Code da inscrição funcionar)
- Valor da inscrição por pessoa

Depois, em **Bingo** e **Rifa**, defina os preços — e em **Rifa**, vá
marcando os números conforme forem vendidos.

## Deploy (Vercel)

Igual à versão anterior: suba para o GitHub, importe na Vercel, cole as
variáveis de ambiente do `.env.example` e clique em Deploy.

## Sobre o Pix

O QR Code gerado é um Pix estático de verdade (padrão do Banco Central,
mesma tecnologia usada por qualquer maquininha ou link de pagamento) —
funciona com qualquer banco, sem mensalidade nem conta de gateway. A
única limitação é que ele não avisa sozinho quando o dinheiro cai na
conta; isso só existe com um provedor de pagamentos pago (Mercado Pago,
Efí etc.). Por isso o código da inscrição existe: ele aparece na
mensagem do Pix, então quando você olhar o extrato do banco, consegue
saber rapidinho de quem é aquele pagamento e marcar como "pago" no painel.

## Solução de problemas

### "Configurações fica em Carregando", "salvar preço da rifa/bingo não faz nada", "falha ao enviar foto"

A causa mais comum é o script `supabase-schema.sql` não ter sido rodado
(ou ter sido rodado antes de existir a tabela `configuracoes`) no seu
projeto Supabase. Desde esta versão, o próprio código se autocorrige
criando a linha de configuração que falta — mas se o erro continuar
aparecer, confira nesta ordem:

1. **Supabase > SQL Editor** — rode `supabase-schema.sql` inteiro de
   novo (é seguro rodar mais de uma vez, ele não apaga dados existentes).
2. **Supabase > Table Editor > configuracoes** — confirme que existe
   uma linha com `id = 1`.
3. **Supabase > Storage** — confirme que o bucket `fotos-encontro`
   existe e está marcado como **Public**. Se a mensagem de erro ao
   subir foto disser "Bucket not found", é exatamente isso.
4. **Vercel > Settings > Environment Variables** — confirme que
   `SUPABASE_SERVICE_ROLE_KEY` é a chave **service_role** (não a
   `anon`/`public`) — colar a errada aqui causa erros de permissão
   ("row-level security policy") só nas ações de admin (salvar,
   subir foto), enquanto a leitura pública continua funcionando
   normalmente, o que confunde o diagnóstico.

Depois de qualquer uma dessas correções, as mensagens de erro agora
aparecem na tela (em vermelho) em vez de falhar em silêncio — se
algo continuar não funcionando, o texto do erro ali já aponta a causa.
