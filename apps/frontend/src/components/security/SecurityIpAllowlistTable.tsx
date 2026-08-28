'use client';

import { useState } from 'react';
import { ShieldCheck, Plus, Trash2, Globe, Check, AlertTriangle, Key, Search, ShieldAlert, Monitor } from 'lucide-react';
import { SecurityIpRule } from '@/types/security';
import { cn } from '@/lib/utils';

interface SecurityIpAllowlistTableProps {
  rules: SecurityIpRule[];
  onActionFeedback: (msg: string) => void;
  isAdmin: boolean;
  onAddRule: (rule: Partial<SecurityIpRule>) => void;
  onRemoveRule: (id: string) => void;
}

export function SecurityIpAllowlistTable({
  rules,
  onActionFeedback,
  isAdmin,
  onAddRule,
  onRemoveRule
}: SecurityIpAllowlistTableProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showConfirmRemoveRule, setShowConfirmRemoveRule] = useState<string | null>(null);

  // Form states
  const [ipCidr, setIpCidr] = useState('');
  const [description, setDescription] = useState('');
  const [envType, setEnvType] = useState<'production' | 'sandbox' | 'both'>('both');

  // Simulated active user current IP
  const activeUserIp = "187.54.120.33"; // Porto Alegre IP which is NOT in allowlist!
  const isCurrentIpAllowed = rules.some((rule) => {
    // Basic prefix matching logic for mock purposes
    const cleanCidr = rule.cidr.split('/')[0];
    return activeUserIp === cleanCidr || rule.cidr.includes('187.54.120');
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ipCidr || !description) return;

    onAddRule({
      cidr: ipCidr,
      description: description,
      environment: envType,
      createdBy: "Carlos Oliveira",
      createdAt: new Date().toISOString()
    });

    onActionFeedback(`Regra CIDR "${ipCidr}" adicionada à allowlist.`);
    setIpCidr('');
    setDescription('');
    setShowAddForm(false);
  };

  const handleRemoveConfirm = () => {
    if (showConfirmRemoveRule) {
      onRemoveRule(showConfirmRemoveRule);
      onActionFeedback("Regra CIDR removida permanentemente. Log de segurança disparado.");
      setShowConfirmRemoveRule(null);
    }
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Warning banner if current user IP is not on the active allowlist */}
      {!isCurrentIpAllowed && (
        <div className="bg-red-50 border border-red-150 rounded-[22px] p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-xs font-semibold">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-white border border-red-200 text-red-655 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Seu IP Atual não está na Allowlist!</h4>
              <p className="text-[10px] font-bold text-slate-450 mt-1 leading-relaxed max-w-xl">
                Detectamos que seu IP de acesso atual é <code className="font-mono text-red-600 bg-red-100/50 px-1 py-0.5 rounded font-black select-all">{activeUserIp}</code>. Se você ativar a restrição estrita CIDR global na conta sem cadastrá-lo, seu dispositivo perderá acesso ao painel Basileia Pay.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setIpCidr(`${activeUserIp}/32`);
              setDescription("Meu IP Atual de Acesso");
              setShowAddForm(true);
              onActionFeedback("Campos pré-preenchidos. Adicione para salvar seu IP.");
            }}
            className="h-9 px-4 bg-red-655 hover:bg-red-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shrink-0 transition-all shadow-sm"
          >
            Cadastrar Meu IP
          </button>
        </div>
      )}

      {/* Header and Add action button */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Lista Branca de Acessos</span>
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mt-0.5">
            Regras de Restrição CIDR por IP
          </h3>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex h-8.5 items-center gap-1.5 px-4 bg-brand hover:bg-brand-dark text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm shadow-brand/10"
          >
            <Plus className="w-4 h-4" />
            Adicionar IP / CIDR
          </button>
        )}
      </div>

      {/* Main Table rule list */}
      <div className="bg-white border border-[#E8DDFD]/65 rounded-[22px] overflow-hidden shadow-sm shadow-slate-100/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold text-slate-650">
            <thead className="border-b border-[#E8DDFD]/40 bg-slate-50 text-[9px] font-black uppercase text-slate-400 tracking-wider">
              <tr>
                <th className="px-5 py-3.5">IP / CIDR Cadastrado</th>
                <th className="px-5 py-3.5">Finalidade / Uso</th>
                <th className="px-5 py-3.5">Ambiente Restrito</th>
                <th className="px-5 py-3.5">Criado Por</th>
                <th className="px-5 py-3.5">Data Cadastro</th>
                <th className="px-5 py-3.5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rules.map((rule) => {
                const isProduction = rule.environment === 'production';
                const isSandbox = rule.environment === 'sandbox';

                return (
                  <tr key={rule.id} className="hover:bg-slate-50/50 transition-colors">
                    
                    {/* CIDR */}
                    <td className="px-5 py-4 font-mono text-xs text-slate-800 font-extrabold select-all">
                      {rule.cidr}
                    </td>

                    {/* Descrição */}
                    <td className="px-5 py-4 font-medium text-slate-600">{rule.description}</td>

                    {/* Ambiente */}
                    <td className="px-5 py-4">
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[8.5px] font-black uppercase tracking-wider",
                        isProduction && "bg-emerald-50 text-emerald-600 border border-emerald-100",
                        isSandbox && "bg-blue-50 text-blue-600 border border-blue-100",
                        rule.environment === 'both' && "bg-slate-100 text-slate-600 border border-slate-200"
                      )}>
                        {rule.environment === 'production' ? 'Produção' : rule.environment === 'sandbox' ? 'Sandbox' : 'Ambos'}
                      </span>
                    </td>

                    {/* Criado Por */}
                    <td className="px-5 py-4 text-slate-500 font-bold whitespace-nowrap">{rule.createdBy}</td>

                    {/* Criado em */}
                    <td className="px-5 py-4 text-slate-400 font-medium whitespace-nowrap">
                      {new Date(rule.createdAt).toLocaleDateString('pt-BR')}
                    </td>

                    {/* Ações */}
                    <td className="px-5 py-4 text-right">
                      {isAdmin ? (
                        <button
                          onClick={() => setShowConfirmRemoveRule(rule.id)}
                          className="p-1 text-slate-400 hover:text-red-655 hover:bg-slate-50 rounded-lg cursor-pointer"
                          title="Remover regra"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-350 italic">Apenas Leitura</span>
                      )}
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add IP CIDR Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-[#E8DDFD]/65 rounded-[22px] w-full max-w-md shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">
                Adicionar IP / CIDR de Segurança
              </h3>
              <button onClick={() => setShowAddForm(false)} className="text-slate-450 hover:text-slate-700 cursor-pointer">
                fechar
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9.5px] font-black uppercase text-slate-400 tracking-wider">Endereço IP ou CIDR</label>
                <input
                  type="text"
                  required
                  value={ipCidr}
                  onChange={(e) => setIpCidr(e.target.value)}
                  className="w-full h-8.5 px-3 bg-white border border-[#E8DDFD] rounded-xl text-xs font-semibold text-slate-850 focus:outline-none focus:border-brand"
                  placeholder="Ex: 186.204.12.98/32 ou 186.204.0.0/16"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9.5px] font-black uppercase text-slate-400 tracking-wider">Finalidade / Descrição do Acesso</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full h-8.5 px-3 bg-white border border-[#E8DDFD] rounded-xl text-xs font-semibold text-slate-850 focus:outline-none focus:border-brand"
                  placeholder="Ex: IP Fixo - Carlos Oliveira (Matriz)"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9.5px] font-black uppercase text-slate-400 tracking-wider">Ambiente Restrito</label>
                <select
                  value={envType}
                  onChange={(e) => setEnvType(e.target.value as any)}
                  className="w-full h-8.5 px-3 bg-white border border-[#E8DDFD] rounded-xl text-xs font-semibold text-slate-850 focus:outline-none focus:border-brand"
                >
                  <option value="both">Produção & Sandbox</option>
                  <option value="production">Somente Produção</option>
                  <option value="sandbox">Somente Sandbox</option>
                </select>
              </div>

              <div className="pt-2 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 h-8.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 h-8.5 bg-brand hover:bg-brand-dark text-white rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center cursor-pointer shadow-sm shadow-brand/10"
                >
                  Adicionar IP
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Remove confirmation modal warning */}
      {showConfirmRemoveRule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-[#E8DDFD]/65 rounded-[22px] w-full max-w-sm shadow-2xl p-5 space-y-4 text-center">
            <h3 className="text-xs font-black uppercase text-slate-850 tracking-wider">
              Excluir Regra de IP Allowlist?
            </h3>
            <p className="text-[10px] font-bold text-slate-400 leading-relaxed">
              Dispositivos operando sob esta rede CIDR perderão acesso ao painel administrativo imediatamente se as regras globais estiverem ativas.
            </p>
            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setShowConfirmRemoveRule(null)}
                className="flex-1 h-8.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center cursor-pointer"
              >
                Voltar
              </button>
              <button
                onClick={handleRemoveConfirm}
                className="flex-1 h-8.5 bg-red-655 hover:bg-red-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center cursor-pointer shadow-sm"
              >
                Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
