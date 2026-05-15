import { ThemeList } from '@/components/lab/ThemeList'
export const metadata = { title: 'Lab de Testes — Basileia' }
export default function LabPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      <ThemeList />
    </div>
  )
}
