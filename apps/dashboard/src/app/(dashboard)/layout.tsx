import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full bg-background overflow-hidden relative">
      {/* Decorative background blobs */}
      <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-brand/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[20%] w-[30%] h-[30%] bg-brand-accent/5 rounded-full blur-[100px] pointer-events-none" />
      
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 relative z-10">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-8 no-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}
