// types/trust.ts

export type TrustAction =
  | "approved_auto" | "blocked_auto"
  | "manual_review" | "review_approved"
  | "review_rejected" | "rule_triggered"
  | "suspicious_behavior"

export type TrustRuleType =
  | "block" | "review" | "score_increase"
  | "score_decrease" | "alert"

export type TrustRuleStatus = "active" | "inactive" | "testing"

export type TrustRuleTrigger =
  | "ip" | "device" | "velocity" | "amount"
  | "history" | "country" | "email_age"
  | "attempts" | "hour" | "combination"

export interface TrustScoreFactor {
  name: string
  weight: number
  result: "pass" | "warn" | "fail"
  value: string | number
  contribution: number
  description: string
}

export interface TrustScoreBreakdown {
  paymentId: string
  finalScore: number
  action: "approved" | "blocked" | "manual_review"
  threshold: number
  reviewThreshold: number
  factors: TrustScoreFactor[]
  rulesTriggered: TrustRule[]
  context: {
    ip: string
    ipLocation: string
    ipAsn: string
    deviceFingerprint: string
    deviceSeenCount: number
    userAgent: string
    formFillTimeMs: number
    sessionId: string
    checkoutStartedAt: string
    submittedAt: string
  }
  motorVersion: string
  evaluatedAt: string
}

export interface TrustRule {
  id: string
  name: string
  description?: string
  type: TrustRuleType
  trigger: TrustRuleTrigger
  triggerDetail: string
  conditions: TrustCondition[]
  action: TrustAction
  scoreImpact: number
  customerMessage?: string
  notifyTeam: boolean
  notifyRecipients?: string[]
  executionMode: TrustRuleStatus
  environment: "production" | "sandbox" | "both"
  triggers7d: number
  falsePositiveRate: number
  status: TrustRuleStatus
  createdAt: string
  updatedAt: string
  createdBy: string
}

export interface TrustCondition {
  field: TrustRuleTrigger
  operator: "equals" | "not_equals" | "greater_than" | "less_than" | "contains" | "in_list"
  value: string | number | string[]
  logic?: "AND" | "OR"
}

export interface TrustEvent {
  id: string
  paymentId: string
  customerId?: string
  customerName?: string
  systemId: string
  systemName: string
  score: number
  action: TrustAction
  rulesTriggered: number
  factorsSummary: string[]
  reviewedBy?: string
  reviewedAt?: string
  reviewComment?: string
  finalResult?: "approved" | "rejected"
  createdAt: string
}

export interface TrustKpi {
  averageScoreToday: number
  averageScoreDelta: number
  approvedCount: number
  approvedDelta: number
  inReviewCount: number
  inReviewDelta: number
  blockedCount: number
  blockedDelta: number
  chargebacksAvoided: number
  chargebacksAvoidedDelta: number
}

export interface TrustMotorConfig {
  blockThreshold: number
  reviewThreshold: number
  motorVersion: string
  fallbackOnUnavailable: "approve_all" | "block_all" | "review_all"
  updatedAt: string
  updatedBy: string
}
