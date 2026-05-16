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
    <header className="h-[76px] px-8 flex items-center justify-between sticky top-0 z-20">
      {/* Search Bar - Premium Design */}
      <div className="relative w-[480px] group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate/50 group-focus-within:text-brand transition-colors">
          <Search className="w-4 h-4" />
        </div>
        <input 
          type="text" 
          placeholder="Buscar transação, cliente, pedido ou evento"
          className="w-full bg-white/70 backdrop-blur-md border-border border rounded-2xl py-2.5 pl-12 pr-16 focus:border-brand focus:ring-0 transition-all outline-none text-[13px] font-medium placeholder:text-slate/40 shadow-sm"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-0.5 bg-background border border-border rounded-md shadow-inner opacity-60">
          <span className="text-[10px] font-black text-slate">⌘</span>
          <span className="text-[10px] font-black text-slate">K</span>
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <div className="p-1 bg-white/70 backdrop-blur-md border border-border rounded-xl shadow-sm flex gap-1">
          <button className="p-2 text-slate/60 hover:text-brand hover:bg-brand-soft rounded-lg transition-all relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-brand text-white text-[9px] font-black flex items-center justify-center rounded-full border-2 border-white shadow-sm">12</span>
          </button>
          <button className="p-2 text-slate/60 hover:text-brand hover:bg-brand-soft rounded-lg transition-all">
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {/* System Selector */}
        <div className="flex items-center gap-3 bg-white/70 backdrop-blur-md border border-border px-4 py-2.5 rounded-xl cursor-pointer hover:bg-brand-soft hover:border-brand/30 transition-all group shadow-sm">
          <div className="w-2 h-2 rounded-full bg-success shadow-[0_0_8px_rgba(22,163,74,0.5)]" />
          <span className="text-[12px] font-bold text-ink whitespace-nowrap">Todos os sistemas</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate/40 group-hover:text-brand transition-colors" />
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-3 py-1.5 pr-2 bg-white/70 backdrop-blur-md border border-border rounded-2xl shadow-sm cursor-pointer hover:bg-brand-soft hover:border-brand/20 transition-all group">
          <div className="text-right hidden sm:block">
            <p className="text-[12px] font-black text-ink leading-tight">Vinícius</p>
            <p className="text-[10px] font-bold text-slate/60 uppercase tracking-tighter">Admin</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-soft to-brand/20 border border-brand/10 flex items-center justify-center shadow-sm relative overflow-hidden">
             <img src="https://ui-avatars.com/api/?name=Vinicius&background=7C3AED&color=fff" alt="Avatar" className="w-full h-full object-cover" />
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate/40 group-hover:text-brand transition-colors" />
        </div>
      </div>
    </header>
  );
}
