import { WebhookEndpoint, WebhookDelivery, WebhookKpi, WebhookFlowPoint, WebhookDeliveryStatus } from '@/types/webhook';

export const MOCK_ENDPOINTS: WebhookEndpoint[] = [
  {
    id: "ep_001",
    name: "Church - Pagamentos",
    url: "https://church.basileia.app/webhooks/payments",
    systemId: "sys_church",
    systemName: "Church",
    systemLogo: undefined,
    environment: "production",
    status: "active",
    deliveryRate24h: 99.8,
    lastDeliveryAt: "2026-05-19T10:52:00Z",
    events24h: 1420,
    recentErrors: [],
    subscribedEvents: ["payment.approved", "payment.failed", "subscription.renewed"],
    avgLatencyMs: 118,
    p95LatencyMs: 198,
    hmacEnabled: true,
    sslVerified: true,
    timeoutSeconds: 30,
    maxRetries: 5,
    retryStrategy: "exponential",
    createdAt: "2024-03-10T12:00:00Z",
    updatedAt: "2026-05-18T10:15:00Z"
  },
  {
    id: "ep_002",
    name: "Vendor - Pedidos",
    url: "https://vendor.basileia.app/webhooks/orders",
    systemId: "sys_vendor",
    systemName: "Vendor",
    environment: "production",
    status: "attention",
    deliveryRate24h: 96.2,
    lastDeliveryAt: "2026-05-19T10:44:00Z",
    events24h: 892,
    recentErrors: ["timeout", "500"],
    subscribedEvents: ["payment.approved", "order.created"],
    avgLatencyMs: 342,
    p95LatencyMs: 512,
    hmacEnabled: true,
    sslVerified: true,
    timeoutSeconds: 15,
    maxRetries: 3,
    retryStrategy: "exponential",
    createdAt: "2025-01-15T09:30:00Z",
    updatedAt: "2026-05-19T08:20:00Z"
  },
  {
    id: "ep_003",
    name: "Loja X - Checkout",
    url: "https://lojax.com/api/webhooks",
    systemId: "sys_lojax",
    systemName: "Loja X",
    environment: "production",
    status: "failed",
    deliveryRate24h: 71.4,
    lastDeliveryAt: "2026-05-19T09:10:00Z",
    events24h: 245,
    recentErrors: ["500", "connection_refused", "timeout"],
    subscribedEvents: ["payment.approved"],
    avgLatencyMs: 1840,
    p95LatencyMs: 3200,
    hmacEnabled: false,
    sslVerified: false,
    timeoutSeconds: 30,
    maxRetries: 5,
    retryStrategy: "linear",
    createdAt: "2025-08-20T16:45:00Z",
    updatedAt: "2026-05-19T09:12:00Z"
  },
  {
    id: "ep_004",
    name: "SaaS Externo - Testes",
    url: "https://sandbox.saas.io/hooks",
    systemId: "sys_saas",
    systemName: "SaaS Externo",
    environment: "sandbox",
    status: "disabled",
    deliveryRate24h: 0,
    lastDeliveryAt: null,
    events24h: 0,
    recentErrors: [],
    subscribedEvents: ["payment.*"],
    avgLatencyMs: null,
    p95LatencyMs: null,
    hmacEnabled: true,
    sslVerified: true,
    timeoutSeconds: 30,
    maxRetries: 5,
    retryStrategy: "fixed",
    createdAt: "2026-01-10T11:00:00Z",
    updatedAt: "2026-05-01T15:30:00Z"
  }
];

