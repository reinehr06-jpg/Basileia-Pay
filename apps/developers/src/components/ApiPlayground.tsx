'use client';

import { useState } from 'react';

const PLAYGROUND_EXAMPLES = {
  'Criar checkout session': {
    method: 'POST',
    endpoint: '/checkout-sessions',
    body: {
      amount: 29900,
      currency: 'BRL',
      customer: { name: 'João Teste', email: 'joao@teste.com' },
      items: [{ name: 'Produto Demo', quantity: 1, unitPrice: 29900 }],
    },
  },
  'Buscar sessão': {
    method: 'GET',
    endpoint: '/checkout-sessions/{id}',
    body: null,
  },
  'Verificar status': {
    method: 'GET',
    endpoint: '/public/checkout/{token}/status',
    body: null,
  },
};

export function ApiPlayground() {
  const [example, setExample] = useState('Criar checkout session');
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [elapsed, setElapsed] = useState<number | null>(null);

  const run = async () => {
    setLoading(true);
    const start = performance.now();

    try {
        const ex = (PLAYGROUND_EXAMPLES as any)[example];
        // Mocking API call for playground
        await new Promise(resolve => setTimeout(resolve, 600));
        
        setResponse({
            status: 'success',
            data: ex.body || { id: 'cs_123', status: 'created' }
        });
    } catch (err) {
        setResponse({ error: 'Failed to execute' });
    } finally {
        setElapsed(Math.round(performance.now() - start));
        setLoading(false);
    }
  };

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-surface flex flex-col md:flex-row h-[500px]">
      <div className="flex-1 p-6 border-r border-border flex flex-col gap-4">
        <div>
            <label className="text-xs font-bold text-ink-subtle uppercase mb-2 block">Exemplo</label>
            <select 
                value={example} 
                onChange={(e) => setExample(e.target.value)}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-brand"
            >
                {Object.keys(PLAYGROUND_EXAMPLES).map(k => <option key={k} value={k}>{k}</option>)}
            </select>
        </div>

        <div className="flex-1 bg-background rounded-md p-4 font-mono text-xs overflow-auto border border-border">
            <pre className="text-ink">
                {JSON.stringify((PLAYGROUND_EXAMPLES as any)[example], null, 2)}
            </pre>
        </div>

        <button 
            onClick={run}
            disabled={loading}
            className="w-full bg-brand text-white py-2.5 rounded-md font-bold hover:bg-brand-deep transition-all flex items-center justify-center gap-2"
        >
            {loading ? 'Executando...' : 'Executar →'}
        </button>
      </div>

      <div className="flex-1 bg-ink text-white p-6 overflow-auto font-mono text-xs">
        <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
            <span className="text-white/50 uppercase font-bold tracking-widest text-[10px]">Resposta</span>
            {elapsed && <span className="text-success">{elapsed}ms</span>}
        </div>
        {response ? (
            <pre>{JSON.stringify(response, null, 2)}</pre>
        ) : (
            <div className="h-full flex items-center justify-center text-white/30 italic">
                Aguardando execução...
            </div>
        )}
      </div>
    </div>
  );
}
