import './globals.css'
import type { Metadata } from 'next'
import { PermissionsProvider } from '@/stores/PermissionsContext'

export const metadata: Metadata = {
  title: 'Lab de Testes — Basileia',
  description: 'Editor Visual de Checkout Basileia',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="antialiased bg-gray-950 text-white min-h-screen">
        <PermissionsProvider>
          {children}
        </PermissionsProvider>
      </body>
    </html>
  )
}
