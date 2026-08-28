export type WebhookEndpointStatus = "active" | "attention" | "disabled" | "failed";
export type WebhookDeliveryStatus = "delivered" | "failed" | "pending" | "retrying";
export type WebhookEnvironment = "production" | "sandbox";

export interface WebhookEndpoint {
  id: string;
  name: string;
  url: string;
  systemId: string;
  systemName: string;
  systemLogo?: string;
  environment: WebhookEnvironment;
  status: WebhookEndpointStatus;
  deliveryRate24h: number;
  lastDeliveryAt: string | null;
  events24h: number;
  recentErrors: string[];
  subscribedEvents: string[];
  avgLatencyMs: number | null;
  p95LatencyMs: number | null;
  hmacEnabled: boolean;
  sslVerified: boolean;
  timeoutSeconds: number;
  maxRetries: number;
  retryStrategy: "exponential" | "linear" | "fixed";
  createdAt: string;
  updatedAt: string;
}

export interface WebhookDelivery {
  id: string;
  endpointId: string;
  endpointName: string;
  event: string;
  paymentId?: string;
  systemId: string;
  gatewayId?: string;
  status: WebhookDeliveryStatus;
  httpStatus?: number;
  latencyMs?: number;
  attempts: number;
  maxAttempts: number;
  payload: Record<string, unknown>;
  responseBody?: string;
  responseHeaders?: Record<string, string>;
  errorType?: "timeout" | "500" | "SSL" | "connection_refused" | "invalid_hmac";
  nextRetryAt?: string;
  createdAt: string;
  deliveredAt?: string;
}

export interface WebhookKpi {
  activeEndpoints: number;
  activeEndpointsDelta: number;
  deliveryRate24h: number;
  deliveryRate24hDelta: number;
  eventsSent24h: number;
  eventsSent24hDelta: number;
  failures24h: number;
  failures24hDelta: number;
  retries24h: number;
  retries24hDelta: number;
  avgDeliveryMs: number;
  avgDeliveryMsDelta: number;
}

export interface WebhookFlowPoint {
  hour: string;
  sent: number;
  delivered: number;
  failed: number;
  retried: number;
}

export interface WebhookTestResult {
  success: boolean;
  httpStatus: number;
  latencyMs: number;
  responseBody: string;
  responseHeaders: Record<string, string>;
  hmacValid: boolean;
  error?: string;
}
