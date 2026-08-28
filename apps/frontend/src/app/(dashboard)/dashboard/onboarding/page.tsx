'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Check,
  Lock,
  Monitor,
  Play,
  Info,
  Layers,
  Settings,
  CreditCard,
  Globe,
  Terminal,
  Activity,
  CheckSquare,
  LayoutDashboard
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

type OnboardingStep = 1 | 2 | 3 | 4 | 5 | 6;

interface AuditLog {
  timestamp: string;
  event: string;
  details: string;
  type: 'info' | 'success' | 'warning' | 'security';
}

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [step, setStep] = useState<OnboardingStep>(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Prefill details for explanation
  const userName = user?.name || 'Admin';
  const companyName = 'Empresa Demonstração LTDA';

  // State for interactive preview on the right (local simulation)
  const [systemName, setSystemName] = useState('Sistema E-commerce');
  const [gatewayProvider, setGatewayProvider] = useState('Asaas');
  const [checkoutName, setCheckoutName] = useState('Checkout Padrão');
  const [checkoutThemeColor, setCheckoutThemeColor] = useState('#7C3AED');
  const [allowPix, setAllowPix] = useState(true);
  const [allowCard, setAllowCard] = useState(true);
  const [isPublished, setIsPublished] = useState(true);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Simulated Audit Logs
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    { timestamp: '10:45:12', event: 'Sessão Iniciada', details: 'Primeiro login corporativo detectado.', type: 'security' },
    { timestamp: '10:45:15', event: 'Módulo de Onboarding', details: 'Guia explicativo inicial carregado.', type: 'info' }
  ]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const addAuditLog = (event: string, details: string, type: 'info' | 'success' | 'warning' | 'security' = 'info') => {
    const time = new Date().toLocaleTimeString('pt-BR', { hour12: false });
    setAuditLogs(prev => [
      { timestamp: time, event, details, type },
      ...prev
    ]);
  };

  // Skip / Complete action
  const handleCompleteOnboarding = () => {
    addAuditLog('Onboarding Concluído', 'Finalização do onboarding de boas-vindas.', 'success');
    triggerToast("Carregando painel principal...");
    setTimeout(() => {
      router.push('/dashboard');
    }, 1000);
  };

  // Add audit log on step change
  useEffect(() => {
    if (step === 2) {
      addAuditLog('Aba Visualizada', 'Conceito de Sistemas e Agrupadores.', 'info');
    } else if (step === 3) {
      addAuditLog('Aba Visualizada', 'Conexão de Gateways e Adquirentes.', 'info');
    } else if (step === 4) {
      addAuditLog('Aba Visualizada', 'Design de Checkouts e Conversão.', 'info');
    } else if (step === 5) {
      addAuditLog('Aba Visualizada', 'Publicação de Versões (Releases).', 'info');
    } else if (step === 6) {
      addAuditLog('Aba Visualizada', 'Simulação de Pagamentos de Teste.', 'info');
    }
  }, [step]);

  return (
    <div className="max-w-[1400px] mx-auto pb-32 animate-in fade-in slide-in-from-bottom-2 duration-500 w-full text-left">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-55 bg-slate-900 text-white rounded-2xl p-4 shadow-2xl flex items-center gap-2.5 max-w-sm animate-in slide-in-from-top-4 duration-300">
          <span className="w-2.5 h-2.5 bg-brand rounded-full shrink-0 animate-ping" />
          <span className="text-[11px] font-black text-left">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-4 pt-1 w-full border-b border-slate-100 dark:border-border pb-4 mb-6">
        <div className="space-y-0.5">
          <div className="flex items-center gap-3">
            <h1 className="text-[28px] 2xl:text-[34px] font-black tracking-tighter text-ink leading-none">Bem-vindo à Basileia Pay</h1>
            <div className="h-6 w-px bg-border/60 mx-1" />
            <Sparkles className="w-5.5 h-5.5 text-brand" />
          </div>
          <p className="text-slate/50 font-bold text-[13px] 2xl:text-[14.5px] tracking-tight">
            Conheça as dicas de uso e os pilares de funcionamento do seu novo hub de pagamentos.
          </p>
        </div>

        <button
          onClick={handleCompleteOnboarding}
          className="h-10 px-6 bg-brand hover:bg-brand-dark text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-brand/15 transition-all flex items-center gap-1.5"
        >
          <LayoutDashboard className="w-4 h-4" />
          Ir para o Painel
        </button>
      </header>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] xl:grid-cols-[260px_1fr_400px] gap-6 items-start w-full">

        {/* Left Column: Progress Stepper */}
        <div className="bg-card border border-border rounded-[24px] p-5 shadow-sm space-y-4 text-left">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pb-1 border-b border-border">
            Guia do Sistema
          </span>

          <nav aria-label="Progresso do onboarding" className="space-y-1">
            {[
              { num: 1, label: 'Boas-vindas', desc: 'Introdução e Empresa' },
              { num: 2, label: 'Sistemas', desc: 'Agrupadores de vendas' },
              { num: 3, label: 'Gateways', desc: 'Configurar adquirentes' },
              { num: 4, label: 'Checkouts', desc: 'Design e conversão' },
              { num: 5, label: 'Versões', desc: 'Publicar releases' },
              { num: 6, label: 'Venda de Teste', desc: 'Simulação prática' }
            ].map((s) => {
              const isActive = step === s.num;
              const isDone = step > s.num;

              return (
                <button
                  key={s.num}
                  onClick={() => setStep(s.num as OnboardingStep)}
                  className={`w-full flex items-start gap-3 p-2.5 rounded-xl transition-all text-left ${
                    isActive
                      ? 'bg-brand/5 border border-brand/10 text-brand'
                      : isDone
                      ? 'text-green-500 bg-green-500/5'
                      : 'text-slate-400 hover:text-foreground'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${
                    isActive
                      ? 'bg-brand text-white'
                      : isDone
                      ? 'bg-green-500 text-white'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {isDone ? <Check className="w-3.5 h-3.5" /> : s.num}
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-black block leading-none tracking-tight">{s.label}</span>
                    <span className="text-[9px] font-bold block text-muted-foreground truncate mt-0.5">{s.desc}</span>
                  </div>
                </button>
              );
            })}
          </nav>

          <div className="bg-muted/30 border border-border rounded-2xl p-4 space-y-1.5">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Navegação Livre</span>
            <p className="text-[10px] font-bold text-muted-foreground leading-normal">
              Você pode clicar em qualquer etapa para ler a explicação ou pular para o painel imediatamente.
            </p>
          </div>
        </div>

        {/* Center Column: Informational details */}
        <div className="bg-card border border-border rounded-[24px] p-6 xl:p-8 shadow-sm flex flex-col justify-between min-h-[480px] w-full">

          {/* STEP 1: WELCOME CONTEXT */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="space-y-2">
                <span className="text-[9.5px] text-brand font-black uppercase tracking-wider">Etapa 1 de 6 • Apresentação</span>
                <h2 className="text-xl xl:text-2xl font-black text-foreground">
                  Boas-vindas à Basileia Pay, {userName}!
                </h2>
                <p className="text-slate/60 text-xs font-bold leading-relaxed">
                  Você está logado na organização <strong className="text-brand">{companyName}</strong>. 
                  A Basileia Pay é uma plataforma de orquestração de pagamentos focada em alta performance, roteamento inteligente e checkout de alta conversão.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-muted/20 p-4.5 rounded-2xl border border-border text-xs font-bold text-foreground">
                <div className="space-y-1">
                  <span className="text-[9.5px] text-muted-foreground block uppercase tracking-wider">Organização Logada</span>
                  <span>{companyName}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[9.5px] text-muted-foreground block uppercase tracking-wider">Modo do Onboarding</span>
                  <span className="text-brand flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
                    Explicativo (Sem bloqueios)
                  </span>
                </div>
              </div>

              <div className="bg-brand/5 border border-brand/20 p-4 rounded-xl text-[10.5px] font-bold text-foreground flex items-start gap-2.5">
                <Info className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                <p>
                  Criamos este guia rápido para demonstrar os conceitos fundamentais da plataforma: Sistemas, Gateways, Checkouts, Releases e Testes. Fique à vontade para ler ou prosseguir para o painel principal.
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: SYSTEMS CONCEPT */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="space-y-2">
                <span className="text-[9.5px] text-brand font-black uppercase tracking-wider">Etapa 2 de 6 • Estrutura</span>
                <h2 className="text-xl xl:text-2xl font-black text-foreground">
                  O que são Sistemas?
                </h2>
                <p className="text-slate/60 text-xs font-bold leading-relaxed">
                  Um **Sistema** representa a sua aplicação de origem ou e-commerce. Ele atua como uma gaveta lógica que agrupa os seus checkouts, regras de roteamento e credenciais de API.
                </p>
              </div>

              {/* Interactive Simulation Form */}
              <div className="bg-muted/10 p-4 rounded-2xl border border-border space-y-4">
                <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block">Simulador interativo de Sistema</span>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[9.5px] font-bold text-muted-foreground block">Nome de exemplo para o sistema</label>
                    <input
                      type="text"
                      value={systemName}
                      onChange={e => {
                        setSystemName(e.target.value);
                        addAuditLog('Simulação de Edição', `Nome do sistema alterado para '${e.target.value}'`, 'info');
                      }}
                      className="w-full h-10 px-3 bg-card border border-border rounded-xl text-xs font-bold text-foreground focus:outline-none"
                    />
                  </div>
                  <p className="text-[10px] font-bold text-muted-foreground">
                    Ao alterar o nome acima, você pode ver que o navegador simulado no painel direito atualiza a URL do sistema em tempo real!
                  </p>
                </div>
              </div>

              <div className="bg-purple-500/5 border border-brand/20 p-4 rounded-xl text-[10.5px] font-bold text-foreground">
                📌 **Dica de Uso:** Crie sistemas separados para cada produto ou site que você possui. Isso mantém as métricas financeiras de cada negócio isoladas e organizadas.
              </div>
            </div>
          )}

          {/* STEP 3: GATEWAYS CONCEPT */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="space-y-2">
                <span className="text-[9.5px] text-brand font-black uppercase tracking-wider">Etapa 3 de 6 • Motor Financeiro</span>
                <h2 className="text-xl xl:text-2xl font-black text-foreground">
                  O que são Gateways de Pagamento?
                </h2>
                <p className="text-slate/60 text-xs font-bold leading-relaxed">
                  São os provedores que vão de fato processar e receber o dinheiro das vendas (ex: Asaas, Stripe, PagBank). A Basileia Pay permite conectar e alternar entre vários gateways de forma transparente.
                </p>
              </div>

              {/* Interactive select provider */}
              <div className="bg-muted/10 p-4 rounded-2xl border border-border space-y-4">
                <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block">Simulador de provedor ativo</span>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9.5px] font-bold text-muted-foreground block">Provedor Selecionado</label>
                    <select
                      value={gatewayProvider}
                      onChange={e => {
                        setGatewayProvider(e.target.value);
                        addAuditLog('Simulação de Gateway', `Alterou provedor simulado para '${e.target.value}'`, 'info');
                      }}
                      className="w-full h-10 px-2 bg-card border border-border rounded-xl text-xs font-bold text-foreground focus:outline-none"
                    >
                      <option value="Asaas">Asaas</option>
                      <option value="Stripe">Stripe</option>
                      <option value="Mercado Pago">Mercado Pago</option>
                      <option value="PagBank">PagBank</option>
                      <option value="Pagar.me">Pagar.me</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={() => triggerToast(`Conexão com ${gatewayProvider} simulada com sucesso!`)}
                      className="w-full h-10 bg-brand text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-brand-dark transition-colors"
                    >
                      Testar Conexão
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-purple-500/5 border border-brand/20 p-4 rounded-xl text-[10.5px] font-bold text-foreground">
                📌 **Dica de Roteamento:** Conectando mais de um gateway, você pode ativar o **Roteamento Inteligente** para processar Pix em um provedor com taxas menores e cartões em outro com melhor aprovação.
              </div>
            </div>
          )}

          {/* STEP 4: CHECKOUTS CONCEPT */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="space-y-2">
                <span className="text-[9.5px] text-brand font-black uppercase tracking-wider">Etapa 4 de 6 • Aparência & Conversão</span>
                <h2 className="text-xl xl:text-2xl font-black text-[#1E1538] dark:text-foreground">
                  Customização de Checkouts
                </h2>
                <p className="text-slate/60 text-xs font-bold leading-relaxed">
                  O **Checkout Studio** permite criar interfaces de pagamento extremamente rápidas e otimizadas para conversão. Você decide quais métodos de pagamento estarão visíveis e a identidade visual da página.
                </p>
              </div>

              {/* Interactive customization preview */}
              <div className="bg-muted/10 p-4 rounded-2xl border border-border space-y-4">
                <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block">Personalize o Checkout no painel direito</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9.5px] font-bold text-muted-foreground block">Cor de Destaque</label>
                    <input
                      type="color"
                      value={checkoutThemeColor}
                      onChange={e => setCheckoutThemeColor(e.target.value)}
                      className="w-full h-9 rounded-lg cursor-pointer overflow-hidden p-0 border border-border bg-card"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9.5px] font-bold text-muted-foreground block">Habilitar Opções</label>
                    <div className="flex gap-4 pt-1.5 text-xs font-bold">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="checkbox" checked={allowCard} onChange={e => setAllowCard(e.target.checked)} className="rounded border-border text-brand focus:ring-brand w-3.5 h-3.5" />
                        Cartão
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="checkbox" checked={allowPix} onChange={e => setAllowPix(e.target.checked)} className="rounded border-border text-brand focus:ring-brand w-3.5 h-3.5" />
                        Pix
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-purple-500/5 border border-brand/20 p-4 rounded-xl text-[10.5px] font-bold text-foreground">
                📌 **Dica de Conversão:** Deixe apenas os métodos que fazem sentido para o seu produto. Menos opções na tela costumam reduzir a hesitação do cliente e aumentar a taxa de conversão final!
              </div>
            </div>
          )}

          {/* STEP 5: RELEASES & PUBLISH */}
          {step === 5 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="space-y-2">
                <span className="text-[9.5px] text-brand font-black uppercase tracking-wider">Etapa 5 de 6 • Deploy Seguro</span>
                <h2 className="text-xl xl:text-2xl font-black text-foreground">
                  Publicação de Versões (Releases)
                </h2>
                <p className="text-slate/60 text-xs font-bold leading-relaxed">
                  Toda alteração de checkout ou roteamento na Basileia Pay é salva primeiro em rascunho. Para colocá-la no ar, você publica uma **Release** assinada. Isso permite versionamento seguro e auditoria imutável.
                </p>
              </div>

              <div className="p-4 bg-muted/20 border border-border rounded-2xl flex items-center justify-between gap-3 text-xs">
                <div className="text-left space-y-0.5">
                  <span className="font-black text-foreground block">Versão de Exemplo</span>
                  <span className="text-muted-foreground block font-bold">
                    A versão v1.0.0 está marcada no painel direito como ativa.
                  </span>
                </div>
                <button
                  onClick={() => {
                    setIsPublished(!isPublished);
                    triggerToast(isPublished ? "Rascunho ativo!" : "Versão publicada!");
                    addAuditLog(isPublished ? 'Status Alterado' : 'Versão Publicada', 'Simulou alteração de release de checkout.', 'security');
                  }}
                  className="h-10 px-4 bg-brand text-white rounded-xl text-[10px] font-black uppercase tracking-wider shadow"
                >
                  {isPublished ? 'Despublicar' : 'Publicar v1.0.0'}
                </button>
              </div>

              <div className="bg-purple-500/5 border border-brand/20 p-4 rounded-xl text-[10.5px] font-bold text-foreground">
                📌 **Dica de Segurança:** Se publicar uma alteração e notar algum problema, você pode fazer o *rollback* imediato para a versão anterior em apenas um clique no menu de Checkouts.
              </div>
            </div>
          )}

          {/* STEP 6: TEST TRANSACTION */}
          {step === 6 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="space-y-2">
                <span className="text-[9.5px] text-brand font-black uppercase tracking-wider">Etapa 6 de 6 • Teste de Fluxo</span>
                <h2 className="text-xl xl:text-2xl font-black text-foreground">
                  Venda de Teste e Validação
                </h2>
                <p className="text-slate/60 text-xs font-bold leading-relaxed">
                  Antes de começar a vender de verdade, você pode gerar transações de simulação em ambiente Sandbox para garantir que todos os webhooks e APIs estão respondendo perfeitamente.
                </p>
              </div>

              {/* Interactive payment validation */}
              <div className="bg-muted/10 p-4 rounded-2xl border border-border space-y-4">
                <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block">Simulador de Transação</span>
                
                {paymentSuccess ? (
                  <div className="bg-green-500/10 border border-green-500/35 p-3 rounded-xl text-xs font-bold text-foreground flex items-center justify-between">
                    <span>✓ Transação simulada e aprovada!</span>
                    <button
                      onClick={() => {
                        setPaymentSuccess(false);
                        addAuditLog('Simulador Resetado', 'Testador pronto para nova venda.', 'info');
                      }}
                      className="text-[9px] font-black uppercase text-brand hover:underline"
                    >
                      Tentar de novo
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setPaymentSuccess(true);
                        addAuditLog('Venda Simulada', 'Transação Sandbox aprovada com sucesso.', 'success');
                        triggerToast("Venda simulada com sucesso!");
                      }}
                      className="w-full h-11 bg-brand text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-brand-dark transition-colors"
                    >
                      Simular Compra de R$ 150,00
                    </button>
                  </div>
                )}
              </div>

              <div className="bg-purple-500/5 border border-brand/20 p-4 rounded-xl text-[10.5px] font-bold text-foreground">
                📌 **Dica de Auditoria:** As vendas em Sandbox aparecem com a tag de teste e não acumulam no seu saldo de saque real, servindo exclusivamente para validação técnica da sua integração.
              </div>
            </div>
          )}

          {/* Stepper Buttons at bottom */}
          <div className="flex items-center justify-between pt-6 border-t border-border mt-6">
            {step > 1 ? (
              <button
                onClick={() => setStep((step - 1) as OnboardingStep)}
                className="px-4 py-2 text-muted-foreground hover:text-foreground text-xs font-black uppercase tracking-wider flex items-center gap-1 transition-all"
              >
                <ChevronLeft className="w-4 h-4" /> Voltar
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              {step < 6 ? (
                <button
                  onClick={() => setStep((step + 1) as OnboardingStep)}
                  className="px-5 py-2.5 bg-brand hover:bg-brand-dark text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-brand/10 transition-all"
                >
                  Continuar <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleCompleteOnboarding}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-green-500/10 transition-all"
                >
                  Concluir e Ir ao Painel <Check className="w-4.5 h-4.5" />
                </button>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Live Dynamic Visual preview & audit logs */}
        <div className="space-y-5 select-none w-full">

          {/* Dynamic Mockup Visual Preview Panel */}
          <div className="bg-card border border-border rounded-[24px] p-5 shadow-sm space-y-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block pb-1 border-b border-border">
              Visualização Operacional Ativa
            </span>

            <div className="bg-muted/15 border border-border rounded-[20px] p-4.5 shadow-md space-y-3.5">

              {/* Simulator of a payment checkout */}
              <div className="border border-border rounded-xl overflow-hidden shadow-sm bg-card">

                {/* Browser top-bar */}
                <div className="bg-muted/40 border-b border-border px-3 py-1.5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  </div>
                  <span className="text-[7.5px] font-mono text-muted-foreground truncate max-w-[150px]">
                    basileia.pay/checkout/{systemName.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'preview'}
                  </span>
                  <Lock className="w-2.5 h-2.5 text-slate-450 shrink-0" />
                </div>

                {/* Form preview */}
                <div className="p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div
                        style={{ backgroundColor: checkoutThemeColor }}
                        className="w-5 h-5 rounded-lg flex items-center justify-center text-white font-extrabold text-[9px] shadow transition-colors"
                      >
                        {systemName.substring(0, 1).toUpperCase() || 'B'}
                      </div>
                      <span className="text-[9.5px] font-black text-foreground tracking-tight">{systemName || 'Nome do Sistema'}</span>
                    </div>
                    <span className="text-[10px] font-black text-foreground">R$ 150,00</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[8px] font-black uppercase tracking-wider">
                    {allowCard ? (
                      <div
                        style={{ borderColor: checkoutThemeColor, color: checkoutThemeColor }}
                        className="p-1.5 border rounded-lg bg-brand/5 flex items-center justify-center gap-1 transition-colors"
                      >
                        <span>💳 Cartão</span>
                      </div>
                    ) : (
                      <div className="p-1.5 border border-border/40 rounded-lg text-muted-foreground/40 flex items-center justify-center line-through">
                        <span>💳 Cartão</span>
                      </div>
                    )}

                    {allowPix ? (
                      <div className="p-1.5 border border-border rounded-lg text-foreground flex items-center justify-center gap-1">
                        <span>⚡ Pix</span>
                      </div>
                    ) : (
                      <div className="p-1.5 border border-border/40 rounded-lg text-muted-foreground/40 flex items-center justify-center line-through">
                        <span>⚡ Pix</span>
                      </div>
                    )}
                  </div>

                  <button
                    style={{ backgroundColor: checkoutThemeColor }}
                    className="w-full h-8 rounded-lg text-white font-black text-[9px] uppercase tracking-wider shadow transition-colors flex items-center justify-center pointer-events-none"
                  >
                    Pagar R$ 150,00
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-[9px] font-bold text-muted-foreground text-center">
                <div className="bg-card p-2 rounded-lg border border-border">
                  <span className="text-[8px] text-muted-foreground block">Gateway</span>
                  <span className="text-foreground font-black block truncate">{gatewayProvider}</span>
                </div>
                <div className="bg-card p-2 rounded-lg border border-border">
                  <span className="text-[8px] text-muted-foreground block">Deploy</span>
                  <span className="text-foreground font-black block">{isPublished ? 'Versão Ativa' : 'Rascunho'}</span>
                </div>
                <div className="bg-card p-2 rounded-lg border border-border">
                  <span className="text-[8px] text-muted-foreground block">Status Operação</span>
                  <span className={`font-black block ${paymentSuccess ? 'text-green-500 animate-pulse' : 'text-muted-foreground/60'}`}>
                    {paymentSuccess ? 'Trx Aprovada' : 'Aguardando Trx'}
                  </span>
                </div>
              </div>

            </div>

          </div>

          {/* Audit Logs Trail Visual widget */}
          <div className="bg-card border border-border rounded-[24px] p-5 shadow-sm space-y-3 text-left">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block pb-1 border-b border-border">
              Trilha de Auditoria (Audit Logs)
            </span>

            <div className="space-y-2 max-h-[140px] overflow-y-auto no-scrollbar pr-1">
              {auditLogs.map((log, idx) => (
                <div key={idx} className="flex gap-2 text-[10.5px] leading-tight items-start bg-muted/20 p-2 rounded-xl border border-border">
                  <span className="text-[9px] font-mono text-muted-foreground shrink-0 pt-0.5">{log.timestamp}</span>
                  <div className="min-w-0">
                    <span className={`font-black block ${
                      log.type === 'success' ? 'text-green-500' : log.type === 'security' ? 'text-brand' : 'text-foreground'
                    }`}>
                      {log.event}
                    </span>
                    <span className="text-[9.5px] text-muted-foreground font-semibold block mt-0.5 leading-normal">{log.details}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
