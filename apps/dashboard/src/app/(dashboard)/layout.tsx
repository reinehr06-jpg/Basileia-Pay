'use client';

import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-[#F4F0FF] p-2 2xl:p-3 overflow-hidden relative font-sans selection:bg-brand/20 selection:text-brand">
      {/* Decorative premium glows */}
      <div className="absolute top-[-15%] left-[-5%] w-[45%] h-[45%] bg-brand/5 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[10%] w-[35%] h-[35%] bg-brand-accent/5 rounded-full blur-[140px] pointer-events-none" />
      
      <div className="grid w-full h-[calc(100vh-16px)] 2xl:h-[calc(100vh-24px)] grid-cols-[228px_minmax(0,1fr)] 2xl:grid-cols-[260px_minmax(0,1fr)] gap-3 2xl:gap-5 relative z-10">
        <Sidebar />
        
        <main className="flex flex-col min-w-0 w-full overflow-hidden">
          <Topbar />
          
          <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth pt-4 pb-6">
            <div className="w-full min-w-0 px-1">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
