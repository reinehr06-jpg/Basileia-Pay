export type UserRole = 'owner' | 'admin' | 'editor' | 'viewer'

export interface Permission {
  canView:            boolean
  canEdit:            boolean
  canSaveDraft:       boolean
  canRequestPublish:  boolean
  canPublish:         boolean
  canDelete:          boolean
  canDuplicate:       boolean
  canViewAnalytics:   boolean
  canViewAudit:       boolean
  canManageWhiteLabel:boolean
  canManageUsers:     boolean
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission> = {
  owner: {
    canView: true, canEdit: true, canSaveDraft: true,
    canRequestPublish: true, canPublish: true, canDelete: true,
    canDuplicate: true, canViewAnalytics: true, canViewAudit: true,
    canManageWhiteLabel: true, canManageUsers: true,
  },
  admin: {
    canView: true, canEdit: true, canSaveDraft: true,
    canRequestPublish: true, canPublish: true, canDelete: true,
    canDuplicate: true, canViewAnalytics: true, canViewAudit: true,
    canManageWhiteLabel: false, canManageUsers: false,
  },
  editor: {
    canView: true, canEdit: true, canSaveDraft: true,
    canRequestPublish: true, canPublish: false, canDelete: false,
    canDuplicate: true, canViewAnalytics: true, canViewAudit: false,
    canManageWhiteLabel: false, canManageUsers: false,
  },
  viewer: {
    canView: true, canEdit: false, canSaveDraft: false,
    canRequestPublish: false, canPublish: false, canDelete: false,
    canDuplicate: false, canViewAnalytics: true, canViewAudit: false,
    canManageWhiteLabel: false, canManageUsers: false,
  },
}
