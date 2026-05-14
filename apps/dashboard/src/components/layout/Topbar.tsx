import { Bell, Search, UserCircle } from "lucide-react";

export function Topbar({ title, description }: { title: string; description?: string }) {
  return (
    <header className="h-16 border-b border-line bg-surface flex items-center justify-between px-8 z-10 sticky top-0">
      <div className="flex flex-col">
        <h1 className="text-xl font-bold text-ink">{title}</h1>
        {description && <p className="text-xs text-slate-custom">{description}</p>}
      </div>

      <div className="flex items-center gap-6">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Buscar vendas, clientes..."
            className="pl-9 pr-4 py-2 bg-background border border-line rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary w-64 transition-all"
          />
        </div>

        <div className="flex items-center gap-4">
          <button className="relative p-2 text-slate-custom hover:bg-background rounded-full transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-primary rounded-full border-2 border-surface"></span>
          </button>
          
          <div className="h-8 w-px bg-line"></div>

          <button className="flex items-center gap-2 hover:bg-background p-1 pr-3 rounded-full transition-colors">
            <UserCircle className="w-8 h-8 text-muted" />
            <span className="text-sm font-medium text-ink hidden sm:block">Admin</span>
          </button>
        </div>
      </div>
    </header>
  );
}
