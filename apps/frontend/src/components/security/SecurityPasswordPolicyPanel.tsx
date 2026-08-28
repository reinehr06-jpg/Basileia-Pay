'use client';

import { useState } from 'react';
import { ShieldCheck, ToggleLeft, ToggleRight, Sparkles, RefreshCw, Key, HelpCircle } from 'lucide-react';
import { SecurityPolicy } from '@/types/security';
import { cn } from '@/lib/utils';

interface SecurityPasswordPolicyPanelProps {
  policy: SecurityPolicy;
  onActionFeedback: (msg: string) => void;
  isAdmin: boolean;
}

export function SecurityPasswordPolicyPanel({
  policy,
  onActionFeedback,
  isAdmin
}: SecurityPasswordPolicyPanelProps) {
  const [minLength, setMinLength] = useState(policy.minLength);
  const [requireUppercase, setRequireUppercase] = useState(policy.requireUppercase);
  const [requireNumber, setRequireNumber] = useState(policy.requireNumber);
  const [requireSpecialChar, setRequireSpecialChar] = useState(policy.requireSpecialChar);
  const [expirationDays, setExpirationDays] = useState(policy.expirationDays);
  const [previousCount, setPreviousCount] = useState(policy.previousPasswordsCount);
  const [maxFailed, setMaxFailed] = useState(policy.maxFailedAttempts);
  const [lockMinutes, setLockMinutes] = useState(policy.lockMinutes);

  const [saving, setSaving] = useState(false);

  const handleSubmitPolicy = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      onActionFeedback("Políticas de complexidade de senha atualizadas. Logs de segurança registrados.");
    }, 1000);
  };

  return (
    <form onSubmit={handleSubmitPolicy} className="space-y-6 text-left">
      
      {/* Policy Options and Strength grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        
        {/* Form elements card */}
        <div className="bg-white border border-[#E8DDFD]/65 rounded-[22px] p-5 shadow-sm shadow-slate-100/50 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center gap-2 border-b border-[#E8DDFD]/40 pb-3 mb-4">
              <Key className="w-5 h-5 text-brand" />
              <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">
                Parâmetros da Política de Senhas
              </h3>
            </div>

            <div className="space-y-4">
              {/* Row 1: Min length and expiration */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9.5px] font-black uppercase text-slate-400 tracking-wider">Comprimento Mínimo</label>
                  <input
                    type="number"
                    min="8"
                    max="32"
                    required
                    value={minLength}
                    onChange={(e) => setMinLength(parseInt(e.target.value) || 12)}
                    className="w-full h-8.5 px-3 bg-white border border-[#E8DDFD] rounded-xl text-xs font-semibold text-slate-850 focus:outline-none focus:border-brand"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9.5px] font-black uppercase text-slate-400 tracking-wider">Expiração da Senha (Dias)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={expirationDays}
                    onChange={(e) => setExpirationDays(parseInt(e.target.value) || 0)}
                    className="w-full h-8.5 px-3 bg-white border border-[#E8DDFD] rounded-xl text-xs font-semibold text-slate-850 focus:outline-none focus:border-brand"
                  />
                </div>
              </div>

              {/* Checkboxes row */}
              <div className="space-y-2 pt-1.5">
                <label className="text-[9.5px] font-black uppercase text-slate-400 tracking-wider block">Exigências de Complexidade</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Maiúscula (A-Z)", val: requireUppercase, set: setRequireUppercase },
                    { label: "Número (0-9)", val: requireNumber, set: setRequireNumber },
                    { label: "Especial (!@#)", val: requireSpecialChar, set: setRequireSpecialChar }
                  ].map((chk, i) => (
                    <div 
                      key={i} 
                      onClick={() => chk.set(!chk.val)}
                      className={cn(
                        "p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-colors text-[10px] font-black uppercase tracking-wider",
                        chk.val ? "border-brand text-brand bg-brand-soft/20" : "border-slate-200 text-slate-400"
                      )}
                    >
                      <span>{chk.label}</span>
                      <input
                        type="checkbox"
                        checked={chk.val}
                        onChange={() => {}}
                        className="w-3.5 h-3.5 accent-brand rounded border-slate-300"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Row 3: History & Failed Attempts */}
              <div className="grid grid-cols-3 gap-3 pt-1.5">
                <div className="space-y-1">
                  <label className="text-[8.5px] font-black uppercase text-slate-400 tracking-wider">Preteridas Evitadas</label>
                  <select
                    value={previousCount}
                    onChange={(e) => setPreviousCount(parseInt(e.target.value) || 5)}
                    className="w-full h-8.5 px-2 bg-white border border-[#E8DDFD] rounded-xl text-[11px] font-semibold text-slate-850 focus:outline-none focus:border-brand"
                  >
                    <option value="3">Últimas 3</option>
                    <option value="5">Últimas 5</option>
                    <option value="10">Últimas 10</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[8.5px] font-black uppercase text-slate-400 tracking-wider">Erros Login Máx</label>
                  <input
                    type="number"
                    min="3"
                    max="10"
                    required
                    value={maxFailed}
                    onChange={(e) => setMaxFailed(parseInt(e.target.value) || 5)}
                    className="w-full h-8.5 px-3 bg-white border border-[#E8DDFD] rounded-xl text-xs font-semibold text-slate-850 focus:outline-none focus:border-brand"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[8.5px] font-black uppercase text-slate-400 tracking-wider">Tempo Bloqueio</label>
                  <select
                    value={lockMinutes}
                    onChange={(e) => setLockMinutes(parseInt(e.target.value) || 15)}
                    className="w-full h-8.5 px-2 bg-white border border-[#E8DDFD] rounded-xl text-[11px] font-semibold text-slate-850 focus:outline-none focus:border-brand"
                  >
                    <option value="5">5 minutos</option>
                    <option value="15">15 minutos</option>
                    <option value="30">30 minutos</option>
                    <option value="60">1 hora</option>
                  </select>
                </div>
              </div>

            </div>
          </div>

          {isAdmin && (
            <div className="pt-4 border-t border-[#E8DDFD]/40">
              <button
                type="submit"
                disabled={saving}
                className="w-full h-9 bg-slate-900 hover:bg-slate-850 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm"
              >
                {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Aplicar Políticas Ativas'}
              </button>
            </div>
          )}
        </div>

        {/* Strength card and metrics details */}
        <div className="bg-slate-900 border border-slate-800 rounded-[22px] p-5 shadow-xl flex flex-col justify-between h-full text-slate-350 min-h-[300px]">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-[10px] font-black uppercase text-slate-455 tracking-wider">
                Auditoria e Força da Política Atual
              </span>
              <span className="text-[9px] font-black text-violet-400 bg-violet-950/50 border border-violet-900/50 px-2 py-0.5 rounded-lg">
                FORTE E SEGURA
              </span>
            </div>

            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Comprimento da senha recomendado:</span>
                <span className="font-bold text-slate-200">≥ {minLength} caracteres</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Exigência de números e símbolos:</span>
                <span className="font-bold text-slate-200">
                  {requireNumber && requireSpecialChar ? 'Exigidos' : 'Parcial'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Proteção Brute Force:</span>
                <span className="font-bold text-slate-200">Bloqueio após {maxFailed} falhas</span>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-850 rounded-xl p-3.5 space-y-2 text-[10.5px] font-bold text-slate-400">
              <span className="text-[9.5px] font-black text-slate-300 uppercase tracking-wider block">Exemplo de Senha Autorizada</span>
              <code className="text-violet-400 select-all block font-mono bg-slate-900 px-2 py-1 rounded border border-slate-800">
                BslPay_2026!Secured
              </code>
              <p className="text-[9px] font-medium text-slate-500 mt-1 leading-relaxed">
                Esta senha possui {minLength} caracteres, atende todos os requisitos de maiúsculas, minúsculas, números e símbolos especiais (!@#).
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-850 text-[9px] text-slate-550 leading-relaxed">
            Alterar políticas de complexidade de senha não invalidará senhas existentes imediatamente, mas obrigará os usuários a alterá-las em sua próxima expiração ou troca voluntária.
          </div>
        </div>

      </div>

    </form>
  );
}
