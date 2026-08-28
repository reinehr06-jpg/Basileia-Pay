export type SecurityUserStatus = "active" | "invited" | "suspended" | "blocked"
export type SecuritySessionStatus = "active" | "expired" | "revoked"
export type SecurityRole =
  | "Owner" | "Admin" | "Financeiro"
  | "Desenvolvedor" | "Suporte" | "Auditor"

export interface SecurityUser {
  id: string
  name: string
  email: string
  avatar?: string
  role: SecurityRole
  status: SecurityUserStatus
  twoFactorEnabled: boolean
  lastAccessAt?: string
  createdAt: string
}

export interface SecurityRolePermission {
  area: string
  canView: boolean
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
  canExport: boolean
}

export interface SecuritySession {
  id: string
  userId: string
  userName: string
  role: SecurityRole
  device: string
  userAgent: string
  ip: string
  location: string
  startedAt: string
  lastActivityAt: string
  status: SecuritySessionStatus
  suspicious?: boolean
}

export interface SecurityKpi {
  activeUsers: number
  activeSessions: number
  twoFactorEnabledCount: number
  allowlistCount: number
  criticalEvents24h: number
}

export interface SecurityPolicy {
  minLength: number
  requireUppercase: boolean
  requireNumber: boolean
  requireSpecialChar: boolean
  expirationDays: number
  previousPasswordsCount: number
  maxFailedAttempts: number
  lockMinutes: number
}

export interface SecurityIpRule {
  id: string
  cidr: string
  description: string
  environment: "production" | "sandbox" | "both"
  createdBy: string
  createdAt: string
}

export interface SecurityActivityEvent {
  id: string
  timestamp: string
  event: string
  userName: string
  ip: string
  result: "success" | "warning" | "error"
  details: string
}
