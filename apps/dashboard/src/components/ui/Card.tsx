import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Card({ title, children, className }: { title?: string, children: React.ReactNode, className?: string }) {
  return (
    <div className={cn("bg-surface border border-border rounded-lg overflow-hidden shadow-sm", className)}>
      {title && (
        <div className="px-5 py-4 border-b border-border bg-surface/50">
          <h3 className="font-semibold text-ink">{title}</h3>
        </div>
      )}
      <div className="p-5">
        {children}
      </div>
    </div>
  );
}
