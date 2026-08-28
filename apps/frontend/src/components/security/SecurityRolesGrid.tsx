'use client';

import { useState } from 'react';
import { ShieldCheck, Users, Eye, Settings, Plus, Lock, CheckCircle2, XCircle } from 'lucide-react';
import { SecurityRole } from '@/types/security';
import { cn } from '@/lib/utils';

interface SecurityRolesGridProps {
  onActionFeedback: (msg: string) => void;
  isAdmin: boolean;
}

interface RoleCard {
  name: SecurityRole;
  desc: string;
  usersCount: number;
  scopes: string[];
}

export function SecurityRolesGrid({ onActionFeedback, isAdmin }: SecurityRolesGridProps) {
  const [selectedRole, setSelectedRole] = useState<SecurityRole | null>('Admin');
  
  // Custom Role Editor state
  const [isCreatingRole, setIsCreatingRole] = useState(false);
  const [customRoleName, setCustomRoleName] = useState('');
  const [customRoleDesc, setCustomRoleDesc] = useState('');

  const initialRoles: RoleCard[] = [
    { name: "Owner", desc: "Acesso total irrestrito e indelegável a todos os recursos.", usersCount: 1, scopes: ["all"] },
    { name: "Admin", desc: "Gerenciamento completo operacional de vendas e segurança.", usersCount: 1, scopes: ["read", "write", "delete", "export"] },
    { name: "Financeiro", desc: "Gestão e visualização de faturamento, vendas e saques.", usersCount: 1, scopes: ["read", "export"] },
    { name: "Desenvolvedor", desc: "Acesso a chaves API, logs de erro e simulador sandbox.", usersCount: 1, scopes: ["read", "write"] },
    { name: "Suporte", desc: "Visualização de checkouts, transações e reenvio de webhooks.", usersCount: 1, scopes: ["read"] },
    { name: "Auditor", desc: "Visualização global de logs e trilhas de auditoria.", usersCount: 1, scopes: ["read"] }
  ];

  // Matriz de permissões por área
  const rolePermissionsMatrix: Record<SecurityRole, { area: string; canView: boolean; canCreate: boolean; canEdit: boolean; canDelete: boolean; canExport: boolean }[]> = {
    Owner: [
      { area: "Visão Geral", canView: true, canCreate: true, canEdit: true, canDelete: true, canExport: true },
      { area: "Checkouts", canView: true, canCreate: true, canEdit: true, canDelete: true, canExport: true },
      { area: "Gateways", canView: true, canCreate: true, canEdit: true, canDelete: true, canExport: true },
      { area: "Roteamento", canView: true, canCreate: true, canEdit: true, canDelete: true, canExport: true },
      { area: "Segurança", canView: true, canCreate: true, canEdit: true, canDelete: true, canExport: true },
      { area: "Desenvolvedores", canView: true, canCreate: true, canEdit: true, canDelete: true, canExport: true },
    ],
    Admin: [
      { area: "Visão Geral", canView: true, canCreate: true, canEdit: true, canDelete: true, canExport: true },
      { area: "Checkouts", canView: true, canCreate: true, canEdit: true, canDelete: true, canExport: true },
      { area: "Gateways", canView: true, canCreate: true, canEdit: true, canDelete: true, canExport: true },
      { area: "Roteamento", canView: true, canCreate: true, canEdit: true, canDelete: true, canExport: true },
      { area: "Segurança", canView: true, canCreate: true, canEdit: true, canDelete: false, canExport: true },
      { area: "Desenvolvedores", canView: true, canCreate: true, canEdit: true, canDelete: false, canExport: true },
    ],
    Financeiro: [
      { area: "Visão Geral", canView: true, canCreate: false, canEdit: false, canDelete: false, canExport: true },
      { area: "Checkouts", canView: true, canCreate: false, canEdit: false, canDelete: false, canExport: true },
      { area: "Gateways", canView: false, canCreate: false, canEdit: false, canDelete: false, canExport: false },
      { area: "Roteamento", canView: false, canCreate: false, canEdit: false, canDelete: false, canExport: false },
      { area: "Segurança", canView: true, canCreate: false, canEdit: false, canDelete: false, canExport: false },
      { area: "Desenvolvedores", canView: false, canCreate: false, canEdit: false, canDelete: false, canExport: false },
    ],
    Desenvolvedor: [
      { area: "Visão Geral", canView: true, canCreate: false, canEdit: false, canDelete: false, canExport: false },
      { area: "Checkouts", canView: true, canCreate: true, canEdit: true, canDelete: false, canExport: false },
      { area: "Gateways", canView: true, canCreate: true, canEdit: true, canDelete: false, canExport: false },
      { area: "Roteamento", canView: true, canCreate: false, canEdit: false, canDelete: false, canExport: false },
      { area: "Segurança", canView: true, canCreate: false, canEdit: false, canDelete: false, canExport: false },
      { area: "Desenvolvedores", canView: true, canCreate: true, canEdit: true, canDelete: true, canExport: true },
    ],
    Suporte: [
      { area: "Visão Geral", canView: true, canCreate: false, canEdit: false, canDelete: false, canExport: false },
      { area: "Checkouts", canView: true, canCreate: false, canEdit: false, canDelete: false, canExport: false },
      { area: "Gateways", canView: false, canCreate: false, canEdit: false, canDelete: false, canExport: false },
      { area: "Roteamento", canView: false, canCreate: false, canEdit: false, canDelete: false, canExport: false },
      { area: "Segurança", canView: false, canCreate: false, canEdit: false, canDelete: false, canExport: false },
      { area: "Desenvolvedores", canView: false, canCreate: false, canEdit: false, canDelete: false, canExport: false },
    ],
    Auditor: [
      { area: "Visão Geral", canView: true, canCreate: false, canEdit: false, canDelete: false, canExport: true },
      { area: "Checkouts", canView: true, canCreate: false, canEdit: false, canDelete: false, canExport: true },
      { area: "Gateways", canView: true, canCreate: false, canEdit: false, canDelete: false, canExport: true },
      { area: "Roteamento", canView: true, canCreate: false, canEdit: false, canDelete: false, canExport: true },
      { area: "Segurança", canView: true, canCreate: false, canEdit: false, canDelete: false, canExport: true },
      { area: "Desenvolvedores", canView: true, canCreate: false, canEdit: false, canDelete: false, canExport: true },
    ]
  };

  const handleSaveCustomRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customRoleName) return;
    onActionFeedback(`Novo papel customizado "${customRoleName}" criado com sucesso!`);
    setIsCreatingRole(false);
    setCustomRoleName('');
    setCustomRoleDesc('');
  };

  return (
    <div className="space-y-4 text-left">
      
      {/* Grid de Papéis */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {initialRoles.map((role) => {
          const isSelected = selectedRole === role.name;

          return (
            <div 
              key={role.name}
              onClick={() => setSelectedRole(role.name)}
              className={cn(
                "bg-white border rounded-xl p-3 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden text-left",
                isSelected ? "border-brand shadow-sm shadow-brand/5 ring-1 ring-brand/20" : "border-[#E8DDFD]/65"
              )}
            >
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 mb-2">
                  <span className="text-[10px] font-black text-slate-800 uppercase tracking-wider">{role.name}</span>
                </div>

                <p className="text-[9px] font-bold text-slate-455 leading-relaxed min-h-[48px]">
                  {role.desc}
                </p>
              </div>

              <div className="mt-2 pt-2 border-t border-slate-50 flex items-center justify-between text-[8px] font-black uppercase text-slate-400">
                <span>{role.usersCount} User</span>
                <span className="text-brand tracking-wider">Ver</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Editor / Visualizador da Matriz de Permissões */}
      {selectedRole && (
        <div className="bg-white border border-[#E8DDFD]/65 rounded-[22px] p-5 shadow-sm shadow-slate-100/50">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E8DDFD]/40 pb-3 mb-4">
            <div>
              <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Detalhamento Técnico</span>
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mt-0.5">
                Matriz de Privilégios: {selectedRole}
              </h3>
            </div>

            {isAdmin && selectedRole !== 'Owner' && (
              <button 
                onClick={() => onActionFeedback('Matriz customizada aplicada com sucesso a este papel.')}
                className="h-8 bg-slate-900 hover:bg-slate-850 text-white rounded-xl text-[10px] font-black uppercase tracking-wider px-3.5 cursor-pointer shadow-sm"
              >
                Salvar Alterações
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold text-slate-650">
              <thead className="border-b border-[#E8DDFD]/40 bg-slate-50 text-[9px] font-black uppercase text-slate-400 tracking-wider">
                <tr>
                  <th className="px-4 py-2.5">Módulo / Área</th>
                  <th className="px-4 py-2.5 text-center">Visualizar</th>
                  <th className="px-4 py-2.5 text-center">Criar</th>
                  <th className="px-4 py-2.5 text-center">Editar</th>
                  <th className="px-4 py-2.5 text-center">Deletar / Inativar</th>
                  <th className="px-4 py-2.5 text-center">Exportar Dados</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(rolePermissionsMatrix[selectedRole] || []).map((perm, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-700">{perm.area}</td>
                    
                    {/* Visualizar */}
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center">
                        {perm.canView ? <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500" /> : <XCircle className="w-4.5 h-4.5 text-slate-200" />}
                      </div>
                    </td>

                    {/* Criar */}
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center">
                        {perm.canCreate ? <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500" /> : <XCircle className="w-4.5 h-4.5 text-slate-200" />}
                      </div>
                    </td>

                    {/* Editar */}
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center">
                        {perm.canEdit ? <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500" /> : <XCircle className="w-4.5 h-4.5 text-slate-200" />}
                      </div>
                    </td>

                    {/* Deletar */}
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center">
                        {perm.canDelete ? <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500" /> : <XCircle className="w-4.5 h-4.5 text-slate-200" />}
                      </div>
                    </td>

                    {/* Exportar */}
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center">
                        {perm.canExport ? <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500" /> : <XCircle className="w-4.5 h-4.5 text-slate-200" />}
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
