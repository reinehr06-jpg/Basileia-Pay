'use client';

import { cn } from '@/lib/utils';

export type CheckoutStatus = 'Publicado' | 'Rascunho' | 'Pausado' | 'Arquivado';

interface CheckoutStatusBadgeProps {
  status: CheckoutStatus | string;
  className?: string;
}

export function CheckoutStatusBadge({ status, className }: CheckoutStatusBadgeProps) {
  const normalizedStatus = status === 'published' ? 'Publicado' : 
                           status === 'draft' ? 'Rascunho' : 
                           status === 'paused' ? 'Pausado' : 
                           status === 'archived' ? 'Arquivado' : status;

  const isPublicado = normalizedStatus === 'Publicado';
  const isRascunho = normalizedStatus === 'Rascunho';
  const isPausado = normalizedStatus === 'Pausado';
  const isArquivado = normalizedStatus === 'Arquivado';

  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9.5px] font-black border transition-all h-7 shadow-sm shrink-0 select-none",
      isPublicado && "bg-green-50/60 border-green-100 text-green-700",
      isRascunho && "bg-amber-50/60 border-amber-100 text-amber-700",
      isPausado && "bg-yellow-50/60 border-yellow-100 text-yellow-700",
      isArquivado && "bg-slate-50/60 border-slate-200 text-slate-400",
      className
    )}>
      <div className={cn(
        "w-1.5 h-1.5 rounded-full shrink-0",
        isPublicado && "bg-green-500 animate-pulse",
        isRascunho && "bg-amber-500",
        isPausado && "bg-yellow-500 animate-pulse",
        isArquivado && "bg-slate-400"
      )} />
      {normalizedStatus}
    </div>
  );
}
