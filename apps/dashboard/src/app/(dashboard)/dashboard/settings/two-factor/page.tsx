'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Save, Check, X, KeyRound, Copy, RefreshCw } from 'lucide-react';

export default function TwoFactorSettingsPage() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [method, setMethod] = useState('totp');
  const [forceGlobal, setForceGlobal] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    triggerToast('Código de recuperação copiado.');
  };

  const handleRegenerateCodes = () => {
    const next = Array.from({ length: 10 }).map(() => {
      const p1 = Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase();
      const p2 = Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase();
      const p3 = Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase();
      return `${p1}-${p2}-${p3}`;
    });
    setBackupCodes(next);
    triggerToast('Novos códigos de recuperação gerados.');
  };

  return (
    <div className="w-full text-left space-y-6 pt-2 pb-12 select-none">
      
      {/* Toast Alert Banner */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-55 bg-brand text-white p-3.5 rounded-2xl shadow-xl border border-brand/50 flex items-center justify-between gap-3 max-w-sm animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-white shrink-0" />
            <span className="text-[11.5px] font-bold">{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="p-0.5 text-white/70 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-455">
        <Link href="/dashboard/settings" className="hover:text-brand flex items-center gap-1 transition-colors">
          <ChevronLeft className="w-4 h-4" />
          Configurações
        </Link>
        <span className="text-slate-350">/</span>
        <span className="text-slate-700 font-bold">Autenticação 2FA</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E7E5EF] pb-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-650 border border-indigo-100 flex items-center justify-center shrink-0">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-[18px] 2xl:text-[20px] font-black tracking-tight text-slate-950">
              Autenticação de Dois Fatores (2FA)
            </h1>
            <p className="text-slate-455 font-semibold text-[11px] 2xl:text-[11.5px] tracking-tight">
              Aumente a segurança da sua conta adicionando uma etapa extra de validação.
            </p>
          </div>
        </div>

        <button 
          onClick={() => triggerToast('Definições de 2FA salvas.')}
          className="flex h-9 items-center justify-center gap-1.5 px-4 bg-violet-600 hover:bg-violet-750 text-white rounded-xl text-xs font-black shadow-lg shadow-violet-600/15 transition-all uppercase tracking-tight"
        >
          <Save className="w-3.5 h-3.5 shrink-0" />
          Salvar alterações
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Col 1 & 2: 2FA controls */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Status & Toggle */}
          <div className="bg-white border border-[#E7E5EF] rounded-[22px] p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-50 pb-2">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Status da Autenticação
              </h3>
              <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase border tracking-wider ${twoFactorEnabled ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                {twoFactorEnabled ? 'Ativado' : 'Desativado'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black text-slate-900">Exigir código 2FA no login</p>
                <p className="text-[10.5px] font-semibold text-slate-450 mt-0.5">Habilita a verificação em duas etapas obrigatória para sua conta.</p>
              </div>

              {/* Toggle switch */}
              <button 
                type="button"
                onClick={() => {
                  setTwoFactorEnabled(!twoFactorEnabled);
                  triggerToast(`2FA ${!twoFactorEnabled ? 'ativado' : 'desativado'}.`);
                }}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${twoFactorEnabled ? 'bg-brand' : 'bg-slate-200'}`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${twoFactorEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>

          {/* Setup method */}
          {twoFactorEnabled && (
            <div className="bg-white border border-[#E7E5EF] rounded-[22px] p-5 shadow-sm space-y-4 animate-in fade-in duration-200">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest block border-b border-slate-50 pb-2">
                Método de Autenticação
              </h3>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'totp', label: 'App Autenticador', desc: 'Google Auth, Authy, etc.' },
                  { id: 'sms', label: 'Mensagem SMS', desc: 'Envio de código para celular' },
                  { id: 'email', label: 'E-mail Seguro', desc: 'Envio de token para caixa' }
                ].map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setMethod(item.id);
                      triggerToast(`Método 2FA alterado para ${item.label}.`);
                    }}
                    className={`p-3.5 border rounded-xl cursor-pointer transition text-center space-y-1 ${method === item.id ? 'border-brand bg-brand-soft/20' : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50'}`}
                  >
                    <span className="text-xs font-black text-slate-900 block">{item.label}</span>
                    <span className="text-[9px] text-slate-400 block font-semibold leading-normal">{item.desc}</span>
                  </div>
                ))}
              </div>

              {method === 'totp' && (
                <div className="pt-4 border-t border-slate-100 flex flex-col md:flex-row items-center gap-6">
                  {/* QR code mockup */}
                  <div className="w-28 h-28 bg-slate-100 border border-[#E8DDFD] rounded-xl flex items-center justify-center p-2 shrink-0">
                    <div className="w-full h-full bg-[radial-gradient(#1e293b_35%,transparent_40%)] bg-[length:6px_6px]" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-black text-slate-900">Escaneie o QR Code</p>
                    <p className="text-[11px] font-semibold text-slate-500 leading-relaxed">
                      Abra o aplicativo autenticador no seu celular, selecione "Ler código QR" e aponte a câmera para a imagem ao lado.
                    </p>
                    <div className="pt-1.5">
                      <p className="text-[9px] font-black uppercase text-slate-400">Chave secreta alternativa</p>
                      <p className="text-xs font-mono font-bold text-slate-700 mt-1 select-all">JBSWY3DPEHPK3PXP</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Force Global setting */}
          <div className="bg-white border border-[#E7E5EF] rounded-[22px] p-5 shadow-sm space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest block border-b border-slate-50 pb-2">
              Segurança Operacional da Equipe
            </h3>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black text-slate-900">Forçar 2FA para toda a equipe</p>
                <p className="text-[10.5px] font-semibold text-slate-450 mt-0.5">Obriga todos os operadores e desenvolvedores a configurarem 2FA.</p>
              </div>

              <button 
                type="button"
                onClick={() => {
                  setForceGlobal(!forceGlobal);
                  triggerToast(`Segurança obrigatória da equipe ${!forceGlobal ? 'ativada' : 'desativada'}.`);
                }}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${forceGlobal ? 'bg-brand' : 'bg-slate-200'}`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${forceGlobal ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>

        </div>

        {/* Col 3: Backup codes */}
        <div className="space-y-6">
          <div className="bg-white border border-[#E7E5EF] rounded-[22px] p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-50 pb-2">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Códigos de Recuperação
              </h3>

              <button 
                onClick={handleRegenerateCodes}
                className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-[11px] font-semibold text-slate-500 leading-normal">
              Caso perca acesso ao seu autenticador, use um dos códigos abaixo para acessar a conta. Cada código expira após o uso.
            </p>

            <div className="grid grid-cols-1 gap-1.5 font-mono text-[10px]">
              {backupCodes.map((code) => (
                <div 
                  key={code}
                  onClick={() => handleCopyCode(code)}
                  className="p-2 border border-slate-100 rounded-lg bg-slate-50/50 flex items-center justify-between hover:border-brand/30 cursor-pointer"
                >
                  <span className="text-slate-700 font-bold">{code}</span>
                  <span className="text-[9px] font-black text-brand uppercase">{copiedCode === code ? 'Copiado' : 'Copiar'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
