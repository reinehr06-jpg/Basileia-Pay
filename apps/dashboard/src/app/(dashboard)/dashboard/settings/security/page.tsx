'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { SecurityHeader } from '@/components/security/SecurityHeader';
import { SecurityKpiCards } from '@/components/security/SecurityKpiCards';
import { SecurityTabs, SecurityTabValue } from '@/components/security/SecurityTabs';
import { SecurityUsersTable } from '@/components/security/SecurityUsersTable';
import { SecurityRolesGrid } from '@/components/security/SecurityRolesGrid';
import { SecuritySessionsTable } from '@/components/security/SecuritySessionsTable';
import { SecurityTwoFactorPanel } from '@/components/security/SecurityTwoFactorPanel';
import { SecurityPasswordPolicyPanel } from '@/components/security/SecurityPasswordPolicyPanel';
import { SecurityIpAllowlistTable } from '@/components/security/SecurityIpAllowlistTable';
import { SecurityActivityFeed } from '@/components/security/SecurityActivityFeed';
import { SecurityAlertsPanel } from '@/components/security/SecurityAlertsPanel';

import { 
  MOCK_SECURITY_USERS, 
  MOCK_SECURITY_SESSIONS, 
  MOCK_SECURITY_IP_RULES, 
  MOCK_SECURITY_ACTIVITY_EVENTS, 
  MOCK_SECURITY_POLICY 
} from '../../security/__mocks__/security';

import { SecurityUser, SecuritySession, SecurityIpRule, SecurityActivityEvent, SecurityPolicy, SecurityRole } from '@/types/security';
import { cn } from '@/lib/utils';
import { apiFetch } from '@/lib/api';
import { 
  ShieldAlert, 
  Check, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  History, 
  Save, 
  RefreshCw, 
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  FileText,
  FileSpreadsheet,
  Webhook,
  Database,
  Trash2,
  Fingerprint
} from 'lucide-react';

