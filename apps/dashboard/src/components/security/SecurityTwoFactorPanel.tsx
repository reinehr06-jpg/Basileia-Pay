'use client';

import { useState } from 'react';
import { ShieldCheck, ToggleLeft, ToggleRight, QrCode, Clipboard, Check, RefreshCw, Send, AlertTriangle, Key, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SecurityTwoFactorPanelProps {
  onActionFeedback: (msg: string) => void;
  isAdmin: boolean;
  twoFactorCount: number;
  totalUsers: number;
}

export function SecurityTwoFactorPanel({
  onActionFeedback,
  isAdmin,
  twoFactorCount,
  totalUsers
}: SecurityTwoFactorPanelProps) {
  const [policyMode, setPolicyMode] = useState<'optional' | 'required_all' | 'required_sensitive'>('required_sensitive');
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState(false);
  const [notifying, setNotifying] = useState(false);

  const mockSecretKey = "BSLP K394 AJ83 KD92 FD32";
  const mockRecoveryCodes = [
    "29fa-39bc-49de",
    "f29c-bc01-92da",
    "de33-ff12-881a",
    "99ad-bb02-7cda"
  ];

  const handleCopyKey = () => {
    navigator.clipboard.writeText(mockSecretKey);
    setCopiedKey(true);
    onActionFeedback('Chave secreta copiada com sucesso!');
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleCopyCodes = () => {
    navigator.clipboard.writeText(mockRecoveryCodes.join('\n'));
    setCopiedCodes(true);
    onActionFeedback('Códigos de recuperação copiados! Armazene em local seguro.');
    setTimeout(() => setCopiedCodes(false), 2000);
  };

  const handleNotifyPending = () => {
    setNotifying(true);
    setTimeout(() => {
      setNotifying(false);
      onActionFeedback("Notificação por e-mail disparada para os 4 usuários pendentes.");
    }, 1200);
  };

  const pendingCount = Math.max(0, totalUsers - twoFactorCount);

  return (
    <div className="space-y-6 text-left">
      
      {/* 2FA Adoption Banner Alert */}
      {pendingCount > 0 && (
        <div className="bg-amber-50 border border-amber-150 rounded-[22px] p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-white border border-amber-200 text-amber-600 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Adoção de Duas Etapas Pendente</h4>
              <p className="text-[10px] font-bold text-slate-450 mt-1 leading-relaxed max-w-xl">
                Temos {pendingCount} usuários ativos na conta que ainda não ativaram o 2FA. Sob a política atual de cargos sensíveis, acessos administrativos podem ser restritos se o 2FA for desabilitado.
              </p>
            </div>
          </div>

          <button
            onClick={handleNotifyPending}
            disabled={notifying}
            className="h-9 px-4.5 bg-slate-900 hover:bg-slate-850 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all active:scale-[0.98] shrink-0 shadow-sm"
          >
            {notifying ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            Notificar Pendentes
          </button>
        </div>
      )}

      {/* Grid: Policy Settings & Authenticator setup */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        
        {/* Bloco 1: Global Policy toggles */}
        <div className="bg-white border border-[#E8DDFD]/65 rounded-[22px] p-5 shadow-sm shadow-slate-100/50 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center gap-2 border-b border-[#E8DDFD]/40 pb-3 mb-4 shrink-0">
              <ShieldCheck className="w-5 h-5 text-brand" />
              <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">
                Diretrizes de Governança 2FA
              </h3>
            </div>

            <div className="space-y-4">
              {[
                { id: 'optional', title: 'Opcional para todos', desc: 'Permite login com e-mail e senha normais; integrantes decidem se ativam.' },
                { id: 'required_sensitive', title: 'Obrigatório para Cargos Sensíveis (Recomendado)', desc: 'Exige 2FA de Owners, Admins e Desenvolvedores. Restante opcional.' },
                { id: 'required_all', title: 'Obrigatório para toda a organização', desc: 'Bloqueia acessos ao painel de qualquer usuário sem 2FA ativo.' }
              ].map((opt) => {
                const active = policyMode === opt.id;
                return (
                  <div 
                    key={opt.id}
                    onClick={() => isAdmin && setPolicyMode(opt.id as any)}
                    className={cn(
                      "p-3 rounded-xl border transition-all flex items-start gap-3 cursor-pointer",
                      active ? "border-brand bg-violet-50/10 shadow-sm" : "border-slate-200 hover:bg-slate-50"
                    )}
                  >
                    <div className="mt-0.5 shrink-0">
                      {active ? (
                        <ToggleRight className="w-5 h-5 text-brand" />
                      ) : (
                        <ToggleLeft className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <span className="text-[11px] font-black text-slate-800 block leading-tight">{opt.title}</span>
                      <span className="text-[9.5px] font-medium text-slate-450 block mt-1 leading-normal">{opt.desc}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {isAdmin && (
            <div className="pt-4 border-t border-[#E8DDFD]/40">
              <button
                onClick={() => {
                  onActionFeedback(`Salvando políticas...`);
                  setTimeout(() => {
                    onActionFeedback(`Política 2FA alterada com sucesso. A organização agora opera em modo: ${policyMode}. Auditoria gerada.`);
                  }, 800);
                }}
                className="w-full h-9 bg-slate-900 hover:bg-slate-850 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center cursor-pointer shadow-sm active:scale-95 transition-all"
              >
                Aplicar Políticas de Governança
              </button>
            </div>
          )}
        </div>

        {/* Bloco 2: Setup Authenticator (TOTP) mock details */}
        <div className="bg-slate-900 border border-slate-800 rounded-[22px] p-5 shadow-xl flex flex-col justify-between h-full text-slate-350 min-h-[350px]">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <span className="text-[10px] font-black uppercase text-slate-455 tracking-wider">
                Configurar App Autenticador (TOTP)
              </span>
              <span className="text-[9px] font-black text-emerald-400 bg-emerald-950/50 border border-emerald-900/50 px-2 py-0.5 rounded-lg uppercase tracking-wider">
                Recomendado
              </span>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-start pt-1">
              <div className="bg-white p-2 rounded-xl shrink-0 border border-slate-700 shadow-lg">
                {/* Simulated QR Code using styling */}
                <div className="w-24 h-24 bg-slate-900 rounded-lg flex items-center justify-center relative overflow-hidden">
                  <QrCode className="w-18 h-18 text-white" />
                </div>
              </div>

              <div className="space-y-3 flex-1 text-xs">
                <p className="text-[10px] font-bold text-slate-400 leading-normal">
                  Escaneie o QR Code com o Google Authenticator ou 1Password. Caso prefira inserir manualmente, utilize a chave abaixo:
                </p>

                <div className="bg-slate-950 border border-slate-850 rounded-xl p-2 flex items-center justify-between font-mono text-[10px] text-slate-300">
                  <code className="select-all">{mockSecretKey}</code>
                  <button
                    onClick={handleCopyKey}
                    className="text-slate-500 hover:text-white shrink-0 cursor-pointer"
                    title="Copiar Chave"
                  >
                    {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Clipboard className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Recovery Codes Grid */}
            <div className="mt-5 pt-3 border-t border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase text-slate-455 tracking-wider">
                  Códigos de Recuperação Reserva
                </span>
                <button
                  onClick={handleCopyCodes}
                  className="text-brand hover:underline font-black text-[9px] uppercase tracking-wider cursor-pointer"
                >
                  {copiedCodes ? 'Copiado!' : 'Copiar Todos'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {mockRecoveryCodes.map((code) => (
                  <div key={code} className="bg-slate-950 border border-slate-850 px-2.5 py-1.5 rounded-lg text-center font-mono text-[10px] text-slate-400 font-extrabold select-all">
                    {code}
                  </div>
                ))}
              </div>
            </div>

          </div>

          <div className="pt-3 border-t border-slate-850 text-[9px] text-slate-500 font-bold leading-normal">
            Os códigos de recuperação permitem acesso em caso de perda do dispositivo e são exibidos apenas uma única vez.
          </div>
        </div>

      </div>

    </div>
  );
}
