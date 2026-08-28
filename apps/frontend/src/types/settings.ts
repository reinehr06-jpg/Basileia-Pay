export type SettingsCategory =
  | "Empresa" | "Segurança" | "Integrações"
  | "Operação" | "Financeiro" | "Sistema";

export type SettingsBadgeType = "status" | "count";

export interface SettingsCardBadge {
  type: SettingsBadgeType;
  label?: string;
  value?: number;
  color?: "green" | "red" | "yellow" | "blue" | "violet";
}

export interface SettingsCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  iconBg: string;
  category: SettingsCategory;
  categoryColor: string;
  badge: SettingsCardBadge | null;
  route: string;
  permission: string[];
  isExternal?: boolean;
  isSpecial?: boolean;
}

export interface SettingsSummary {
  environment: "production" | "sandbox";
  lastUpdatedAt: string;
  lastUpdatedBy: string;
  security: {
    status: "protected" | "warning" | "critical";
    twoFactorEnabled: boolean;
    activeSessionsCount: number;
    lastSecurityAudit: string;
  };
  integrations: {
    gatewaysCount: number;
    webhooksCount: number;
    apiKeysCount: number;
    activeEnvironments: number;
  };
  apiUsage: {
    callsThisMonth: number;
    limit: number;
    percentUsed: number;
  };
  company: {
    name: string;
    id: string;
    plan: string;
    region: string;
  };
}

export interface SettingsFilters {
  tab: "all" | "company" | "security" | "integrations" | "operation" | "financial" | "system";
  search?: string;
}
