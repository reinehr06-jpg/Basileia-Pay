import React from 'react';

export function PageLayout({ title, action, children, backHref }: { title: string, action?: React.ReactNode, children: React.ReactNode, backHref?: string }) {
  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          {backHref && (
            <a href={backHref} className="text-sm text-ink-subtle hover:text-brand mb-1">← Voltar</a>
          )}
          <h1 className="text-2xl font-bold text-ink">{title}</h1>
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="flex flex-col gap-6">
        {children}
      </div>
    </div>
  );
}
