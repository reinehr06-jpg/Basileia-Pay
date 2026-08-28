export type GatewayListItem = {
  id: number
  slug: string
  name: string
  provider: string
  environment: string
  status: string
  is_default: boolean
  last_tested_at: string | null
  last_test_status: string | null
  circuit_state: string
}

export type GatewayAccount = {
  uuid: string
  name: string
  environment: string
  status: string
  gateway_type: string
  settings: Record<string, unknown> | null
}

export type CircuitBreakerState = {
  state: string
  consecutive_failures: number
}

export type GatewayHealth = {
  approval_rate: number | null
  failure_rate: number | null
  avg_latency_ms: number | null
  total_transactions: number
  last_approved_at: string | null
  last_failed_at: string | null
}

export type GatewayDetail = {
  gateway: {
    id: number
    slug: string
    name: string
    provider: string
    status: string
    is_default: boolean
    last_tested_at: string | null
    last_test_status: string | null
  }
  account: GatewayAccount
  circuit_breaker: CircuitBreakerState
  health: GatewayHealth | null
  capabilities: {
    key: string
    methods: string[]
  }
}

export type ConnectionResult = {
  success: boolean
  status: string
  message: string
  latency_ms: number | null
  provider_info: Record<string, string>
  errors: string[]
}

export type Capability = {
  key: string
  methods: string[]
}

export type HealthSnapshot = {
  id: number
  approval_rate: number | null
  failure_rate: number | null
  avg_latency_ms: number | null
  timeout_count: number
  total_transactions: number
  last_approved_at: string | null
  last_failed_at: string | null
  recorded_at: string | null
}

export type GatewayHealthData = {
  gateway: { id: number; name: string; slug: string; status: string }
  circuit_breaker: CircuitBreakerState
  snapshots: HealthSnapshot[]
}

export type StoreGatewayPayload = {
  name: string
  provider: string
  environment: string
  credentials: Record<string, string>
}

export type UpdateGatewayPayload = {
  name?: string
  environment?: string
  credentials?: Record<string, string>
}
