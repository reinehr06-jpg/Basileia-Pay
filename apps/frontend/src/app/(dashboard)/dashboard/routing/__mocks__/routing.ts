// __mocks__/routing.ts
import { RoutingRule, RoutingKpi } from '@/types/routing';

export const MOCK_SYSTEMS = [
  { id: "all", name: "Todos os sistemas", logo: null },
  { id: "sys_church", name: "Church Integration", logo: "⛪" },
  { id: "sys_vendor", name: "Vendor Platform", logo: "🛍️" },
  { id: "sys_saas", name: "SaaS Engine", logo: "⚡" },
];

export const MOCK_ROUTING_KPIS: RoutingKpi = {
  activeRulesCount: 14,
  activeRulesDelta: 2,
  gatewaysInPool: 8,
  decisionsToday: 24812,
  decisionsTodayDelta: 8.4,
  conflictsCount: 2,
};

export const MOCK_ROUTING_RULES: RoutingRule[] = [
  {
    id: "rule_001",
    priority: 1,
    name: "PIX alto valor — Asaas preferencial",
    type: "by_method",
    conditions: [
      { field: "method", operator: "equals", value: "pix" },
      { field: "amount", operator: "greater_than", value: 50000 },
    ],
    action: "route_to_gateway",
    gatewayId: "gw_asaas",
    gatewayName: "Asaas",
    gatewayHealth: 98,
    fallbackGatewayId: "gw_mercadopago",
    fallbackGatewayName: "Mercado Pago",
    systems: ["all"],
    environment: "production",
    status: "active",
    coverage7d: 28.4,
    lastDecisionAt: "2026-05-19T10:52:00Z",
    createdAt: "2026-03-10T09:00:00Z",
    updatedAt: "2026-05-01T14:22:00Z",
    createdBy: "Gabriel Silva"
  },
  {
    id: "rule_002",
    priority: 2,
    name: "Cartão parcelado — Cielo",
    type: "by_installments",
    conditions: [
      { field: "method", operator: "equals", value: "credit_card" },
      { field: "installments", operator: "greater_than", value: 3 },
    ],
    action: "route_to_gateway",
    gatewayId: "gw_cielo",
    gatewayName: "Cielo",
    gatewayHealth: 95,
    fallbackGatewayId: "gw_rede",
    fallbackGatewayName: "Rede",
    systems: ["sys_church", "sys_vendor"],
    environment: "both",
    status: "active",
    coverage7d: 15.7,
    lastDecisionAt: "2026-05-19T10:48:00Z",
    createdAt: "2026-03-12T10:00:00Z",
    updatedAt: "2026-04-20T11:00:00Z",
    createdBy: "Mariana Costa"
  },
  {
    id: "rule_003",
    priority: 3,
    name: "Alto risco — bloquear e revisar",
    type: "by_risk",
    conditions: [
      { field: "risk_score", operator: "greater_than", value: 80 },
    ],
    action: "block_and_review",
    gatewayId: null,
    gatewayName: null,
    gatewayHealth: 100,
    fallbackGatewayId: null,
    fallbackGatewayName: null,
    systems: ["all"],
    environment: "both",
    status: "active",
    coverage7d: 2.1,
    lastDecisionAt: "2026-05-19T09:10:00Z",
    createdAt: "2026-04-01T08:00:00Z",
    updatedAt: "2026-04-01T08:00:00Z",
    createdBy: "Felipe Melo"
  },
  {
    id: "rule_004",
    priority: 4,
    name: "Church — gateway exclusivo",
    type: "by_system",
    conditions: [
      { field: "system", operator: "equals", value: "sys_church" },
    ],
    action: "route_to_gateway",
    gatewayId: "gw_asaas_church",
    gatewayName: "Asaas Church",
    gatewayHealth: 88, // Below 90%! Instável!
    fallbackGatewayId: "gw_asaas",
    fallbackGatewayName: "Asaas Principal",
    systems: ["sys_church"],
    environment: "production",
    status: "active",
    coverage7d: 31.2,
    lastDecisionAt: "2026-05-19T10:55:00Z",
    createdAt: "2026-02-14T12:00:00Z",
    updatedAt: "2026-05-10T16:00:00Z",
    createdBy: "Gabriel Silva"
  },
  {
    id: "rule_005",
    priority: 5,
    name: "Boleto — Itaú preferencial",
    type: "by_method",
    conditions: [
      { field: "method", operator: "equals", value: "boleto" },
    ],
    action: "route_to_gateway",
    gatewayId: "gw_itau",
    gatewayName: "Itaú",
    gatewayHealth: 92,
    fallbackGatewayId: "gw_bradesco",
    fallbackGatewayName: "Bradesco",
    systems: ["all"],
    environment: "both",
    status: "conflict", // Conflict!
    coverage7d: 8.9,
    lastDecisionAt: "2026-05-19T08:44:00Z",
    createdAt: "2026-03-20T09:00:00Z",
    updatedAt: "2026-05-18T10:00:00Z",
    createdBy: "Luciana Reis"
  },
  {
    id: "rule_006",
    priority: 6,
    name: "Regra Inativa de Teste",
    type: "by_value",
    conditions: [
      { field: "amount", operator: "less_than", value: 1000 },
    ],
    action: "route_to_gateway",
    gatewayId: "gw_mercadopago",
    gatewayName: "Mercado Pago",
    gatewayHealth: 99,
    fallbackGatewayId: "gw_asaas",
    fallbackGatewayName: "Asaas",
    systems: ["all"],
    environment: "sandbox",
    status: "inactive", // Inactive!
    coverage7d: 0.0,
    lastDecisionAt: undefined,
    createdAt: "2026-05-01T09:00:00Z",
    updatedAt: "2026-05-01T09:00:00Z",
    createdBy: "Luciana Reis"
  }
];

