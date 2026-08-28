# Tarefas: Master Fixes (P0-P2)

## P0 — Bloqueadores (Fix Imediato)
- `[x]` Reparar rotas inoperantes no `routes/checkout.php` redirecionando para `BasileiaCheckoutController`.
- `[x]` Limpar cache do Laravel (`bootstrap/cache/`) e validar boot do kernel.
- `[ ]` Criar testes de idempotência (`PaymentIdempotencyTest.php`) e expandir Cypress.

## P1 — Segurança (Hardening)
- `[x]` Bloquear webhook by-pass em `GenericHttpGatewayDriver.php` (forçar verificação de algoritmo/secret).
- `[x]` Remover ignore build TS/ESLint do `next.config.ts` do dashboard.
- `[x]` Mover AuthGuard para Edge Middleware (`middleware.ts`) protegendo rotas no server-side com HTTPOnly Cookie.
- `[x]` Limpar `.gitignore` de credenciais e remover tracking de arquivos sigilosos se aplicável.

## P1 — Arquitetura (Limpeza)
- `[x]` Deletar `apps/api/app/Http/Controllers/Api/V2/` e unificar na V1.
- `[x]` Deletar gateway legado `PagBankGateway.php` e focar na arquitetura de Drivers.
- `[x]` Deletar frontend obsoleto `checkout-studio/`.
- `[x]` Remover mockers de telas pendentes (`TrustScoreSearch`, etc) do frontend.

## P2 — CI/CD e Estabilidade
- `[x]` Atualizar pipeline de CI (`.github/workflows/ci.yml`) para Node 20, checkout v4 e adicionar `type-check`.
- `[x]` Limpar `_backup/deprecated_migrations/` do Git.
- `[x]` Adicionar documentação de Queue Worker / Scheduler nas instruções locais.
