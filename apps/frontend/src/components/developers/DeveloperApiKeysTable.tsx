'use client';

import { useState } from 'react';
import { Key, Copy, Trash2, Check, ShieldAlert, Plus, Eye, EyeOff, Clipboard, Terminal, ArrowRight } from 'lucide-react';
import { DeveloperApiKey } from '@/types/developers';
import { cn } from '@/lib/utils';

interface DeveloperApiKeysTableProps {
  keys: DeveloperApiKey[];
  onActionFeedback: (msg: string) => void;
  isAdmin: boolean;
  onSaveKey: (key: Partial<DeveloperApiKey>) => void;
  onRevokeKey: (id: string) => void;
}

export function DeveloperApiKeysTable({
  keys,
  onActionFeedback,
  isAdmin,
  onSaveKey,
  onRevokeKey
}: DeveloperApiKeysTableProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showConfirmRevoke, setShowConfirmRevoke] = useState<string | null>(null);
  
  // Creation Form State
  const [keyName, setKeyName] = useState('');
  const [systemName, setSystemName] = useState('Vendor ERP');
  const [environment, setEnvironment] = useState<'production' | 'sandbox'>('production');
  const [selectedScopes, setSelectedScopes] = useState<string[]>(['checkouts.create', 'payments.read']);
  const [expiresInDays, setExpiresInDays] = useState('365');
  
  // Single-time reveal key string
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [copiedRevealed, setCopiedRevealed] = useState(false);

  const availableScopes = [
    { value: 'checkouts.create', label: 'checkouts.create', desc: 'Criar checkouts de pagamento' },
    { value: 'payments.read', label: 'payments.read', desc: 'Consultar transações de pagamento' },
    { value: 'refunds.write', label: 'refunds.write', desc: 'Solicitar ou estornar reembolsos' },
    { value: 'webhooks.read', label: 'webhooks.read', desc: 'Consultar eventos de webhooks' }
  ];

  const handleToggleScope = (scope: string) => {
    if (selectedScopes.includes(scope)) {
      setSelectedScopes(selectedScopes.filter(s => s !== scope));
    } else {
      setSelectedScopes([...selectedScopes, scope]);
    }
  };

  const handleCopyPrefix = (prefix: string) => {
    navigator.clipboard.writeText(prefix + '********');
    onActionFeedback('Chave truncada copiada para área de transferência!');
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName) return;

    // Generate random mock key sk_live_bsl_XXXXX or sk_test_bsl_XXXXX
    const randomHex = Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 8);
    const prefix = environment === 'production' ? 'sk_live_bsl_' : 'sk_test_bsl_';
    const finalKeyString = `${prefix}${randomHex}`;

    // Pass to parent
    onSaveKey({
      name: keyName,
      prefix: `${prefix}${randomHex.substring(0, 4)}`,
      systemName: systemName,
      environment: environment,
      scopes: selectedScopes,
      status: 'active',
      expiresAt: expiresInDays ? new Date(Date.now() + parseInt(expiresInDays) * 24 * 60 * 60 * 1000).toISOString() : undefined
    });

    // Reveal locally once
    setRevealedKey(finalKeyString);
    setKeyName('');
    onActionFeedback('Chave de API gerada com sucesso! Copie-a agora.');
  };

  const handleConfirmRevocation = () => {
    if (showConfirmRevoke) {
      onRevokeKey(showConfirmRevoke);
      onActionFeedback('Chave de API revogada com sucesso e inativada.');
      setShowConfirmRevoke(null);
    }
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
            API Keys de Integração
          </span>
          <h3 className="text-sm font-black text-slate-800 mt-0.5">
            Gestão de Chaves de Acesso
          </h3>
        </div>

        {isAdmin && (
          <button
            onClick={() => {
              setRevealedKey(null);
              setShowCreateModal(true);
            }}
            className="flex h-8.5 items-center gap-1.5 px-4 bg-brand hover:bg-brand-dark text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm shadow-brand/10"
          >
            <Plus className="w-4 h-4" />
            Nova Chave
          </button>
        )}
      </div>

      {/* Main Keys List Card */}
      <div className="bg-white border border-[#E8DDFD]/65 rounded-[22px] overflow-hidden shadow-sm shadow-slate-100/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold text-slate-650">
            <thead className="border-b border-[#E8DDFD]/40 bg-slate-50 text-[9px] font-black uppercase text-slate-400 tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Nome / Sistema</th>
                <th className="px-5 py-3.5">Ambiente</th>
                <th className="px-5 py-3.5">Escopos Autorizados</th>
                <th className="px-5 py-3.5">Chave</th>
                <th className="px-5 py-3.5">Criada em</th>
                <th className="px-5 py-3.5">Último uso</th>
                <th className="px-5 py-3.5 text-center">Status</th>
                <th className="px-5 py-3.5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {keys.map((key) => {
                const isActive = key.status === 'active';
                const isRevoked = key.status === 'revoked';
                const isExpired = key.status === 'expired';

                return (
                  <tr key={key.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Nome / Sistema */}
                    <td className="px-5 py-4">
                      <span className="font-black text-slate-800 text-xs block">{key.name}</span>
                      <span className="text-[9.5px] font-bold text-slate-400 mt-0.5 block">
                        Vinculada: <span className="font-extrabold text-slate-500">{key.systemName}</span>
                      </span>
                    </td>

                    {/* Ambiente */}
                    <td className="px-5 py-4">
                      <span className={cn(
                        "px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider",
                        key.environment === 'production' 
                          ? "bg-violet-100 text-violet-700" 
                          : "bg-blue-150/60 text-blue-700"
                      )}>
                        {key.environment === 'production' ? 'Produção' : 'Sandbox'}
                      </span>
                    </td>

                    {/* Escopos */}
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1 max-w-[220px]">
                        {key.scopes.map((s, idx) => (
                          <span key={idx} className="bg-slate-100/80 border border-slate-200/20 text-slate-600 px-1.5 py-0.5 rounded text-[8.5px] font-extrabold uppercase leading-none">
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Chave Truncada */}
                    <td className="px-5 py-4 font-mono text-[10px] text-slate-400 font-extrabold">
                      <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/50 px-2 py-1 rounded-lg w-fit">
                        <span>{key.prefix}********</span>
                        <button
                          onClick={() => handleCopyPrefix(key.prefix)}
                          className="text-slate-450 hover:text-slate-700 shrink-0 cursor-pointer"
                          title="Copiar truncada"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </td>

                    {/* Criada em */}
                    <td className="px-5 py-4 text-slate-500 font-medium">
                      <span>{new Date(key.createdAt).toLocaleDateString('pt-BR')}</span>
                    </td>

                    {/* Último uso */}
                    <td className="px-5 py-4 text-slate-500 font-medium">
                      <span>{key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString('pt-BR') : 'Nunca usada'}</span>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4 text-center">
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-wider block mx-auto w-fit",
                        isActive && "bg-emerald-50 text-emerald-600",
                        isRevoked && "bg-slate-100 text-slate-500",
                        isExpired && "bg-amber-50 text-amber-500"
                      )}>
                        {isActive ? 'Ativa' : isRevoked ? 'Revogada' : 'Expirada'}
                      </span>
                    </td>

                    {/* Ações */}
                    <td className="px-5 py-4 text-right">
                      {isActive && isAdmin ? (
                        <button
                          onClick={() => setShowConfirmRevoke(key.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                          title="Revogar chave"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-350 italic">Nenhuma</span>
                      )}
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 1. Modal Criação Chave API */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-left">
          <div className="bg-white border border-[#E8DDFD]/65 rounded-[22px] w-full max-w-lg shadow-2xl overflow-hidden flex flex-col justify-between max-h-[90vh] no-scrollbar">
            
            {/* Modal Header */}
            <div className="bg-slate-50 border-b border-[#E8DDFD]/40 p-5 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                  Criar Nova Chave de API
                </h3>
                <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                  Cada sistema conectado pode possuir chaves e permissões dedicadas.
                </p>
              </div>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                fechar
              </button>
            </div>

            {/* Revealed Key Display (If created) */}
            {revealedKey ? (
              <div className="p-5 space-y-4 overflow-y-auto no-scrollbar">
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl p-4 flex items-start gap-2.5">
                  <ShieldAlert className="w-5 h-5 text-emerald-650 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider">Chave de API Gerada!</h4>
                    <p className="text-[10px] font-bold text-emerald-700/80 leading-relaxed mt-0.5">
                      Esta chave será exibida completa **apenas esta única vez**. Copie e armazene em um gerenciador de segredos seguro. Você não poderá visualizá-la novamente após fechar este modal!
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Chave Secreta Secreta</span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={revealedKey}
                      className="flex-1 h-10 px-3.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-800 font-extrabold"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(revealedKey);
                        setCopiedRevealed(true);
                        onActionFeedback('Chave de API copiada para área de transferência!');
                        setTimeout(() => setCopiedRevealed(false), 2000);
                      }}
                      className="flex h-10 items-center justify-center gap-1.5 px-4 bg-brand hover:bg-brand-dark text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-brand/10"
                    >
                      {copiedRevealed ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copiedRevealed ? 'Copiado' : 'Copiar'}
                    </button>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center justify-between text-[10px] font-semibold text-slate-500">
                  <span>Expiração configurada:</span>
                  <span className="font-extrabold text-slate-700">{expiresInDays ? `${expiresInDays} dias` : 'Nunca expira'}</span>
                </div>

                <div className="pt-2 shrink-0">
                  <button
                    onClick={() => {
                      setRevealedKey(null);
                      setShowCreateModal(false);
                    }}
                    className="w-full h-10 bg-slate-900 hover:bg-slate-850 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center cursor-pointer shadow-md"
                  >
                    Entendido, Copiei a Chave
                  </button>
                </div>
              </div>
            ) : (
              /* Creation Form */
              <form onSubmit={handleCreate} className="p-5 space-y-4 overflow-y-auto no-scrollbar">
                
                {/* 1. Nome Amigável */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Nome da Chave</label>
                  <input
                    type="text"
                    required
                    value={keyName}
                    onChange={(e) => setKeyName(e.target.value)}
                    className="w-full h-10 px-3.5 bg-white border border-[#E8DDFD] rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand shadow-sm shadow-slate-100/50"
                    placeholder="Ex: ERP Produção Matriz"
                  />
                </div>

                {/* 2. Sistema Vinculado */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Sistema Vinculado</label>
                  <input
                    type="text"
                    required
                    value={systemName}
                    onChange={(e) => setSystemName(e.target.value)}
                    className="w-full h-10 px-3.5 bg-white border border-[#E8DDFD] rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand shadow-sm"
                    placeholder="Ex: Vendor ERP"
                  />
                </div>

                {/* 3. Ambiente */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Ambiente Logico</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setEnvironment('production')}
                      className={cn(
                        "h-10 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center border transition-all cursor-pointer",
                        environment === 'production' 
                          ? "bg-brand text-white border-brand shadow-md shadow-brand/10" 
                          : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                      )}
                    >
                      Produção (sk_live)
                    </button>
                    <button
                      type="button"
                      onClick={() => setEnvironment('sandbox')}
                      className={cn(
                        "h-10 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center border transition-all cursor-pointer",
                        environment === 'sandbox' 
                          ? "bg-violet-750 text-white border-violet-750 shadow-md shadow-violet-100/10" 
                          : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                      )}
                    >
                      Sandbox (sk_test)
                    </button>
                  </div>
                </div>

                {/* 4. Escopos de Permissão */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Escopos Autorizados (Granular)</label>
                  <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-3 space-y-2.5">
                    {availableScopes.map((scope) => {
                      const active = selectedScopes.includes(scope.value);
                      return (
                        <div 
                          key={scope.value}
                          onClick={() => handleToggleScope(scope.value)}
                          className="flex items-start gap-2.5 cursor-pointer select-none"
                        >
                          <div className={cn(
                            "w-4 h-4 rounded border flex items-center justify-center mt-0.5 shrink-0 transition-colors",
                            active ? "bg-brand border-brand text-white" : "border-slate-350 bg-white"
                          )}>
                            {active && <Check className="w-2.5 h-2.5 stroke-[4px]" />}
                          </div>
                          <div>
                            <span className="text-[10.5px] font-black text-slate-800 font-mono leading-none block">{scope.label}</span>
                            <span className="text-[9px] font-bold text-slate-400 block mt-0.5">{scope.desc}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 5. Expiração */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Expiração Automática</label>
                  <select
                    value={expiresInDays}
                    onChange={(e) => setExpiresInDays(e.target.value)}
                    className="w-full h-10 px-3.5 bg-white border border-[#E8DDFD] rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-brand shadow-sm"
                  >
                    <option value="30">Expirar em 30 dias</option>
                    <option value="90">Expirar em 90 dias</option>
                    <option value="365">Expirar em 1 ano (Recomendado)</option>
                    <option value="">Nunca expirar</option>
                  </select>
                </div>

                {/* Submit Action */}
                <div className="pt-2 flex gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 h-10 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center cursor-pointer transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-10 bg-brand hover:bg-brand-dark text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center cursor-pointer shadow-md shadow-brand/10 transition-transform active:scale-[0.98]"
                  >
                    Gerar Credencial
                  </button>
                </div>

              </form>
            )}

          </div>
        </div>
      )}

      {/* 2. Dialog Confirmação de Revogação */}
      {showConfirmRevoke && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-left">
          <div className="bg-white border border-[#E8DDFD]/65 rounded-[22px] w-full max-w-sm shadow-2xl p-5 space-y-4">
            <div className="w-10 h-10 bg-red-50 text-red-650 border border-red-100 rounded-xl flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">
                Revogar Chave de API Secreta?
              </h3>
              <p className="text-[10px] font-bold text-slate-400 leading-relaxed">
                Esta ação desativará imediatamente a chave secreta de autenticação. Todas as chamadas de sistemas vinculados e checkouts integrados falharão instantaneamente em tempo real. Esta ação não poderá ser desfeita!
              </p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setShowConfirmRevoke(null)}
                className="flex-1 h-8.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center cursor-pointer transition-colors"
              >
                Voltar
              </button>
              <button
                onClick={handleConfirmRevocation}
                className="flex-1 h-8.5 bg-red-655 hover:bg-red-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center cursor-pointer shadow-sm transition-colors"
              >
                Confirmar e Inativar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
