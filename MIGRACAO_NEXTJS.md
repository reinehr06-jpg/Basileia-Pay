# Plano de Migração para Next.js (Monorepo)

> **Conceito central:** cada "módulo" vira uma pasta com seu próprio frontend Next.js
> e o backend Laravel fica apenas como API REST. Sem Blade, sem Alpine.js, sem HTML no PHP.

---

## Visão Geral da Arquitetura

```
basileia/                          ← raiz do monorepo
│
├── backend/                       ← Laravel puro (só API + webhooks)
│   └── app/Http/Controllers/Api/
│
├── apps/
│   ├── checkout/                  ← Next.js do checkout público (PIX, Cartão, Boleto)
│   ├── dashboard/                 ← Next.js do painel interno
│   └── checkout-builder/          ← Next.js do editor visual (Lab/Builder)
│
└── packages/
    ├── ui/                        ← Componentes compartilhados (CardForm, BrandLogos...)
    ├── card-engine/               ← Detecção de bandeira centralizada
    └── api-client/                ← Funções fetch() para cada endpoint do Laravel
```

**Ferramenta de monorepo:** [Turborepo](https://turbo.build/) — roda todos os apps em paralelo,
compartilha dependências e cache de build.

---

## Módulo 1 — `apps/checkout/`

> Página pública que o cliente final vê para pagar.

### Rotas do Laravel que viram API

| Rota Blade atual | Vira API REST |
|---|---|
| `GET /{uuid}` — `CheckoutController@show` | `GET /api/checkout/{uuid}` → JSON com dados da transação |
| `POST /pay/{uuid}/process` — `CheckoutController@process` | `POST /api/checkout/{uuid}/process` |
| `GET /pay/{uuid}/success` | `GET /api/checkout/{uuid}` (status `approved`) |
| `GET /pay/{uuid}/receipt` | `GET /api/checkout/{uuid}/receipt` |
| `GET /checkout/{uuid}` — `BasileiaCheckoutController@show` | Merge com a rota acima |
| `GET /checkout/asaas/{id}` — `AsaasCheckoutController@show` | Merge com a rota acima |
| `GET /eventos/{slug}` — `EventCheckoutController@show` | `GET /api/events/{slug}` |
| `POST /eventos/{slug}/pay` | `POST /api/events/{slug}/process` |

### Estrutura de pastas Next.js

```
apps/checkout/
├── app/
│   ├── [uuid]/
│   │   ├── page.tsx              ← página principal (detecta método: PIX/Cartão/Boleto)
│   │   ├── success/
│   │   │   └── page.tsx          ← tela de sucesso / comprovante
│   │   └── receipt/
│   │       └── page.tsx          ← recibo imprimível
│   └── evento/
│       └── [slug]/
│           ├── page.tsx
│           └── success/page.tsx
│
├── components/
│   ├── PixTab.tsx                ← QR Code + copiar código + timer de expiração
│   ├── CardTab.tsx               ← Formulário cartão (usa <CardForm> do packages/ui)
│   ├── BoletoTab.tsx             ← Botão de boleto + instruções
│   ├── PaymentTabs.tsx           ← Wrapper com as 3 abas
│   └── LocaleSwitcher.tsx        ← Seletor de país / moeda (multi-idioma)
│
├── hooks/
│   ├── useTransaction.ts         ← fetch dos dados da transação
│   ├── usePolling.ts             ← polling de status PIX a cada 3s
│   └── useCardDetect.ts          ← usa packages/card-engine
│
└── lib/
    └── api.ts                    ← calls para o backend Laravel
```

### O que acontece com cada view Blade atual

| View Blade | Vira | Arquivo Next.js |
|---|---|---|
| `checkout/pay.blade.php` | Dividido em 3 tabs | `components/PaymentTabs.tsx` |
| `checkouts/basileia-vendor/index.blade.php` | Merge com PaymentTabs + i18n | `components/LocaleSwitcher.tsx` + `[uuid]/page.tsx` |
| `checkout/asaas.blade.php` | Removida (duplicata) | — |
| `checkout/event-pagamento.blade.php` | `evento/[slug]/page.tsx` | `app/evento/[slug]/page.tsx` |
| `checkout/success.blade.php` | `[uuid]/success/page.tsx` | — |
| `checkout/error.blade.php` | Componente de erro padrão | `components/ErrorState.tsx` |

---

## Módulo 2 — `apps/dashboard/`

> Painel interno: transações, gateways, eventos, relatórios, configurações.

### Rotas do Laravel que viram API

| Rota web/ atual | Vira API REST |
|---|---|
| `GET /dashboard` — `DashboardController@index` | `GET /api/dashboard/stats` → JSON com KPIs |
| `GET /transactions` — `TransactionDashboardController@index` | `GET /api/transactions?page=&status=` |
| `GET /transactions/{id}` | `GET /api/transactions/{id}` |
| `GET /transactions-export` | `GET /api/transactions/export` (CSV stream) |
| `GET /gateways` | `GET /api/gateways` |
| `POST /gateways` | `POST /api/gateways` |
| `PUT /gateways/{id}` | `PUT /api/gateways/{id}` |
| `POST /gateways/{id}/test` | `POST /api/gateways/{id}/test` |
| `GET /events` | `GET /api/events` |
| `POST /events` | `POST /api/events` |
| `GET /reports` | `GET /api/reports/summary?dateFrom=&dateTo=` |
| `GET /reports/export` | `GET /api/reports/export` |
| `GET /webhooks` | `GET /api/webhooks?status=&eventType=` |
| `POST /webhooks/{id}/retry` | `POST /api/webhooks/{id}/retry` |
| `GET /sources` | `GET /api/sources` |
| `GET /settings/receipt` | `GET /api/settings/receipt` |
| `PUT /settings/receipt` | `PUT /api/settings/receipt` |
| `POST /login` — `AuthController@login` | `POST /api/auth/login` (retorna token Sanctum) |
| `POST /logout` | `POST /api/auth/logout` |

### Estrutura de pastas Next.js

```
apps/dashboard/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx
│   │
│   └── (protected)/               ← layout com sidebar + header
│       ├── layout.tsx
│       ├── page.tsx               ← /dashboard → KPIs + gráfico + transações recentes
│       │
│       ├── transactions/
│       │   ├── page.tsx           ← listagem paginada com filtros
│       │   └── [id]/
│       │       └── page.tsx       ← detalhe da transação
│       │
│       ├── gateways/
│       │   ├── page.tsx
│       │   ├── new/page.tsx
│       │   └── [id]/
│       │       ├── page.tsx       ← show/edit
│       │       └── edit/page.tsx
│       │
│       ├── events/
│       │   └── page.tsx
│       │
│       ├── reports/
│       │   └── page.tsx
│       │
│       ├── webhooks/
│       │   ├── page.tsx
│       │   └── [id]/page.tsx
│       │
│       ├── sources/
│       │   └── page.tsx
│       │
│       ├── tokenizer/
│       │   └── page.tsx
│       │
│       └── settings/
│           └── receipt/page.tsx
│
├── components/
│   ├── Sidebar.tsx
│   ├── KpiCard.tsx                ← compartilha com packages/ui
│   ├── TransactionTable.tsx
│   ├── GatewayForm.tsx
│   ├── EventModal.tsx
│   ├── ReportChart.tsx
│   └── ReceiptEditor.tsx
│
└── lib/
    ├── api.ts
    └── auth.ts                    ← Next-Auth ou Sanctum token no cookie httpOnly
```

### O que acontece com cada view Blade atual

| View Blade | Vira |
|---|---|
| `dashboard/index.blade.php` | `app/(protected)/page.tsx` |
| `dashboard/transactions/index.blade.php` | `app/(protected)/transactions/page.tsx` |
| `dashboard/transactions/show.blade.php` | `app/(protected)/transactions/[id]/page.tsx` |
| `dashboard/gateways/index.blade.php` | `app/(protected)/gateways/page.tsx` |
| `dashboard/gateways/create.blade.php` | `app/(protected)/gateways/new/page.tsx` |
| `dashboard/gateways/edit.blade.php` | `app/(protected)/gateways/[id]/edit/page.tsx` |
| `dashboard/gateways/show.blade.php` | Merge com edit |
| `dashboard/events/index.blade.php` | `app/(protected)/events/page.tsx` |
| `dashboard/reports/index.blade.php` | `app/(protected)/reports/page.tsx` |
| `dashboard/reports/summary.blade.php` | Merge com index |
| `dashboard/webhooks/index.blade.php` | `app/(protected)/webhooks/page.tsx` |
| `dashboard/webhooks/show.blade.php` | `app/(protected)/webhooks/[id]/page.tsx` |
| `dashboard/sources/index.blade.php` | `app/(protected)/sources/page.tsx` |
| `dashboard/tokenizer.blade.php` | `app/(protected)/tokenizer/page.tsx` |
| `dashboard/settings/receipt.blade.php` | `app/(protected)/settings/receipt/page.tsx` |
| `dashboard/lab.blade.php` | `app/(protected)/checkout-builder/page.tsx` (ou app separado) |
| `auth/login.blade.php` | `app/(auth)/login/page.tsx` |
| `dashboard/layouts/app.blade.php` | `app/(protected)/layout.tsx` |

---

## Módulo 3 — `apps/checkout-builder/`

> Editor visual do checkout (Lab + Builder). Pode ser parte do dashboard
> ou um app Next.js separado, dependendo da complexidade.

```
apps/checkout-builder/
├── app/
│   ├── page.tsx                   ← lista de checkouts configurados
│   └── [id]/
│       └── edit/
│           └── page.tsx           ← editor visual com preview ao vivo
│
└── components/
    ├── BuilderSidebar.tsx         ← painéis de Cores, Logo, Campos, Métodos, Layout
    ├── CheckoutPreview.tsx        ← iframe ou componente que re-renderiza ao vivo
    └── TabPanel.tsx
```

### O que acontece com as views Blade

| View Blade | Vira |
|---|---|
| `dashboard/checkout-configs/index.blade.php` | `app/page.tsx` |
| `dashboard/checkout-configs/edit.blade.php` | `app/[id]/edit/page.tsx` |
| `dashboard/lab.blade.php` | Merge com index |

---

## `packages/` — Código Compartilhado (sem duplicação)

### `packages/card-engine/`
```ts
// Detecção de bandeira — 1 só lugar para todos os apps
export function detectBrand(cardNumber: string): CardBrand { ... }
export function formatCardNumber(value: string): string { ... }
export function validateLuhn(number: string): boolean { ... }
```

### `packages/ui/`
```
packages/ui/
├── CardForm/
│   ├── CardForm.tsx              ← formulário completo com preview 3D
│   ├── CardPreview.tsx           ← o card animado isolado
│   └── BrandLogos.tsx            ← SVGs de Visa, Master, Amex, Elo
├── SecurityFooter.tsx
├── KpiCard.tsx
└── PixDisplay.tsx                ← QR Code + copiar código
```

### `packages/api-client/`
```ts
// Todas as chamadas ao Laravel em um só lugar
export const checkoutApi = {
  get: (uuid: string) => fetch(`/api/checkout/${uuid}`),
  process: (uuid: string, data: CardData) => fetch(...)
}
export const dashboardApi = {
  stats: () => fetch('/api/dashboard/stats'),
  transactions: (params) => fetch(...)
}
```

---

## Backend Laravel — O Que Sobra

Após a migração, o Laravel fica **somente** com:

```
backend/
├── app/Http/Controllers/
│   ├── Api/
│   │   ├── CheckoutController.php      ← retorna JSON, sem view()
│   │   ├── DashboardController.php
│   │   ├── TransactionController.php
│   │   ├── GatewayController.php
│   │   ├── EventController.php
│   │   ├── ReportController.php
│   │   ├── WebhookLogController.php
│   │   ├── SourceController.php
│   │   ├── SettingsController.php
│   │   └── AuthController.php          ← retorna token Sanctum
│   │
│   └── Webhook/
│       └── AsaasWebhookController.php  ← recebe do gateway (não muda)
│
├── app/Services/                        ← não muda (AsaasPaymentService etc.)
├── app/Models/                          ← não muda
└── routes/
    ├── api.php                          ← todas as rotas unificadas aqui
    └── webhook.php                      ← webhooks do Asaas (não muda)
```

**O que some do Laravel:**
- `resources/views/` — todo o diretório some
- `routes/web.php` — some (ou fica com 1 rota de redirect para o Next.js)
- `public/css/`, `public/js/` — some
- Dependências: `laravel/ui`, `livewire`, `Alpine.js`

---

## Autenticação

O dashboard usa **Laravel Sanctum** com tokens SPA:

```
Next.js (apps/dashboard) → POST /api/auth/login
Laravel → retorna cookie httpOnly com token Sanctum
Next.js → todas as requests subsequentes com o cookie
```

O checkout **não precisa de autenticação** — é público por UUID.

---

## Ordem de Execução (sem quebrar o que está em produção)

| Etapa | O que fazer | Duração | Risco |
|---|---|---|---|
| 1 | Criar endpoints API no Laravel (sem remover Blade) | 3–4 dias | Baixo |
| 2 | Criar `packages/card-engine` e `packages/ui` | 1–2 dias | Baixo |
| 3 | Criar `apps/checkout/` em Next.js e testar em paralelo | 3–5 dias | Médio |
| 4 | Fazer deploy do checkout Next.js em subdomínio (checkout2.basileia.global) | 1 dia | Baixo |
| 5 | Testar fluxo PIX + Cartão + Boleto em produção (tráfego paralelo) | 2–3 dias | Médio |
| 6 | Redirecionar domínio principal para Next.js | 1 dia | Alto — ponto de virada |
| 7 | Criar `apps/dashboard/` em Next.js | 5–7 dias | Médio |
| 8 | Deploy do dashboard e desativar Blade | 1 dia | Médio |
| 9 | Remover views Blade e dependências frontend do Laravel | 1 dia | Baixo |

**Total estimado:** 3–4 semanas de trabalho ativo, sem quebrar produção.

---

## Configuração do Turborepo (início rápido)

```bash
# Na raiz do monorepo
npx create-turbo@latest basileia
cd basileia

# Criar os apps
cd apps && npx create-next-app@latest checkout --typescript --tailwind --app
cd apps && npx create-next-app@latest dashboard --typescript --tailwind --app

# Criar os packages
mkdir -p packages/ui packages/card-engine packages/api-client
```

`turbo.json`:
```json
{
  "pipeline": {
    "build": { "dependsOn": ["^build"] },
    "dev": { "cache": false, "persistent": true }
  }
}
```

Rodar tudo junto:
```bash
turbo dev
# → checkout em localhost:3000
# → dashboard em localhost:3001
# → backend Laravel em localhost:8000