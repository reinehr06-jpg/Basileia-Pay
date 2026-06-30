'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Save, Check, X, Users, UserMinus, ShieldAlert, KeyRound } from 'lucide-react';

interface Member {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'financial' | 'developer' | 'support' | 'auditor';
  status: 'active' | 'suspended';
  twoFactorEnabled: boolean;
  lastActive: string;
}

export default function PermissionsSettingsPage() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [members, setMembers] = useState<Member[]>([]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleToggleStatus = (id: string) => {
    setMembers(prev => prev.map(m => {
      if (m.id === id) {
        const nextStatus = m.status === 'active' ? 'suspended' : 'active';
        triggerToast(`Operador ${m.name} teve o status alterado para ${nextStatus.toUpperCase()}.`);
        return { ...m, status: nextStatus };
      }
      return m;
    }));
  };

  const handleRoleChange = (id: string, nextRole: Member['role']) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, role: nextRole } : m));
    triggerToast('Papel de acesso alterado.');
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
        <span className="text-slate-700 font-bold">Permissões</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E7E5EF] pb-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-650 border border-indigo-100 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-[18px] 2xl:text-[20px] font-black tracking-tight text-slate-950">
              Permissões e Equipe
            </h1>
            <p className="text-slate-455 font-semibold text-[11px] 2xl:text-[11.5px] tracking-tight">
              Gerencie operadores da conta, perfis de acesso e privilégios administrativos.
            </p>
          </div>
        </div>
      </div>

      {/* Team table */}
      <div className="bg-white border border-[#E7E5EF] rounded-[22px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-[#E7E5EF] text-[10px] font-black text-slate-450 uppercase tracking-widest">
                <th className="py-3.5 px-5">Membro</th>
                <th className="py-3.5 px-5">E-mail</th>
                <th className="py-3.5 px-5">Papel / Perfil</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5">2FA Habilitado</th>
                <th className="py-3.5 px-5">Último Acesso</th>
                <th className="py-3.5 px-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E5EF]/60 text-xs">
              {members.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-bold">Nenhum membro encontrado na equipe.</td>
                </tr>
              ) : (
                members.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50/40 transition">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-700 uppercase">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="font-black text-slate-900">{member.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-slate-500 font-bold">{member.email}</td>
                    <td className="py-3.5 px-5">
                      <select
                        value={member.role}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleRoleChange(member.id, e.target.value as Member['role'])}
                        disabled={member.role === 'owner'}
                        className="h-8 px-2.5 bg-slate-50 border border-[#E8DDFD] rounded-lg text-xs font-bold text-slate-900 focus:outline-none cursor-pointer disabled:opacity-50"
                      >
                        <option value="owner">Proprietário (Owner)</option>
                        <option value="admin">Administrador (Admin)</option>
                        <option value="financial">Financeiro</option>
                        <option value="developer">Desenvolvedor</option>
                        <option value="support">Suporte</option>
                        <option value="auditor">Auditor Forense</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${member.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-755'}`}>
                        {member.status === 'active' ? 'Ativo' : 'Suspenso'}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-1.5">
                        <KeyRound className={`w-3.5 h-3.5 ${member.twoFactorEnabled ? 'text-green-500' : 'text-slate-300'}`} />
                        <span className="text-[10px] font-semibold text-slate-400">{member.twoFactorEnabled ? 'Sim' : 'Não'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 font-bold text-slate-500">
                      {new Date(member.lastActive).toLocaleDateString('pt-BR')} {new Date(member.lastActive).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      {member.role !== 'owner' ? (
                        <button
                          onClick={() => handleToggleStatus(member.id)}
                          className={`p-1.5 rounded-lg border transition ${member.status === 'active' ? 'text-red-500 border-red-100 hover:bg-red-50' : 'text-green-600 border-green-100 hover:bg-green-50'}`}
                          title={member.status === 'active' ? 'Suspender Operador' : 'Reativar Operador'}
                        >
                          <UserMinus className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-[10px] font-semibold text-slate-400 italic">Owner</span>
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
