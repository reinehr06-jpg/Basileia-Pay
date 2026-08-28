'use client';

import { useState } from 'react';
import { Search, Monitor, Globe, Clock, ShieldAlert, X, Eye, Laptop, Smartphone, AlertTriangle } from 'lucide-react';
import { SecuritySession } from '@/types/security';
import { cn } from '@/lib/utils';

interface SecuritySessionsTableProps {
  sessions: SecuritySession[];
  onActionFeedback: (msg: string) => void;
  isAdmin: boolean;
  onRevokeSession: (id: string) => void;
  onRevokeAllSessions: () => void;
}

export function SecuritySessionsTable({
  sessions,
  onActionFeedback,
  isAdmin,
  onRevokeSession,
  onRevokeAllSessions
}: SecuritySessionsTableProps) {
  const [selectedSession, setSelectedSession] = useState<SecuritySession | null>(null);
  const [showConfirmRevoke, setShowConfirmRevoke] = useState<string | null>(null);
  const [showConfirmRevokeAll, setShowConfirmRevokeAll] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'revoked'>('all');

  const filteredSessions = sessions.filter((s) => {
    const matchesSearch = s.userName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.device.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.ip.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleRevokeConfirm = () => {
    if (showConfirmRevoke) {
      onRevokeSession(showConfirmRevoke);
      onActionFeedback("Sessão revogada com sucesso. O dispositivo associado foi deslogado.");
      setShowConfirmRevoke(null);
      if (selectedSession?.id === showConfirmRevoke) {
        setSelectedSession(null);
      }
    }
  };

  const handleRevokeAllConfirm = () => {
    onRevokeAllSessions();
    onActionFeedback("Todas as outras sessões ativas foram encerradas com sucesso.");
    setShowConfirmRevokeAll(false);
    setSelectedSession(null);
  };

  return (
    <div className="space-y-4 text-left">
      
      {/* Filters & Actions Bar */}
      <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 text-xs font-semibold">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8.5 pl-9 pr-3 bg-white border border-slate-250 rounded-xl text-[11px] font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand shadow-sm shadow-slate-100/50"
              placeholder="Buscar por dispositivo, IP, integrante..."
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="h-8.5 px-3 bg-white border border-slate-250 rounded-xl text-[11px] font-semibold text-slate-700 focus:outline-none focus:border-brand shadow-sm cursor-pointer"
          >
            <option value="all">Todos Status</option>
            <option value="active">Ativo</option>
            <option value="revoked">Revogado</option>
          </select>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowConfirmRevokeAll(true)}
            className="flex h-8.5 items-center gap-1.5 px-4 bg-red-50 hover:bg-red-100 text-red-655 border border-red-100 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
          >
            Encerrar Outras Sessões
          </button>
        )}
      </div>

      {/* Main Grid for Table & Side Details Drawer */}
      <div className="flex flex-col lg:flex-row gap-6 items-stretch">
        
        {/* Table list */}
        <div className="flex-1 bg-white border border-[#E8DDFD]/65 rounded-[22px] overflow-hidden shadow-sm shadow-slate-100/50">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold text-slate-650">
              <thead className="border-b border-[#E8DDFD]/40 bg-slate-50 text-[9px] font-black uppercase text-slate-400 tracking-wider">
                <tr>
                  <th className="px-4 py-3">Integrante</th>
                  <th className="px-4 py-3">Dispositivo / SO</th>
                  <th className="px-4 py-3">IP Origem</th>
                  <th className="px-4 py-3">Localização</th>
                  <th className="px-4 py-3">Iniciada em</th>
                  <th className="px-4 py-3">Última Atividade</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSessions.map((sess) => {
                  const isActive = sess.status === 'active';
                  const isSuspicious = sess.suspicious;

                  return (
                    <tr 
                      key={sess.id} 
                      onClick={() => setSelectedSession(sess)}
                      className={cn(
                        "hover:bg-slate-50/50 transition-colors cursor-pointer",
                        selectedSession?.id === sess.id && "bg-violet-50/20",
                        isSuspicious && "bg-red-50/30 hover:bg-red-50/40"
                      )}
                    >
                      {/* Integrante */}
                      <td className="px-4 py-3.5">
                        <span className="font-black text-slate-800 block text-xs">{sess.userName}</span>
                        <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">{sess.role}</span>
                      </td>

                      {/* Dispositivo */}
                      <td className="px-4 py-3.5 font-bold text-slate-700">
                        <div className="flex items-center gap-1.5">
                          {sess.device.includes('iPhone') || sess.device.includes('iOS') ? (
                            <Smartphone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          ) : (
                            <Laptop className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          )}
                          <span className="truncate max-w-[150px]" title={sess.device}>
                            {sess.device}
                          </span>
                        </div>
                      </td>

                      {/* IP */}
                      <td className="px-4 py-3.5 font-mono text-[10.5px] text-slate-750 font-bold">{sess.ip}</td>

                      {/* Localização */}
                      <td className="px-4 py-3.5 text-slate-600 font-bold">{sess.location}</td>

                      {/* Iniciada em */}
                      <td className="px-4 py-3.5 text-slate-400 font-medium">
                        {new Date(sess.startedAt).toLocaleTimeString('pt-BR')}
                      </td>

                      {/* Última atividade */}
                      <td className="px-4 py-3.5 text-slate-400 font-medium">
                        {new Date(sess.lastActivityAt).toLocaleTimeString('pt-BR')}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5 text-center">
                        {isSuspicious ? (
                          <span className="px-2 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-wider bg-red-100 text-red-655 animate-pulse">
                            Suspeito
                          </span>
                        ) : (
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-wider",
                            isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
                          )}>
                            {sess.status === 'active' ? 'Ativo' : 'Revogado'}
                          </span>
                        )}
                      </td>

                      {/* Ações */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setSelectedSession(sess)}
                            className="p-1 text-slate-400 hover:text-brand hover:bg-slate-50 rounded-lg cursor-pointer"
                            title="Ver detalhes"
                          >
                            <Eye className="w-4.5 h-4.5" />
                          </button>
                          {isAdmin && isActive && (
                            <button
                              onClick={() => { setShowConfirmRevoke(sess.id); }}
                              className="p-1.5 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                              aria-label="Encerrar sessão"
                            >
                              <X className="w-4.5 h-4.5" />
                            </button>
                          )}
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Side Details Drawer */}
        {selectedSession && (
          <div className="w-full lg:w-[320px] bg-white border border-[#E8DDFD]/65 rounded-[22px] p-5 shrink-0 flex flex-col justify-between overflow-y-auto no-scrollbar text-left shadow-sm shadow-slate-100/50">
            <div className="space-y-4">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#E8DDFD]/40 pb-3">
                <div>
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Auditoria de Acesso</span>
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mt-0.5 truncate max-w-[180px]" title={selectedSession.userName}>
                    {selectedSession.userName}
                  </h4>
                </div>
                <button 
                  onClick={() => setSelectedSession(null)}
                  className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                  aria-label="Fechar"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Alert Suspicious Warning */}
              {selectedSession.suspicious && (
                <div className="bg-red-50 border border-red-150 rounded-xl p-3 flex items-start gap-2.5 text-[10px] text-red-750 font-bold">
                  <AlertTriangle className="w-4 h-4 text-red-655 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span>Sessão Suspete Detectada!</span>
                    <p className="text-[9.5px] font-medium text-red-600/90 leading-snug">
                      Login feito a partir de Moscou, Rússia, usando um navegador Headless sem assinatura digital. Recomendamos suspensão imediata!
                    </p>
                  </div>
                </div>
              )}

              {/* Tech details */}
              <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-3.5 space-y-2.5 text-[10.5px] font-bold text-slate-650">
                <div className="flex items-center gap-2">
                  <Laptop className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{selectedSession.device}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>IP: {selectedSession.ip} ({selectedSession.location})</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Início: {new Date(selectedSession.startedAt).toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex items-start gap-2">
                  <Monitor className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span className="font-mono text-[9px] text-slate-500 leading-normal break-all">
                    {selectedSession.userAgent}
                  </span>
                </div>
              </div>

            </div>

            {isAdmin && selectedSession.status === 'active' && (
              <div className="pt-4 border-t border-[#E8DDFD]/40">
                <button
                  onClick={() => setShowConfirmRevoke(selectedSession.id)}
                  className="w-full h-8.5 bg-red-655 hover:bg-red-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-red-100/50"
                >
                  Derrubar Dispositivo
                </button>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Revoke single session confirmation */}
      {showConfirmRevoke && (
        <div className="fixed inset-0 z-55 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" role="dialog" aria-modal="true" aria-label="Revogar acesso">
          <div className="bg-white border border-[#E8DDFD]/65 rounded-[22px] w-full max-w-sm shadow-2xl p-5 space-y-4 text-center">
            <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">
              Revogar Acesso do Dispositivo?
            </h3>
            <p className="text-[10px] font-bold text-slate-400 leading-relaxed">
              O usuário correspondente será deslogado de forma forçada imediatamente e precisará efetuar login novamente.
            </p>
            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setShowConfirmRevoke(null)}
                className="flex-1 h-8.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center cursor-pointer"
              >
                Voltar
              </button>
              <button
                onClick={handleRevokeConfirm}
                className="flex-1 h-8.5 bg-red-655 hover:bg-red-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center cursor-pointer shadow-sm"
              >
                Encerrar Sessão
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revoke all sessions confirmation */}
      {showConfirmRevokeAll && (
        <div className="fixed inset-0 z-55 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" role="dialog" aria-modal="true" aria-label="Revogar todas as sessões">
          <div className="bg-white border border-[#E8DDFD]/65 rounded-[22px] w-full max-w-sm shadow-2xl p-5 space-y-4 text-center">
            <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">
              Revogar Todas as Outras Sessões?
            </h3>
            <p className="text-[10px] font-bold text-slate-400 leading-relaxed">
              Isso derrubará todas as conexões ativas na organização, exceto o seu dispositivo atual. Ação recomendada se houver indício de vazamento ou ataque crítico.
            </p>
            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setShowConfirmRevokeAll(false)}
                className="flex-1 h-8.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center cursor-pointer"
              >
                Voltar
              </button>
              <button
                onClick={handleRevokeAllConfirm}
                className="flex-1 h-8.5 bg-red-655 hover:bg-red-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center cursor-pointer shadow-sm"
              >
                Sim, Derrubar Tudo
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
