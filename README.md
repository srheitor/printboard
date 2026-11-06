# Printboard — catálogo de produtos para gráficas

Site institucional + catálogo com orçamento via WhatsApp e painel administrativo,
**sem banco de dados e sem servidor**. Feito para a gráfica **PrintBoard**.

## Como funciona o "banco"

O catálogo é um arquivo JSON versionado no próprio repositório:

```
public/data/catalogo.json   ← produtos e categorias
public/img/produtos/        ← fotos dos produtos
```

- **Visitantes** baixam o JSON como arquivo estático (igual a uma imagem). Não existe limite de requisições,
  nada "hiberna" por inatividade e não há custo.
- **O admin** grava pela API do GitHub: cada salvamento vira **um commit** (JSON + imagens juntos).
  O push dispara o GitHub Actions, que republica o site em ~1–2 minutos.
- As fotos são redimensionadas e convertidas para WebP **no navegador** antes do envio (~100–200 KB cada).
- Edição simultânea é detectada: se outra pessoa salvou antes, o painel pede para recarregar em vez de sobrescrever.

Bônus: todo o histórico de alterações fica no Git — dá para ver quem mudou o quê e desfazer qualquer coisa.

## Rodando localmente

```bash
npm install
npm run dev        # http://localhost:5173  ·  painel em /admin
```

Em desenvolvimento o login tem o botão **"Entrar no modo local"**, que grava direto em `public/`
(sem GitHub). Depois é só fazer commit/push.

## Publicando (GitHub Pages, gratuito)

1. Crie um repositório **público** no GitHub e faça push deste projeto na branch `main`.
2. Em `src/config/site.ts`, preencha `github.owner` e `github.repo` e faça push.
3. No repositório: **Settings → Pages → Source: GitHub Actions**.
4. Domínio próprio (ex.: `caixasparapizzabh.com.br`): **Settings → Pages → Custom domain**.
   Sem domínio próprio (`usuario.github.io/repo`): crie a variável
   **Settings → Secrets and variables → Actions → Variables → `BASE_PATH` = `/nome-do-repo/`**.

### Acesso ao painel admin

O login usa um **token fine-grained do GitHub** (o próprio painel tem o passo a passo em "Como conseguir o token?"):

- *Repository access*: somente o repositório do site
- *Permissions*: **Contents → Read and write**

O token não fica no código — é digitado no painel e guardado só no navegador de quem logou.
Quem não tem o token não consegue alterar nada.

## Estrutura

```
src/
├── config/site.ts              # nome, WhatsApp, Instagram, repositório — tudo que muda por cliente
├── styles/global.css           # tokens de design (cores, fontes, raios, sombras)
├── shared/                     # reutilizável em qualquer tela
│   ├── components/
│   │   ├── form/               # Field, TextInput, TextArea, Select, PriceInput,
│   │   │                       # QuantityInput, Toggle, ImageInput
│   │   ├── Button, Modal, ConfirmDialog, Badge, EmptyState, Spinner, Toast
│   │   ├── ProductPrice, WhatsAppButton
│   ├── hooks/usePublicCatalog.ts
│   ├── icons/
│   ├── types/catalog.ts        # Produto, Categoria, Catalogo
│   └── utils/                  # formatação BRL, link do WhatsApp, compressão de imagem, slug
├── services/catalog/           # camada de dados
│   ├── types.ts                # interface CatalogRepository
│   ├── githubRepository.ts     # produção: grava via API do GitHub
│   ├── localRepository.ts      # desenvolvimento: grava no disco
│   └── publicCatalog.ts        # leitura pública (fetch do JSON)
└── features/
    ├── site/                   # páginas públicas (início, catálogo, detalhe)
    └── admin/                  # painel (login, produtos, categorias) — carregado sob demanda
vite-plugins/local-catalog-api.ts   # API do "modo local" (só no npm run dev)
```

### Componentes de formulário

Todos usam o mesmo `Field` (rótulo, dica, erro, acessibilidade) e a mesma aparência:

```tsx
<PriceInput label="Preço" value={preco} onChange={setPreco} suffix="/ cento" />          // number | null, máscara R$
<QuantityInput label="Qtd." value={qtd} onChange={setQtd} min={100} suffix="unidades" /> // inteiro com − / +
<TextInput label="Nome" value={nome} onChange={setNome} error={erro} required />
```

`onChange` sempre recebe o **valor** (não o evento), então não há `e.target.value` espalhado pelo código.

### Trocar o armazenamento no futuro

O painel só conhece a interface `CatalogRepository` (`load`, `save`, `imageUrl`). Para usar outro
backend (Cloudflare D1, Firebase, uma API própria...), basta criar outra implementação dessa interface.
