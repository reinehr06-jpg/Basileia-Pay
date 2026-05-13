# Plano de Refatoração: Eliminação de Duplicações e Correção de Bugs

## 📋 Visão Geral

Este documento detalha o plano para eliminar duplicações de código e corrigir bugs no projeto CheckOutFINAL. O foco principal é na arquitetura de checkout e gateways de pagamento.

## 🔍 Problemas Identificados

### 1. Duplicação de Gateways (CRÍTICO)

**Problema:** Existem duas estruturas paralelas de Gateway:
- `app/Services/Gateway/` - Contém 20+ classes de gateway individuais + GatewayFactory + GatewayInterface
- `app/Services/Gateways/` - Contém apenas AsaasGateway, StripeGateway e uma GatewayFactory diferente

**Impacto:**
- Confusão sobre qual usar
- BasileiaCheckoutController usa `App\Services\Gateways\GatewayFactory`
- PaymentServices (Card, Boleto, Pix) usam `App\Services\Gateways\GatewayFactory`
- AsaasCheckoutController usa `AsaasPaymentService` diretamente
- CheckoutController usa `AsaasPaymentService` diretamente
- Inconsistência total

**Solução:** 
- Consolidar em uma única estrutura: `App\Services\Gateway\`
- A `GatewayFactory` existente em `Gateway/` já suporta todos os gateways
- Remover `app/Services/Gateways/` completamente
- Atualizar todos os usos para `App\Services\Gateway\GatewayFactory`

---

### 2. Duplicação Massiva em Checkout Controllers

**Problema:** 6 controllers diferentes com lógica quase idêntica:

| Controller | Linhas | Padrão |
|------------|--------|--------|
| CheckoutController | 222 | Legacy, misturado |
| BasileiaCheckoutController | 329 | Usa GatewayFactory |
| AsaasCheckoutController | 141 | Usa AsaasPaymentService |
| CardCheckoutController | 236 | Usa CardPaymentService |
| BoletoCheckoutController | 207 | Usa BoletoPaymentService |
| PixCheckoutController | 213 | Usa PixPaymentService |

**Código Duplicado (80-90%):**

1. **Busca de Transaction:**
```php
$transaction = Transaction::where('uuid', $uuid)->first()
    ?? Subscription::where('uuid', $uuid)->firstOrFail();
