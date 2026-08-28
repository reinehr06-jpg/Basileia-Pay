'use client';

import { cn } from '@/lib/utils';

interface TrustScoreGaugeProps {
  score: number;
  size?: number;
}

export function TrustScoreGauge({ score, size = 160 }: TrustScoreGaugeProps) {
  const getRiskDetails = (val: number) => {
    if (val < 40) return { text: 'Baixo Risco', color: 'text-emerald-600', fill: '#10B981' };
    if (val < 70) return { text: 'Risco Moderado', color: 'text-amber-500', fill: '#F59E0B' };
    return { text: 'Alto Risco', color: 'text-red-655', fill: '#EF4444' };
  };

  const risk = getRiskDetails(score);

  const radius = size * 0.35;
  const strokeWidth = size * 0.06;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center text-center relative select-none">
      <div 
        style={{ width: size, height: size * 0.55 }}
        className="relative flex items-center justify-center overflow-hidden"
      >
        <svg 
          style={{ width: size, height: size }}
          className="absolute top-0"
          viewBox="0 0 120 120"
        >
          {/* Track */}
          <path
            d="M 15,80 A 45,45 0 0,1 105,80"
            fill="none"
            stroke="#E7E5EF"
            strokeWidth={strokeWidth / 1.5}
            strokeLinecap="round"
          />
          {/* Progress */}
          <path
            d="M 15,80 A 45,45 0 0,1 105,80"
            fill="none"
            stroke={risk.fill}
            strokeWidth={strokeWidth / 1.5}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute top-[35%] flex flex-col items-center">
          <span 
            className="font-black text-slate-800 leading-none"
            style={{ fontSize: size * 0.16 }}
          >
            {score}
          </span>
          <span 
            className={cn("font-black uppercase tracking-wider mt-1.5", risk.color)}
            style={{ fontSize: size * 0.055 }}
          >
            {risk.text}
          </span>
        </div>
      </div>
    </div>
  );
}
