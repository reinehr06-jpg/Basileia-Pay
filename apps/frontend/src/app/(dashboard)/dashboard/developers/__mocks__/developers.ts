import { DeveloperSummary, DeveloperApiKey, DeveloperLog, SandboxRequest } from '@/types/developers';

export const MOCK_DEVELOPER_SUMMARY: DeveloperSummary = {
  apiKeysActive: 12,
  apiCalls24h: 184231,
  successRate24h: 99.42,
  activeWebhooks: 24,
  sandboxRequests24h: 8912,
  apiStatus: {
    uptime: 99.95,
    latencyP95: 198,
    errorP95: 0.02,
    region: "São Paulo, BR",
  },
};

export const MOCK_API_KEYS: DeveloperApiKey[] = [
  {
    id: "key_01",
    name: "ERP Vendor Produção",
    prefix: "sk_live_bsl_29fa",
    systemId: "sys_vendor",
    systemName: "Vendor",
    environment: "production",
    scopes: ["checkouts.create", "payments.read", "webhooks.read"],
    status: "active",
    createdAt: "2026-05-01T10:00:00Z",
    lastUsedAt: "2026-05-19T11:42:00Z",
    createdBy: "Carlos Oliveira",
  },
  {
    id: "key_02",
    name: "Church Sandbox",
    prefix: "sk_test_bsl_77bc",
    systemId: "sys_church",
    systemName: "Church",
    environment: "sandbox",
    scopes: ["checkouts.create", "payments.read"],
    status: "active",
    createdAt: "2026-05-10T09:15:00Z",
    lastUsedAt: "2026-05-19T11:10:00Z",
    createdBy: "Carlos Oliveira",
  },
  {
    id: "key_03",
    name: "Legacy Integration",
    prefix: "sk_live_bsl_00de",
    systemId: "sys_legacy",
    systemName: "Legacy ERP",
    environment: "production",
    scopes: ["payments.read"],
    status: "revoked",
    createdAt: "2026-03-22T12:00:00Z",
    lastUsedAt: "2026-04-19T18:40:00Z",
    createdBy: "Alexandre Silva",
  },
  {
    id: "key_04",
    name: "Automação de Notas Fiscais",
    prefix: "sk_live_bsl_91ab",
    systemId: "sys_invoice",
    systemName: "Emissor Fiscal",
    environment: "production",
    scopes: ["payments.read", "refunds.write"],
    status: "expired",
    createdAt: "2025-05-18T08:00:00Z",
    lastUsedAt: "2026-05-18T08:00:00Z",
    expiresAt: "2026-05-18T08:00:00Z",
    createdBy: "Mariana Costa",
  }
];

