'use client';

import { 
  Search, 
  Bell, 
  Sun, 
  Moon, 
  Command, 
  ChevronDown, 
  PlusCircle,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TopbarProps {
  title?: string;
  description?: string;
}

export function Topbar({ title, description }: TopbarProps) {
  return (
    <header className="h-[80px] bg-surface/80 backdrop-blur-md border-b border-border px-8 flex items-center justify-between sticky top-0 z-10">
      {/* Search */}
      <div className="relative w-[480px]">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">
          <Search className="w-4 h-4" />
        </div>
        <input 
          type="text" 
          placeholder="Buscar transação, cliente, pedido ou evento"
          className="w-full bg-background border-border border-2 rounded-2xl py-3 pl-12 pr-16 focus:border-brand/40 focus:ring-0 transition-all outline-none text-sm font-medium placeholder:text-muted/70"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-2 py-1 bg-surface border border-border rounded-lg shadow-sm">
          <Command className="w-3 h-3 text-muted" />
          <span className="text-[10px] font-bold text-muted">K</span>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-6">
        {/* Status */}
        <div className="hidden lg:flex items-center gap-2 bg-success/10 border border-success/20 px-4 py-2 rounded-xl">
          <Activity className="w-4 h-4 text-success" />
          <span className="text-xs font-bold text-success uppercase tracking-wider">Sistemas operando</span>
        </div>

        {/* System Selector */}
        <div className="flex items-center gap-3 bg-background border border-border px-4 py-2.5 rounded-xl cursor-pointer hover:bg-brand-soft hover:border-brand/20 transition-all group">
          <div className="w-2 h-2 rounded-full bg-success" />
          <span className="text-sm font-bold text-ink whitespace-nowrap">Todos os sistemas</span>
          <ChevronDown className="w-4 h-4 text-muted group-hover:text-brand transition-colors" />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 border-x border-border px-6">
          <button className="p-2.5 text-muted hover:bg-brand-soft hover:text-brand rounded-xl transition-all relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-danger rounded-full border-2 border-surface" />
          </button>
          <button className="p-2.5 text-muted hover:bg-brand-soft hover:text-brand rounded-xl transition-all">
            <Sun className="w-5 h-5" />
          </button>
        </div>

        {/* Profile */}
        <div className="flex items-center gap-3 pl-2 group cursor-pointer">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-ink leading-tight">Vinícius</p>
            <p className="text-[11px] font-semibold text-muted">Admin</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-brand-soft border border-brand/20 flex items-center justify-center overflow-hidden shadow-sm group-hover:border-brand/40 transition-all">
             <img src="https://ui-avatars.com/api/?name=Vinicius&background=7B16D9&color=fff" alt="Avatar" />
          </div>
        </div>
      </div>
    </header>
  );
}