export const MOCK_DELIVERIES: WebhookDelivery[] = [
  {
    id: "wh_dlv_01JTK8XA1D0829A",
    endpointId: "ep_001",
    endpointName: "Church - Pagamentos",
    event: "payment.approved",
    paymentId: "pay_01JTK7abc",
    systemId: "sys_church",
    gatewayId: "asaas",
    status: "delivered",
    httpStatus: 200,
    latencyMs: 118,
    attempts: 1,
    maxAttempts: 5,
    payload: {
      event: "payment.approved",
      payment_id: "pay_01JTK7abc",
      amount: 29700,
      currency: "BRL",
      method: "pix",
      gateway: "asaas",
      system: "church",
      customer: {
        name: "Maria Silva",
        email: "maria@email.com"
      },
      created_at: "2026-05-19T10:52:14Z"
    },
    responseBody: "{\"status\":\"success\",\"received\":true}",
    responseHeaders: {
      "content-type": "application/json",
      "server": "nginx"
    },
    createdAt: "2026-05-19T10:52:14Z",
    deliveredAt: "2026-05-19T10:52:14Z"
  },
  {
    id: "wh_dlv_01JTK8XA1D0829B",
    endpointId: "ep_002",
    endpointName: "Vendor - Pedidos",
    event: "payment.approved",
    paymentId: "pay_01JTK7def",
    systemId: "sys_vendor",
    gatewayId: "pagarme",
    status: "delivered",
    httpStatus: 201,
    latencyMs: 298,
    attempts: 2,
    maxAttempts: 3,
    payload: {
      event: "payment.approved",
      payment_id: "pay_01JTK7def",
      amount: 45000,
      currency: "BRL",
      method: "credit_card",
      gateway: "pagarme",
      system: "vendor",
      customer: {
        name: "Rodrigo Costa",
        email: "rodrigo@email.com"
      },
      created_at: "2026-05-19T10:43:10Z"
    },
    responseBody: "{\"order_updated\":true,\"code\":201}",
    responseHeaders: {
      "content-type": "application/json",
      "x-powered-by": "Express"
    },
    createdAt: "2026-05-19T10:43:10Z",
    deliveredAt: "2026-05-19T10:44:00Z"
  },
  {
    id: "wh_dlv_01JTK8XA1D0829C",
    endpointId: "ep_003",
    endpointName: "Loja X - Checkout",
    event: "payment.approved",
    paymentId: "pay_01JTK7ghi",
    systemId: "sys_lojax",
    gatewayId: "mercadopago",
    status: "failed",
    httpStatus: 500,
    latencyMs: 1420,
    attempts: 5,
    maxAttempts: 5,
    payload: {
      event: "payment.approved",
      payment_id: "pay_01JTK7ghi",
      amount: 12900,
      currency: "BRL",
      method: "boleto",
      gateway: "mercadopago",
      system: "lojax",
      customer: {
        name: "Carla Souza",
        email: "carla@email.com"
      },
      created_at: "2026-05-19T09:10:00Z"
    },
    responseBody: "Internal Server Error",
    responseHeaders: {
      "content-type": "text/plain",
      "server": "Apache"
    },
    errorType: "500",
    createdAt: "2026-05-19T09:10:00Z"
  },
  {
    id: "wh_dlv_01JTK8XA1D0829D",
    endpointId: "ep_002",
    endpointName: "Vendor - Pedidos",
    event: "order.created",
    paymentId: "pay_01JTK7jkl",
    systemId: "sys_vendor",
    status: "retrying",
    httpStatus: 504,
    latencyMs: 15000,
    attempts: 1,
    maxAttempts: 3,
    payload: {
      event: "order.created",
      payment_id: "pay_01JTK7jkl",
      amount: 8900,
      currency: "BRL",
      method: "pix",
      gateway: "asaas",
      system: "vendor",
      customer: {
        name: "Eduardo Neto",
        email: "eduardo@email.com"
      },
      created_at: "2026-05-19T10:35:10Z"
    },
    responseBody: "Gateway Timeout",
    errorType: "timeout",
    nextRetryAt: "2026-05-19T11:05:10Z",
    createdAt: "2026-05-19T10:35:10Z"
  },
  {
    id: "wh_dlv_01JTK8XA1D0829E",
    endpointId: "ep_001",
    endpointName: "Church - Pagamentos",
    event: "payment.failed",
    paymentId: "pay_01JTK7mno",
    systemId: "sys_church",
    gatewayId: "asaas",
    status: "delivered",
    httpStatus: 200,
    latencyMs: 95,
    attempts: 1,
    maxAttempts: 5,
    payload: {
      event: "payment.failed",
      payment_id: "pay_01JTK7mno",
      reason: "insufficient_funds",
      amount: 5000,
      customer: {
        name: "Juliana Silva",
        email: "juliana@email.com"
      },
      created_at: "2026-05-19T10:28:15Z"
    },
    responseBody: "{\"received\":true}",
    createdAt: "2026-05-19T10:28:15Z",
    deliveredAt: "2026-05-19T10:28:15Z"
  },
  {
    id: "wh_dlv_01JTK8XA1D0829F",
    endpointId: "ep_001",
    endpointName: "Church - Pagamentos",
    event: "subscription.renewed",
    paymentId: "pay_01JTK7pqr",
    systemId: "sys_church",
    gatewayId: "asaas",
    status: "pending",
    attempts: 0,
    maxAttempts: 5,
    payload: {
      event: "subscription.renewed",
      payment_id: "pay_01JTK7pqr",
      subscription_id: "sub_01JTK8xyz",
      amount: 12900,
      created_at: "2026-05-19T10:55:00Z"
    },
    createdAt: "2026-05-19T10:55:00Z"
  }
];

