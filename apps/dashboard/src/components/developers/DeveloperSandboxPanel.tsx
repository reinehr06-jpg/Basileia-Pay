'use client';

import { useState } from 'react';
import { FlaskConical, Play, ArrowRight, RefreshCw, Layers, Copy, Check, ShieldAlert, Sparkles, ExternalLink, Globe } from 'lucide-react';
import { SandboxRequest } from '@/types/developers';
import { cn } from '@/lib/utils';

interface DeveloperSandboxPanelProps {
  onActionFeedback: (msg: string) => void;
  onAddSandboxRequest: (req: SandboxRequest) => void;
}

export function DeveloperSandboxPanel({ onActionFeedback, onAddSandboxRequest }: DeveloperSandboxPanelProps) {
  const [requests, setRequests] = useState<SandboxRequest[]>([]);
  const [loadingReset, setLoadingReset] = useState(false);
  const [simulating, setSimulating] = useState(false);

  // Simulator Form State
  const [systemName, setSystemName] = useState('Vendor ERP');
  const [amount, setAmount] = useState('159.90');
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit_card' | 'boleto'>('pix');
  const [customerName, setCustomerName] = useState('Mariana Souza');
  const [customerEmail, setCustomerEmail] = useState('mariana@email.com');

  // Simulation Result Display State
  const [simResponse, setSimResponse] = useState<string | null>(null);
  const [simCheckoutUrl, setSimCheckoutUrl] = useState<string | null>(null);

  // Computed live payload
  const amountCents = Math.round(parseFloat(amount) * 100) || 0;
  const livePayload = {
    system_id: systemName.toLowerCase().replace(/\s+/g, '_'),
    amount: amountCents,
    currency: 'BRL',
    payment_method: paymentMethod,
    customer: {
      name: customerName,
      email: customerEmail
    }
  };

  const handleExecuteSimulation = (e: React.FormEvent) => {
    e.preventDefault();
    setSimulating(true);

    setTimeout(() => {
      setSimulating(false);
      const mockCheckoutId = `chk_test_${Math.random().toString(36).substring(2, 10)}`;
      const checkoutLink = `https://pay.basileia.com/test/${mockCheckoutId}`;
      
      const successResponse = {
        id: mockCheckoutId,
        status: "created",
        environment: "sandbox",
        payment_method: paymentMethod,
        amount: amountCents,
        checkout_url: checkoutLink,
        expires_at: new Date(Date.now() + 3 * 3600 * 1000).toISOString(),
        customer: {
          name: customerName,
          email: customerEmail
        }
      };

      setSimResponse(JSON.stringify(successResponse, null, 2));
      setSimCheckoutUrl(checkoutLink);

      // Create new Sandbox request to list
      const newReq: SandboxRequest = {
        id: `req_sb_${Math.floor(Math.random() * 10000)}`,
        timestamp: new Date().toISOString(),
        endpoint: "/v1/checkouts",
        method: "POST",
        statusCode: 201,
        latencyMs: Math.floor(Math.random() * 80) + 60,
        apiKeyPrefix: "sk_test_bsl_77bc"
      };

      setRequests([newReq, ...requests]);
      onAddSandboxRequest(newReq);
      onActionFeedback('Checkout de teste simulado com sucesso em Sandbox!');
    }, 850);
  };

  const handleResetData = () => {
    setLoadingReset(true);
    setTimeout(() => {
      setLoadingReset(false);
      setRequests([]);
      setSimResponse(null);
      setSimCheckoutUrl(null);
      onActionFeedback('Banco de dados Sandbox resetado com sucesso.');
    }, 1200);
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Resumo Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {[
          { label: "Sandbox Base URL", val: "https://sandbox.api.basileia.com/v1", code: true },
          { label: "Status do Ambiente", val: "OPERACIONAL (100% Saudável)", badge: "emerald" },
          { label: "Requests Simulados Hoje", val: `${requests.length + 12} chamadas` },
          { label: "Último Reset de Testes", val: "Hoje, 09:12" }
        ].map((item, i) => (
          <div key={i} className="bg-white border border-[#E8DDFD]/65 rounded-[22px] p-4.5 shadow-sm shadow-slate-100/50 flex flex-col justify-between">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
              {item.label}
            </span>
            <div className="mt-2.5">
              {item.code ? (
                <code className="text-[10px] font-mono font-black text-slate-700 bg-slate-50 border border-slate-200/50 px-2 py-1 rounded-lg select-all">
                  {item.val}
                </code>
              ) : item.badge ? (
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                  {item.val}
                </span>
              ) : (
                <span className="text-sm font-black text-slate-800">{item.val}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Simulator Tools and Live payloads split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        
        {/* Simulator parameters input Card */}
        <div className="bg-white border border-[#E8DDFD]/65 rounded-[22px] p-5 shadow-sm shadow-slate-100/50 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center gap-2 border-b border-[#E8DDFD]/40 pb-3 mb-4 shrink-0">
              <FlaskConical className="w-5 h-5 text-brand" />
              <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">
                Simulador Técnico de Checkout Sandbox
              </h3>
            </div>

            <form onSubmit={handleExecuteSimulation} className="space-y-3.5">
              {/* Row 1: System and Amount */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9.5px] font-black uppercase text-slate-400 tracking-wider">Sistema de Origem</label>
                  <input
                    type="text"
                    required
                    value={systemName}
                    onChange={(e) => setSystemName(e.target.value)}
                    className="w-full h-8.5 px-3 bg-white border border-[#E8DDFD] rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-brand"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9.5px] font-black uppercase text-slate-400 tracking-wider">Valor Cobrado (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full h-8.5 px-3 bg-white border border-[#E8DDFD] rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-brand"
                  />
                </div>
              </div>

              {/* Row 2: Customer Name and Email */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9.5px] font-black uppercase text-slate-400 tracking-wider">Nome do Cliente</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full h-8.5 px-3 bg-white border border-[#E8DDFD] rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-brand"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9.5px] font-black uppercase text-slate-400 tracking-wider">E-mail de Contato</label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full h-8.5 px-3 bg-white border border-[#E8DDFD] rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-brand"
                  />
                </div>
              </div>

              {/* Row 3: Payment method selector */}
              <div className="space-y-1">
                <label className="text-[9.5px] font-black uppercase text-slate-400 tracking-wider block">Método de Pagamento Assinado</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['pix', 'credit_card', 'boleto'] as const).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={cn(
                        "h-8.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center border transition-all cursor-pointer",
                        paymentMethod === method 
                          ? "bg-brand text-white border-brand shadow-sm shadow-brand/10" 
                          : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                      )}
                    >
                      {method === 'pix' ? 'Pix' : method === 'credit_card' ? 'Cartão' : 'Boleto'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Simulation Buttons */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={simulating}
                  className="w-full h-10 bg-slate-900 hover:bg-slate-850 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50 transition-all active:scale-[0.98]"
                >
                  {simulating ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-brand" />
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Executar Simulação
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="pt-3 border-t border-[#E8DDFD]/40 flex items-center justify-between">
            <span className="text-[9px] font-bold text-slate-450">Ambiente ativo: Sandbox Seguro</span>
            <button
              onClick={handleResetData}
              disabled={loadingReset}
              className="text-red-500 hover:underline font-black uppercase tracking-widest text-[9px] cursor-pointer flex items-center gap-1"
            >
              <RefreshCw className={cn("w-3 h-3", loadingReset && "animate-spin")} />
              Resetar Banco Sandbox
            </button>
          </div>
        </div>

        {/* Live response / URL checkout display Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-[22px] p-5 shadow-xl flex flex-col justify-between h-full text-slate-350 min-h-[300px]">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-[10px] font-black uppercase text-slate-450 tracking-wider">
                Resposta / JSON Retornado
              </span>
              <span className="text-[9px] font-black text-violet-400 bg-violet-950/50 border border-violet-900/50 px-2 py-0.5 rounded-lg">
                HTTP 201 Created
              </span>
            </div>

            {simResponse ? (
              <pre className="font-mono text-[10.5px] text-slate-300 leading-relaxed overflow-x-auto whitespace-pre no-scrollbar max-h-[220px]">
                <code>{simResponse}</code>
              </pre>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-2">
                <Sparkles className="w-8 h-8 text-slate-700 animate-pulse" />
                <span className="text-[10.5px] font-black uppercase text-slate-500 tracking-wider">Aguardando Execução</span>
                <p className="text-[9px] font-bold text-slate-600 max-w-[200px] leading-relaxed">
                  Preencha o formulário e clique em Executar Simulação para analisar a resposta técnica JSON do gateway.
                </p>
              </div>
            )}
          </div>

          {simCheckoutUrl && (
            <div className="pt-3 border-t border-slate-800 flex gap-2">
              <a
                href={simCheckoutUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 h-9 bg-brand hover:bg-brand-dark text-white rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-brand/10 transition-all hover:scale-[1.02]"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Abrir Checkout de Teste
              </a>
            </div>
          )}
        </div>

      </div>

      {/* Feed de Requests Sandbox */}
      <div className="bg-white border border-[#E8DDFD]/65 rounded-[22px] p-5 shadow-sm shadow-slate-100/50">
        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-3">
          Histórico Recente de Requests em Sandbox
        </span>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold text-slate-650">
            <thead className="border-b border-[#E8DDFD]/40 bg-slate-50 text-[9px] font-black uppercase text-slate-400 tracking-wider">
              <tr>
                <th className="px-4 py-3">Hora / Timestamp</th>
                <th className="px-4 py-3">Método</th>
                <th className="px-4 py-3">Endpoint Rota</th>
                <th className="px-4 py-3 text-center">Status HTTP</th>
                <th className="px-4 py-3">Latência</th>
                <th className="px-4 py-3">Chave Credencial</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 text-slate-450 font-medium">
                    {new Date(req.timestamp).toLocaleTimeString('pt-BR')}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "px-1.5 py-0.5 rounded text-[8.5px] font-black leading-none uppercase",
                      req.method === 'POST' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-655'
                    )}>
                      {req.method}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-[10.5px] text-slate-700 font-extrabold">{req.endpoint}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn(
                      "px-1.5 py-0.5 rounded-full text-[8.5px] font-black leading-none",
                      req.statusCode === 201 || req.statusCode === 200 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                    )}>
                      {req.statusCode}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 font-medium">{req.latencyMs} ms</td>
                  <td className="px-4 py-3 font-mono text-[10px] text-slate-400 font-bold">{req.apiKeyPrefix}********</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