export const MOCK_HISTORY_LOGS = [
  {
    id: "pay_9812",
    paymentLink: "/dashboard/payments/pay_9812",
    system: "sys_church",
    environment: "production",
    method: "pix",
    amount: 120000,
    ruleApplied: "PIX alto valor — Asaas preferencial",
    priority: 1,
    gatewayUsed: "Asaas",
    fallbackAcioned: "Não",
    fallbackReason: null,
    latencyMs: 110,
    date: "2026-05-19T10:52:00Z"
  },
  {
    id: "pay_9811",
    paymentLink: "/dashboard/payments/pay_9811",
    system: "sys_vendor",
    environment: "production",
    method: "credit_card",
    amount: 45000,
    ruleApplied: "Cartão parcelado — Cielo",
    priority: 2,
    gatewayUsed: "Cielo",
    fallbackAcioned: "Não",
    fallbackReason: null,
    latencyMs: 145,
    date: "2026-05-19T10:48:00Z"
  },
  {
    id: "pay_9810",
    paymentLink: "/dashboard/payments/pay_9810",
    system: "sys_saas",
    environment: "production",
    method: "credit_card",
    amount: 99990,
    ruleApplied: "Alto risco — bloquear e revisar",
    priority: 3,
    gatewayUsed: "Nenhum (Bloqueado)",
    fallbackAcioned: "Sim",
    fallbackReason: "Risco alto (85)",
    latencyMs: 85,
    date: "2026-05-19T09:10:00Z"
  },
  {
    id: "pay_9809",
    paymentLink: "/dashboard/payments/pay_9809",
    system: "sys_church",
    environment: "production",
    method: "boleto",
    amount: 15000,
    ruleApplied: "Church — gateway exclusivo",
    priority: 4,
    gatewayUsed: "Asaas Church",
    fallbackAcioned: "Não",
    fallbackReason: null,
    latencyMs: 125,
    date: "2026-05-19T10:55:00Z"
  },
  {
    id: "pay_9808",
    paymentLink: "/dashboard/payments/pay_9808",
    system: "sys_saas",
    environment: "sandbox",
    method: "pix",
    amount: 1000,
    ruleApplied: "Fallback global",
    priority: 0,
    gatewayUsed: "Mercado Pago",
    fallbackAcioned: "Não",
    fallbackReason: null,
    latencyMs: 98,
    date: "2026-05-19T08:44:00Z"
  }
];

export const MOCK_FALLBACKS = [
  {
    id: "fb_global",
    systemName: "Fallback Global da Empresa",
    gatewayName: "Mercado Pago",
    environment: "production",
    lastActivated: "2026-05-19T08:44:00Z",
    active: true
  },
  {
    id: "fb_church",
    systemName: "Church Integration",
    gatewayName: "Asaas Principal",
    environment: "production",
    lastActivated: "2026-05-18T12:00:00Z",
    active: true
  },
  {
    id: "fb_vendor",
    systemName: "Vendor Platform",
    gatewayName: "Rede",
    environment: "both",
    lastActivated: "2026-05-17T09:30:00Z",
    active: true
  }
];