// Add generic logs to make it 20+
for (let i = 1; i <= 20; i++) {
  const isSuccess = i % 4 !== 0;
  const status: WebhookDeliveryStatus = isSuccess ? "delivered" : "failed";
  const httpCode = isSuccess ? 200 : (i % 8 === 0 ? 504 : 500);
  const errorType = isSuccess ? undefined : (httpCode === 504 ? "timeout" as const : "500" as const);
  const latency = 80 + Math.floor(Math.random() * 400) + (isSuccess ? 0 : 1000);

  MOCK_DELIVERIES.push({
    id: `wh_dlv_gen_${1000 + i}`,
    endpointId: i % 2 === 0 ? "ep_001" : "ep_002",
    endpointName: i % 2 === 0 ? "Church - Pagamentos" : "Vendor - Pedidos",
    event: i % 3 === 0 ? "payment.approved" : (i % 3 === 1 ? "payment.failed" : "subscription.renewed"),
    systemId: i % 2 === 0 ? "sys_church" : "sys_vendor",
    status: status,
    httpStatus: httpCode,
    latencyMs: latency,
    attempts: isSuccess ? 1 : 5,
    maxAttempts: 5,
    payload: {
      event: "system.generic_ping",
      index: i,
      timestamp: new Date(Date.now() - i * 3600000).toISOString()
    },
    responseBody: isSuccess ? "{\"status\":\"ok\"}" : "Error response",
    errorType: errorType,
    createdAt: new Date(Date.now() - i * 3600000).toISOString(),
    deliveredAt: isSuccess ? new Date(Date.now() - i * 3600000).toISOString() : undefined
  });
}

export const MOCK_KPI: WebhookKpi = {
  activeEndpoints: 12,
  activeEndpointsDelta: 2,
  deliveryRate24h: 98.7,
  deliveryRate24hDelta: 0.3,
  eventsSent24h: 8421,
  eventsSent24hDelta: 14.2,
  failures24h: 112,
  failures24hDelta: -8.1,
  retries24h: 47,
  retries24hDelta: -12.0,
  avgDeliveryMs: 142,
  avgDeliveryMsDelta: -18.0
};

export const MOCK_FLOW_POINTS: WebhookFlowPoint[] = Array.from({ length: 24 }).map((_, idx) => {
  const baseHour = idx.toString().padStart(2, '0') + ':00';
  const sent = 300 + Math.floor(Math.random() * 150) + (idx >= 8 && idx <= 18 ? 200 : 0);
  const failed = Math.floor(Math.random() * 12);
  const retried = Math.floor(Math.random() * 6);
  const delivered = sent - failed;

  return {
    hour: baseHour,
    sent,
    delivered,
    failed,
    retried
  };
});
