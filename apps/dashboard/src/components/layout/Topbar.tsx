'use client';

import { Bell } from 'lucide-react';

interface TopbarProps {
  title?: string;
  description?: string;
}

export function Topbar({ title, description }: TopbarProps) {
  return (
    <header className="h-20 bg-surface border-b border-border flex items-center justify-between px-8 flex-shrink-0">
      <div>
        {title && <h1 className="text-xl font-bold text-ink">{title}</h1>}
        {description && <p className="text-sm text-ink-muted">{description}</p>}
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 text-ink-muted hover:text-brand hover:bg-brand-muted rounded-full transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full border-2 border-surface"></span>
        </button>
      </div>
    </header>
  );
}
