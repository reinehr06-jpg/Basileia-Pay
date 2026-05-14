import { AuditLog } from '@/components/lab/AuditLog'
import { PermissionsGuard } from '@/components/lab/PermissionsGuard'

export const metadata = { title: 'Auditoria — Lab' }

export default function AuditPage() {
  return (
    <div className="min-h-screen bg-gray-950 p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-2">📋 Auditoria</h1>
      <p className="text-sm text-gray-500 mb-8">Histórico completo de todas as ações no Lab</p>
      <PermissionsGuard require="canViewAudit">
        <AuditLog />
      </PermissionsGuard>
    </div>
  )
}
