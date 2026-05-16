'use client';

import { 
  Search, 
  Bell, 
  Settings, 
  ChevronDown, 
  User,
  LayoutGrid
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TopbarProps {
  title?: string;
  description?: string;
}

export function Topbar({ title, description }: TopbarProps) {
  return (
    <header className="h-[68px] px-8 flex items-center justify-between sticky top-0 z-20">
      {/* Search Bar - Professional & Wide */}
      <div className="relative flex-1 max-w-[640px] group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate/40 group-focus-within:text-brand transition-colors">
          <Search className="w-4 h-4" />
        </div>
        <input 
          type="text" 
          placeholder="Buscar transação, cliente, pedido ou evento"
          className="w-full bg-white/60 backdrop-blur-md border-border border rounded-xl py-2 pl-12 pr-16 focus:border-brand/50 focus:ring-0 transition-all outline-none text-[12.5px] font-medium placeholder:text-slate/30 shadow-sm h-[48px]"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-0.5 bg-background border border-border rounded-md opacity-40">
          <span className="text-[9px] font-black text-slate">⌘</span>
          <span className="text-[9px] font-black text-slate">K</span>
        </div>
      </div>

      {/* Right Side Actions - Refined */}
      <div className="flex items-center gap-2.5">
        <div className="p-1 bg-white/60 backdrop-blur-md border border-border rounded-xl shadow-sm flex gap-1 h-[48px]">
          <button className="px-2.5 text-slate/50 hover:text-brand hover:bg-brand-soft rounded-lg transition-all relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-brand text-white text-[8px] font-black flex items-center justify-center rounded-full border-2 border-white">12</span>
          </button>
          <button className="px-2.5 text-slate/50 hover:text-brand hover:bg-brand-soft rounded-lg transition-all">
            <Settings className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2.5 bg-white/60 backdrop-blur-md border border-border px-3.5 rounded-xl cursor-pointer hover:bg-brand-soft hover:border-brand/20 transition-all group shadow-sm h-[48px]">
          <div className="w-1.5 h-1.5 rounded-full bg-success shadow-[0_0_6px_rgba(22,163,74,0.4)]" />
          <span className="text-[12px] font-bold text-ink whitespace-nowrap opacity-80">Todos os sistemas</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate/30 group-hover:text-brand transition-colors" />
        </div>

        <div className="flex items-center gap-2.5 pl-3 pr-2.5 bg-white/60 backdrop-blur-md border border-border rounded-xl shadow-sm cursor-pointer hover:bg-brand-soft hover:border-brand/10 transition-all group h-[48px]">
          <div className="text-right hidden sm:block">
            <p className="text-[12px] font-black text-ink leading-tight">Vinícius</p>
            <p className="text-[9px] font-bold text-slate/40 uppercase tracking-tighter">Admin</p>
          </div>
          <div className="w-7.5 h-7.5 rounded-full border border-brand/10 overflow-hidden shadow-sm">
             <img src="https://ui-avatars.com/api/?name=Vinicius&background=7C3AED&color=fff" alt="Avatar" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </header>
  );
}

