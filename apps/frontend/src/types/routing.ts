// types/routing.ts

export type RoutingRuleStatus = "active" | "inactive" | "conflict";
export type RoutingRuleType =
  | "by_system"
  | "by_method"
  | "by_value"
  | "by_installments"
  | "by_risk"
  | "by_availability"
  | "fallback";

export type RoutingConditionField =
  | "system"
  | "method"
  | "amount"
  | "installments"
  | "risk_score"
  | "environment"
  | "hour"
  | "country";

export type RoutingConditionOperator =
  | "equals"
  | "not_equals"
  | "greater_than"
  | "less_than"
  | "between"
  | "contains";

export type RoutingAction =
  | "route_to_gateway"
  | "block_and_review"
  | "block";

export interface RoutingCondition {
  field: RoutingConditionField;
  operator: RoutingConditionOperator;
  value: string | number | string[];
}

export interface RoutingRule {
  id: string;
  priority: number;
  name: string;
  description?: string;
  type: RoutingRuleType;
  conditions: RoutingCondition[];
  action: RoutingAction;
  gatewayId?: string | null;
  gatewayName?: string | null;
  gatewayHealth?: number; // health score e.g. 0-100
  fallbackGatewayId?: string | null;
  fallbackGatewayName?: string | null;
  systems: string[];
  environment: "production" | "sandbox" | "both";
  status: RoutingRuleStatus;
  coverage7d: number;
  lastDecisionAt?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface RoutingSimulatorInput {
  systemId: string;
  method: "pix" | "credit_card" | "boleto";
  amount: number;
  installments?: number;
  riskScore: number;
  customerId?: string;
  country?: string;
  device?: "mobile" | "desktop" | "api";
  scheduledAt?: string;
  customerHistory?: "new" | "returning" | "chargeback";
}

export interface RoutingSimulatorResult {
  gatewayId?: string | null;
  gatewayName?: string | null;
  ruleApplied?: RoutingRule;
  action: RoutingAction;
  isFallback: boolean;
  fallbackReason?: string;
  estimatedLatencyMs?: number;
  decisionChain: RoutingDecisionStep[];
}

export interface RoutingDecisionStep {
  rule: RoutingRule;
  evaluated: boolean;
  satisfied: boolean;
  conditionResults: {
    condition: RoutingCondition;
    satisfied: boolean;
    actualValue: string | number;
  }[];
}

export interface RoutingKpi {
  activeRulesCount: number;
  activeRulesDelta: number;
  gatewaysInPool: number;
  decisionsToday: number;
  decisionsTodayDelta: number;
  conflictsCount: number;
}
