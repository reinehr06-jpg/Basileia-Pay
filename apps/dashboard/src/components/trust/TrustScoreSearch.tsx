'use client';

import { useState, useEffect } from 'react';
import { Search, ShieldAlert, ArrowRight, ShieldCheck } from 'lucide-react';
import { TrustScoreDetailPage } from './TrustScoreDetailPage';

interface TrustScoreSearchProps {
  preloadedPaymentId?: string | null;
  onClearPreload?: () => void;
}

export function TrustScoreSearch({ preloadedPaymentId, onClearPreload }: TrustScoreSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [breakdown, setBreakdown] = useState<any | null>(null);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (preloadedPaymentId) {
      setSearchQuery(preloadedPaymentId);
      const found = null;
      setBreakdown(found);
      setSearched(true);
      if (onClearPreload) {
        onClearPreload();
      }
    }
  }, [preloadedPaymentId, onClearPreload]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    
    // Look up in mock breakdowns
    const found = {
      score: 85,
      riskLevel: 'low',
      decision: 'approved',
      factors: []
    };
    
    setBreakdown(found);
    setSearched(true);
  };

  const handleBack = () => {
    setBreakdown(null);
    setSearched(false);
  };

  return (
    <div className="w-full text-left animate-in fade-in duration-300">
      {!searched ? (
        /* Search landing */
        <div className="max-w-2xl mx-auto py-12 space-y-6 text-center">
          <div className="w-12 h-12 bg-violet-50 text-violet-750 border border-violet-100 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <Search className="w-5 h-5" />
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-black uppercase text-slate-800 tracking-wider">
              Análise de Score Individual
            </h3>
            <p className="text-[11px] font-semibold text-slate-400 max-w-md mx-auto leading-relaxed">
              Consulte a árvore de fatores e timeline forense completa de decisões inserindo o ID de qualquer transação de pagamento.
            </p>
          </div>

          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-4 bg-white border border-[#E8DDFD] rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand shadow-sm shadow-slate-100/50"
                placeholder="Buscar pagamento por ID (Ex: pay_8f3a2d7e9b1c)..."
              />
            </div>
            <button
              type="submit"
              className="flex h-10 items-center justify-center gap-1 px-4.5 bg-brand hover:bg-brand-dark text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-brand/10"
            >
              Analisar
              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
            </button>
          </form>

          {/* Quick suggest tags */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2 text-[10.5px] font-semibold text-slate-400">
            <span>Sugestões de IDs:</span>
            {['pay_8f3a2d7e9b1c'].map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setSearchQuery(id);
                  const found = null;
                  setBreakdown(found);
                  setSearched(true);
                }}
                className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded border border-slate-200/50 cursor-pointer font-bold transition-all"
              >
                {id}
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Breakdown Details page */
        <TrustScoreDetailPage breakdown={breakdown} onBack={handleBack} />
      )}
    </div>
  );
}
