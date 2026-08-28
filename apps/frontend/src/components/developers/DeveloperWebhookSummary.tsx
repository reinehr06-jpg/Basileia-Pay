'use client';

import { useState } from 'react';
import { Webhook, Check, Clipboard, Settings2, Play, ExternalLink } from 'lucide-react';

interface DeveloperWebhookSummaryProps {
  onActionFeedback: (msg: string) => void;
  onNavigateTab: (tab: any) => void;
}

export function DeveloperWebhookSummary({ onActionFeedback, onNavigateTab }: DeveloperWebhookSummaryProps) {
  const [copied, setCopied] = useState(false);

  const mockPayload = {
    id: "evt_01JTK8X9A214",
    event: "payment.succeeded",
    created_at: new Date().toISOString(),
    environment: "production",
    data: {
      payment_id: "pay_7c9d8a1e2f3",
      system_id: "sys_vendor",
      amount: 15990,
      currency: "BRL",
      payment_method: "pix",
      customer: {
        name: "Mariana Souza",
        email: "mariana@email.com"
      }
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(mockPayload, null, 2));
    setCopied(true);
    onActionFeedback('Payload do webhook copiado para a área de transferência!');
    setTimeout(() => setCopied(false), 2000);
  };

  const availableEvents = [
    { name: 'payment.succeeded', desc: 'Disparado quando um pagamento for aprovado.' },
    { name: 'payment.failed', desc: 'Disparado quando um pagamento for recusado ou falhar.' },
    { name: 'checkout.completed', desc: 'Disparado quando um cliente finalizar a jornada de checkout.' },
    { name: 'subscription.updated', desc: 'Disparado em caso de recorrências ou faturas atualizadas.' },
    { name: 'refund.created', desc: 'Disparado quando um estorno/reembolso for processado.' },
    { name: 'chargeback.created', desc: 'Disparado quando o portador do cartão contestar a compra.' }
  ];

  return (
    <div className="space-y-6 text-left">
      
      {/* Resumo Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Endpoints Cadastrados", val: "24 URLs" },
          { label: "Eventos Assinados", val: "6 eventos ativos" },
          { label: "Último Delivery", val: "Há 42 segundos" },
          { label: "Taxa de Sucesso (24h)", val: "99.88% de entregas" }
        ].map((item, i) => (
          <div key={i} className="bg-white border border-[#E8DDFD]/65 rounded-[22px] p-4.5 shadow-sm shadow-slate-100/50 flex flex-col justify-between">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
              {item.label}
            </span>
            <span className="text-sm font-black text-slate-800 mt-2.5">{item.val}</span>
          </div>
        ))}
      </div>

      {/* Events available list and mock payload split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        
        {/* Events Available List */}
        <div className="bg-white border border-[#E8DDFD]/65 rounded-[22px] p-5 shadow-sm shadow-slate-100/50 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center gap-2 border-b border-[#E8DDFD]/40 pb-3 mb-4">
              <Webhook className="w-5 h-5 text-brand" />
              <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">
                Eventos Técnicos Disponíveis
              </h3>
            </div>

            <div className="space-y-3">
              {availableEvents.map((evt) => (
                <div key={evt.name} className="flex items-start gap-2.5 pb-2.5 border-b border-slate-100 last:border-0 last:pb-0">
                  <div className="w-1.5 h-1.5 bg-brand rounded-full mt-1.5 shrink-0" />
                  <div>
                    <span className="font-mono text-[10.5px] font-black text-slate-800 leading-none block">{evt.name}</span>
                    <span className="text-[9.5px] font-bold text-slate-400 block mt-0.5">{evt.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-[#E8DDFD]/40 flex gap-2">
            <button
              onClick={() => onActionFeedback('Direcionando para a central técnica de cadastro de endpoints...')}
              className="flex-1 h-9 bg-slate-900 hover:bg-slate-850 text-white rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Settings2 className="w-3.5 h-3.5" />
              Configurar Endpoint
            </button>
            <button
              onClick={() => onActionFeedback('Enviando entrega de teste (ping) para todos os endpoints ativos...')}
              className="flex-1 h-9 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-350/20 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <Play className="w-3.5 h-3.5" />
              Testar Webhook
            </button>
          </div>
        </div>

        {/* Payload Example Display */}
        <div className="bg-slate-900 border border-slate-800 rounded-[22px] p-5 shadow-xl flex flex-col justify-between h-full text-slate-350 min-h-[300px]">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-[10px] font-black uppercase text-slate-450 tracking-wider">
                Exemplo de Payload Enviado
              </span>
              <button
                onClick={handleCopy}
                className="text-slate-400 hover:text-white shrink-0 cursor-pointer flex items-center gap-1"
                title="Copiar JSON"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Clipboard className="w-3.5 h-3.5" />}
                <span className="text-[9px] font-black uppercase tracking-widest">{copied ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>

            <pre className="font-mono text-[10px] text-slate-300 leading-relaxed overflow-x-auto whitespace-pre no-scrollbar max-h-[220px]">
              <code>{JSON.stringify(mockPayload, null, 2)}</code>
            </pre>
          </div>

          <div className="pt-3 border-t border-slate-800 text-[10px] text-slate-400 flex justify-between items-center">
            <span>Todas as assinaturas usam criptografia HMAC-SHA256.</span>
            <a
              href="#"
              onClick={() => onActionFeedback('Abrindo central avançada de auditoria de webhooks...')}
              className="text-brand hover:underline font-black uppercase tracking-widest text-[9px] flex items-center gap-1"
            >
              Central Avançada Webhooks
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

      </div>

    </div>
  );
}
