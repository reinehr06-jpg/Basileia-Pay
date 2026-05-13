export type AuditAction =
  | 'created'
  | 'updated'
  | 'published'
  | 'unpublished'
  | 'deleted'
  | 'duplicated'
  | 'restored_version'
  | 'requested_publish'
  | 'approved_publish'
  | 'rejected_publish'
  | 'test_link_generated'
  | 'ab_test_started'
  | 'ab_test_stopped'

export interface AuditLog {
  id: number
  config_id: number
  config_name: string
  user_id: number
  user_name: string
  user_email: string
  action: AuditAction
  before: Record<string, unknown> | null
  after: Record<string, unknown> | null
  diff_keys: string[]
  ip_address: string
  created_at: string
}

export interface AuditDiff {
  key: string
  before: unknown
  after: unknown
}
