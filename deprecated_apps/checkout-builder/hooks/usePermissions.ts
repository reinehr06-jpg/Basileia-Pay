import { usePermissionsCtx } from '@/stores/PermissionsContext'

export function usePermissions() {
  const { role, permissions, loading } = usePermissionsCtx()

  function can(action: keyof import('@/types/permissions').Permission): boolean {
    if (loading || !permissions) return false
    return permissions[action]
  }

  return { role, permissions, loading, can }
}
