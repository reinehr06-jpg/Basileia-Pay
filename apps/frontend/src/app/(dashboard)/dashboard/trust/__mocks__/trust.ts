import { TrustRule, TrustEvent, TrustKpi, TrustMotorConfig, TrustScoreBreakdown } from '@/types/trust';

export const MOCK_TRUST_RULES: TrustRule[] = [
  {
    id: "tr_001",
    name: "IP bloqueado por política",
    description: "IP identificado em listas de abusos internacionais ou blacklist de fraudes conhecidas.",
    type: "block",
    trigger: "ip",
    triggerDetail: "IP na blacklist global",
    conditions: [
      { field: "ip", operator: "equals", value: "blacklist" }
    ],
    action: "blocked_auto",
    scoreImpact: 50,
    notifyTeam: true,
    executionMode: "active",
    environment: "production",
    triggers7d: 23,
    falsePositiveRate: 0.4,
    status: "active",
    createdAt: "2026-01-10T09:00:00Z",
    updatedAt: "2026-01-10T09:00:00Z",
    createdBy: "Gabriel Silva"
  },
  {
    id: "tr_002",
    name: "Formulário preenchido muito rápido",
    description: "Detecção de automação ou robôs preenchendo o formulário de checkout em tempo menor que o humanamente aceitável.",
    type: "score_increase",
    trigger: "velocity",
    triggerDetail: "Tempo de preenchimento < 5s",
    conditions: [
      { field: "velocity", operator: "less_than", value: 5 }
    ],
    action: "rule_triggered",
    scoreImpact: 25,
    notifyTeam: false,
    executionMode: "active",
    environment: "both",
    triggers7d: 142,
    falsePositiveRate: 8.2,
    status: "active",
    createdAt: "2026-02-01T10:00:00Z",
    updatedAt: "2026-02-01T10:00:00Z",
    createdBy: "Gabriel Silva"
  },
  {
    id: "tr_003",
    name: "Valor 3× acima da média do cliente",
    description: "Sinaliza compras desproporcionais ao perfil de comportamento anterior do portador do cartão.",
    type: "review",
    trigger: "amount",
    triggerDetail: "Valor > 3× média dos últimos 30 pagamentos",
    conditions: [
      { field: "amount", operator: "greater_than", value: 3 }
    ],
    action: "manual_review",
    scoreImpact: 30,
    notifyTeam: true,
    executionMode: "active",
    environment: "production",
    triggers7d: 18,
    falsePositiveRate: 22.1,
    status: "active",
    createdAt: "2026-02-15T08:00:00Z",
    updatedAt: "2026-02-15T08:00:00Z",
    createdBy: "Admin Basileia"
  },
  {
    id: "tr_004",
    name: "Cliente recorrente verificado",
    description: "Reduz o score de risco de clientes que possuem histórico de transações bem-sucedidas na plataforma.",
    type: "score_decrease",
    trigger: "history",
    triggerDetail: "Mais de 5 pagamentos aprovados sem chargeback",
    conditions: [
      { field: "history", operator: "greater_than", value: 5 }
    ],
    action: "approved_auto",
    scoreImpact: -20,
    notifyTeam: false,
    executionMode: "active",
    environment: "both",
    triggers7d: 3841,
    falsePositiveRate: 0.0,
    status: "active",
    createdAt: "2026-01-20T11:00:00Z",
    updatedAt: "2026-01-20T11:00:00Z",
    createdBy: "Gabriel Silva"
  },
  {
    id: "tr_005",
    name: "País de alto risco",
    description: "Transações originadas de geografias marcadas temporariamente com alta incidência de chargebacks.",
    type: "score_increase",
    trigger: "country",
    triggerDetail: "IP originado de país na lista de alto risco",
    conditions: [
      { field: "country", operator: "in_list", value: ["NG", "CN", "RU"] }
    ],
    action: "rule_triggered",
    scoreImpact: 40,
    notifyTeam: false,
    executionMode: "testing",
    environment: "production",
    triggers7d: 7,
    falsePositiveRate: 14.3,
    status: "testing",
    createdAt: "2026-05-01T14:00:00Z",
    updatedAt: "2026-05-01T14:00:00Z",
    createdBy: "Admin Basileia"
  },
  {
    id: "tr_006",
    name: "Dispositivo não reconhecido + novo e-mail",
    description: "Cruzamento de nova assinatura de dispositivo associada a e-mail criado muito recentemente.",
    type: "review",
    trigger: "device",
    triggerDetail: "Device fingerprint novo + e-mail criado há < 24h",
    conditions: [
      { field: "device", operator: "equals", value: "new_device" },
      { field: "email_age", operator: "less_than", value: 24, logic: "AND" }
    ],
    action: "manual_review",
    scoreImpact: 35,
    notifyTeam: true,
    executionMode: "active",
    environment: "production",
    triggers7d: 31,
    falsePositiveRate: 6.7,
    status: "active",
    createdAt: "2026-03-10T09:00:00Z",
    updatedAt: "2026-03-10T09:00:00Z",
    createdBy: "Gabriel Silva"
  }
];

