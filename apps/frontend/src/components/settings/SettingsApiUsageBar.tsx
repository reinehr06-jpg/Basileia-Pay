'use client';

interface SettingsApiUsageBarProps {
  percentUsed: number;
}

export function SettingsApiUsageBar({ percentUsed }: SettingsApiUsageBarProps) {
  const isHighUsage = percentUsed >= 90;

  return (
    <div className="w-full mt-2.5">
      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/50">
        <div
          className={`h-full rounded-full transition-all duration-500 ${isHighUsage ? 'bg-red-500' : 'bg-brand'}`}
          style={{ width: `${Math.min(100, Math.max(0, percentUsed))}%` }}
        />
      </div>
      <div className="flex justify-between items-center mt-1 text-[10px] font-bold text-slate-400">
        <span>Uso atual: {percentUsed}%</span>
        <span>Limite: 1.6M requisições</span>
      </div>
    </div>
  );
}
