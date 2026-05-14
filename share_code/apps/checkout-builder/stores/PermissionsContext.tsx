'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { UserRole, Permission, ROLE_PERMISSIONS } from '@/types/permissions'

interface PermissionsState {
  role: UserRole | null
  permissions: Permission | null
  loading: boolean
}

const PermissionsContext = createContext<PermissionsState>({
  role: null, permissions: null, loading: true,
})

export function PermissionsProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PermissionsState>({ role: null, permissions: null, loading: true })

  useEffect(() => {
    fetch('/api/dashboard/me/lab-role', { credentials: 'include' })
      .then(r => r.json())
      .then(({ role }: { role: UserRole }) => {
        setState({ role, permissions: ROLE_PERMISSIONS[role] ?? null, loading: false })
      })
      .catch(() => setState(s => ({ ...s, loading: false })))
  }, [])

  return <PermissionsContext.Provider value={state}>{children}</PermissionsContext.Provider>
}

export function usePermissionsCtx(): PermissionsState {
  return useContext(PermissionsContext)
}
