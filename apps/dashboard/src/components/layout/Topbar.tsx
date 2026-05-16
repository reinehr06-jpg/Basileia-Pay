'use client';

import { 
  Search, 
  Bell, 
  Settings, 
  User, 
  ChevronDown, 
  Sun,
  LayoutGrid
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TopbarProps {
  title?: string;
  description?: string;
}

export function Topbar({ title, description }: TopbarProps) {
  return (
    <header className="h-[52px] 2xl:h-[68px] px-6 2xl:px-8 flex items-center justify-between sticky top-0 z-20 w-full transition-all duration-300 bg-white/40 backdrop-blur-md border-b border-white/20">
      {/* Search Bar - Professional & Expansive */}
      <div className="relative flex-1 max-w-[580px] group mr-6">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate/40 group-focus-within:text-brand transition-colors">
          <Search className="w-4 h-4" />
        </div>
        <input 
          type="text" 
          placeholder="Buscar transação, cliente, pedido ou evento"
          className="w-full bg-white/60 border border-border/50 rounded-2xl pl-11 pr-12 py-2.5 2xl:py-3 text-[13px] 2xl:text-[14px] font-medium text-ink placeholder:text-slate/40 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition-all shadow-sm"
        />
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 px-1.5 py-1 bg-background border border-border rounded-md text-[10px] font-black text-slate/30 uppercase tracking-tighter">
          ⌘ K
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 2xl:gap-4">
        {/* Notifications */}
        <div className="relative p-2 2xl:p-2.5 text-slate/40 hover:text-brand hover:bg-brand-soft rounded-xl transition-all cursor-pointer">
          <Bell className="w-5 h-5 2xl:w-5.5 2xl:h-5.5" />
          <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-brand text-white text-[9px] font-black flex items-center justify-center rounded-full border-2 border-white">
            12
          </div>
        </div>

        {/* Theme Toggle */}
        <div className="p-2 2xl:p-2.5 text-slate/40 hover:text-brand hover:bg-brand-soft rounded-xl transition-all cursor-pointer">
          <Sun className="w-5 h-5 2xl:w-5.5 2xl:h-5.5" />
        </div>

        {/* Scope Selector */}
        <div className="flex items-center gap-2 px-3 py-2 bg-white border border-border rounded-xl cursor-pointer hover:bg-brand-soft transition-all shadow-sm">
          <div className="w-2 h-2 rounded-full bg-success shadow-[0_0_8px_rgba(22,163,74,0.4)]" />
          <span className="text-[11.5px] 2xl:text-[12.5px] font-bold text-ink">Todos os sistemas</span>
          <ChevronDown className="w-4 h-4 text-slate/30" />
        </div>

        <div className="h-8 w-px bg-border/40 mx-1 2xl:mx-2" />

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-2 cursor-pointer group">
          <div className="text-right hidden sm:block">
            <p className="text-[12px] 2xl:text-[13px] font-black text-ink leading-tight group-hover:text-brand transition-colors">Vinícius</p>
            <p className="text-[10px] 2xl:text-[11px] font-bold text-slate/40 uppercase tracking-tight">Admin</p>
          </div>
          <div className="w-8 h-8 2xl:w-10 2xl:h-10 rounded-xl bg-gradient-to-tr from-brand/20 to-brand-accent/20 p-0.5 border border-brand/10 group-hover:scale-105 transition-transform overflow-hidden shadow-md">
            <img 
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Vinicius" 
              alt="User profile" 
              className="w-full h-full object-cover rounded-[10px]"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
