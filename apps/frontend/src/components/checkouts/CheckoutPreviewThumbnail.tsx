'use client';

import { cn } from '@/lib/utils';
import { CreditCard, QrCode, Sparkles, ShoppingBag, Calendar, Mail } from 'lucide-react';

interface CheckoutPreviewThumbnailProps {
  slug: string;
  className?: string;
}

export function CheckoutPreviewThumbnail({ slug, className }: CheckoutPreviewThumbnailProps) {
  return (
    <div className={cn(
      "w-full h-full bg-gradient-to-b from-[#F9F7FF] to-[#F1ECFF] relative flex items-center justify-center overflow-hidden border-b border-[#E8DDFD] select-none",
      className
    )}>
      {/* Background glow effects */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-brand/5 rounded-full blur-xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-20 h-20 bg-brand-accent/5 rounded-full blur-xl pointer-events-none" />

      {/* Render based on slug */}
      {slug === 'pagar-me-padrao' && (
        <div className="w-[85%] h-[85%] bg-white/95 rounded-xl shadow-[0_4px_12px_rgba(76,29,149,0.06)] border border-[#E8DDFD] p-2 flex flex-col justify-between animate-in fade-in zoom-in duration-500">
          <div className="flex items-center justify-between border-b border-slate-100 pb-1">
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-brand/10 flex items-center justify-center">
                <CreditCard className="w-1.5 h-1.5 text-brand" />
              </div>
              <span className="text-[7.5px] font-black text-slate-800">Checkout Padrão</span>
            </div>
            <span className="text-[7.5px] font-bold text-slate-400">Pagar.Me</span>
          </div>

          <div className="flex gap-2 items-center my-1">
            {/* Miniature Glassmorphic Credit Card */}
            <div className="flex-1 h-[36px] bg-gradient-to-tr from-brand-deep to-brand rounded-lg p-1.5 flex flex-col justify-between shadow-sm relative overflow-hidden">
              <div className="absolute -right-3 -bottom-3 w-10 h-10 bg-white/10 rounded-full" />
              <div className="flex items-center justify-between">
                <div className="w-2.5 h-1.5 bg-yellow-400/80 rounded-[2px]" /> {/* chip */}
                <div className="w-4 h-2.5 bg-white/10 rounded" />
              </div>
              <div className="space-y-0.5">
                <div className="h-1 w-8 bg-white/40 rounded-[1px]" />
                <div className="flex justify-between items-center">
                  <div className="h-[3px] w-6 bg-white/20 rounded-[1px]" />
                  <div className="h-1 w-2 bg-yellow-400/40 rounded-[1px]" />
                </div>
              </div>
            </div>

            {/* Inputs list skeleton */}
            <div className="flex-1 space-y-1">
              <div className="h-2 w-full bg-slate-100 rounded-[2px] border border-slate-200/50" />
              <div className="flex gap-1">
                <div className="h-2 flex-1 bg-slate-100 rounded-[2px] border border-slate-200/50" />
                <div className="h-2 flex-1 bg-slate-100 rounded-[2px] border border-slate-200/50" />
              </div>
            </div>
          </div>

          <button className="w-full h-3.5 bg-brand rounded-[4px] text-white text-[7px] font-black tracking-wider shadow-sm uppercase flex items-center justify-center">
            Pagar com Cartão
          </button>
        </div>
      )}

      {slug === 'pix-bb' && (
        <div className="w-[85%] h-[85%] bg-white/95 rounded-xl shadow-[0_4px_12px_rgba(76,29,149,0.06)] border border-[#E8DDFD] p-2 flex flex-col justify-between animate-in fade-in zoom-in duration-500">
          <div className="flex items-center justify-between border-b border-slate-100 pb-1">
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500/10 flex items-center justify-center">
                <QrCode className="w-1.5 h-1.5 text-blue-600" />
              </div>
              <span className="text-[7.5px] font-black text-slate-800">Checkout PIX</span>
            </div>
            <span className="text-[7.5px] font-bold text-yellow-500 uppercase tracking-widest font-mono">Banco do Brasil</span>
          </div>

          <div className="flex gap-3 items-center justify-center my-0.5">
            {/* Mocked QR Code Frame */}
            <div className="w-[38px] h-[38px] border border-[#E8DDFD] rounded-md p-0.5 bg-white shadow-sm flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-slate-50 border border-slate-200 rounded relative flex flex-col p-[2px] gap-[2px]">
                <div className="flex justify-between">
                  <div className="w-1.5 h-1.5 bg-slate-800 rounded-[1px]" />
                  <div className="w-1.5 h-1.5 bg-slate-800 rounded-[1px]" />
                </div>
                <div className="w-1 h-1 bg-slate-800 self-center rounded-[1px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                <div className="flex justify-between mt-auto">
                  <div className="w-1.5 h-1.5 bg-slate-800 rounded-[1px]" />
                  <div className="w-1 h-1 bg-slate-800 rounded-[1px]" />
                </div>
              </div>
            </div>

            {/* Pix payment details */}
            <div className="space-y-1 min-w-0 flex-1">
              <div className="h-1.5 w-10 bg-slate-100 rounded" />
              <div className="h-2 w-14 bg-blue-50 rounded text-blue-700 text-[6.5px] font-bold flex items-center px-1">
                Aguardando PIX...
              </div>
              <div className="h-1.5 w-16 bg-slate-50 rounded" />
            </div>
          </div>

          <button className="w-full h-3.5 bg-yellow-500 hover:bg-yellow-600 transition-all rounded-[4px] text-blue-900 text-[7px] font-black tracking-wider shadow-sm uppercase flex items-center justify-center">
            Copiar Código PIX
          </button>
        </div>
      )}

      {slug === 'assinatura-pro' && (
        <div className="w-[85%] h-[85%] bg-slate-950 text-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.15)] border border-slate-800 p-2 flex flex-col justify-between animate-in fade-in zoom-in duration-500 relative">
          <div className="absolute right-2 top-2 bg-green-500/20 text-green-400 px-1 py-[2px] rounded text-[6px] font-black uppercase tracking-tight flex items-center gap-0.5 border border-green-500/30">
            <Sparkles className="w-1 h-1" /> PRO
          </div>

          <div>
            <span className="text-[6.5px] font-black text-brand-accent/80 uppercase tracking-widest">Premium Plan</span>
            <h5 className="text-[8.5px] font-black tracking-tight leading-none mt-0.5">Assinatura Pro</h5>
          </div>

          <div className="my-1 border-y border-slate-800 py-1 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="h-1 w-12 bg-slate-700 rounded" />
              <div className="h-1.5 w-8 bg-slate-600 rounded" />
            </div>
            <div className="text-right">
              <p className="text-[9px] font-black text-white leading-none">R$ 99<span className="text-[6px] font-bold text-slate-400">/mês</span></p>
            </div>
          </div>

          <button className="w-full h-3.5 bg-green-500 hover:bg-green-600 transition-all rounded-[4px] text-slate-950 text-[7px] font-black tracking-wider uppercase flex items-center justify-center gap-1 shadow-[0_2px_6px_rgba(34,197,94,0.4)]">
            Confirmar Plano Pro
          </button>
        </div>
      )}

      {slug === 'marketplace' && (
        <div className="w-[85%] h-[85%] bg-white/95 rounded-xl shadow-[0_4px_12px_rgba(76,29,149,0.06)] border border-[#E8DDFD] p-2 flex flex-col justify-between animate-in fade-in zoom-in duration-500">
          <div className="flex items-center justify-between border-b border-slate-100 pb-1">
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-500/10 flex items-center justify-center">
                <ShoppingBag className="w-1.5 h-1.5 text-indigo-600" />
              </div>
              <span className="text-[7.5px] font-black text-slate-800">Checkout Split</span>
            </div>
            <span className="text-[7.5px] font-bold text-slate-400">Marketplace</span>
          </div>

          <div className="flex justify-between items-center my-1 bg-[#FAF8FF] p-1 border border-[#E8DDFD]/60 rounded-md">
            <div className="flex items-center gap-1.5">
              <div className="flex -space-x-1.5">
                <div className="w-3.5 h-3.5 rounded-full bg-brand flex items-center justify-center border border-white text-[5px] font-black text-white">S1</div>
                <div className="w-3.5 h-3.5 rounded-full bg-violet-400 flex items-center justify-center border border-white text-[5px] font-black text-white">S2</div>
              </div>
              <div className="space-y-0.5">
                <div className="h-1 w-10 bg-slate-300 rounded" />
                <div className="h-1 w-14 bg-slate-200 rounded" />
              </div>
            </div>
            <span className="text-[7.5px] font-black text-indigo-600">60% / 40%</span>
          </div>

          <button className="w-full h-3.5 bg-indigo-600 hover:bg-indigo-700 transition-all rounded-[4px] text-white text-[7px] font-black tracking-wider shadow-sm uppercase flex items-center justify-center">
            Pagar com Split
          </button>
        </div>
      )}

      {slug === 'evento' && (
        <div className="w-[85%] h-[85%] bg-white/95 rounded-xl shadow-[0_4px_12px_rgba(76,29,149,0.06)] border border-[#E8DDFD] p-2 flex flex-col justify-between animate-in fade-in zoom-in duration-500 relative">
          {/* Ticket styling cutouts */}
          <div className="absolute -left-[5px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-gradient-to-b from-[#F9F7FF] to-[#F1ECFF] rounded-full border border-[#E8DDFD] z-10" />
          <div className="absolute -right-[5px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-gradient-to-b from-[#F9F7FF] to-[#F1ECFF] rounded-full border border-[#E8DDFD] z-10" />

          <div className="flex items-center justify-between border-b border-dashed border-slate-200 pb-1">
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500/10 flex items-center justify-center">
                <Calendar className="w-1.5 h-1.5 text-rose-500" />
              </div>
              <span className="text-[7.5px] font-black text-slate-800">Checkout Ingresso</span>
            </div>
            <span className="text-[7.5px] font-bold text-rose-500">Live Show</span>
          </div>

          <div className="flex gap-2 items-center my-0.5">
            <div className="flex-1 space-y-0.5">
              <div className="h-1.5 w-16 bg-slate-300 rounded" />
              <div className="h-1 w-10 bg-slate-200 rounded" />
            </div>
            <div className="w-8 h-3.5 border-l border-dashed border-slate-200 pl-1.5 flex items-center justify-center">
              <div className="flex gap-[1px] h-full items-center">
                <div className="w-[1px] h-full bg-slate-400" />
                <div className="w-[2px] h-full bg-slate-400" />
                <div className="w-[1px] h-full bg-slate-400" />
                <div className="w-[1px] h-full bg-slate-400" />
                <div className="w-[2px] h-full bg-slate-400" />
              </div>
            </div>
          </div>

          <button className="w-full h-3.5 bg-rose-500 hover:bg-rose-600 transition-all rounded-[4px] text-white text-[7px] font-black tracking-wider shadow-sm uppercase flex items-center justify-center">
            Adquirir Entrada
          </button>
        </div>
      )}

      {slug === 'recuperacao' && (
        <div className="w-[85%] h-[85%] bg-white/95 rounded-xl shadow-[0_4px_12px_rgba(76,29,149,0.06)] border border-[#E8DDFD] p-2 flex flex-col justify-between animate-in fade-in zoom-in duration-500">
          <div className="flex items-center justify-between border-b border-slate-100 pb-1">
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <Mail className="w-1.5 h-1.5 text-emerald-600" />
              </div>
              <span className="text-[7.5px] font-black text-slate-800">Recuperação de Venda</span>
            </div>
            <span className="text-[7.5px] font-bold text-slate-400">E-mail</span>
          </div>

          <div className="my-1 flex items-center gap-1.5 justify-center bg-emerald-50/50 p-1 border border-emerald-100/50 rounded-md">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-100 flex items-center justify-center">
              <Mail className="w-1.5 h-1.5 text-emerald-600" />
            </div>
            <div className="space-y-0.5 flex-1 min-w-0">
              <div className="h-1 w-16 bg-slate-300 rounded" />
              <div className="h-1 w-24 bg-slate-200 rounded truncate" />
            </div>
          </div>

          <button className="w-full h-3.5 bg-emerald-500 hover:bg-emerald-600 transition-all rounded-[4px] text-white text-[7px] font-black tracking-wider shadow-sm uppercase flex items-center justify-center">
            Concluir Pagamento
          </button>
        </div>
      )}
    </div>
  );
}