export const MOCK_DEVELOPER_LOGS: DeveloperLog[] = [
  {
    id: "log_01",
    requestId: "req_3a9f0e1d8c2b",
    timestamp: "2026-05-19T12:14:02Z",
    method: "POST",
    endpoint: "/v1/checkouts",
    systemName: "Vendor ERP",
    apiKeyPrefix: "sk_live_bsl_29fa",
    environment: "production",
    statusCode: 201,
    latencyMs: 142,
    ip: "186.204.12.98",
    userAgent: "Basileia-HttpClient/1.0 (Node.js 18)",
    requestPayload: JSON.stringify({
      system_id: "sys_vendor",
      amount: 15990,
      currency: "BRL",
      customer: {
        name: "Mariana Souza",
        email: "mariana@email.com"
      }
    }, null, 2),
    responsePayload: JSON.stringify({
      id: "chk_01JTK8X9A214",
      status: "created",
      amount: 15990,
      checkout_url: "https://pay.basileia.com/chk_01JTK8X9A214",
      expires_at: "2026-05-19T15:00:00Z"
    }, null, 2)
  },
  {
    id: "log_02",
    requestId: "req_8b1f2e4c7d9a",
    timestamp: "2026-05-19T12:12:45Z",
    method: "GET",
    endpoint: "/v1/payments/pay_7c9d8a1e2f3",
    systemName: "Church Mobile",
    apiKeyPrefix: "sk_test_bsl_77bc",
    environment: "sandbox",
    statusCode: 200,
    latencyMs: 89,
    ip: "177.34.89.21",
    userAgent: "Axios/1.6.0 (macOS)",
    requestPayload: "{}",
    responsePayload: JSON.stringify({
      id: "pay_7c9d8a1e2f3",
      amount: 5000,
      status: "succeeded",
      payment_method: "pix",
      customer: {
        name: "Júlio César",
        email: "julio@igreja.org"
      }
    }, null, 2)
  },
  {
    id: "log_03",
    requestId: "req_9f8e7d6c5b4a",
    timestamp: "2026-05-19T12:10:11Z",
    method: "POST",
    endpoint: "/v1/refunds",
    systemName: "Legacy ERP",
    apiKeyPrefix: "sk_live_bsl_00de",
    environment: "production",
    statusCode: 401,
    latencyMs: 45,
    ip: "200.18.92.104",
    userAgent: "curl/8.4.0",
    requestPayload: JSON.stringify({
      payment_id: "pay_01JTK78A2299",
      amount: 15990
    }, null, 2),
    responsePayload: JSON.stringify({
      error: {
        code: "unauthorized",
        message: "A chave de API fornecida foi revogada e não tem mais acesso à plataforma.",
        param: null
      }
    }, null, 2)
  },
  {
    id: "log_04",
    requestId: "req_2d1c0b9a8f7e",
    timestamp: "2026-05-19T12:08:50Z",
    method: "POST",
    endpoint: "/v1/checkouts",
    systemName: "Vendor ERP",
    apiKeyPrefix: "sk_live_bsl_29fa",
    environment: "production",
    statusCode: 400,
    latencyMs: 112,
    ip: "186.204.12.98",
    userAgent: "Basileia-HttpClient/1.0 (Node.js 18)",
    requestPayload: JSON.stringify({
      system_id: "sys_vendor",
      amount: -1500, // Invalid amount
      currency: "BRL"
    }, null, 2),
    responsePayload: JSON.stringify({
      error: {
        code: "invalid_request_error",
        message: "O valor informado (amount) deve ser um inteiro positivo em centavos.",
        param: "amount"
      }
    }, null, 2)
  },
  {
    id: "log_05",
    requestId: "req_7a8b9c0d1e2f",
    timestamp: "2026-05-19T11:55:30Z",
    method: "POST",
    endpoint: "/v1/webhooks/test",
    systemName: "Portal Integração",
    apiKeyPrefix: "sk_test_bsl_77bc",
    environment: "sandbox",
    statusCode: 200,
    latencyMs: 420,
    ip: "177.34.89.21",
    userAgent: "BasileiaEngine/2.4 (Sandbox Webhook Delivery)",
    requestPayload: JSON.stringify({
      event: "payment.succeeded",
      data: {
        id: "pay_test_99ab12",
        amount: 8990,
        status: "succeeded"
      }
    }, null, 2),
    responsePayload: "HTTP 200 OK\nBody: {\"status\":\"received\"}"
  },
  {
    id: "log_06",
    requestId: "req_5f4e3d2c1b0a",
    timestamp: "2026-05-19T11:45:12Z",
    method: "DELETE",
    endpoint: "/v1/checkouts/chk_98e27c",
    systemName: "Church Sandbox",
    apiKeyPrefix: "sk_test_bsl_77bc",
    environment: "sandbox",
    statusCode: 500,
    latencyMs: 1250,
    ip: "177.34.89.21",
    userAgent: "Axios/1.6.0 (macOS)",
    requestPayload: "{}",
    responsePayload: JSON.stringify({
      error: {
        code: "internal_server_error",
        message: "Ocorreu um erro interno no gateway de processamento da Basileia Pay. Contate o suporte.",
        param: null
      }
    }, null, 2)
  }
];

export const MOCK_SANDBOX_REQUESTS: SandboxRequest[] = [
  {
    id: "req_sb_01",
    timestamp: "2026-05-19T12:12:45Z",
    endpoint: "/v1/payments/pay_7c9d8a1e2f3",
    method: "GET",
    statusCode: 200,
    latencyMs: 89,
    apiKeyPrefix: "sk_test_bsl_77bc"
  },
  {
    id: "req_sb_02",
    timestamp: "2026-05-19T12:05:00Z",
    endpoint: "/v1/checkouts",
    method: "POST",
    statusCode: 201,
    latencyMs: 154,
    apiKeyPrefix: "sk_test_bsl_77bc"
  },
  {
    id: "req_sb_03",
    timestamp: "2026-05-19T11:55:30Z",
    endpoint: "/v1/webhooks/test",
    method: "POST",
    statusCode: 200,
    latencyMs: 420,
    apiKeyPrefix: "sk_test_bsl_77bc"
  },
  {
    id: "req_sb_04",
    timestamp: "2026-05-19T11:45:12Z",
    endpoint: "/v1/checkouts/chk_98e27c",
    method: "DELETE",
    statusCode: 500,
    latencyMs: 1250,
    apiKeyPrefix: "sk_test_bsl_77bc"
  },
  {
    id: "req_sb_05",
    timestamp: "2026-05-19T11:30:18Z",
    endpoint: "/v1/checkouts",
    method: "POST",
    statusCode: 400,
    latencyMs: 92,
    apiKeyPrefix: "sk_test_bsl_77bc"
  }
];
