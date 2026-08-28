# Walkthrough: Basileia Pay (Fase Final de Preparação)

Abaixo está o resumo executivo de todas as alterações feitas para preparar a aplicação Basileia Pay para o ambiente de produção, englobando desde a infraestrutura do Vault até a limpeza e travas de Qualidade.

## 1. Vault Security & Data Privacy (Fase 1)
O objetivo principal foi isolar e endurecer a criptografia dos dados sensíveis do cartão.
- **Implementação do `VaultService`**: A classe substitui a antiga lógica acoplada, e agora gerencia o processo de tokenização usando uma abordagem de envelope e chaves derivadas (HKDF) por tenant (`company_id`).
- **Implementação do `EncryptionKeyManager`**: Responsável por lidar com versionamento de chaves KEK e rotação, derivando deterministicamente a chave final por meio de HKDF.
- **`resolveToken` Legacy Fallback**: O método suporta tanto os novos tokens com o envelope seguro (`key_version`) quanto a reversão temporária e segura para tokens mais antigos que usavam IV e TAG independentes.
- **Rotas Internas**: As rotas de tokenização agora estão protegidas sob o `ServerToServerMiddleware`.
- **Driver Virtual de Cofre**: Um stub do `HashiCorpVault` foi desenvolvido para facilitar a transição para Vault gerenciado por infraestrutura no futuro.

## 2. Testes Automatizados & QA (Fase 2)
Testes focados nos fluxos críticos que garantirão que os pipelines de CI mantenham a estabilidade durante a evolução.
- **Backend Vault**: Desenvolvidos testes `VaultServiceTest.php` comprovando que os dados só são acessíveis com o `company_id` correto.
- **Feature Tests**: Validação de endpoints no `PaymentFlowTest.php`, cobrindo o contrato JSON esperado do `tokenize`.
- **Testes Ponta-a-Ponta**: Cypress configurado com script `core_flows.cy.ts` simulando operações críticas da UI.

## 3. Eliminação de Mocks na Interface (Fase 3)
Remoção de painéis visuais que antes dependiam de dados falsos e não processavam integrações reais.
- **Developer Sandbox e Trust Score**: O estado histórico desses componentes agora é iniciado em branco, pronto para integrar o log da API no lugar dos mocks fixos.
- **Routing Simulator**: Remoção das dependências vazias de mock. 

## 4. Faxina de Código e Pipeline de Qualidade (Fase 5)
Implementação de regras duras para o ambiente de CI (Continuous Integration), evitando que código com falhas primárias vaze para produção.
- **Deleção de Entulho**: Removemos todos os diretórios obsoletos (`_backup`, `deprecated_apps`, `scratch`, `plans`) e o repositório zumbi `packages/card-engine`.
- **Alinhamento do PHP**: Resolvemos a disparidade das versões. O Laravel agora exige `php: ^8.2` no `composer.json` em consonância total com o runner que opera a esteira no GitHub Actions.
- **Travas Anti-Debug em Produção**:
    - O **ESLint** do Next.js agora bloqueia envios que possuam `console.log()` com a regra `"no-console": "error"`.
    - O **PHPStan** (Análise Estática do Backend) foi configurado usando a extensão `spaze/phpstan-disallowed-calls` para varrer todo o repositório em busca dos helpers de debug `dd()` e `dump()`. Qualquer commit com um debug esquecido irá quebrar e ser rejeitado antes do deploy.
- **Vercel / GitHub Actions Strict Node Env**: Injeção da flag dura `NODE_ENV=production` na etapa de Build do Dashboard no CI, forçando otimização absoluta durante as compilações.

> [!TIP]
> A aplicação Next.js e o backend Laravel estão com os portões de verificação 100% blindados na esteira do `ci.yml`.

## Próximos Passos — Rumo a Produção 🚀
Toda a dívida técnica prioritária foi zerada. O sistema já está **tecnicamente apto** a suportar PCI-DSS SAQ-D no nível de banco de dados e criptografia. 
O próximo e último passo (Fase 4) é apenas burocrático e infraestrutural: rodar a esteira no seu servidor, conectar os containers e solicitar a certificação/pentest do ambiente cloud (via QSA externo).