export const MOCK_TRUST_EVENTS: TrustEvent[] = [
  {
    id: "evt_risk_001",
    paymentId: "pay_8f3a2d7e9b1c",
    customerId: "cli_5129",
    customerName: "André M. Souza",
    systemId: "sys_church",
    systemName: "Church",
    score: 32,
    action: "approved_auto",
    rulesTriggered: 1,
    factorsSummary: ["IP Reconhecido", "Velocidade padrão"],
    createdAt: new Date(Date.now() - 3 * 60000).toISOString() // 3 min ago
  },
  {
    id: "evt_risk_002",
    paymentId: "pay_9f4b3e8f0c2d",
    customerId: "cli_9122",
    customerName: "Renata Santos",
    systemId: "sys_vendor",
    systemName: "Vendor Platform",
    score: 84,
    action: "blocked_auto",
    rulesTriggered: 2,
    factorsSummary: ["IP Blacklist", "Velocidade rápida"],
    createdAt: new Date(Date.now() - 14 * 60000).toISOString() // 14 min ago
  },
  {
    id: "evt_risk_003",
    paymentId: "pay_1c2d3e4f5a6b",
    customerId: "cli_0821",
    customerName: "Lucas Mendes",
    systemId: "sys_saas",
    systemName: "SaaS Engine",
    score: 67,
    action: "manual_review",
    rulesTriggered: 1,
    factorsSummary: ["Valor desproporcional"],
    createdAt: new Date(Date.now() - 25 * 60000).toISOString() // 25 min ago
  },
  {
    id: "evt_risk_004",
    paymentId: "pay_7f6e5d4c3b2a",
    customerId: "cli_3021",
    customerName: "Clara Fonseca",
    systemId: "sys_church",
    systemName: "Church",
    score: 15,
    action: "approved_auto",
    rulesTriggered: 1,
    factorsSummary: ["Cliente Recorrente"],
    createdAt: new Date(Date.now() - 40 * 60000).toISOString()
  },
  {
    id: "evt_risk_005",
    paymentId: "pay_8a9b0c1d2e3f",
    customerId: "cli_7442",
    customerName: "Jefferson Dias",
    systemId: "sys_vendor",
    systemName: "Vendor Platform",
    score: 63,
    action: "review_approved",
    rulesTriggered: 1,
    factorsSummary: ["Dispositivo Novo"],
    reviewedBy: "Gabriel Silva",
    reviewedAt: new Date(Date.now() - 45 * 60000).toISOString(),
    reviewComment: "Documentação do cliente verificada via suporte.",
    finalResult: "approved",
    createdAt: new Date(Date.now() - 55 * 60000).toISOString()
  },
  {
    id: "evt_risk_006",
    paymentId: "pay_a1b2c3d4e5f6",
    customerId: "cli_4910",
    customerName: "Felipe Nogueira",
    systemId: "sys_saas",
    systemName: "SaaS Engine",
    score: 72,
    action: "review_rejected",
    rulesTriggered: 2,
    factorsSummary: ["País Alto Risco", "Múltiplas tentativas"],
    reviewedBy: "Gabriel Silva",
    reviewedAt: new Date(Date.now() - 50 * 60000).toISOString(),
    reviewComment: "Tentativa de fraude óbvia, dados inconsistentes.",
    finalResult: "rejected",
    createdAt: new Date(Date.now() - 90 * 60000).toISOString()
  },
  {
    id: "evt_risk_007",
    paymentId: "pay_f7e6d5c4b3a2",
    customerId: "cli_9311",
    customerName: "Marcos Castilho",
    systemId: "sys_church",
    systemName: "Church Integration",
    score: 42,
    action: "suspicious_behavior",
    rulesTriggered: 1,
    factorsSummary: ["Horário Incomum"],
    createdAt: new Date(Date.now() - 120 * 60000).toISOString()
  }
];

