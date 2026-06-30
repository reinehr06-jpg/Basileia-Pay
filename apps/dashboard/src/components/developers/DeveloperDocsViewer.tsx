'use client';

import { useState } from 'react';
import { Search, Terminal, Clipboard, Check, HelpCircle, ArrowRight, Lock, BookOpen, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

export function DeveloperDocsViewer({ onActionFeedback }: { onActionFeedback: (msg: string) => void }) {
  const [activeSection, setActiveSection] = useState('auth');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    onActionFeedback('Bloco de exemplo copiado com sucesso!');
    setTimeout(() => setCopiedText(null), 2000);
  };

  const sections = [
    { id: 'auth', label: 'Autenticação', desc: 'Como assinar chamadas HTTP com segurança.' },
    { id: 'create-checkout', label: 'Criar Checkout', desc: 'Criar uma nova experiência de checkout.' },
    { id: 'get-payment', label: 'Consultar Pagamento', desc: 'Obter status atual de uma transação.' },
    { id: 'refunds', label: 'Estornos & Reembolsos', desc: 'Processar devoluções parciais ou totais.' },
    { id: 'webhooks', label: 'Configurar Webhooks', desc: 'Receber retornos assíncronos em tempo real.' },
    { id: 'errors', label: 'Tabela de Erros', desc: 'Códigos de status e tratamento de falhas.' },
    { id: 'rate-limits', label: 'Limites de Requisição', desc: 'Políticas de rate limit por API Key.' }
  ];

  const filteredSections = sections.filter(
    s => s.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
         s.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6 text-left items-stretch h-[600px] overflow-hidden">
      
      {/* Index Navigation Column */}
      <div className="w-full lg:w-[240px] bg-slate-50 border border-slate-200/50 rounded-[22px] p-4 flex flex-col justify-between shrink-0">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8.5 pl-9 pr-3 bg-white border border-slate-200 rounded-xl text-[10.5px] font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand shadow-sm shadow-slate-100/50"
              placeholder="Buscar na documentação..."
            />
          </div>

          <div className="space-y-1 overflow-y-auto max-h-[440px] no-scrollbar">
            {filteredSections.map((s) => {
              const active = activeSection === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider block transition-all cursor-pointer",
                    active 
                      ? "bg-brand text-white shadow-sm shadow-brand/10" 
                      : "text-slate-500 hover:bg-slate-150/60 hover:text-slate-800"
                  )}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-slate-100/50 rounded-xl p-3 border border-slate-200/20 text-[9px] font-bold text-slate-400 leading-snug">
          <BookOpen className="w-4 h-4 text-slate-400 shrink-0 mb-1" />
          API V1 oficial da Basileia Pay. Última alteração há 2 semanas.
        </div>
      </div>

      {/* Primary Markdown Content Column */}
      <div className="flex-1 bg-white border border-[#E8DDFD]/65 rounded-[22px] p-5 overflow-y-auto no-scrollbar shadow-sm shadow-slate-100/50 h-full">
        
        {/* Section 1: Auth */}
        {activeSection === 'auth' && (
          <div className="space-y-4">
            <div>
              <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Conceitos Gerais</span>
              <h2 className="text-sm font-black text-slate-900 mt-0.5">Autenticação de Chamadas HTTP</h2>
            </div>
            
            <p className="text-[11px] font-semibold text-slate-450 leading-relaxed">
              A API da Basileia Pay utiliza autenticação baseada em Bearer Token. Todas as chamadas para endpoints privados devem incluir a chave de API (sk_live_...) no cabeçalho <span className="font-mono bg-slate-50 px-1 border border-slate-100 rounded text-slate-800 font-extrabold text-[10px]">Authorization</span> de cada requisição.
            </p>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 space-y-2">
              <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-450 border-b border-slate-800 pb-2">
                <span>Cabeçalho de Exemplo</span>
                <button
                  onClick={() => handleCopy("Authorization: Bearer sk_live_bsl_29fa********", "auth-hdr")}
                  className="text-slate-400 hover:text-white shrink-0 cursor-pointer"
                >
                  {copiedText === 'auth-hdr' ? <Check className="w-3.5 h-3.5" /> : <Clipboard className="w-3.5 h-3.5" />}
                </button>
              </div>
              <pre className="font-mono text-xs text-slate-300 overflow-x-auto whitespace-pre no-scrollbar">
                <code>{`Authorization: Bearer sk_live_bsl_29fa********\nContent-Type: application/json`}</code>
              </pre>
            </div>

            <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-3 text-[10.5px] font-semibold text-amber-800 leading-relaxed flex gap-2">
              <Lock className="w-4.5 h-4.5 text-amber-600 shrink-0" />
              <span>
                <strong>Atenção:</strong> Chaves criadas em ambiente **Sandbox** utilizam o prefixo <code className="font-mono font-black text-[9.5px]">sk_test_...</code> e nunca alteram saldos ou transações reais de clientes.
              </span>
            </div>
          </div>
        )}

        {/* Section 2: Create Checkout */}
        {activeSection === 'create-checkout' && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-emerald-600 text-white font-black text-[9px] px-2 py-0.5 rounded uppercase leading-none">POST</span>
                <span className="font-mono text-xs text-slate-800 font-black">/v1/checkouts</span>
              </div>
              <h2 className="text-sm font-black text-slate-900 mt-1.5">Criar Experiência de Checkout</h2>
            </div>

            <p className="text-[11px] font-semibold text-slate-450 leading-relaxed">
              Use este endpoint para criar e inicializar uma experiência de checkout embutida para cartões, PIX ou boletos. Retorna a URL final da Basileia Pay.
            </p>

            <div className="space-y-2">
              <span className="text-[9.5px] font-black uppercase text-slate-400 tracking-wider block">Parâmetros do Payload</span>
              <div className="border border-slate-100 rounded-xl overflow-hidden text-[10.5px] font-semibold text-slate-600">
                <div className="grid grid-cols-4 bg-slate-50 border-b border-slate-100 p-2 font-black uppercase text-slate-400 text-[9px]">
                  <span>Campo</span>
                  <span>Tipo</span>
                  <span>Obrigatoriedade</span>
                  <span>Descrição</span>
                </div>
                <div className="grid grid-cols-4 p-2 border-b border-slate-100 font-mono text-[10px]">
                  <span className="text-slate-800 font-black">system_id</span>
                  <span>string</span>
                  <span className="text-brand">Obrigatório</span>
                  <span className="font-sans text-[10px]">Código do sistema de origem.</span>
                </div>
                <div className="grid grid-cols-4 p-2 border-b border-slate-100 font-mono text-[10px]">
                  <span className="text-slate-800 font-black">amount</span>
                  <span>integer</span>
                  <span className="text-brand">Obrigatório</span>
                  <span className="font-sans text-[10px]">Valor em centavos (Ex: 15990 = R$159,90).</span>
                </div>
                <div className="grid grid-cols-4 p-2 font-mono text-[10px]">
                  <span className="text-slate-800 font-black">customer</span>
                  <span>object</span>
                  <span className="text-slate-400">Opcional</span>
                  <span className="font-sans text-[10px]">Objeto com dados de contato do cliente.</span>
                </div>
              </div>
            </div>

            {/* Request example code */}
            <div className="space-y-3 mt-4">
              <span className="text-[9.5px] font-black uppercase text-slate-400 tracking-wider block">Exemplo de Requisição (POST)</span>
              
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 space-y-2">
                <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-450 border-b border-slate-800 pb-2">
                  <span>cURL</span>
                  <button onClick={() => handleCopy(`curl -X POST https://api.basileia.app/v1/checkouts \\\n  -H "Authorization: Bearer sk_live_bsl_xxx" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "system_id": "sys_church",\n    "amount": 15990\n  }'`, "chk-req-curl")} className="text-slate-400 hover:text-white shrink-0 cursor-pointer">
                    {copiedText === 'chk-req-curl' ? <Check className="w-3.5 h-3.5" /> : <Clipboard className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <pre className="font-mono text-xs text-blue-400 overflow-x-auto whitespace-pre no-scrollbar">
                  <code>{`curl -X POST https://api.basileia.app/v1/checkouts \\
  -H "Authorization: Bearer sk_live_bsl_xxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "system_id": "sys_church",
    "amount": 15990
  }'`}</code>
                </pre>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 space-y-2">
                <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-450 border-b border-slate-800 pb-2">
                  <span>PHP (cURL)</span>
                  <button onClick={() => handleCopy(`<?php\n$ch = curl_init();\ncurl_setopt($ch, CURLOPT_URL, 'https://api.basileia.app/v1/checkouts');\ncurl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);\ncurl_setopt($ch, CURLOPT_POST, 1);\ncurl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([\n  "system_id" => "sys_church",\n  "amount" => 15990\n]));\n$headers = [];\n$headers[] = 'Authorization: Bearer sk_live_bsl_xxx';\n$headers[] = 'Content-Type: application/json';\ncurl_setopt($ch, CURLOPT_HTTPHEADER, $headers);\n$result = curl_exec($ch);\ncurl_close($ch);\necho $result;`, "chk-req-php")} className="text-slate-400 hover:text-white shrink-0 cursor-pointer">
                    {copiedText === 'chk-req-php' ? <Check className="w-3.5 h-3.5" /> : <Clipboard className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <pre className="font-mono text-xs text-violet-400 overflow-x-auto whitespace-pre no-scrollbar">
                  <code>{`<?php
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'https://api.basileia.app/v1/checkouts');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
  "system_id" => "sys_church",
  "amount" => 15990
]));
$headers = [
  'Authorization: Bearer sk_live_bsl_xxx',
  'Content-Type: application/json'
];
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
$result = curl_exec($ch);
curl_close($ch);
echo $result;`}</code>
                </pre>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 space-y-2">
                <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-450 border-b border-slate-800 pb-2">
                  <span>Payload de Resposta (JSON)</span>
                  <button
                    onClick={() => handleCopy(JSON.stringify({ id: "chk_01JTK8X9A214", status: "created", amount: 15990, checkout_url: "https://pay.basileia.com/chk_01JTK8X9A214" }, null, 2), "chk-res")}
                    className="text-slate-400 hover:text-white shrink-0 cursor-pointer"
                  >
                    {copiedText === 'chk-res' ? <Check className="w-3.5 h-3.5" /> : <Clipboard className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <pre className="font-mono text-xs text-green-400 overflow-x-auto whitespace-pre no-scrollbar">
                  <code>{`{\n  "id": "chk_01JTK8X9A214",\n  "status": "created",\n  "amount": 15990,\n  "checkout_url": "https://pay.basileia.com/chk_01JTK8X9A214",\n  "expires_at": "2026-05-19T15:00:00Z"\n}`}</code>
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Section 3: Get Payment */}
        {activeSection === 'get-payment' && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-blue-600 text-white font-black text-[9px] px-2 py-0.5 rounded uppercase leading-none">GET</span>
                <span className="font-mono text-xs text-slate-800 font-black">/v1/payments/:id</span>
              </div>
              <h2 className="text-sm font-black text-slate-900 mt-1.5">Consultar Transação de Pagamento</h2>
            </div>

            <p className="text-[11px] font-semibold text-slate-450 leading-relaxed">
              Obtém a árvore completa de dados e o status operacional atual de uma transação pelo seu ID exclusivo.
            </p>

            <div className="space-y-3 mt-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 space-y-2">
                <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-450 border-b border-slate-800 pb-2">
                  <span>cURL</span>
                  <button onClick={() => handleCopy(`curl -X GET https://api.basileia.app/v1/payments/pay_7c9d8a1e2f3 \\\n  -H "Authorization: Bearer sk_live_bsl_xxx"`, "get-pay-curl")} className="text-slate-400 hover:text-white shrink-0 cursor-pointer">
                    {copiedText === 'get-pay-curl' ? <Check className="w-3.5 h-3.5" /> : <Clipboard className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <pre className="font-mono text-xs text-blue-400 overflow-x-auto whitespace-pre no-scrollbar">
                  <code>{`curl -X GET https://api.basileia.app/v1/payments/pay_7c9d8a1e2f3 \\
  -H "Authorization: Bearer sk_live_bsl_xxx"`}</code>
                </pre>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 space-y-2">
                <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-450 border-b border-slate-800 pb-2">
                  <span>Response (200 OK)</span>
                  <button
                    onClick={() => handleCopy(JSON.stringify({ id: "pay_7c9d8a1e2f3", status: "succeeded" }, null, 2), "get-pay-res")}
                    className="text-slate-400 hover:text-white shrink-0 cursor-pointer"
                  >
                    {copiedText === 'get-pay-res' ? <Check className="w-3.5 h-3.5" /> : <Clipboard className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <pre className="font-mono text-xs text-green-400 overflow-x-auto whitespace-pre no-scrollbar">
                  <code>{`{\n  "id": "pay_7c9d8a1e2f3",\n  "amount": 5000,\n  "status": "succeeded",\n  "payment_method": "pix",\n  "customer": {\n    "name": "Júlio César",\n    "email": "julio@igreja.org"\n  }\n}`}</code>
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Section 4: Refunds */}
        {activeSection === 'refunds' && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-emerald-600 text-white font-black text-[9px] px-2 py-0.5 rounded uppercase leading-none">POST</span>
                <span className="font-mono text-xs text-slate-800 font-black">/v1/refunds</span>
              </div>
              <h2 className="text-sm font-black text-slate-900 mt-1.5">Estornos e Reembolsos de Valores</h2>
            </div>

            <p className="text-[11px] font-semibold text-slate-450 leading-relaxed">
              Solicita o reembolso parcial ou total de uma compra paga de Pix ou Cartão. Retorna o ID da operação e o status da devolução.
            </p>

            <div className="space-y-3 mt-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 space-y-2">
                <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-450 border-b border-slate-800 pb-2">
                  <span>cURL</span>
                  <button onClick={() => handleCopy(`curl -X POST https://api.basileia.app/v1/refunds \\\n  -H "Authorization: Bearer sk_live_bsl_xxx" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "payment_id": "pay_7c9d8a1e2f3",\n    "amount": 2500\n  }'`, "refund-curl")} className="text-slate-400 hover:text-white shrink-0 cursor-pointer">
                    {copiedText === 'refund-curl' ? <Check className="w-3.5 h-3.5" /> : <Clipboard className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <pre className="font-mono text-xs text-blue-400 overflow-x-auto whitespace-pre no-scrollbar">
                  <code>{`curl -X POST https://api.basileia.app/v1/refunds \\
  -H "Authorization: Bearer sk_live_bsl_xxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "payment_id": "pay_7c9d8a1e2f3",
    "amount": 2500
  }'`}</code>
                </pre>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 space-y-2">
                <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-450 border-b border-slate-800 pb-2">
                  <span>Response (200 OK)</span>
                  <button
                    onClick={() => handleCopy(JSON.stringify({ id: "ref_81jd23kd", status: "processing", amount: 2500 }, null, 2), "refund-res")}
                    className="text-slate-400 hover:text-white shrink-0 cursor-pointer"
                  >
                    {copiedText === 'refund-res' ? <Check className="w-3.5 h-3.5" /> : <Clipboard className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <pre className="font-mono text-xs text-green-400 overflow-x-auto whitespace-pre no-scrollbar">
                  <code>{`{\n  "id": "ref_81jd23kd",\n  "payment_id": "pay_7c9d8a1e2f3",\n  "amount": 2500,\n  "status": "processing"\n}`}</code>
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Section 5: Webhooks */}
        {activeSection === 'webhooks' && (
          <div className="space-y-5">
            <div>
              <h2 className="text-[15px] font-black text-slate-900">Configuração de Webhooks Técnicos</h2>
              <p className="text-[11px] font-semibold text-slate-450 leading-relaxed mt-2">
                A Basileia Pay dispara requisições HTTPS do tipo <span className="font-extrabold text-slate-700 bg-slate-100 px-1 rounded">POST</span> sempre que um pagamento é aprovado, recusado ou estornado, enviando o payload correspondente para sua URL configurada em tempo real.
              </p>
            </div>

            <div className="space-y-2 mt-4">
              <span className="text-[9.5px] font-black uppercase text-slate-400 tracking-wider block">Assinatura e Segurança</span>
              <p className="text-[10.5px] font-semibold text-slate-500 leading-relaxed">
                Para garantir que o webhook foi enviado pela Basileia Pay, todas as requisições incluem o cabeçalho <code className="font-mono text-[9.5px] font-bold bg-slate-50 text-brand px-1 border border-brand/20 rounded">Basileia-Signature</code>. A assinatura é um HMAC SHA-256 gerado usando sua Chave Secreta de Webhook e o corpo da requisição bruta.
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-[9.5px] font-black uppercase text-slate-400 tracking-wider block">Eventos Disponíveis</span>
              <div className="border border-slate-100 rounded-xl overflow-hidden text-[10.5px] font-semibold text-slate-600">
                <div className="grid grid-cols-2 bg-slate-50 border-b border-slate-100 p-2.5 font-black uppercase text-slate-400 text-[9px]">
                  <span>Evento</span>
                  <span>Descrição</span>
                </div>
                <div className="grid grid-cols-2 p-2.5 border-b border-slate-100 font-mono text-[10px] items-center">
                  <span className="text-slate-800 font-black">payment.created</span>
                  <span className="font-sans text-[10px]">Um novo pagamento foi iniciado e está aguardando processamento.</span>
                </div>
                <div className="grid grid-cols-2 p-2.5 border-b border-slate-100 font-mono text-[10px] items-center">
                  <span className="text-slate-800 font-black">payment.succeeded</span>
                  <span className="font-sans text-[10px]">O pagamento foi aprovado com sucesso (Cartão ou Pix).</span>
                </div>
                <div className="grid grid-cols-2 p-2.5 border-b border-slate-100 font-mono text-[10px] items-center">
                  <span className="text-slate-800 font-black">payment.failed</span>
                  <span className="font-sans text-[10px]">O pagamento foi recusado pela adquirente ou o Pix expirou.</span>
                </div>
                <div className="grid grid-cols-2 p-2.5 font-mono text-[10px] items-center">
                  <span className="text-slate-800 font-black">payment.refunded</span>
                  <span className="font-sans text-[10px]">Um estorno ou reembolso foi concluído na conta do cliente.</span>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 space-y-2 mt-4">
              <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-450 border-b border-slate-800 pb-2">
                <span>Exemplo de Payload Webhook (Node.js)</span>
              </div>
              <pre className="font-mono text-xs text-yellow-300 overflow-x-auto whitespace-pre no-scrollbar">
                <code>{`app.post('/webhook', express.raw({type: 'application/json'}), (req, res) => {
  const signature = req.headers['basileia-signature'];
  const event = JSON.parse(req.body);

  if (event.type === 'payment.succeeded') {
    const paymentId = event.data.id;
    console.log(\`Pagamento \${paymentId} foi aprovado!\`);
  }
  
  res.status(200).send();
});`}</code>
              </pre>
            </div>
          </div>
        )}

        {/* Section 6: Errors */}
        {activeSection === 'errors' && (
          <div className="space-y-5">
            <div>
              <h2 className="text-[15px] font-black text-slate-900">Tratamento de Falhas e Erros HTTP</h2>
              <p className="text-[11px] font-semibold text-slate-450 leading-relaxed mt-2">
                A API utiliza códigos de status HTTP padrão do mercado (2xx, 4xx, 5xx) para sinalizar o sucesso ou falha das requisições. Para erros da série 4xx, o corpo da resposta sempre incluirá um código de erro interno e uma mensagem legível.
              </p>
            </div>

            <div className="space-y-2 mt-4">
              <span className="text-[9.5px] font-black uppercase text-slate-400 tracking-wider block">Códigos de Erro Comuns</span>
              <div className="border border-slate-100 rounded-xl overflow-hidden text-[10.5px] font-semibold text-slate-600">
                <div className="grid grid-cols-12 bg-slate-50 border-b border-slate-100 p-2.5 font-black uppercase text-slate-400 text-[9px]">
                  <span className="col-span-2">HTTP</span>
                  <span className="col-span-4">Código Interno</span>
                  <span className="col-span-6">Causa & Solução</span>
                </div>
                <div className="grid grid-cols-12 p-2.5 border-b border-slate-100 font-mono text-[10px] items-start">
                  <span className="col-span-2 text-red-600 font-black">400</span>
                  <span className="col-span-4 text-slate-800 font-black">invalid_request</span>
                  <span className="col-span-6 font-sans text-[10px] text-slate-500">O payload JSON está malformado ou campos obrigatórios estão ausentes. Verifique a sintaxe.</span>
                </div>
                <div className="grid grid-cols-12 p-2.5 border-b border-slate-100 font-mono text-[10px] items-start">
                  <span className="col-span-2 text-red-600 font-black">401</span>
                  <span className="col-span-4 text-slate-800 font-black">unauthorized</span>
                  <span className="col-span-6 font-sans text-[10px] text-slate-500">Chave de API ausente, revogada ou incorreta. Use o cabeçalho Authorization: Bearer sk_live_...</span>
                </div>
                <div className="grid grid-cols-12 p-2.5 border-b border-slate-100 font-mono text-[10px] items-start">
                  <span className="col-span-2 text-red-600 font-black">402</span>
                  <span className="col-span-4 text-slate-800 font-black">card_declined</span>
                  <span className="col-span-6 font-sans text-[10px] text-slate-500">Pagamento recusado pela adquirente ou banco emissor (ex: limite insuficiente).</span>
                </div>
                <div className="grid grid-cols-12 p-2.5 border-b border-slate-100 font-mono text-[10px] items-start">
                  <span className="col-span-2 text-red-600 font-black">404</span>
                  <span className="col-span-4 text-slate-800 font-black">resource_not_found</span>
                  <span className="col-span-6 font-sans text-[10px] text-slate-500">O ID do pagamento, estorno ou checkout especificado não existe ou não pertence a sua conta.</span>
                </div>
                <div className="grid grid-cols-12 p-2.5 font-mono text-[10px] items-start">
                  <span className="col-span-2 text-red-600 font-black">429</span>
                  <span className="col-span-4 text-slate-800 font-black">rate_limit_exceeded</span>
                  <span className="col-span-6 font-sans text-[10px] text-slate-500">Você enviou requisições demais num curto período. Aguarde alguns segundos.</span>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 space-y-2 mt-4">
              <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-450 border-b border-slate-800 pb-2">
                <span>Formato da Resposta de Erro</span>
              </div>
              <pre className="font-mono text-xs text-red-400 overflow-x-auto whitespace-pre no-scrollbar">
                <code>{`{
  "error": {
    "type": "invalid_request_error",
    "code": "card_declined",
    "message": "O cartão foi recusado pelo banco emissor por limite insuficiente.",
    "decline_code": "insufficient_funds",
    "request_id": "req_84jf92jfa"
  }
}`}</code>
              </pre>
            </div>
          </div>
        )}

        {/* Section 7: Rate limits */}
        {activeSection === 'rate-limits' && (
          <div className="space-y-5">
            <div>
              <h2 className="text-[15px] font-black text-slate-900">Políticas de Rate Limit</h2>
              <p className="text-[11px] font-semibold text-slate-450 leading-relaxed mt-2">
                Para garantir a estabilidade da plataforma para todos, aplicamos limites de taxa (Rate Limiting) às requisições da API. O limite padrão é de <strong>60 requisições por minuto</strong> (1 req/s) para endpoints de gravação e <strong>120 requisições por minuto</strong> para leitura.
              </p>
            </div>

            <div className="space-y-2 mt-4">
              <span className="text-[9.5px] font-black uppercase text-slate-400 tracking-wider block">Cabeçalhos de Retorno</span>
              <p className="text-[10.5px] font-semibold text-slate-500 leading-relaxed">
                Toda resposta da API inclui cabeçalhos detalhando o estado atual dos seus limites:
              </p>
              <div className="border border-slate-100 rounded-xl overflow-hidden text-[10.5px] font-semibold text-slate-600 mt-2">
                <div className="grid grid-cols-12 bg-slate-50 border-b border-slate-100 p-2.5 font-black uppercase text-slate-400 text-[9px]">
                  <span className="col-span-5">Cabeçalho HTTP</span>
                  <span className="col-span-7">Descrição</span>
                </div>
                <div className="grid grid-cols-12 p-2.5 border-b border-slate-100 items-start">
                  <span className="col-span-5 font-mono text-[10px] font-black text-slate-800">X-RateLimit-Limit</span>
                  <span className="col-span-7 text-[10px] text-slate-500">O número máximo de requisições permitidas na janela atual (ex: 60).</span>
                </div>
                <div className="grid grid-cols-12 p-2.5 border-b border-slate-100 items-start">
                  <span className="col-span-5 font-mono text-[10px] font-black text-slate-800">X-RateLimit-Remaining</span>
                  <span className="col-span-7 text-[10px] text-slate-500">O número de requisições que você ainda pode fazer antes de ser bloqueado.</span>
                </div>
                <div className="grid grid-cols-12 p-2.5 items-start">
                  <span className="col-span-5 font-mono text-[10px] font-black text-slate-800">X-RateLimit-Reset</span>
                  <span className="col-span-7 text-[10px] text-slate-500">A data e hora (em Epoch Time) em que os limites serão redefinidos.</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3.5 text-[10.5px] font-semibold text-blue-800 leading-relaxed flex items-start gap-2.5 mt-4">
              <span className="text-blue-500 mt-0.5"><BookOpen className="w-4 h-4" /></span>
              <span>
                <strong>Precisa de limites maiores?</strong> Clientes Enterprise podem solicitar aumento das cotas de API diretamente com seu gerente de contas ou via suporte técnico para até 1.000 requisições por segundo.
              </span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
