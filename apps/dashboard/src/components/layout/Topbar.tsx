'use client';

import { Bell } from 'lucide-react';

export function Topbar() {
  return (
    <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-6 flex-shrink-0">
      <div>
        {/* Breadcrumbs or page title */}
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 text-ink-muted hover:text-ink hover:bg-surface-raised rounded-full transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full border border-surface"></span>
        </button>
      </div>
    </header>
  );
}
