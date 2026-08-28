'use client';

import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { AuthGuard } from '@/components/auth/AuthGuard';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen font-inter bg-[#F5F5F7]">
        <Sidebar />
        <div className="flex-1 ml-[240px] flex flex-col min-h-screen transition-all duration-300">
          <Topbar />
          <main className="flex-1 flex flex-col p-[24px_28px_20px_28px] min-h-0 relative">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
