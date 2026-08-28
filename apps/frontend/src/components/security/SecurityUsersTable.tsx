'use client';

import { useState } from 'react';
import { Search, UserPlus, ShieldCheck, Mail, Key, ShieldAlert, Edit3, Trash2, StopCircle, RefreshCw, Check, CheckCircle2 } from 'lucide-react';
import { SecurityUser, SecurityRole } from '@/types/security';
import { cn } from '@/lib/utils';

interface SecurityUsersTableProps {
  users: SecurityUser[];
  onActionFeedback: (msg: string) => void;
  isAdmin: boolean;
  onInviteUser: (user: Partial<SecurityUser>) => void;
  onUpdateUserRole: (id: string, newRole: SecurityRole) => void;
  onSuspendUser: (id: string) => void;
  onRemoveUser: (id: string) => void;
}

export function SecurityUsersTable({
  users,
  onActionFeedback,
  isAdmin,
  onInviteUser,
  onUpdateUserRole,
  onSuspendUser,
  onRemoveUser
}: SecurityUsersTableProps) {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showConfirmSuspend, setShowConfirmSuspend] = useState<string | null>(null);
  const [showConfirmRemove, setShowConfirmRemove] = useState<string | null>(null);
  
  // Role Edit Popover/Modal locally
  const [editingRoleUserId, setEditingRoleUserId] = useState<string | null>(null);
  const [editedRole, setEditedRole] = useState<SecurityRole>('Auditor');

  // Form states for invitation
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<SecurityRole>('Desenvolvedor');
  const [require2FA, setRequire2FA] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | SecurityRole>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'invited' | 'suspended'>('all');

  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName || !inviteEmail) return;

    onInviteUser({
      name: inviteName,
      email: inviteEmail,
      role: inviteRole,
      twoFactorEnabled: false, // will require on login if toggle active
      status: 'invited'
    });

    onActionFeedback(`Convite enviado com sucesso para ${inviteEmail}!`);
    setInviteName('');
    setInviteEmail('');
    setShowInviteModal(false);
  };

  const handleConfirmSuspend = () => {
    if (showConfirmSuspend) {
      onSuspendUser(showConfirmSuspend);
      onActionFeedback("Usuário suspenso. Todas as sessões dele foram encerradas imediatamente.");
      setShowConfirmSuspend(null);
    }
  };

  const handleConfirmRemove = () => {
    if (showConfirmRemove) {
      onRemoveUser(showConfirmRemove);
      onActionFeedback("Usuário removido da organização.");
      setShowConfirmRemove(null);
    }
  };

  const handleSaveRole = () => {
    if (editingRoleUserId) {
      onUpdateUserRole(editingRoleUserId, editedRole);
      onActionFeedback(`Papel alterado para ${editedRole}. Evento de auditoria registrado.`);
      setEditingRoleUserId(null);
    }
  };

  return (
    <div className="space-y-4 text-left">
      
      {/* Filters Bar */}
      <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 text-xs font-semibold">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8.5 pl-9 pr-3 bg-white border border-slate-250 rounded-xl text-[11px] font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand shadow-sm shadow-slate-100/50"
              placeholder="Buscar usuários por nome, e-mail..."
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="h-8.5 px-3 bg-white border border-slate-250 rounded-xl text-[11px] font-semibold text-slate-700 focus:outline-none focus:border-brand shadow-sm cursor-pointer"
          >
            <option value="all">Todos os Papéis</option>
            <option value="Owner">Owner</option>
            <option value="Admin">Admin</option>
            <option value="Financeiro">Financeiro</option>
            <option value="Desenvolvedor">Desenvolvedor</option>
            <option value="Suporte">Suporte</option>
            <option value="Auditor">Auditor</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="h-8.5 px-3 bg-white border border-slate-250 rounded-xl text-[11px] font-semibold text-slate-700 focus:outline-none focus:border-brand shadow-sm cursor-pointer"
          >
            <option value="all">Todos os Status</option>
            <option value="active">Ativo</option>
            <option value="invited">Convidado</option>
            <option value="suspended">Suspenso</option>
          </select>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex h-8.5 items-center gap-1.5 px-4 bg-brand hover:bg-brand-dark text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm shadow-brand/10"
          >
            <UserPlus className="w-4 h-4" />
            Convidar
          </button>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white border border-[#E8DDFD]/65 rounded-[22px] overflow-hidden shadow-sm shadow-slate-100/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold text-slate-650">
            <thead className="border-b border-[#E8DDFD]/40 bg-slate-50 text-[9px] font-black uppercase text-slate-400 tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Nome / E-mail</th>
                <th className="px-5 py-3.5">Cargo / Papel</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Autenticação 2FA</th>
                <th className="px-5 py-3.5">Último Acesso</th>
                <th className="px-5 py-3.5 text-right">Ações de Governança</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => {
                const isOwner = user.role === 'Owner';
                const isActive = user.status === 'active';
                const isInvited = user.status === 'invited';
                const isSuspended = user.status === 'suspended';

                return (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Nome / E-mail */}
                    <td className="px-5 py-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-black text-xs border border-slate-200">
                        {user.avatar || user.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-black text-slate-800 text-xs block">{user.name}</span>
                        <span className="text-[10px] text-slate-400 font-bold block mt-0.5">{user.email}</span>
                      </div>
                    </td>

                    {/* Cargo / Papel */}
                    <td className="px-5 py-4">
                      <span className={cn(
                        "px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider",
                        isOwner ? "bg-violet-650 text-white" : "bg-slate-100 text-slate-600"
                      )}>
                        {user.role}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-wider",
                        isActive && "bg-emerald-50 text-emerald-600",
                        isInvited && "bg-blue-50 text-blue-600",
                        isSuspended && "bg-red-50 text-red-655"
                      )}>
                        {user.status === 'active' ? 'Ativo' : user.status === 'invited' ? 'Convidado' : 'Suspenso'}
                      </span>
                    </td>

                    {/* 2FA */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-[10.5px]">
                        {user.twoFactorEnabled ? (
                          <>
                            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                            <span className="text-emerald-600 font-black">Habilitado</span>
                          </>
                        ) : (
                          <>
                            <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
                            <span className="text-amber-600 font-bold">Desabilitado</span>
                          </>
                        )}
                      </div>
                    </td>

                    {/* Último acesso */}
                    <td className="px-5 py-4 text-slate-500 font-medium whitespace-nowrap">
                      {user.lastAccessAt ? new Date(user.lastAccessAt).toLocaleString('pt-BR') : 'Nunca acessou'}
                    </td>

                    {/* Ações */}
                    <td className="px-5 py-4 text-right">
                      {isAdmin && !isOwner ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setEditingRoleUserId(user.id);
                              setEditedRole(user.role);
                            }}
                            className="p-1 text-slate-400 hover:text-brand hover:bg-slate-50 border border-transparent hover:border-slate-200/50 rounded-lg cursor-pointer transition-all"
                            title="Alterar cargo"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {isActive && (
                            <button
                              onClick={() => setShowConfirmSuspend(user.id)}
                              className="p-1 text-slate-400 hover:text-amber-600 hover:bg-slate-50 border border-transparent hover:border-slate-200/50 rounded-lg cursor-pointer transition-all"
                              title="Suspender acesso"
                            >
                              <StopCircle className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => setShowConfirmRemove(user.id)}
                            className="p-1 text-slate-400 hover:text-red-655 hover:bg-slate-50 border border-transparent hover:border-slate-200/50 rounded-lg cursor-pointer transition-all"
                            title="Remover permanente"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-350 italic">Restrito / Owner</span>
                      )}
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 1. Modal Convite de Usuário */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-[#E8DDFD]/65 rounded-[22px] w-full max-w-md shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-2">
              <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">
                Convidar Novo Usuário
              </h3>
              <button onClick={() => setShowInviteModal(false)} className="text-slate-450 hover:text-slate-700 cursor-pointer">
                fechar
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9.5px] font-black uppercase text-slate-400 tracking-wider">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full h-8.5 px-3 bg-white border border-[#E8DDFD] rounded-xl text-xs font-semibold text-slate-850 focus:outline-none focus:border-brand"
                  placeholder="Ex: Rodrigo Lacerda"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9.5px] font-black uppercase text-slate-400 tracking-wider">E-mail Institucional</label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full h-8.5 px-3 bg-white border border-[#E8DDFD] rounded-xl text-xs font-semibold text-slate-850 focus:outline-none focus:border-brand"
                  placeholder="rodrigo@basileia.com"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9.5px] font-black uppercase text-slate-400 tracking-wider">Cargo / Papel Administrativo</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as SecurityRole)}
                  className="w-full h-8.5 px-3 bg-white border border-[#E8DDFD] rounded-xl text-xs font-semibold text-slate-850 focus:outline-none focus:border-brand"
                >
                  <option value="Admin">Admin</option>
                  <option value="Financeiro">Financeiro</option>
                  <option value="Desenvolvedor">Desenvolvedor</option>
                  <option value="Suporte">Suporte</option>
                  <option value="Auditor">Auditor</option>
                </select>
              </div>

              {/* 2FA Toggle Requirement */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <span className="text-[10px] font-black text-slate-700 block">Exigir 2FA Obrigatório</span>
                  <span className="text-[9px] font-bold text-slate-400 block mt-0.5">Obrigará o usuário a configurar 2FA no 1º login.</span>
                </div>
                <input
                  type="checkbox"
                  checked={require2FA}
                  onChange={(e) => setRequire2FA(e.target.checked)}
                  className="w-4 h-4 border-[#E8DDFD] rounded text-brand focus:ring-brand cursor-pointer"
                />
              </div>

              <div className="pt-2 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 h-8.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center cursor-pointer"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  className="flex-1 h-8.5 bg-brand hover:bg-brand-dark text-white rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center cursor-pointer shadow-sm shadow-brand/10"
                >
                  Convidar Integrante
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Modal Alterar Cargo */}
      {editingRoleUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-[#E8DDFD]/65 rounded-[22px] w-full max-w-sm shadow-2xl p-5 space-y-4">
            <div className="space-y-1">
              <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">
                Alterar Papel / Permissões
              </h3>
              <p className="text-[10px] font-bold text-slate-400">
                Isto alterará as permissões de acesso às áreas administrativas imediatamente.
              </p>
            </div>

            <select
              value={editedRole}
              onChange={(e) => setEditedRole(e.target.value as SecurityRole)}
              className="w-full h-8.5 px-3 bg-white border border-[#E8DDFD] rounded-xl text-xs font-semibold text-slate-850 focus:outline-none focus:border-brand"
            >
              <option value="Admin">Admin</option>
              <option value="Financeiro">Financeiro</option>
              <option value="Desenvolvedor">Desenvolvedor</option>
              <option value="Suporte">Suporte</option>
              <option value="Auditor">Auditor</option>
            </select>

            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setEditingRoleUserId(null)}
                className="flex-1 h-8.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center cursor-pointer"
              >
                Voltar
              </button>
              <button
                onClick={handleSaveRole}
                className="flex-1 h-8.5 bg-brand hover:bg-brand-dark text-white rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center cursor-pointer shadow-sm"
              >
                Salvar Cargo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Modal Confirmar Suspensão */}
      {showConfirmSuspend && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-[#E8DDFD]/65 rounded-[22px] w-full max-w-sm shadow-2xl p-5 space-y-4">
            <div className="w-10 h-10 bg-red-50 text-red-655 border border-red-100 rounded-xl flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">
                Suspender Acesso do Usuário?
              </h3>
              <p className="text-[10px] font-bold text-slate-400 leading-relaxed">
                Todas as sessões ativas do integrante serão imediatamente invalidadas e encerradas. Ele não poderá acessar a plataforma até ser reativado pelo Owner.
              </p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setShowConfirmSuspend(null)}
                className="flex-1 h-8.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center cursor-pointer"
              >
                Voltar
              </button>
              <button
                onClick={handleConfirmSuspend}
                className="flex-1 h-8.5 bg-red-655 hover:bg-red-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center cursor-pointer shadow-sm"
              >
                Confirmar Suspensão
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Modal Confirmar Remoção */}
      {showConfirmRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-[#E8DDFD]/65 rounded-[22px] w-full max-w-sm shadow-2xl p-5 space-y-4">
            <div className="w-10 h-10 bg-red-50 text-red-655 border border-red-100 rounded-xl flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">
                Remover Integrante da Organização?
              </h3>
              <p className="text-[10px] font-bold text-slate-400 leading-relaxed">
                Esta ação apagará permanentemente as permissões do usuário nesta conta. Caso ele precise retornar, você deverá disparar um novo convite.
              </p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setShowConfirmRemove(null)}
                className="flex-1 h-8.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center cursor-pointer"
              >
                Voltar
              </button>
              <button
                onClick={handleConfirmRemove}
                className="flex-1 h-8.5 bg-red-655 hover:bg-red-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center cursor-pointer shadow-sm"
              >
                Remover Permanente
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
