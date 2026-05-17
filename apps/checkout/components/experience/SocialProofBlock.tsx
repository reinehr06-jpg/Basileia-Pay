'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, User } from 'lucide-react';

export function SocialProofBlock({ sessionToken }: { sessionToken: string }) {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/v1/public/checkout-sessions/${sessionToken}/social-proof`)
      .then(r => r.json())
      .then(setData)
      .catch(() => {});
  }, [sessionToken]);

  if (!data || !data.enabled) return null;

  return (
    <div className="bg-success/5 border border-success/20 rounded-lg p-3 mb-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-success/10 text-success flex items-center justify-center">
            <TrendingUp size={16} />
        </div>
        <div>
            <div className="text-xs font-bold text-ink">
                {data.recentCount} pessoas compraram nas últimas {data.lookbackHours}h
            </div>
            {data.recentBuyers && data.recentBuyers.length > 0 && (
                <div className="text-[10px] text-ink-muted">
                    Última compra: {data.recentBuyers[0].name} • {data.recentBuyers[0].time_ago}
                </div>
            )}
        </div>
      </div>
      <div className="flex -space-x-2">
        {[1, 2, 3].map(i => (
            <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-surface-raised flex items-center justify-center">
                <User size={10} className="text-ink-subtle" />
            </div>
        ))}
      </div>
    </div>
  );
}
