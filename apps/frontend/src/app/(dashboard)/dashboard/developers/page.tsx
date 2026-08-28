'use client';

import { useState, useEffect } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { DevelopersHeader } from '@/components/developers/DevelopersHeader';
import { DevelopersKpiCards } from '@/components/developers/DevelopersKpiCards';
import { DevelopersTabs, DeveloperTabValue } from '@/components/developers/DevelopersTabs';
import { DevelopersQuickStart } from '@/components/developers/DevelopersQuickStart';
import { DevelopersApiStatusPanel } from '@/components/developers/DevelopersApiStatusPanel';
import { DeveloperApiKeysTable } from '@/components/developers/DeveloperApiKeysTable';
import { DeveloperDocsViewer } from '@/components/developers/DeveloperDocsViewer';
import { DeveloperSandboxPanel } from '@/components/developers/DeveloperSandboxPanel';
import { DeveloperWebhookSummary } from '@/components/developers/DeveloperWebhookSummary';
import { DeveloperLogsTable } from '@/components/developers/DeveloperLogsTable';

import { DeveloperSummary, DeveloperApiKey, DeveloperLog, SandboxRequest } from '@/types/developers';
import { cn } from '@/lib/utils';
import { ShieldCheck, ShieldAlert, Key } from 'lucide-react';
import { apiFetch } from '@/lib/api';

