import { ApiPlayground } from '@/components/ApiPlayground';
import { RequestLogs } from '@/components/RequestLogs';

export default function DevelopersHome() {
  return (
    <div className="min-h-screen bg-background text-ink font-sans">
      {/* Header */}
      <header className="h-16 border-b border-border bg-surface flex items-center justify-between px-8 sticky top-0 z-50">
        <div className="flex items-center gap-8">
            <div className="font-bold text-xl flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center text-white">B</div>
                Basileia <span className="text-brand">Developers</span>
            </div>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-ink-muted">
                <a href="#" className="text-ink hover:text-brand">Documentação</a>
                <a href="#" className="hover:text-brand">Referência API</a>
                <a href="#" className="hover:text-brand">SDKs</a>
                <a href="#" className="hover:text-brand">Status</a>
            </nav>
        </div>
        <div className="flex items-center gap-4">
            <button className="text-sm font-medium hover:text-brand">Login</button>
            <button className="bg-ink text-white px-4 py-2 rounded-md text-sm font-bold hover:bg-brand transition-colors">Criar conta sandbox</button>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-6xl mx-auto px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24">
            <div>
                <div className="inline-block px-3 py-1 rounded-full bg-brand/10 text-brand text-xs font-bold uppercase tracking-wider mb-4">API V1 — GA</div>
                <h1 className="text-5xl font-extrabold tracking-tight mb-6 leading-tight">A infraestrutura financeira para <span className="text-brand italic">builders</span>.</h1>
                <p className="text-xl text-ink-muted mb-8 leading-relaxed">
                    Integre pagamentos Pix, cartões e recorrência em minutos com nossos SDKs e API de alta performance.
                </p>
                <div className="flex items-center gap-4">
                    <button className="bg-brand text-white px-8 py-3 rounded-lg font-bold hover:bg-brand-deep transition-all shadow-lg shadow-brand/20">Começar agora</button>
                    <button className="px-8 py-3 border border-border rounded-lg font-bold hover:bg-surface-raised transition-all">Ver exemplos</button>
                </div>
            </div>
            <div className="bg-ink rounded-2xl p-6 shadow-2xl border border-white/10 font-mono text-sm overflow-hidden">
                <div className="flex gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-danger"></div>
                    <div className="w-3 h-3 rounded-full bg-warning"></div>
                    <div className="w-3 h-3 rounded-full bg-success"></div>
                </div>
                <div className="space-y-1">
                    <p className="text-white/50">// Instale o SDK</p>
                    <p className="text-brand">npm <span className="text-white">install @basileia/js</span></p>
                    <p className="text-white/50 mt-4">// Crie um checkout em 3 linhas</p>
                    <p className="text-white"><span className="text-brand">const</span> basileia = <span className="text-brand">new</span> BasileiaClient(&#123; apiKey: <span className="text-success">'bp_live_...'</span> &#125;);</p>
                    <p className="text-white"><span className="text-brand">const</span> session = <span className="text-brand">await</span> basileia.checkouts.create(&#123;</p>
                    <p className="text-white ml-4">amount: <span className="text-warning">29900</span>,</p>
                    <p className="text-white ml-4">customer: &#123; name: <span className="text-success">'João Silva'</span> &#125;</p>
                    <p className="text-white">&#125;);</p>
                    <p className="text-white/50 mt-4">// Redirecione ou use o Embed</p>
                    <p className="text-white">window.location.href = session.checkoutUrl;</p>
                </div>
            </div>
        </div>

        {/* Playground Section */}
        <section className="mb-24">
            <div className="flex flex-col items-center text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Playground Interativo</h2>
                <p className="text-ink-muted max-w-2xl">
                    Teste chamadas reais para nossa API diretamente do navegador sem precisar configurar nada.
                </p>
            </div>
            <ApiPlayground />
        </section>

        {/* Logs Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="md:col-span-1">
                <h2 className="text-2xl font-bold mb-4">Monitoramento Real-time</h2>
                <p className="text-ink-muted mb-6">
                    Acompanhe cada requisição feita aos seus sistemas em tempo real. Depure erros e analise o tráfego instantaneamente.
                </p>
                <div className="space-y-4">
                    <div className="flex items-center gap-3 text-sm font-medium">
                        <div className="w-6 h-6 rounded-md bg-success/10 text-success flex items-center justify-center">✓</div>
                        Visibilidade total de payloads
                    </div>
                    <div className="flex items-center gap-3 text-sm font-medium">
                        <div className="w-6 h-6 rounded-md bg-success/10 text-success flex items-center justify-center">✓</div>
                        Eventos de Webhook registrados
                    </div>
                    <div className="flex items-center gap-3 text-sm font-medium">
                        <div className="w-6 h-6 rounded-md bg-success/10 text-success flex items-center justify-center">✓</div>
                        Proteção contra replay nativa
                    </div>
                </div>
            </div>
            <div className="md:col-span-2">
                <RequestLogs apiKeyPrefix="bp_live_8a9b..." />
            </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-surface py-12 px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="font-bold text-lg opacity-50">Basileia Pay</div>
            <div className="flex gap-8 text-sm text-ink-muted">
                <a href="#" className="hover:text-ink">Terms</a>
                <a href="#" className="hover:text-ink">Privacy</a>
                <a href="#" className="hover:text-ink">Security</a>
                <a href="#" className="hover:text-ink">Contact</a>
            </div>
            <div className="text-ink-subtle text-xs">© 2026 Basileia Pay. Todos os direitos reservados.</div>
        </div>
      </footer>
    </div>
  );
}
