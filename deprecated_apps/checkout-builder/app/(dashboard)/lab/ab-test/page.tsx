import { AbTestPanel } from '@/components/lab/AbTestPanel'
export const metadata = { title: 'A/B Test — Lab' }
export default function AbTestPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      <AbTestPanel />
    </div>
  )
}