export default function DevelopersPage() {
  const [activeTab, setActiveTab] = useState<DeveloperTabValue>('overview');
  const [apiKeys, setApiKeys] = useState<DeveloperApiKey[]>([]);
  const [logs, setLogs] = useState<DeveloperLog[]>([]);
  const [summary, setSummary] = useState<DeveloperSummary>({
    apiKeysActive: 0,
    sandboxRequests24h: 0,
    apiCalls24h: 0,
    successRate24h: 100,
    activeWebhooks: 0,
    apiStatus: { uptime: 100, latencyP95: 45, errorP95: 0.01, region: 'sa-east-1' }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await apiFetch('/api/v1/dashboard/api-keys');
        if (res.success && Array.isArray(res.data)) {
          setApiKeys(res.data.map((k: any) => ({
            id: k.uuid || k.id?.toString(),
            name: k.name || '',
            prefix: k.key_preview || '',
            systemId: k.connected_system_id?.toString() || '',
            systemName: k.system_name || '',
            environment: k.environment || 'production',
            scopes: ['payments.read'],
            status: 'active' as const,
            createdAt: k.created_at || '',
            createdBy: '',
          })));
        } else {
          setApiKeys([]);
        }
      } catch (err) { console.error('Failed to fetch API keys:', err); setApiKeys([]); } finally {
        setLoading(false);
      }
    })();
    setLogs([]);
  }, []);
  
  // Toast notifications
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Simulated Roles & Permissions
  const [userRole, setUserRole] = useState<'owner' | 'auditor'>('owner');
  const isAdmin = userRole === 'owner';

  const triggerFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const handleSaveKey = (newKeyData: Partial<DeveloperApiKey>) => {
    const keyId = `key_${Math.floor(Math.random() * 1000)}`;
    const freshKey: DeveloperApiKey = {
      id: keyId,
      name: newKeyData.name || 'Nova Chave de API',
      prefix: newKeyData.prefix || 'sk_live_bsl_abcd',
      systemId: newKeyData.systemId || 'sys_custom',
      systemName: newKeyData.systemName || 'Integração Customizada',
      environment: newKeyData.environment || 'production',
      scopes: newKeyData.scopes || ['payments.read'],
      status: 'active',
      createdAt: new Date().toISOString(),
      createdBy: isAdmin ? 'Carlos Oliveira (Owner)' : 'Audit Bot',
    };

    setApiKeys([freshKey, ...apiKeys]);
    
    // Simulate updating counts
    setSummary({ ...summary, apiKeysActive: summary.apiKeysActive + 1 });

    triggerFeedback(`Chave "${freshKey.name}" criada com sucesso. Evento de auditoria registrado.`);
  };

  const handleRevokeKey = (id: string) => {
    setApiKeys(apiKeys.map(k => k.id === id ? { ...k, status: 'revoked' } : k));
    
    // Simulate updating counts
    setSummary({ ...summary, apiKeysActive: Math.max(0, summary.apiKeysActive - 1) });

    triggerFeedback("Chave de API revogada permanentemente. Log de auditoria gerado.");
  };

  const handleAddSandboxRequest = (sandboxReq: SandboxRequest) => {
    // Add to logs feed
    const newLog: DeveloperLog = {
      id: `log_${Math.floor(Math.random() * 10000)}`,
      requestId: sandboxReq.id.replace('req_sb_', 'req_'),
      timestamp: sandboxReq.timestamp,
      method: sandboxReq.method,
      endpoint: sandboxReq.endpoint,
      systemName: 'Portal Sandbox',
      apiKeyPrefix: sandboxReq.apiKeyPrefix,
      environment: 'sandbox',
      statusCode: sandboxReq.statusCode,
      latencyMs: sandboxReq.latencyMs,
      ip: '177.34.89.21',
      userAgent: 'Basileia Engine (Sandbox Simulator)',
      requestPayload: JSON.stringify({ simulated: true }, null, 2),
      responsePayload: JSON.stringify({ status: "created", simulated: true }, null, 2)
    };

    setLogs([newLog, ...logs]);

    // Update sandbox metrics counts
    setSummary({ ...summary, sandboxRequests24h: summary.sandboxRequests24h + 1, apiCalls24h: summary.apiCalls24h + 1 });
  };

  // Determine if side panel should render next to active tab
  const showSidePanel = activeTab === 'overview' || activeTab === 'docs' || activeTab === 'webhooks';

  return (
    <PageLayout title="Desenvolvedores">
      
      {/* Toast Notification */}
      {feedbackMsg && (
        <div className="fixed bottom-5 right-5 z-60 bg-slate-900 border border-slate-800 text-white rounded-2xl p-4 shadow-2xl flex items-center gap-2 max-w-sm animate-in slide-in-from-bottom-2 duration-300">
          <span className="w-2 h-2 bg-violet-500 rounded-full shrink-0 animate-ping" />
          <span className="text-[11px] font-black text-left">{feedbackMsg}</span>
        </div>
      )}

      {/* Header component */}
      <DevelopersHeader 
        onOpenDoc={() => setActiveTab('docs')}
        onOpenSandboxTest={() => setActiveTab('sandbox')}
        onNewKey={() => {
          setActiveTab('api-keys');
          triggerFeedback("Preencha as credenciais na tabela abaixo clicando em 'Nova Chave'.");
        }}
        isAdmin={isAdmin}
      />



      {/* KPI Cards Grid */}
      <DevelopersKpiCards 
        summary={summary}
        onFilterTab={setActiveTab}
      />

      {/* Navigation tabs header */}
      <div className="border-b border-[#E8DDFD]/60 flex items-center justify-between">
        <DevelopersTabs 
          activeTab={activeTab}
          onTabChange={setActiveTab}
          activeKeysCount={apiKeys.filter(k => k.status === 'active').length}
          activeWebhooksCount={summary.activeWebhooks}
        />
      </div>

      {/* Split layout or Full width depending on active Tab */}
      <div className="w-full">
        {showSidePanel ? (
          /* Split layout: Content on left (66%), Health API status panel on right (33%) */
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            
            <div className="flex-1 min-w-0 w-full">
              {activeTab === 'overview' && (
                <DevelopersQuickStart 
                  onActionFeedback={triggerFeedback}
                  onNavigateTab={setActiveTab}
                />
              )}

              {activeTab === 'docs' && (
                <DeveloperDocsViewer 
                  onActionFeedback={triggerFeedback}
                />
              )}

              {activeTab === 'webhooks' && (
                <DeveloperWebhookSummary 
                  onActionFeedback={triggerFeedback}
                  onNavigateTab={setActiveTab}
                />
              )}
            </div>

            <DevelopersApiStatusPanel 
              uptime={summary.apiStatus.uptime}
              latency={summary.apiStatus.latencyP95}
              errorRate={summary.apiStatus.errorP95}
              region={summary.apiStatus.region}
            />

          </div>
        ) : (
          /* Full width layout: to maximize tables and log drawers horizontal space */
          <div className="w-full">
            
            {activeTab === 'api-keys' && (
              <DeveloperApiKeysTable 
                keys={apiKeys}
                onActionFeedback={triggerFeedback}
                isAdmin={isAdmin}
                onSaveKey={handleSaveKey}
                onRevokeKey={handleRevokeKey}
              />
            )}

            {activeTab === 'sandbox' && (
              <DeveloperSandboxPanel 
                onActionFeedback={triggerFeedback}
                onAddSandboxRequest={handleAddSandboxRequest}
              />
            )}

            {activeTab === 'logs' && (
              <DeveloperLogsTable 
                logs={logs}
                onActionFeedback={triggerFeedback}
              />
            )}

          </div>
        )}
      </div>

    </PageLayout>
  );
}
