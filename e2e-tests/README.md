# Basileia-Pay E2E Tests

Esta suite de testes ponta a ponta (E2E) cobre os cenários obrigatórios de garantia de qualidade (QA) para garantir que os Blocos 1 a 4 operem com segurança antes de cada deploy em produção.

## Cenários Cobertos

1. **Auth completo**: login → 2FA → seleção de empresa → acesso ao dashboard.
2. **Gestão de usuários**: criar usuário, atribuir perfil, validar que perfil restrito não acessa rota proibida.
3. **Gateway**: cadastrar gateway sandbox, testar conexão, rotacionar secret.
4. **Checkout**: criar checkout no dashboard → editar no Studio → salvar → publicar → abrir URL pública.
5. **Pagamento**: gerar pedido no checkout público → criar pagamento com idempotency key → simular webhook de confirmação → validar atualização de status.
6. **Webhook duplicado**: reenviar o mesmo evento de webhook duas vezes → validar que não duplica efeito (idempotência).
7. **Reembolso**: solicitar reembolso parcial e total, validar limites.
8. **Conciliação**: forçar discrepância manualmente e validar que o job de reconciliação corrige o estado.
9. **Falha de gateway**: simular timeout do gateway e validar fallback configurado (se houver) ou erro tratado corretamente.
10. **Multiempresa**: validar que usuário da empresa A nunca vê dado da empresa B em nenhuma tela.

## Como rodar

```bash
npm ci
npm run cypress:open
```
