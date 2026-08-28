# Plano de Implementação — Master Fixes (P0-P2)

Esta é a resposta direta e o plano tático para resolver a auditoria crítica enviada, endereçando todas as categorias (P0 Bloqueadores, P1 Segurança, P1 Arquitetura e P2 CI/CD).

## User Review Required
> [!WARNING]
> **API V1 vs V2:** Vou apagar completamente o namespace e rotas da API legada/duplicada. Pelo estado atual do `routes/`, a `V1` parece ser a mais conectada, mas me confirme se prefere manter a `V2` como a base canônica. Por padrão neste plano, assumirei a V1 como a oficial e excluirei a V2 para remover o código duplicado.

> [!WARNING]
> **Frontends de Checkout:** Vou remover a pasta isolada `checkout-studio/` e manter apenas os apps configurados no Turborepo (`apps/checkout` e o dashboard). Me confirme se podemos deletar o diretório solto.

## Proposed Changes

### 1. P0 — Bloqueadores (Fix Imediato de Boot e Rotas)
- **[MODIFY] `apps/api/routes/checkout.php`**: O namespace modular `Checkout\*` foi criado mas os arquivos físicos não subiram no repositório. Vou redirecionar essas rotas (PIX, Boleto, Eventos) para os controllers monolíticos existentes (`BasileiaCheckoutController` ou `AsaasCheckoutController`) ou criar os diretórios corretos e isolados se fizer sentido arquitetural.
- **[MODIFY] Ambiente Laravel (`bootstrap/cache/`)**: O erro `Target class [files] does not exist` no `SanctumServiceProvider` ocorre porque a pasta de cache do bootstrap no Laravel 12 está corrompida localmente (ou tem pacotes ausentes). Vou purgar os caches (`packages.php`, `services.php`) e garantir que a stack volte a bootar para o `php artisan test` rodar verde.
- **[NEW] Cobertura de Testes Core**: Criação de `PaymentIdempotencyTest.php` e expansão severa do `core_flows.cy.ts` para testar webhook.

---

### 2. P1 — Segurança (Hardening)
- **[MODIFY] `apps/api/app/Services/Gateway/Drivers/GenericHttpGatewayDriver.php`**: Linha 42. Vou alterar `verifySignature()` para falhar brutalmente (`throw new SecurityException`) se o payload/signature estiverem vazios ou sem algoritmo.
- **[MODIFY] `apps/dashboard/next.config.ts`**: Remoção de `ignoreBuildErrors: true` e `ignoreDuringBuilds: true`. O Typescript vai quebrar o build se estiver errado.
- **[MODIFY] `apps/dashboard/src/middleware.ts`**: Criação do middleware Next.js de borda. Proteção server-side genuína, lendo o token via `cookies` HTTPOnly e não via `sessionStorage`, prevenindo XSS e flash of unauthenticated content.
- **[MODIFY] `.gitignore`**: Limpeza pesada de artefatos de credenciais vazadas (adicionando `.env`, `login.json`, `cookies.txt`).

---

### 3. P1 — Arquitetura (Limpeza de Duplicação)
- **[DELETE] `apps/api/app/Http/Controllers/Api/V2/`**: Deleção sumária de API duplicada. (Sujeito a aprovação caso a V2 seja a real).
- **[DELETE] `apps/api/app/Services/Gateway/PagBankGateway.php`**: Deleção de gateway legado (Substituição pela arquitetura via `Drivers/`).
- **[DELETE] `checkout-studio/`**: Deleção do diretório solto na raiz.
- **[MODIFY] Inventário de Mocks**: Substituição de mockers remanescentes no dashboard para `apiFetch()`.

---

### 4. P2 — CI/CD e Estabilidade
- **[MODIFY] `.github/workflows/ci.yml`**: 
  - Subir para Node 20 / Node 22 (suportado pelo Turbo).
  - Adicionar Step de `npm run type-check`.
  - Atualizar actions/checkout para `v4`.
- **[DELETE] `_backup/deprecated_migrations/`**: Limpeza de histórico de migração instável. Baseline limpa das 37 ativas.
- **[MODIFY] Docker/Scheduler**: Atualização da documentação sobre o setup obrigatório do Horizon e Worker de filas em produção.

## Verification Plan

### Automated Tests
```bash
cd apps/api
php artisan optimize:clear
php artisan test
cd ../dashboard
npm run type-check
npm run build
```

### Manual Verification
- O usuário deve testar o comando `php artisan route:list` e `npm run dev` na raiz para garantir que não haja erros de boot e não haja flash content de client-side authentication no painel.
