'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Save, Check, X, Key, Trash, Copy, Plus, AlertCircle } from 'lucide-react';

interface ApiKey {
  id: string;
  name: string;
  scopes: string[];
  environment: 'production' | 'sandbox';
  createdAt: string;
  lastUsedAt: string;
  status: 'active' | 'revoked';
}

export default function ApiKeysSettingsPage() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal control
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newKeyDetails, setNewKeyDetails] = useState<{ name: string; environment: 'production' | 'sandbox'; scopes: string[] }>({
    name: '',
    environment: 'production',
    scopes: ['read_payments']
  });

  const [generatedKey, setGeneratedKey] = useState<string | null>(null);

  // Key storage state
  const [keys, setKeys] = useState<ApiKey[]>([]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleCopy = (txt: string) => {
    navigator.clipboard.writeText(txt);
    triggerToast('Copiado para a área de transferência.');
  };

  const handleCreateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyDetails.name) {
      triggerToast('Forneça um nome para a chave.');
      return;
    }

    const mockKeyString = `pk_${newKeyDetails.environment === 'production' ? 'live' : 'test'}_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`;
    
    const newKey: ApiKey = {
      id: Math.random().toString(),
      name: newKeyDetails.name,
      scopes: newKeyDetails.scopes,
      environment: newKeyDetails.environment,
      createdAt: new Date().toISOString(),
      lastUsedAt: 'Nunca utilizado',
      status: 'active'
    };

    setKeys([newKey, ...keys]);
    setGeneratedKey(mockKeyString);
    setIsCreateOpen(false);
    triggerToast('Chave de API criada.');
  };

  const handleRevokeKey = (id: string) => {
    setKeys(prev => prev.map(k => k.id === id ? { ...k, status: 'revoked' } : k));
    triggerToast('Chave de API revogada.');
  };

  return (
    <div className="w-full text-left space-y-6 pt-2 pb-12 select-none relative">
      
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

      {/* API Key Modal Display (Only once) */}
      {generatedKey && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E7E5EF] rounded-[24px] max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2 text-brand">
              <Key className="w-5 h-5 shrink-0" />
              <h3 className="text-sm font-black text-slate-950">Chave de API Gerada com Sucesso</h3>
            </div>

            <p className="text-[11px] font-semibold text-slate-500 leading-relaxed">
              Por motivos de segurança, guarde sua chave privada em local seguro. Você <strong>não conseguirá visualizá-la novamente</strong> após fechar esta caixa.
            </p>

            <div className="p-3.5 bg-slate-50 border border-[#E8DDFD] rounded-xl flex items-center justify-between gap-2.5">
              <span className="text-xs font-mono font-bold text-slate-800 break-all select-all">{generatedKey}</span>
              <button
                onClick={() => handleCopy(generatedKey)}
                className="p-2 bg-brand-soft hover:bg-brand/10 text-brand rounded-lg shrink-0"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-2 p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-[10.5px] font-bold text-amber-800 leading-normal">
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span>Qualquer pessoa com acesso a esta chave pode realizar cobranças e operações de checkout em seu nome.</span>
            </div>

            <button
              onClick={() => setGeneratedKey(null)}
              className="w-full h-10 bg-slate-950 hover:bg-slate-900 text-white font-black text-xs uppercase rounded-xl transition"
            >
              Entendi, salvei a chave
            </button>
          </div>
        </div>
      )}

      {/* Key Creation Form Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E7E5EF] rounded-[24px] max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-50 pb-2">
              <h3 className="text-xs font-black text-slate-950 uppercase tracking-wider">Criar Nova Chave de API</h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateKey} className="space-y-4">
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Nome Identificador</label>
                <input
                  type="text"
                  placeholder="Ex: Integração App Mobile"
                  value={newKeyDetails.name}
                  onChange={(e) => setNewKeyDetails({ ...newKeyDetails, name: e.target.value })}
                  className="w-full h-10 px-3.5 bg-slate-50 border border-[#E8DDFD] rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-brand"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Ambiente da Chave</label>
                <select
                  value={newKeyDetails.environment}
                  onChange={(e) => setNewKeyDetails({ ...newKeyDetails, environment: e.target.value as any })}
                  className="w-full h-10 px-3.5 bg-slate-50 border border-[#E8DDFD] rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-brand cursor-pointer"
                >
                  <option value="production">Produção</option>
                  <option value="sandbox">Sandbox / Homologação</option>
                </select>
              </div>

              <div className="space-y-2 text-left">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Escopos e Permissões</label>
                <div className="space-y-2 max-h-32 overflow-y-auto p-2 border border-[#E8DDFD] rounded-xl bg-slate-50/50">
                  {[
                    { id: 'read_payments', label: 'Ver transações e pagamentos' },
                    { id: 'write_payments', label: 'Efetuar novos pagamentos' },
                    { id: 'refund_payments', label: 'Realizar reembolsos' },
                    { id: 'read_subscriptions', label: 'Consultar assinaturas ativas' }
                  ].map((scope) => (
                    <label key={scope.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newKeyDetails.scopes.includes(scope.id)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setNewKeyDetails(prev => ({
                            ...prev,
                            scopes: checked 
                              ? [...prev.scopes, scope.id]
                              : prev.scopes.filter(s => s !== scope.id)
                          }));
                        }}
                        className="rounded border-[#E8DDFD] text-brand focus:ring-brand"
                      />
                      <span className="text-[11px] font-semibold text-slate-700">{scope.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-10 bg-brand hover:bg-brand-accent text-white font-black text-xs uppercase rounded-xl shadow-md transition"
              >
                Gerar Chave
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-455">
        <Link href="/dashboard/settings" className="hover:text-brand flex items-center gap-1 transition-colors">
          <ChevronLeft className="w-4 h-4" />
          Configurações
        </Link>
        <span className="text-slate-350">/</span>
        <span className="text-slate-700 font-bold">API Keys</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E7E5EF] pb-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-yellow-50 text-yellow-600 border border-yellow-100 flex items-center justify-center shrink-0">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-[18px] 2xl:text-[20px] font-black tracking-tight text-slate-950">
              API Keys
            </h1>
            <p className="text-slate-455 font-semibold text-[11px] 2xl:text-[11.5px] tracking-tight">
              Crie chaves de acesso para integrar o Basileia Pay de maneira segura com seus checkouts e backends.
            </p>
          </div>
        </div>

        <button 
          onClick={() => {
            setNewKeyDetails({ name: '', environment: 'production', scopes: ['read_payments'] });
            setIsCreateOpen(true);
          }}
          className="flex h-9 items-center justify-center gap-1.5 px-4 bg-violet-600 hover:bg-violet-750 text-white rounded-xl text-xs font-black shadow-lg shadow-violet-600/15 transition-all uppercase tracking-tight"
        >
          <Plus className="w-4 h-4 shrink-0" />
          Criar nova chave
        </button>
      </div>

      {/* Table grid layout */}
      <div className="bg-white border border-[#E7E5EF] rounded-[22px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-[#E7E5EF] text-[10px] font-black text-slate-450 uppercase tracking-widest">
                <th className="py-3.5 px-5">Nome</th>
                <th className="py-3.5 px-5">Ambiente</th>
                <th className="py-3.5 px-5">Escopos</th>
                <th className="py-3.5 px-5">Criada em</th>
                <th className="py-3.5 px-5">Último uso</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E5EF]/60 text-xs">
              {keys.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-bold">Nenhuma chave de API gerada.</td>
                </tr>
              ) : (
                keys.map((key) => (
                  <tr key={key.id} className="hover:bg-slate-50/40 transition">
                    <td className="py-3 px-5 font-black text-slate-900">{key.name}</td>
                    <td className="py-3 px-5">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${key.environment === 'production' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                        {key.environment}
                      </span>
                    </td>
                    <td className="py-3 px-5 font-mono text-[9px] text-slate-500">
                      {key.scopes.join(', ')}
                    </td>
                    <td className="py-3 px-5 font-bold text-slate-500">
                      {new Date(key.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-3 px-5 font-bold text-slate-500">
                      {key.lastUsedAt.includes('Z') ? new Date(key.lastUsedAt).toLocaleDateString('pt-BR') : key.lastUsedAt}
                    </td>
                    <td className="py-3 px-5">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${key.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-750'}`}>
                        {key.status === 'active' ? 'Ativo' : 'Revogado'}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-right">
                      {key.status === 'active' ? (
                        <button
                          onClick={() => handleRevokeKey(key.id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 transition"
                          title="Revogar chave de API"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-[10px] font-semibold text-slate-400 italic">Inativa</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
