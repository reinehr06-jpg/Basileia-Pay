'use client';

import { useState } from 'react';
import { CheckCircle2, Clipboard, Code2, Play, ArrowRight, Key, FlaskConical, Webhook, ShieldCheck, Terminal, HeartHandshake } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DevelopersQuickStartProps {
  onActionFeedback: (msg: string) => void;
  onNavigateTab: (tab: any) => void;
}

type Lang = 'curl' | 'javascript' | 'php' | 'python';

export function DevelopersQuickStart({ onActionFeedback, onNavigateTab }: DevelopersQuickStartProps) {
  const [activeLang, setActiveLang] = useState<Lang>('curl');

  const snippets: Record<Lang, string> = {
    curl: `curl --request POST https://api.basileia.com/v1/checkouts \\
  --header "Authorization: Bearer sk_live_bsl_29fa********" \\
  --header "Content-Type: application/json" \\
  --data '{
    "system_id": "sys_vendor",
    "amount": 15990,
    "currency": "BRL",
    "customer": {
      "name": "Mariana Souza",
      "email": "mariana@email.com"
    }
  }'`,
    javascript: `// Utilizando Node.js ou ES6 Modules
import { BasileiaPay } from '@basileia/pay';

const basileia = new BasileiaPay('sk_live_bsl_29fa********');

const checkout = await basileia.checkouts.create({
  system_id: 'sys_vendor',
  amount: 15990, // Centavos (R$ 159,90)
  currency: 'BRL',
  customer: {
    name: 'Mariana Souza',
    email: 'mariana@email.com'
  }
});

console.log('Checkout criado com sucesso URL:', checkout.checkout_url);`,
    php: `<?php
// Utilizando nosso SDK via Composer
require 'vendor/autoload.php';

$basileia = new \\Basileia\\PayClient('sk_live_bsl_29fa********');

$checkout = $basileia->checkouts->create([
    'system_id' => 'sys_vendor',
    'amount' => 15990,
    'currency' => 'BRL',
    'customer' => [
        'name' => 'Mariana Souza',
        'email' => 'mariana@email.com'
    ]
]);

header('Location: ' . $checkout->checkout_url);`,
    python: `# Instale o pacote oficial via pip install basileiapay
from basileiapay import BasileiaClient

basileia = BasileiaClient(api_key="sk_live_bsl_29fa********")

checkout = basileia.checkouts.create(
    system_id="sys_vendor",
    amount=15990,
    currency="BRL",
    customer={
        "name": "Mariana Souza",
        "email": "mariana@email.com"
    }
)

print(f"URL de checkout gerada: {checkout.checkout_url}")`
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(snippets[activeLang]);
    onActionFeedback(`Snippet em ${activeLang.toUpperCase()} copiado com sucesso!`);
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Primeiros Passos Checklist */}
      <div className="bg-white border border-[#E8DDFD]/65 rounded-[22px] p-5 shadow-sm shadow-slate-100/50">
        <div className="flex items-center gap-2 border-b border-[#E8DDFD]/40 pb-3 mb-4">
          <CheckCircle2 className="w-5 h-5 text-brand" />
          <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">
            Checklist de Primeiros Passos do Integrador
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {[
            { step: "1", title: "Criar API Key", desc: "Gere chaves exclusivas vinculadas a sistemas.", action: () => onNavigateTab('api-keys'), label: "Chaves API" },
            { step: "2", title: "Ambiente Sandbox", desc: "Use chaves de teste (sk_test_...) para simulações.", action: () => onNavigateTab('sandbox'), label: "Ir p/ Sandbox" },
            { step: "3", title: "Fazer Request", desc: "Execute chamadas de criação de checkout.", action: handleCopy, label: "Copiar Snippet" },
            { step: "4", title: "Webhook", desc: "Cadastre URLs para receber retornos automáticos.", action: () => onNavigateTab('webhooks'), label: "Configurar" },
            { step: "5", title: "Testar Sandbox", desc: "Simule checkouts criados e transações pagas.", action: () => onNavigateTab('sandbox'), label: "Executar Teste" }
          ].map((item, index) => (
            <div key={index} className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 flex flex-col justify-between h-full hover:border-[#E8DDFD]/60 transition-all">
              <div className="space-y-2">
                <span className="w-5 h-5 rounded-full bg-brand/10 text-brand text-[10px] font-black flex items-center justify-center">
                  {item.step}
                </span>
                <h4 className="text-xs font-black text-slate-800">{item.title}</h4>
                <p className="text-[10px] font-medium text-slate-400 leading-snug">{item.desc}</p>
              </div>

              <button
                onClick={item.action}
                className="mt-4 flex h-8 items-center justify-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-[9.5px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm w-full"
              >
                {item.label}
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Snippet Code block */}
      <div className="bg-slate-900 rounded-[22px] border border-slate-800 p-5 overflow-hidden shadow-xl flex flex-col justify-between min-h-[300px]">
        
        {/* Code toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-violet-400" />
            <span className="text-[10px] font-black uppercase text-slate-350 tracking-wider">
              Exemplo Rápido: Criar Checkout de Pagamento
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {(['curl', 'javascript', 'php', 'python'] as Lang[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setActiveLang(lang)}
                className={cn(
                  "px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer",
                  activeLang === lang 
                    ? "bg-brand text-white shadow-sm" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                )}
              >
                {lang === 'javascript' ? 'JS/TS' : lang.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[9px] font-black uppercase tracking-wider cursor-pointer transition-colors"
          >
            <Clipboard className="w-3.5 h-3.5" />
            Copiar
          </button>
        </div>

        {/* Code Content */}
        <pre className="text-left font-mono text-xs text-slate-300 leading-relaxed overflow-x-auto whitespace-pre no-scrollbar pb-3 max-h-[220px]">
          <code>{snippets[activeLang]}</code>
        </pre>

        <div className="flex justify-between items-center border-t border-slate-800/80 pt-3 text-[10px] text-slate-400">
          <span>Este endpoint criará um checkout ativo que pode receber cartões, pix ou boletos.</span>
          <button
            onClick={() => onNavigateTab('docs')}
            className="text-brand hover:underline font-black uppercase tracking-widest text-[9px] flex items-center gap-1"
          >
            Ver Docs Completa
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

    </div>
  );
}
