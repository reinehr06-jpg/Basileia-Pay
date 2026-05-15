'use client'

import { usePermissions } from '@/hooks/usePermissions'
import type { Permission } from '@/types/permissions'

interface Props {
  require: keyof Permission
  fallback?: React.ReactNode
  children: React.ReactNode
}

export function PermissionsGuard({ require, fallback, children }: Props) {
  const { can, loading } = usePermissions()

  if (loading) return (
    <div className="flex items-center justify-center h-16">
      <span className="text-xs text-gray-600 animate-pulse">Verificando permissão...</span>
    </div>
  )

  if (!can(require)) {
    return fallback ? <>{fallback}</> : (
      <div className="flex flex-col items-center justify-center h-48 gap-3">
        <span className="text-3xl">🔒</span>
        <p className="text-sm text-gray-500">Você não tem permissão para esta ação.</p>
      </div>
    )
  }

  return <>{children}</>
}
