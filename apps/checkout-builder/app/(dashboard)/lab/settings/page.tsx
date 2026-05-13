import { WhiteLabelPanel } from '@/components/lab/WhiteLabelPanel'
import { PermissionsGuard } from '@/components/lab/PermissionsGuard'

export const metadata = { title: 'Configurações — Lab' }

export default function SettingsPage() {
  return (
    <PermissionsGuard require="canManageWhiteLabel">
      <WhiteLabelPanel />
    </PermissionsGuard>
  )
}