```

2. **Obtenção do AsaasPayment:**
```php
$asaasPaymentId = $transaction->asaas_payment_id ?? $transaction->gateway_subscription_id;
$asaasPayment = $this->asaasService->getPayment($asaasPaymentId);
if (!$asaasPayment) {
    // fallback com dados locais (quase idêntico em todos)
}
```

3. **Construção de customerData:**
```php
$customerData = [
    'name' => $customer['name'] ?? ($transaction->customer_name ?? ''),
    'email' => $customer['email'] ?? ($transaction->customer_email ?? ''),
    // ... etc
];
```

4. **Criação de Transaction (quando não existe):**
```php
if (!$transaction->exists || !$transaction->id) {
    $transaction = Transaction::create([
        'uuid' => Str::uuid(),
        'company_id' => $companyId,
        'asaas_payment_id' => $asaasPaymentId,
        'source' => '...', // DIFERENTE em cada controller
        'amount' => $asaasPayment['value'] ?? 0,
        // ... campos quase idênticos
    ]);
}
```

5. **Método status():** **EXATAMENTE IGUAL** em Card, Boleto, Pix:
```php
public function status(string $uuid)
{
    $transaction = Transaction::where('uuid', $uuid)->first();
    if (!$transaction) {
        return response()->json(['status' => 'not_found'], 404);
    }
    if ($transaction->status === 'pending' && $transaction->asaas_payment_id) {
        $asaasPayment = $this->asaasService->getPayment($transaction->asaas_payment_id);
        if ($asaasPayment) {
            $status = $this->service->mapStatus($asaasPayment['status'] ?? 'PENDING');
            if ($status !== 'pending') {
                $paidAt = $this->service->isPaid($asaasPayment['status'] ?? '') ? now() : null;
                $transaction->update(['status' => $status, 'paid_at' => $paidAt]);
                $this->webhookNotifier->notify($transaction);
            }
        }
    }
    return response()->json(['status' => $transaction->status]);
}
```

**Solução:**
- Criar `AbstractCheckoutController` com toda lógica comum
- Criar `CheckoutHelper` trait ou service para:
  - `findTransactionByUuid($uuid)`
  - `getAsaasPaymentWithFallback($transaction, $asaasService)`
  - `buildCustomerData($asaasPayment, $transaction)`
  - `createTransactionFromPayment($data, $source)`
  - `checkAndUpdateStatus($transaction, $asaasService, $paymentService)`
- Controllers específicos ficam apenas com:
  - Nome da view
  - Serviço de pagamento específico
  - Método de pagamento

---

### 3. Inconsistência em Transaction->source

**Problema:** Cada controller usa um valor diferente:
- BasileiaCheckoutController: `'basileia_vendas'`
- AsaasCheckoutController: `'basileia_vendas'`
- Card/Boleto/Pix Checkout: `'basileia_vendas'`
- DefaultVendorController: `'default_vendor'`
- CheckoutController (legacy): não define source
- EventCheckoutController: não usa source

**Bug Potencial:** Dificulta relatórios e filtros por origem.

**Solução:** 
- Padronizar para `'checkout'` ou manter `'basileia_vendas'` e corrigir todos
- Adicionar campo `checkout_type` ou `payment_channel` se necessário diferenciar

---

### 4. View Names Inconsistentes

**Problema:** Views diferentes para mesma funcionalidade:
- CardCheckoutController::success → `checkout.sucesso`
- BasileiaCheckoutController::success → `checkout.asaas-success`
- AsaasCheckoutController::success → `checkout.asaas-success`
- BoletoCheckoutController::show → `checkout.boleto.pagamento`
- PixCheckoutController::show → `checkout.pix.pagamento`
- CardCheckoutController::show → `checkout.card.pagamento`
- CheckoutController::show → `checkout.index`
- DefaultVendorController::handle → `checkout.premium`

**Solução:**
- Padronizar nomes:
  - `checkout.{method}.show` → `checkout.{method}` 
  - `checkout.success` (única para todos)
  - Ou manter separado mas padronizar: `checkout.{method}.success`

---

### 5. Tratamento de Erro Inconsistente

**Problema:** 
- AsaasCheckoutController: retorna `back()->withErrors()` (redirect)
- BasileiaCheckoutController: retorna JSON com `ok: false`
- Card/Boleto/Pix: retornam JSON com `ok: false`
- CheckoutController: retorna JSON com `status: error`

**Solução:** Padronizar para JSON em APIs, redirect em web. Separar claramente.

---

### 6. Validação Duplicada e Inconsistente

**Problema:**
- AsaasCheckoutController: valida `card_number`, `card_name`, `card_expiry`, `card_cvv`
- BasileiaCheckoutController: valida `cardToken`, `cardHolderName`, etc (diferente!)
- CardCheckoutController: valida `cardToken`, `cardHolderName`, `cardExpiry`, `cardCvv`
- DefaultVendorController: valida `card_number`, `card_name`, `card_expiry`, `card_cvv`

**Solução:** Padronizar regras de validação em um FormRequest ou no serviço.

---

### 7. Falta de Abstração para Customer Creation

**Problema:** Todos os controllers criam customers da mesma forma:
```php
$gateway->createCustomer([
    'name' => $customerData['name'],
    'email' => $customerData['email'],
    'phone' => '',
    'document' => $customerData['document'],
    'zip' => '',
]);
```

**Solução:** Encapsular no serviço de pagamento (já está, mas pode ser melhorado).

---

### 8. Bug: Transaction Creation com Dados Incompletos

**Problema:** Em BasileiaCheckoutController, AsaasCheckoutController e outros, quando a transaction não existe, são criadas com:
```php
'external_id' => '',
'callback_url' => config('basileia.callback_url', ''),
```

Mas `callback_url` pode não estar configurado, resultando em string vazia.

**Solução:** Garantir configuração padrão ou tornar obrigatório.

---

### 9. Duplicação de i18n Loading

**Problema:** Código para carregar arquivos de idioma aparece em:
- CheckoutController (pt, ja, en)
- BasileiaCheckoutController (pt, ja, en, es)

**Solução:** Extrair para service ou helper.

---

### 10. Inconsistência no Campo `asaas_payment_id` vs `gateway_subscription_id`

**Problema:** O modelo Transaction tem `asaas_payment_id`, mas Subscription tem `gateway_subscription_id`. 
Controllers usam:
```php
$asaasPaymentId = $transaction->asaas_payment_id ?? $transaction->gateway_subscription_id;
```

Isso é confuso. Se o sistema suporta múltiplos gateways, o campo deveria ser `gateway_payment_id` genérico.

**Solução:** 
- Curto prazo: manter como está, mas documentar
- Longo prazo: renomear para `gateway_payment_id` e remover especificidade Asaas

---

## 🎯 Plano de Ação Detalhado

### Fase 1: Consolidação de Gateway (Prioridade ALTA)

**Tarefa 1.1:** Remover `app/Services/Gateways/`
- [ ] Mover `AsaasGateway.php` de `Gateways/` para `Gateway/` (se for diferente do existente)
- [ ] Mover `StripeGateway.php` de `Gateways/` para `Gateway/` (se for diferente)
- [ ] Remover `Gateways/GatewayFactory.php` (já existe em `Gateway/`)
- [ ] Atualizar namespaces em todos os arquivos que usam `App\Services\Gateways\`
- [ ] Testar

**Tarefa 1.2:** Padronizar uso de `GatewayFactory`
- [ ] Todos os serviços de pagamento devem usar `App\Services\Gateway\GatewayFactory::make($type)`
- [ ] BasileiaCheckoutController deve usar `GatewayFactory` de `Gateway/`
- [ ] DefaultVendorController deve usar `GatewayFactory` de `Gateway/`

---

### Fase 2: Abstração de Checkout (Prioridade ALTA)

**Tarefa 2.1:** Criar `AbstractCheckoutController`
- Localização: `app/Http/Controllers/Checkout/AbstractCheckoutController.php`
- Propósito: Implementar toda lógica comum
- Métodos abstratos: `getPaymentMethod()`, `getViewName()`, `getPaymentService()`

**Tarefa 2.2:** Criar `CheckoutService` ou `CheckoutHelper`
- Localização: `app/Services/CheckoutService.php`
- Métodos estáticos/instância:
  - `findTransaction(string $uuid): Transaction|Subscription`
  - `getAsaasPaymentWithFallback(AsaasPaymentService $asaasService, $transaction, string $asaasPaymentId): array`
  - `buildCustomerData(array $asaasPayment, $transaction): array`
  - `createTransaction(array $data, string $source): Transaction`
  - `loadI18n(): array`

**Tarefa 2.3:** Refatorar controllers específicos
- CardCheckoutController: estender AbstractCheckoutController, reduzir para ~50 linhas
- BoletoCheckoutController: estender AbstractCheckoutController, reduzir para ~50 linhas
- PixCheckoutController: estender AbstractCheckoutController, reduzir para ~50 linhas

**Tarefa 2.4:** Decidir fate de CheckoutController, BasileiaCheckoutController, AsaasCheckoutController
- Opção A: Remover e migrar rotas
- Opção B: Manter mas refatorar para usar AbstractCheckoutController
- Recomendação: Opção B (compatibilidade), marcar como @deprecated

---

### Fase 3: Padronização (Prioridade MÉDIA)

**Tarefa 3.1:** Padronizar `source` em Transaction
- [ ] Decidir valor padrão: `'checkout'`
- [ ] Atualizar todos os controllers para usar o mesmo
- [ ] Criar constante em Transaction: `const SOURCE_CHECKOUT = 'checkout'`

**Tarefa 3.2:** Padronizar nomes de views
- [ ] Criar convenção: `checkout.{method}.show` → view `checkout.{method}`
- [ ] Renomear views ou ajustar controllers
- [ ] Atualizar rotas se necessário

**Tarefa 3.3:** Criar FormRequests para validação
- [ ] `ProcessCardPaymentRequest`
- [ ] `ProcessPixPaymentRequest`
- [ ] `ProcessBoletoPaymentRequest`
- [ ] Centralizar regras

**Tarefa 3.4:** Padronizar respostas de erro
- [ ] Criar `CheckoutResponse` class ou helper
- [ ] Métodos: `success($data)`, `error($message)`, `validationError($errors)`

---

### Fase 4: Correção de Bugs (Prioridade VARIADA)

**Bug 1:** `callback_url` pode ser vazio
- [ ] Garantir configuração padrão em `config/basileia.php` ou `.env`
- [ ] Validar antes de criar transaction

**Bug 2:** Tratamento de exceção em `AsaasPaymentService::getPixQrCode()` retorna `[]` no catch
- [ ] Deve retornar `null` ou lançar exceção
- [ ] Consistência com outros métodos

**Bug 3:** `PaymentStatusMapper::isPaid()` não cobre todos status confirmados
- [ ] Adicionar `'RECEIVED_IN_CASH'` (já está no mapStatus mas não no isPaid)

**Bug 4:** Duplicação de lógica de fallback quando Asaas não encontra pagamento
- [ ] Centralizar no CheckoutService

**Bug 5:** Inconsistência no campo `payment_method`
- [ ] Alguns usam `PaymentStatusMapper::mapPaymentMethod()`
- [ ] Outros usam string literal `'credit_card'`, `'pix'`, `'boleto'`
- [ ] Padronizar para sempre usar o mapper

---

### Fase 5: Limpeza e Depreciação (Prioridade BAIXA)

**Tarefa 5.1:** Marcar controllers legados como @deprecated
- [ ] CheckoutController
- [ ] BasileiaCheckoutController  
- [ ] AsaasCheckoutController
- [ ] Adicionar comentário: "Use CardCheckoutController, PixCheckoutController, BoletoCheckoutController"

**Tarefa 5.2:** Atualizar documentação
- [ ] README.md com nova arquitetura
- [ ] Comentários PHPDoc em todas as classes
- [ ] Guia de migração

---

## 📊 Priorização

### Sprint 1 (Crítico - Semana 1)
1. Consolidar GatewayFactory (Fase 1)
2. Criar AbstractCheckoutController (Fase 2.1)
3. Criar CheckoutService (Fase 2.2)
4. Refatorar CardCheckoutController (Fase 2.3)
5. Refatorar BoletoCheckoutController (Fase 2.3)
6. Refatorar PixCheckoutController (Fase 2.3)

### Sprint 2 (Alto - Semana 2)
1. Padronizar source em Transaction (Fase 3.1)
2. Criar FormRequests (Fase 3.3)
3. Padronizar respostas (Fase 3.4)
4. Corrigir bugs 1-3 (Fase 4)
5. Atualizar routes/checkout.php

### Sprint 3 (Médio - Semana 3)
1. Decidir fate de controllers legados (Fase 2.4)
2. Padronizar view names (Fase 3.2)
3. Corrigir bugs restantes (Fase 4)
4. Testes completos de checkout
5. Documentação

---

## 🏗️ Arquitetura Proposta

```
app/
├── Http/
│   └── Controllers/
│       ├── Checkout/
│       │   ├── AbstractCheckoutController.php  ← Nova base
│       │   ├── CardCheckoutController.php      ← Refatorado
│       │   ├── BoletoCheckoutController.php    ← Refatorado
│       │   ├── PixCheckoutController.php       ← Refatorado
│       │   └── EventCheckoutController.php     ← (já está bom)
│       ├── AsaasCheckoutController.php         ← @deprecated
│       ├── BasileiaCheckoutController.php      ← @deprecated
│       └── CheckoutController.php              ← @deprecated
├── Services/
│   ├── Gateway/
│   │   ├── GatewayFactory.php                  ← ÚNICO factory
│   │   ├── GatewayInterface.php
│   │   ├── AsaasGateway.php
│   │   ├── StripeGateway.php
│   │   └── ... (outros)
│   ├── Payment/
│   │   ├── CardPaymentService.php
│   │   ├── BoletoPaymentService.php
│   │   ├── PixPaymentService.php
│   │   └── PaymentStatusMapper.php
│   ├── CheckoutService.php                     ← NOVO
│   └── AsaasPaymentService.php
└── Traits/
    └── HandlesCheckout.php                     ← Alternativa ao service