export const MOCK_TRUST_KPIS: TrustKpi = {
  averageScoreToday: 24.3,
  averageScoreDelta: -2.1,
  approvedCount: 22841,
  approvedDelta: 7.8,
  inReviewCount: 47,
  inReviewDelta: 12,
  blockedCount: 71,
  blockedDelta: -8,
  chargebacksAvoided: 18,
  chargebacksAvoidedDelta: 3
};

export const MOCK_TRUST_MOTOR_CONFIG: TrustMotorConfig = {
  blockThreshold: 80,
  reviewThreshold: 60,
  motorVersion: "v2.4.1",
  fallbackOnUnavailable: "approve_all",
  updatedAt: "2026-05-18T16:30:00Z",
  updatedBy: "Gabriel Silva"
};

export const MOCK_TRUST_SCORE_BREAKDOWNS: Record<string, TrustScoreBreakdown> = {
  "pay_8f3a2d7e9b1c": {
    paymentId: "pay_8f3a2d7e9b1c",
    finalScore: 32,
    action: "approved",
    threshold: 80,
    reviewThreshold: 60,
    factors: [
      {
        name: "Dispositivo reconhecido",
        weight: 15,
        result: "pass",
        value: "Reconhecido",
        contribution: 0,
        description: "Assinatura digital do dispositivo já realizou 4 transações aprovadas anteriormente."
      },
      {
        name: "IP na whitelist",
        weight: 10,
        result: "pass",
        value: "São Paulo, BR",
        contribution: 0,
        description: "IP corporativo de provedor nacional seguro."
      },
      {
        name: "Velocidade de digitação",
        weight: 10,
        result: "warn",
        value: "Ligeiramente rápida",
        contribution: 12,
        description: "Tempo total de digitação foi de 11 segundos, um pouco abaixo da média padrão."
      },
      {
        name: "Tentativas anteriores",
        weight: 20,
        result: "pass",
        value: "Nenhuma falha",
        contribution: 0,
        description: "Sem registros de falhas de cartão para este e-mail nos últimos 7 dias."
      },
      {
        name: "País do IP",
        weight: 10,
        result: "pass",
        value: "Brasil",
        contribution: 0,
        description: "IP e país de emissão do cartão coincidem."
      },
      {
        name: "Histórico do cliente",
        weight: 15,
        result: "pass",
        value: "Recorrente",
        contribution: -20,
        description: "Cliente cadastrado há 3 meses com compras ativas."
      },
      {
        name: "Valor fora do padrão",
        weight: 20,
        result: "fail",
        value: "3× acima da média",
        contribution: 40,
        description: "O valor simulado de R$ 9.800 está desproporcional à média histórica de R$ 320."
      }
    ],
    rulesTriggered: [
      MOCK_TRUST_RULES[2] // Valor 3x acima
    ],
    context: {
      ip: "177.12.34.56",
      ipLocation: "São Paulo, SP, BR",
      ipAsn: "TELEFONICA BRASIL S.A. (AS27699)",
      deviceFingerprint: "df_8d19a2f7c6e",
      deviceSeenCount: 4,
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      formFillTimeMs: 11200,
      sessionId: "sess_trust_0019",
      checkoutStartedAt: new Date(Date.now() - 5 * 60000).toISOString(),
      submittedAt: new Date().toISOString()
    },
    motorVersion: "v2.4.1",
    evaluatedAt: new Date().toISOString()
  }
};
