'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Save, Check, X, Layers, Activity, Key, Play, ShieldAlert } from 'lucide-react';

interface Environment {
  id: string;
  name: string;
  url: string;
  publicKey: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export default function EnvironmentsSettingsPage() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [envs, setEnvs] = useState<Environment[]>([
    { id: '1', name: 'Produção', url: 'https://api.basileia.com/v1', publicKey: 'pk_live_84f938c82b9a7102e389d4c9f1', status: 'active', createdAt: '2025-01-10T12:00:00Z' },
    { id: '2', name: 'Homologação', url: 'https://api-staging.basileia.com/v1', publicKey: 'pk_staging_42a84fb79204cd19c8f2b8', status: 'active', createdAt: '2025-01-15T15:30:00Z' },
    { id: '3', name: 'Sandbox / Testes', url: 'https://api-sandbox.basileia.com/v1', publicKey: 'pk_test_3b8a1c9df24b6f1e8e204c3', status: 'active', createdAt: '2025-01-15T15:35:00Z' }
  ]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleToggleStatus = (id: string) => {
    setEnvs(prev => prev.map(e => e.id === id ? { ...e, status: e.status === 'active' ? 'inactive' : 'active' } : e));
    const target = envs.find(e => e.id === id);
    if (target) {
      triggerToast(`Ambiente ${target.name} ${target.status === 'active' ? 'desativado' : 'ativado'}.`);
    }
  };

  const handleRegenKey = (name: string) => {
    triggerToast(`Solicitação de nova chave pública para o ambiente ${name} encaminhada.`);
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
        <span className="text-slate-700 font-bold">Ambientes</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E7E5EF] pb-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-650 border border-cyan-100 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-[18px] 2xl:text-[20px] font-black tracking-tight text-slate-950">
              Gerenciamento de Ambientes
            </h1>
            <p className="text-slate-455 font-semibold text-[11px] 2xl:text-[11.5px] tracking-tight">
              Gerencie seus domínios, chaves de API correspondentes e endpoints de homologação e sandbox.
            </p>
          </div>
        </div>
      </div>

      {/* Environments Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {envs.map((env) => (
          <div key={env.id} className="bg-white border border-[#E7E5EF] rounded-[22px] p-5 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              {/* Top info */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900">{env.name}</span>
                <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase border tracking-wider ${env.status === 'active' ? 'bg-green-50 text-green-705 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                  {env.status === 'active' ? 'Ativo' : 'Desativado'}
                </span>
              </div>

              {/* Endpoints & public key */}
              <div className="space-y-2 pt-2 border-t border-slate-50">
                <div>
                  <span className="text-[9px] font-black uppercase text-slate-400">Endpoint URL</span>
                  <p className="text-xs font-mono font-bold text-slate-700 mt-0.5 truncate">{env.url}</p>
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase text-slate-400">Chave Pública</span>
                  <div className="flex items-center justify-between gap-2.5 mt-0.5">
                    <p className="text-xs font-mono font-bold text-slate-450 truncate">{env.publicKey}</p>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(env.publicKey);
                        triggerToast('Chave pública copiada.');
                      }}
                      className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-700 shrink-0"
                    >
                      <Key className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-50 flex items-center justify-between gap-2 mt-4">
              <button
                onClick={() => handleToggleStatus(env.id)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase border ${env.status === 'active' ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'}`}
              >
                {env.status === 'active' ? 'Desativar' : 'Ativar'}
              </button>

              <button
                onClick={() => handleRegenKey(env.name)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg text-[10px] font-black uppercase transition-all"
              >
                Nova Chave
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