export default function SecuritySettingsPage() {
  const [activeTab, setActiveTab] = useState<SecurityTabValue>('users');
  
  // Data States
  const [users, setUsers] = useState<SecurityUser[]>([]);
  const [sessions, setSessions] = useState<SecuritySession[]>([]);
  const [ipRules, setIpRules] = useState<SecurityIpRule[]>([]);
  const [events, setEvents] = useState<SecurityActivityEvent[]>([]);
  const [policy, setPolicy] = useState<SecurityPolicy>(MOCK_SECURITY_POLICY);

  // LGPD Strict Mode States
  const [lgpdEnabled, setLgpdEnabled] = useState(true);
  const [maskPiiLogs, setMaskPiiLogs] = useState(true);
  const [encryptLocalDb, setEncryptLocalDb] = useState(true);
  const [hideFullEmail, setHideFullEmail] = useState(true);
  const [hideFullCpfCnpj, setHideFullCpfCnpj] = useState(true);
  const [hideFullIpFingerprint, setHideFullIpFingerprint] = useState(true);
  const [applyRulePerRole, setApplyRulePerRole] = useState(true);
  const [retentionDays, setRetentionDays] = useState(90);
  const [testInput, setTestInput] = useState('');
  const [testMaskedResult, setTestMaskedResult] = useState('');
  
  const [lgpdAuditLogs, setLgpdAuditLogs] = useState<any[]>([]);

  // Toast Notifications
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Simulated access roles
  const [userRole, setUserRole] = useState<'Owner' | 'Auditor'>('Owner');
  const isAdmin = userRole === 'Owner';
  const [twoFactorActive, setTwoFactorActive] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [sessRes, statusRes] = await Promise.all([
          apiFetch('/api/v1/dashboard/security/sessions'),
          apiFetch('/api/v1/dashboard/security/status'),
        ]);
        if (sessRes.success && Array.isArray(sessRes.data) && sessRes.data.length > 0) {
          setSessions(sessRes.data.map((s: any) => ({
            id: s.token_id || s.id,
            userId: s.user_id,
            userName: s.user_name || 'Usuário',
            role: s.role || 'Desenvolvedor' as SecurityRole,
            device: s.device || s.user_agent?.split('/')[0] || 'Navegador',
            userAgent: s.user_agent || '',
            ip: s.ip || '',
            location: s.location || '',
            startedAt: s.created_at || s.started_at,
            lastActivityAt: s.last_active_at || s.last_activity_at || s.created_at,
            status: s.status || 'active',
          } as SecuritySession)));
        }
        if (statusRes.success && statusRes.data) {
          setTwoFactorActive((statusRes.data as any).two_factor_enabled);
        }
      } catch (err) { console.error('Failed to load security data:', err); }
    })();
  }, []);

  const triggerFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  // User Administration Handlers
  const handleInviteUser = async (newUser: Partial<SecurityUser>) => {
    const freshUser: SecurityUser = {
      id: `user_${Math.floor(Math.random() * 1000)}`,
      name: newUser.name || 'Convidado Novo',
      email: newUser.email || 'convidado@basileia.com',
      avatar: newUser.name?.substring(0, 2).toUpperCase() || 'CV',
      role: newUser.role || 'Desenvolvedor',
      status: 'invited',
      twoFactorEnabled: false,
      createdAt: new Date().toISOString()
    };

    setUsers((prev) => [...prev, freshUser]);

    try {
      await apiFetch('/api/v1/dashboard/security/users/invite', {
        method: 'POST',
        body: JSON.stringify({
          email: freshUser.email,
          name: freshUser.name,
          role: freshUser.role
        })
      });
    } catch (err) {
      console.error('Falha ao enviar e-mail de convite:', err);
    }

    const newEvt: SecurityActivityEvent = {
      id: `evt_sec_${Math.floor(Math.random() * 10000)}`,
      timestamp: new Date().toISOString(),
      event: "Usuário convidado",
      userName: "Carlos Oliveira (Owner)",
      ip: "186.204.12.98",
      result: "success",
      details: `Novo convite gerado para cargo ${freshUser.role}: ${freshUser.email}`
    };
    setEvents((prev) => [newEvt, ...prev]);
    // Simulate an email with a magic link to copy
    triggerFeedback(`Email enviado para ${freshUser.email}! Link de convite: https://pay.basileia.com/invite/${freshUser.id}`);
  };

  const handleUpdateUserRole = (id: string, newRole: SecurityRole) => {
    setUsers(users.map((u) => u.id === id ? { ...u, role: newRole } : u));
    
    const targetUser = users.find(u => u.id === id);
    const newEvt: SecurityActivityEvent = {
      id: `evt_sec_${Math.floor(Math.random() * 10000)}`,
      timestamp: new Date().toISOString(),
      event: "Cargo atualizado",
      userName: "Carlos Oliveira (Owner)",
      ip: "186.204.12.98",
      result: "success",
      details: `Cargo de ${targetUser?.name || 'usuário'} alterado para ${newRole}`
    };
    setEvents([newEvt, ...events]);
  };

  const handleSuspendUser = (id: string) => {
    setUsers(users.map((u) => u.id === id ? { ...u, status: 'suspended' } : u));
    setSessions(sessions.filter((s) => s.userId !== id));

    const targetUser = users.find(u => u.id === id);
    const newEvt: SecurityActivityEvent = {
      id: `evt_sec_${Math.floor(Math.random() * 10000)}`,
      timestamp: new Date().toISOString(),
      event: "Usuário suspenso",
      userName: "Carlos Oliveira (Owner)",
      ip: "186.204.12.98",
      result: "warning",
      details: `Acesso suspenso e sessões ativas encerradas para ${targetUser?.name || 'usuário'}`
    };
    setEvents([newEvt, ...events]);
  };

  const handleRemoveUser = (id: string) => {
    setUsers(users.filter((u) => u.id !== id));
    setSessions(sessions.filter((s) => s.userId !== id));

    const newEvt: SecurityActivityEvent = {
      id: `evt_sec_${Math.floor(Math.random() * 10000)}`,
      timestamp: new Date().toISOString(),
      event: "Usuário excluído",
      userName: "Carlos Oliveira (Owner)",
      ip: "186.204.12.98",
      result: "error",
      details: `Integrante da conta removido permanentemente.`
    };
    setEvents([newEvt, ...events]);
  };

  // Sessions management
  const handleRevokeSession = (id: string) => {
    setSessions(sessions.map((s) => s.id === id ? { ...s, status: 'revoked' as const } : s));
    
    const targetSession = sessions.find(s => s.id === id);
    (async () => {
      try {
        await apiFetch('/api/v1/dashboard/security/sessions/' + id, { method: 'DELETE' });
      } catch (err) { console.error('Failed to delete session:', err); };
    })();
    const newEvt: SecurityActivityEvent = {
      id: `evt_sec_${Math.floor(Math.random() * 10000)}`,
      timestamp: new Date().toISOString(),
      event: "Sessão revogada",
      userName: "Carlos Oliveira (Owner)",
      ip: "186.204.12.98",
      result: "warning",
      details: `Encerrado acesso de dispositivo ${targetSession?.device || 'desconhecido'} para ${targetSession?.userName}`
    };
    setEvents([newEvt, ...events]);
  };

  const handleRevokeAllSessions = () => {
    setSessions(sessions.filter((s) => s.userId === 'user_01'));

    const newEvt: SecurityActivityEvent = {
      id: `evt_sec_${Math.floor(Math.random() * 10000)}`,
      timestamp: new Date().toISOString(),
      event: "Logout geral forçado",
      userName: "Carlos Oliveira (Owner)",
      ip: "186.204.12.98",
      result: "error",
      details: "Disparado logout de emergência para todas as sessões da organização."
    };
    setEvents([newEvt, ...events]);
  };

  // IP Allowlist handlers
  const handleAddIpRule = (newRule: Partial<SecurityIpRule>) => {
    const freshRule: SecurityIpRule = {
      id: `rule_${Math.floor(Math.random() * 1000)}`,
      cidr: newRule.cidr || '0.0.0.0/0',
      description: newRule.description || 'Regra de IP',
      environment: newRule.environment || 'both',
      createdBy: newRule.createdBy || 'Carlos Oliveira',
      createdAt: new Date().toISOString()
    };

    setIpRules([...ipRules, freshRule]);

    const newEvt: SecurityActivityEvent = {
      id: `evt_sec_${Math.floor(Math.random() * 10000)}`,
      timestamp: new Date().toISOString(),
      event: "IP adicionado à allowlist",
      userName: "Carlos Oliveira (Owner)",
      ip: "186.204.12.98",
      result: "success",
      details: `Rede autorizada CIDR cadastrada: ${freshRule.cidr}`
    };
    setEvents([newEvt, ...events]);
  };

  const handleRemoveIpRule = (id: string) => {
    const targetRule = ipRules.find(r => r.id === id);
    setIpRules(ipRules.filter((r) => r.id !== id));

    const newEvt: SecurityActivityEvent = {
      id: `evt_sec_${Math.floor(Math.random() * 10000)}`,
      timestamp: new Date().toISOString(),
      event: "IP removido da allowlist",
      userName: "Carlos Oliveira (Owner)",
      ip: "186.204.12.98",
      result: "warning",
      details: `Removido privilégio de rede CIDR: ${targetRule?.cidr}`
    };
    setEvents([newEvt, ...events]);
  };

  // Save LGPD Policy changes and log them in the audit
  const handleSaveLgpdPolicies = () => {
    const newAudit = {
      id: `lgpd_${Date.now()}`,
      user: 'Carlos Oliveira',
      role: 'Owner',
      change: 'Políticas LGPD salvas manualmente',
      date: '19/05 16:12:33',
      oldVal: 'Parcial',
      newVal: lgpdEnabled ? 'Strict Mode Ativo' : 'Desativado'
    };
    setLgpdAuditLogs(prev => [newAudit, ...prev]);
    triggerFeedback("Políticas de privacidade LGPD salvas e aplicadas em toda a API!");
  };

  // Live PII Sanitization Preview Engine based on input text
  const handleTestMaskingInput = () => {
    if (!testInput) {
      setTestMaskedResult('Nenhum texto inserido.');
      return;
    }
    
    // CPF Check
    const cpfRegex = /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g;
    // Email Check
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    // IP Check
    const ipRegex = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g;

    let sanitized = testInput;

    if (hideFullCpfCnpj) {
      sanitized = sanitized.replace(cpfRegex, '***.***.***-**');
    }
    if (hideFullEmail) {
      sanitized = sanitized.replace(emailRegex, (match) => {
        const parts = match.split('@');
        return parts[0][0] + '***@' + parts[1];
      });
    }
    if (hideFullIpFingerprint) {
      sanitized = sanitized.replace(ipRegex, (match) => {
        const parts = match.split('.');
        return `${parts[0]}.${parts[1]}.xxx.xxx`;
      });
    }

    setTestMaskedResult(sanitized);
    triggerFeedback("Demonstração de mascaramento gerada!");
  };

  return (
    <PageLayout title="Segurança">
      
      {/* Toast Notification */}
      {feedbackMsg && (
        <div className="fixed bottom-5 right-5 z-60 bg-slate-900 border border-slate-800 text-white rounded-2xl p-4 shadow-2xl flex items-center gap-2 max-w-sm animate-in slide-in-from-bottom-2 duration-300">
          <span className="w-2 h-2 bg-violet-500 rounded-full shrink-0 animate-ping" />
          <span className="text-[11px] font-black text-left">{feedbackMsg}</span>
        </div>
      )}

      {/* Breadcrumbs back to Settings */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-455 pb-1">
        <Link href="/dashboard/settings" className="hover:text-brand flex items-center gap-0.5 transition-colors">
          <ChevronLeft className="w-4 h-4" />
          Configurações
        </Link>
        <span className="text-slate-350">/</span>
        <span className="text-slate-700 font-bold">Segurança & Governança</span>
      </div>

      {/* Header */}
      <SecurityHeader 
        onOpenPolicy={() => triggerFeedback("Direcionando para as boas práticas e políticas técnicas da empresa...")}
        onOpen2FA={() => setActiveTab('2fa')}
        onInviteUser={() => {
          setActiveTab('users');
          triggerFeedback("Abra a aba Usuários e clique em 'Convidar' para adicionar integrantes.");
        }}
        isAdmin={isAdmin}
      />

      {/* KPI Cards Grid */}
      <SecurityKpiCards 
        activeUsers={users.filter(u => u.status !== 'suspended').length}
        activeSessions={sessions.filter(s => s.status === 'active').length}
        twoFactorCount={users.filter(u => u.twoFactorEnabled).length}
        allowlistCount={ipRules.length}
        criticalEvents={events.length * 14}
        onFilterTab={setActiveTab}
      />

      {/* Navigation tabs bar */}
      <div className="border-b border-[#E8DDFD]/60 flex items-center justify-between">
        <SecurityTabs 
          activeTab={activeTab}
          onTabChange={setActiveTab}
          usersCount={users.length}
          sessionsCount={sessions.filter(s => s.status === 'active').length}
          allowlistCount={ipRules.length}
          criticalEventsCount={events.length}
        />
      </div>

      {/* Responsive layout containers */}
      <div className="w-full space-y-3.5">
        
        {/* Main Tab Content - Full Width */}
        <div className="w-full min-w-0">
          {activeTab === 'users' && (
            <SecurityUsersTable 
              users={users}
              onActionFeedback={triggerFeedback}
              isAdmin={isAdmin}
              onInviteUser={handleInviteUser}
              onUpdateUserRole={handleUpdateUserRole}
              onSuspendUser={handleSuspendUser}
              onRemoveUser={handleRemoveUser}
            />
          )}

          {activeTab === 'roles' && (
            <SecurityRolesGrid 
              onActionFeedback={triggerFeedback}
              isAdmin={isAdmin}
            />
          )}

          {activeTab === 'sessions' && (
            <SecuritySessionsTable 
              sessions={sessions}
              onActionFeedback={triggerFeedback}
              isAdmin={isAdmin}
              onRevokeSession={handleRevokeSession}
              onRevokeAllSessions={handleRevokeAllSessions}
            />
          )}

          {activeTab === '2fa' && (
            <SecurityTwoFactorPanel 
              onActionFeedback={triggerFeedback}
              isAdmin={isAdmin}
              twoFactorCount={users.filter(u => u.twoFactorEnabled).length}
              totalUsers={users.filter(u => u.status === 'active').length}
            />
          )}

          {activeTab === 'password' && (
            <SecurityPasswordPolicyPanel 
              policy={policy}
              onActionFeedback={triggerFeedback}
              isAdmin={isAdmin}
            />
          )}

          {activeTab === 'ips' && (
            <SecurityIpAllowlistTable 
              rules={ipRules}
              onActionFeedback={triggerFeedback}
              isAdmin={isAdmin}
              onAddRule={handleAddIpRule}
              onRemoveRule={handleRemoveIpRule}
            />
          )}

          {activeTab === 'activity' && (
            <SecurityActivityFeed 
              events={events}
              onActionFeedback={triggerFeedback}
              onNavigateToAudit={() => window.location.href = '/dashboard/audit'}
            />
          )}

          {activeTab === 'lgpd' && (
            <div className="space-y-6 text-left animate-in fade-in duration-300">
              
              {/* LGPD Header and Switches */}
              <div className="bg-white border border-[#E8DDFD]/65 rounded-[22px] p-5 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                  <div>
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Conformidade LGPD (Strict Privacy Mode)</h3>
                    <p className="text-[10.5px] font-semibold text-slate-400 mt-1">
                      Monitore a conformidade regulatória de dados de titulares. Criptografe e sanitize PII de payloads automaticamente.
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-700">Estado Global LGPD</span>
                    <button 
                      onClick={() => {
                        setLgpdEnabled(!lgpdEnabled);
                        triggerFeedback(`LGPD Strict Mode ${!lgpdEnabled ? 'Ativado' : 'Desativado'}`);
                      }}
                      className={cn(
                        "px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border shrink-0 transition-all cursor-pointer",
                        lgpdEnabled ? "bg-indigo-50 border-indigo-100 text-indigo-700" : "bg-slate-50 border-slate-200 text-slate-400"
                      )}
                    >
                      {lgpdEnabled ? 'Ativo Strict' : 'Desativado'}
                    </button>
                  </div>
                </div>

                {/* Policies Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {[
                    { title: 'Mascaramento PII em Logs', desc: 'Sanitiza nomes, e-mails, endereços de rede e cartões de crédito em qualquer log de depuração operacional.', icon: ShieldAlert },
                    { title: 'Criptografia Local de Dados', desc: 'Emprega o algoritmo AES-256-GCM para criptografia em repouso nos bancos de dados para qualquer coluna com tag sensível.', icon: Lock },
                    { title: 'Retenção Automática de Payloads', desc: 'Limpeza automática cronometrada de payloads brutos expirados para conformidade com o prazo de descarte regulatório.', icon: Trash2 }
                  ].map((card, idx) => {
                    const IconComp = card.icon;
                    return (
                      <div key={idx} className="border border-[#E8DDFD]/60 rounded-xl p-4 bg-slate-50/15 space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6.5 h-6.5 bg-[#FAF8FF] border border-[#E8DDFD]/60 rounded-lg flex items-center justify-center text-brand">
                            <IconComp className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-xs font-black text-slate-850 block">{card.title}</span>
                        </div>
                        <p className="text-[10px] font-semibold text-slate-400 leading-relaxed pt-1">{card.desc}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Settings Toggles and Retention selection split */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
                  
                  {/* Left checklist column */}
                  <div className="lg:col-span-2 space-y-3.5 border-r border-slate-50 pr-6">
                    <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest block border-b border-slate-50 pb-1.5">Toggles Funcionais</span>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { label: 'Mascarar PII em Logs', state: maskPiiLogs, setter: setMaskPiiLogs },
                        { label: 'Criptografia de Banco Local', state: encryptLocalDb, setter: setEncryptLocalDb },
                        { label: 'Ocultar E-mail Completo', state: hideFullEmail, setter: setHideFullEmail },
                        { label: 'Ocultar CPF/CNPJ Completo', state: hideFullCpfCnpj, setter: setHideFullCpfCnpj },
                        { label: 'Ocultar IP/Device fingerprint', state: hideFullIpFingerprint, setter: setHideFullIpFingerprint },
                        { label: 'Aplicar regra por Perfil (RBAC)', state: applyRulePerRole, setter: setApplyRulePerRole }
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between border-b border-slate-50/50 pb-2">
                          <span className="text-xs font-bold text-slate-700">{item.label}</span>
                          <input 
                            type="checkbox" 
                            checked={item.state}
                            onChange={(e) => {
                              item.setter(e.target.checked);
                              triggerFeedback(`${item.label} alterado!`);
                            }}
                            className="rounded border-[#E8DDFD] text-brand focus:ring-brand cursor-pointer w-4.5 h-4.5"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Retention column */}
                  <div className="lg:col-span-1 space-y-4">
                    <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest block border-b border-slate-50 pb-1.5">Retenção de Payloads</span>
                    
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Prazo de descarte automático</label>
                        <select 
                          value={retentionDays}
                          onChange={(e) => {
                            setRetentionDays(parseInt(e.target.value) || 30);
                            triggerFeedback(`Prazo de retenção ajustado para ${e.target.value} dias!`);
                          }}
                          className="w-full bg-slate-50 border border-[#E8DDFD] rounded-xl px-3 py-2 text-xs font-black text-slate-700 focus:outline-none appearance-none cursor-pointer h-9.5"
                        >
                          <option value={30}>30 Dias (Mínimo recomendado)</option>
                          <option value={60}>60 Dias</option>
                          <option value={90}>90 Dias (Padrão Basileia)</option>
                          <option value={180}>180 Dias</option>
                        </select>
                      </div>

                      <p className="text-[9px] font-semibold text-slate-450 leading-relaxed pt-1 bg-[#FAF8FF] border border-[#E8DDFD]/55 rounded-xl p-3">
                        ℹ️ Payloads brutos de webhooks, callbacks e auditorias de conexões técnicas serão expurgados após o fim do período sem afetar relatórios financeiros consolidados.
                      </p>
                    </div>
                  </div>

                </div>

                <div className="flex justify-end pt-3 border-t border-slate-50">
                  <button 
                    onClick={handleSaveLgpdPolicies}
                    className="h-9.5 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Salvar Políticas
                  </button>
                </div>
              </div>

              {/* Data masking simulator preview board */}
              <div className="bg-white border border-[#E8DDFD]/65 rounded-[22px] p-5 shadow-sm space-y-4">
                <div className="border-b border-slate-50 pb-2.5">
                  <h4 className="text-[10px] font-black text-slate-850 uppercase tracking-wider">Painel de Visualização Sanitizada PII</h4>
                  <span className="text-[8.5px] font-bold text-slate-400 block mt-1">Veja como as informações de titulares são exibidas nos logs conforme o papel RBAC do operador.</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Vista Admin */}
                  <div className="border border-slate-100 rounded-xl p-4 bg-[#FAF8FF]/45 text-left space-y-2">
                    <span className="text-[9px] font-black text-brand uppercase tracking-wider block">Exibição para Carlos Oliveira (Owner/Admin)</span>
                    <div className="font-mono text-[10px] bg-white border border-[#E8DDFD]/60 rounded-lg p-3 space-y-1.5 leading-normal text-slate-700 select-text">
                      <div><span className="text-slate-400">Nome:</span> João da Silva Medeiros</div>
                      <div><span className="text-slate-400">E-mail:</span> joao.silva@gmail.com</div>
                      <div><span className="text-slate-400">CPF:</span> 098.241.872-91</div>
                      <div><span className="text-slate-400">CNPJ:</span> 12.345.678/0001-90</div>
                      <div><span className="text-slate-400">IP:</span> 192.168.12.98</div>
                    </div>
                  </div>

                  {/* Vista Suporte */}
                  <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 text-left space-y-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Exibição para Operador de Suporte/Auditor</span>
                    <div className="font-mono text-[10px] bg-white border border-[#E8DDFD]/60 rounded-lg p-3 space-y-1.5 leading-normal text-slate-700 select-text">
                      <div><span className="text-slate-400">Nome:</span> João da S*** M***</div>
                      <div><span className="text-slate-400">E-mail:</span> {hideFullEmail ? 'j***@gmail.com' : 'joao.silva@gmail.com'}</div>
                      <div><span className="text-slate-400">CPF:</span> {hideFullCpfCnpj ? '***.***.***-**' : '098.241.872-91'}</div>
                      <div><span className="text-slate-400">CNPJ:</span> {hideFullCpfCnpj ? '**.***.***/****-**' : '12.345.678/0001-90'}</div>
                      <div><span className="text-slate-400">IP:</span> {hideFullIpFingerprint ? '192.168.xxx.xxx' : '192.168.12.98'}</div>
                    </div>
                  </div>
                </div>

                {/* Interactive masking simulator input test */}
                <div className="border border-[#E8DDFD]/60 rounded-xl p-4.5 bg-slate-50/15 space-y-3">
                  <span className="text-[9.5px] font-black text-slate-800 uppercase tracking-wider block">Área de Teste Interativo de Mascaramento</span>
                  
                  <div className="flex flex-col md:flex-row items-end gap-3.5">
                    <div className="space-y-1 flex-1 w-full">
                      <label className="text-[9px] font-black text-slate-450 uppercase tracking-wider block">Cole um log ou digite dados sensíveis (CPF, Email ou IP)</label>
                      <input 
                        type="text"
                        value={testInput}
                        onChange={(e) => setTestInput(e.target.value)}
                        placeholder="ex: João comprou usando o e-mail joao@gmail.com e CPF 123.456.789-00 do IP 192.168.1.1"
                        className="w-full bg-white border border-[#E8DDFD] rounded-xl px-3 py-2 text-xs font-semibold text-slate-750 placeholder-slate-350 focus:outline-none"
                      />
                    </div>
                    
                    <button 
                      onClick={handleTestMaskingInput}
                      className="h-9.5 px-5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[10.5px] font-black uppercase tracking-wider transition-all shadow-md shrink-0 flex items-center justify-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Testar Mascaramento
                    </button>
                  </div>

                  {testMaskedResult && (
                    <div className="rounded-xl border border-[#E8DDFD]/65 p-3 bg-white text-left animate-in zoom-in-95 duration-200">
                      <span className="text-[9px] font-black text-brand uppercase tracking-wider block">Resultado Sanitizado:</span>
                      <p className="text-[11px] font-mono text-slate-650 leading-relaxed mt-1 select-text">
                        {testMaskedResult}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Module application grid */}
              <div className="bg-white border border-[#E8DDFD]/65 rounded-[22px] p-5 shadow-sm space-y-4">
                <div className="border-b border-slate-50 pb-2.5">
                  <h4 className="text-[10px] font-black text-slate-850 uppercase tracking-wider">Aplicação Técnica por Módulo de Negócio</h4>
                  <span className="text-[8.5px] font-bold text-slate-400 block mt-1">Veja quais camadas e rotas da API estão sob o controle estrito da política ativa.</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    { mod: 'Relatórios BCI', route: '/dashboard/bci', status: 'Criptografado & Mascarado', desc: 'Evita a exportação direta de XLS/CSV contendo dados cadastrais brutos de clientes sem permissão dpo.' },
                    { mod: 'Vendas e Pedidos', route: '/dashboard/orders', status: 'Visão por Cargo', desc: 'Oculta dados do comprador na visualização geral. Desbloqueio individual auditável por log.' },
                    { mod: 'Payloads de Webhooks', route: '/dashboard/developers/webhooks', status: 'Sanitização Dinâmica', desc: 'Sanitiza campos PII de qualquer requisição enviada a endpoints antes da postagem externa.' },
                    { mod: 'Trilhas de Auditoria', route: '/dashboard/settings/security', status: 'Anonimização Integral', desc: 'Rastreabilidade mantida via ID hashes sem expor dados de e-mail ou cartão físico nos logs.' }
                  ].map((m, idx) => (
                    <div key={idx} className="border border-slate-50 rounded-xl p-3.5 bg-slate-50/15 space-y-2 hover:border-[#E8DDFD]/65 transition-colors">
                      <div className="flex items-center justify-between border-b border-slate-50 pb-1.5">
                        <span className="text-xs font-black text-slate-800">{m.mod}</span>
                        <span className="bg-indigo-50 text-indigo-750 px-1.5 py-0.2 rounded font-mono text-[8px] font-black uppercase">Ativo</span>
                      </div>
                      <span className="font-mono text-[9px] text-brand block">{m.route}</span>
                      <span className="text-[10px] font-black text-slate-650 block leading-tight">{m.status}</span>
                      <p className="text-[9.5px] font-semibold text-slate-400 leading-relaxed pt-1">{m.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Laravel / PHP Sanitization Integration code blocks */}
              <div className="bg-white border border-[#E8DDFD]/65 rounded-[22px] p-5 shadow-sm space-y-4">
                <div className="border-b border-slate-50 pb-2.5 flex items-center justify-between">
                  <div>
                    <h4 className="text-[10px] font-black text-slate-850 uppercase tracking-wider block">Middleware de Sanitização (PHP/Laravel Helper)</h4>
                    <span className="text-[8.5px] font-bold text-slate-400 block mt-1">Cole o helper de mascaramento e a migration no seu repositório de backend para acionamento nativo.</span>
                  </div>
                  <span className="bg-purple-50 text-brand px-2.5 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest font-mono">
                    Laravel Helper
                  </span>
                </div>

                <div className="font-mono text-[9px] bg-slate-950 border border-slate-900 rounded-xl p-4.5 leading-relaxed text-slate-350 select-text overflow-x-auto relative">
                  <div className="absolute right-3.5 top-3.5 bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-[8px] font-black uppercase text-slate-400 pointer-events-none select-none">
                    LGPDSanitizer.php
                  </div>
                  <pre className="text-left font-mono">
                    {`<?php

namespace App\\Helpers;

class LGPDSanitizer
{
    /**
     * Mascara dinamicamente e-mail de compradores sensíveis.
     */
    public static function maskEmail(string $email): string
    {
        $parts = explode('@', $email);
        if (count($parts) < 2) return $email;
        
        $name = $parts[0];
        $domain = $parts[1];
        
        $maskedName = substr($name, 0, 1) . str_repeat('*', max(3, strlen($name) - 1));
        return $maskedName . '@' . $domain;
    }

    /**
     * Mascara dinamicamente CPF/CNPJ de portadores de cartão.
     */
    public static function maskCpfCnpj(string $value): string
    {
        $cleaned = preg_replace('/[^0-9]/', '', $value);
        
        // Formato CPF
        if (strlen($cleaned) === 11) {
            return '***.***.***-**';
        }
        
        // Formato CNPJ
        if (strlen($cleaned) === 14) {
            return '**.***.***/****-**';
        }
        
        return $value;
    }
}`}
                  </pre>
                </div>
              </div>

              {/* Compliance Audit Logs Feed */}
              <div className="bg-white border border-[#E8DDFD]/65 rounded-[22px] p-5 shadow-sm space-y-4">
                <div className="border-b border-slate-50 pb-2.5">
                  <h4 className="text-[10px] font-black text-slate-850 uppercase tracking-wider block">Auditoria de Alterações da Política LGPD</h4>
                  <span className="text-[8.5px] font-bold text-slate-400 block mt-1">Rastreabilidade completa de todas as atualizações no Strict Mode por operadores da plataforma.</span>
                </div>

                <div className="w-full overflow-hidden rounded-xl border border-slate-100">
                  <table className="w-full text-left table-fixed">
                    <thead>
                      <tr className="border-b border-[#E8DDFD]/40 bg-slate-50/50">
                        <th className="py-2.5 px-3.5 text-[9px] font-black uppercase text-slate-400 tracking-wider w-[24%]">Operador / Cargo</th>
                        <th className="py-2.5 px-2 text-[9px] font-black uppercase text-slate-400 tracking-wider w-[28%]">Mudança Executada</th>
                        <th className="py-2.5 px-2 text-[9px] font-black uppercase text-slate-400 tracking-wider w-[18%]">Horário</th>
                        <th className="py-2.5 px-2 text-[9px] font-black uppercase text-slate-400 tracking-wider w-[15%]">Valor Anterior</th>
                        <th className="py-2.5 px-2 text-[9px] font-black uppercase text-slate-400 tracking-wider w-[15%]">Novo Valor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[11px] font-bold text-slate-700">
                      {lgpdAuditLogs.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-400 font-bold">Nenhum registro de auditoria LGPD encontrado.</td>
                        </tr>
                      ) : (
                        lgpdAuditLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-50/50 h-[48px]">
                            <td className="py-2 px-3.5 min-w-0">
                              <div className="leading-tight">
                                <span className="font-extrabold text-slate-900 block truncate">{log.user}</span>
                                <span className="text-[8px] font-black text-brand uppercase tracking-wider block mt-0.5">{log.role}</span>
                              </div>
                            </td>
                            <td className="py-2 px-2 text-slate-800 font-extrabold truncate">{log.change}</td>
                            <td className="py-2 px-2 text-slate-550 font-semibold">{log.date}</td>
                            <td className="py-2 px-2 text-red-650 font-mono text-[9.5px]">{log.oldVal}</td>
                            <td className="py-2 px-2 text-emerald-650 font-mono text-[9.5px]">{log.newVal}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Bottom Horizontal Tarja Banner */}
        <SecurityAlertsPanel 
          onActionFeedback={triggerFeedback}
          onForceLogoutAll={handleRevokeAllSessions}
          onNavigateToAudit={() => window.location.href = '/dashboard/audit'}
          is2faActive={twoFactorActive}
          isIpAllowlistActive={ipRules.length > 0}
        />

      </div>

    </PageLayout>
  );
}
