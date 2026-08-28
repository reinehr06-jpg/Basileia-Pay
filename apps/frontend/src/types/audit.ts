export interface AuditEvent {
  id: string;
  time: string;
  relative: string;
  date: string;
  title: string;
  category: string;
  details: string;
  meta: string;
  user: string;
  role: string;
  system: string;
  environment: string;
  ip: string;
  location?: string;
  level: string; // 'Crítico' | 'Alteração' | 'Informativo' | 'Acesso' | 'Exclusão'
  type: string;  // e.g. 'refund', 'checkout'
  entityType?: string;
  entityId?: string | null;
  metadata?: Record<string, any>;
  relatedIds?: {
    orderId?: string;
    customerId?: string;
  };
}

export interface AuditSummary {
  totalEvents: number;
  activeUsers: number;
  impactedEntities: number;
  systemsInvolved: number;
  criticalActions: number;
  lastEventAt: string;
}