```

---

## 🔄 Backward Compatibility

**Estratégia:**
1. Manter controllers antigos funcionando durante 1 sprint
2. Adicionar middleware de depreciação que loga warning
3. Atualizar rotas para usar novos controllers
4. Após 2 sprints, remover controllers legados

---

## ✅ Critérios de Sucesso

- [ ] Redução de 40% no código duplicado (métrica: linhas removidas vs linhas adicionadas)
- [ ] Todos os checkout controllers específicos têm < 100 linhas
- [ ] Apenas UMA GatewayFactory em uso
- [ ] Testes manuais de checkout (PIX, Cartão, Boleto) passam
- [ ] Logs não contêm erros de "undefined index" ou "null pointer"
- [ ] Documentação atualizada

---

## 📝 Notas de Implementação

### Ordem Recomendada:

1. **NÃO QUEBRAR NADA** - Trabalhar em branch separado
2. Começar criando `CheckoutService` com métodos estáticos (fácil testar)
3. Refatorar um controller de cada vez, testando após cada um
4. Usar `git diff` para garantir que a lógica permanece idêntica
5. Manter logs existentes (não remover, apenas adicionar)

### Padrões a Seguir:

- **Single Responsibility:** Cada classe/função faz uma coisa
- **DRY:** Don't Repeat Yourself (não copiar/colar)
- **Open/Closed:** Extender sem modificar (usar herança/traits)
- **Composition over Inheritance:** Preferir services em vez de herança profunda

---

## 🐛 Bugs Conhecidos (Antes da Refatoração)

1. **callback_url vazio** - Transaction pode ter callback_url vazio
2. **isPaid() incompleto** - Não cobre todos status CONFIRMED
3. **Validação inconsistente** - Diferentes regras por controller
4. **Tratamento de erro duplicado** - Lógica de try-copy-paste
5. **Fallback Asaas duplicado** - 6 cópias da mesma lógica
6. **Customer data building** - 6 cópias do mesmo array mapping
7. **Transaction creation** - 4 cópias com leves variações
8. **Status polling** - 3 cópias EXATAS do mesmo código

---

## 📈 Métricas

**Antes:**
- CheckoutController: 222 linhas
- BasileiaCheckoutController: 329 linhas
- AsaasCheckoutController: 141 linhas
- CardCheckoutController: 236 linhas
- BoletoCheckoutController: 207 linhas
- PixCheckoutController: 213 linhas
- **Total: 1,348 linhas** (com ~70% duplicação)

**Depois:**
- AbstractCheckoutController: ~150 linhas (lógica comum)
- CardCheckoutController: ~40 linhas
- BoletoCheckoutController: ~40 linhas
- PixCheckoutController: ~40 linhas
- CheckoutService: ~100 linhas
- **Total: ~370 linhas** (73% redução)

**Economia:** ~978 linhas de código duplicado eliminadas

---

## 🚀 Próximos Passos

Após aprovação deste plano:
1. Criar branch `refactor/checkout-consolidation`
2. Implementar Fase 1 (Gateway)
3. Implementar Fase 2 (AbstractController + CheckoutService)
4. Testar exaustivamente
5. Criar pull request com descrição detalhada
6. Deploy em staging
7. Validar com QA
8. Deploy em produção

---

**Documento criado:** 2025-05-11  
**Autor:** Plano de Refatoração CheckOutFINAL  
**Status:** Em análise
