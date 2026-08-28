export type DeveloperEnvironment = "production" | "sandbox"
export type ApiKeyStatus = "active" | "revoked" | "expired"
export type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE"

export interface DeveloperApiKey {
  id: string
  name: string
  prefix: string
  systemId: string
  systemName: string
  environment: DeveloperEnvironment
  scopes: string[]
  status: ApiKeyStatus
  createdAt: string
  lastUsedAt?: string
  expiresAt?: string
  createdBy: string
}

export interface DeveloperSummary {
  apiKeysActive: number
  apiCalls24h: number
  successRate24h: number
  activeWebhooks: number
  sandboxRequests24h: number
  apiStatus: {
    uptime: number
    latencyP95: number
    errorP95: number
    region: string
  }
}

export interface DeveloperLog {
  id: string
  requestId: string
  timestamp: string
  method: HttpMethod
  endpoint: string
  systemName: string
  apiKeyPrefix: string
  environment: DeveloperEnvironment
  statusCode: number
  latencyMs: number
  ip?: string
  userAgent?: string
  requestPayload?: string
  responsePayload?: string
}

export interface DeveloperSnippet {
  language: "curl" | "javascript" | "php" | "python"
  title: string
  code: string
}

export interface SandboxRequest {
  id: string
  timestamp: string
  endpoint: string
  method: HttpMethod
  statusCode: number
  latencyMs: number
  apiKeyPrefix: string
}
