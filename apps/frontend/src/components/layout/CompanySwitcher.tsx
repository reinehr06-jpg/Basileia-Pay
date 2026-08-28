'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Building2, ChevronDown, Check } from 'lucide-react';

export function CompanySwitcher() {
  const { availableCompanies, switchCompany, activeCompanyId } = useAuth();
  const [open, setOpen] = useState(false);

  if (!availableCompanies || availableCompanies.length === 0) return null;

  const activeCompany = availableCompanies.find((c) => c.id === activeCompanyId) || null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 bg-brand/5 border border-brand/10 rounded-lg text-xs font-bold text-brand hover:bg-brand/10 transition-colors"
      >
        <Building2 className="w-3.5 h-3.5" />
        <span className="truncate max-w-[120px]">{activeCompany ? activeCompany.name : 'Todas as empresas'}</span>
        <ChevronDown className="w-3 h-3" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 w-64 bg-white rounded-xl border border-border shadow-xl z-50 py-2 max-h-64 overflow-y-auto">
            <button
              onClick={() => { switchCompany(0); setOpen(false); }}
              className="w-full px-3 py-2 text-left text-xs font-bold text-ink hover:bg-brand-soft flex items-center justify-between"
            >
              <span>Todas as empresas</span>
              {!activeCompanyId && <Check className="w-3 h-3 text-brand" />}
            </button>
            <div className="border-t border-border/50 my-1" />
            {availableCompanies.map((company) => (
              <button
                key={company.id}
                onClick={() => { switchCompany(company.id); setOpen(false); }}
                className="w-full px-3 py-2 text-left text-xs font-bold text-ink hover:bg-brand-soft flex items-center justify-between"
              >
                <span>{company.name}</span>
                {activeCompanyId === company.id && <Check className="w-3 h-3 text-brand" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
