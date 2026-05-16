'use client';

import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full bg-[#F4F0FF] overflow-hidden relative font-sans selection:bg-brand/20 selection:text-brand">
      {/* Decorative premium glows */}
      <div className="absolute top-[-15%] left-[-5%] w-[45%] h-[45%] bg-brand/5 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[10%] w-[35%] h-[35%] bg-brand-accent/5 rounded-full blur-[140px] pointer-events-none" />
      
      {/* Sidebar - Margined from screen edge as per Reference 2 */}
      <Sidebar />
      
      <div className="flex flex-col flex-1 min-w-0 relative z-10 overflow-hidden">
        <Topbar />
        
        {/* Main Content Area - Reduced padding for high density */}
        <main className="flex-1 overflow-y-auto px-8 pb-8 no-scrollbar scroll-smooth">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
