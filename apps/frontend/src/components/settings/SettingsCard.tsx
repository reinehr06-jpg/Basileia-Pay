'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Palette, 
  Moon, 
  ShieldCheck, 
  KeyRound, 
  Key, 
  Landmark, 
  Webhook, 
  Sparkles, 
  DollarSign, 
  Bell, 
  Layers, 
  Users, 
  ClipboardList, 
  SlidersHorizontal,
  ChevronRight,
  Lock,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SettingsCard as SettingsCardType } from '@/types/settings';

const iconMap: Record<string, React.ComponentType<any>> = {
  Building2,
  Palette,
  Moon,
  ShieldCheck,
  KeyRound,
  Key,
  Landmark,
  Webhook,
  Sparkles,
  DollarSign,
  Bell,
  Layers,
  Users,
  ClipboardList,
  SlidersHorizontal
};

interface SettingsCardProps {
  card: SettingsCardType;
  userRole: string;
  onActionFeedback: (msg: string) => void;
}

export function SettingsCard({ card, userRole, onActionFeedback }: SettingsCardProps) {
  const IconComponent = iconMap[card.icon] || SlidersHorizontal;
  
  // Check permission
  const hasPermission = card.permission.includes(userRole.toLowerCase());

  // Category pill style mapping
  const categoryStyles: Record<string, string> = {
    'Empresa': 'bg-blue-50 text-blue-700 border-blue-200/50',
    'Segurança': 'bg-red-50 text-red-700 border-red-200/50',
    'Integrações': 'bg-violet-50 text-violet-750 border-violet-200/50',
    'Operação': 'bg-green-50 text-green-700 border-green-200/50',
    'Sistema': 'bg-slate-100 text-slate-700 border-slate-200/50',
    'Financeiro': 'bg-amber-50 text-amber-700 border-amber-200/50',
  };

  const currentCategoryStyle = categoryStyles[card.category] || 'bg-slate-100 text-slate-700 border-slate-200/50';

  // Card Content Render
  const cardContent = (
    <div className="relative min-h-[154px] flex flex-col justify-between p-4 bg-white border border-[#E8DDFD]/65 rounded-[20px] shadow-sm shadow-slate-100/50 transition-all duration-300 select-none group text-left">
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between">
          <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center border", card.iconBg)}>
            <IconComponent className="w-4.5 h-4.5 shrink-0" />
          </div>

          <div className="relative">
            {!hasPermission ? (
              <div className="duration-200 transition-all">
                <Lock className="w-3.5 h-3.5 text-slate-355" />
              </div>
            ) : card.isExternal ? (
              <ExternalLink className="w-3.5 h-3.5 text-slate-350 opacity-0 group-hover:opacity-100 transition-all duration-300" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-slate-350 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-0.5" />
            )}
          </div>
        </div>

        {/* Title & Desc */}
        <h3 className="mt-3 text-xs font-black text-slate-900 leading-tight">
          {card.title}
        </h3>
        <p className="mt-1 text-[10.5px] font-semibold text-slate-400 leading-normal line-clamp-2">
          {card.description}
        </p>
      </div>

      {/* Footer Badges */}
      <div className="mt-3 flex items-center justify-between">
        <span className={cn("px-2 py-0.5 rounded-md text-[8.5px] font-black uppercase border tracking-wider", currentCategoryStyle)}>
          {card.category}
        </span>

        {/* Extra Badge */}
        {card.badge && (
          <span className={cn(
            "px-2 py-0.5 rounded-md text-[8.5px] font-black uppercase tracking-wider border",
            card.badge.type === 'status' && card.badge.label === 'Ativo' && 'bg-green-50 text-green-700 border-green-200/50',
            card.badge.type === 'status' && card.badge.label === 'Inativo' && 'bg-red-50 text-red-700 border-red-200/50',
            card.badge.type === 'count' && cn(
              card.badge.color === 'violet' && 'bg-violet-50 text-violet-755 border-violet-200/50',
              card.badge.color === 'blue' && 'bg-blue-50 text-blue-700 border-blue-200/50',
              card.badge.color === 'red' && 'bg-red-50 text-red-700 border-red-200/50',
              card.badge.color === 'green' && 'bg-green-50 text-green-700 border-green-200/50',
              card.badge.color === 'yellow' && 'bg-yellow-50 text-yellow-700 border-yellow-250/50',
              !card.badge.color && 'bg-slate-100 text-slate-800 border-slate-200'
            )
          )}>
            {card.badge.type === 'status' ? card.badge.label : card.badge.value}
          </span>
        )}
      </div>

      {/* Access Denied Overlay/Tooltip */}
      {!hasPermission && (
        <div className="absolute inset-0 bg-white/45 backdrop-blur-[0.5px] rounded-[20px] pointer-events-none" />
      )}
    </div>
  );

  if (!hasPermission) {
    return (
      <div 
        onClick={() => onActionFeedback(`Acesso negado: seu perfil não tem permissão para configurar ${card.title}.`)}
        className="cursor-not-allowed group relative min-h-[154px]"
        title="Sem permissão para acessar"
      >
        {cardContent}
      </div>
    );
  }

  return (
    <Link href={card.route} className="block transition-all hover:scale-[1.01] active:scale-[0.99] hover:shadow-md hover:shadow-brand/5 duration-200 min-h-[154px]">
      {cardContent}
    </Link>
  );
}
