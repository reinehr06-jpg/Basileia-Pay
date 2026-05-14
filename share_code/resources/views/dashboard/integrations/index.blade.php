@extends('dashboard.layouts.app')
@section('title', 'Integrações')

@section('header_actions')
    <button onclick="toggleDrawer('drawer-create', true)" class="btn" style="background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.3); padding: 10px 20px; border-radius: 12px; font-weight: 900; font-size: 0.8rem; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.2s ease;">
        <i class="fas fa-plus-circle"></i> NOVA INTEGRAÇÃO
    </button>
@endsection

@section('content')
<!-- Metric Bar -->
<div class="kpi-grid" style="margin-bottom: 24px;">
    <div class="kpi-card animate-up" style="animation-delay: 0.1s;">
        <div class="label">Sistemas Conectados</div>
        <div class="value">{{ $integrations->count() }}</div>
        <i class="fas fa-plug kpi-icon"></i>
    </div>
    <div class="kpi-card animate-up" style="animation-delay: 0.2s; border-left: 3px solid var(--success);">
        <div class="label">Integrações Ativas</div>
        <div class="value">{{ $integrations->where('status', 'active')->count() }}</div>
        <i class="fas fa-check-circle kpi-icon"></i>
    </div>
    <div class="kpi-card animate-up" style="animation-delay: 0.3s;">
        <div class="label">Vendas Processadas</div>
        <div class="value">{{ number_format($integrations->sum('transactions_count')) }}</div>
        <i class="fas fa-exchange-alt kpi-icon"></i>
    </div>
    <div class="kpi-card animate-up" style="animation-delay: 0.4s; border-left: 3px solid var(--primary-light);">
        <div class="label">Saúde das APIs</div>
        <div class="value">100%</div>
        <i class="fas fa-heartbeat kpi-icon"></i>
    </div>
</div>

<!-- Filter Bar Elite -->
<div class="card animate-up" style="padding: 12px 20px; margin-bottom: 24px; border-radius: 16px; display: flex; align-items: center; justify-content: space-between; background: #fff; border: 1px solid var(--border);">
    <div style="display: flex; align-items: center; gap: 15px;">
        <div style="font-size: 0.7rem; font-weight: 900; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Filtrar por:</div>
        <div style="position: relative;">
            <select style="appearance: none; background: #f8fafc; border: 1px solid var(--border); padding: 8px 36px 8px 16px; border-radius: 10px; font-size: 0.8rem; font-weight: 700; color: var(--text-primary); cursor: pointer; min-width: 180px;">
                <option>Todos os Status</option>
                <option>Ativos</option>
                <option>Pausados</option>
            </select>
            <i class="fas fa-chevron-down" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); font-size: 0.6rem; color: var(--text-muted); pointer-events: none;"></i>
        </div>
        <div style="position: relative;">
            <input type="text" placeholder="Buscar sistema..." style="background: #f8fafc; border: 1px solid var(--border); padding: 8px 16px; border-radius: 10px; font-size: 0.8rem; font-weight: 600; min-width: 240px;">
        </div>
    </div>
    <div style="display: flex; align-items: center; gap: 12px;">
        <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">Exibindo {{ $integrations->count() }} resultados</span>
        <button class="btn" style="background: #f1f5f9; color: #475569; border: none; padding: 10px; border-radius: 10px; cursor: pointer;"><i class="fas fa-sync-alt"></i></button>
    </div>
</div>

<!-- Grid List -->
<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 24px;">
    @forelse($integrations as $int)
        <div class="card animate-up" style="padding: 24px; border-radius: 20px; transition: all 0.3s ease; position: relative; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between; min-height: 220px; box-shadow: var(--shadow-sm); border: 1px solid var(--border);">
            <div style="position: absolute; top: 0; right: 0; padding: 16px;">
                @if($int->status === 'active')
                    <span style="background: #ecfdf5; color: #10b981; padding: 6px 12px; border-radius: 8px; font-size: 0.65rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px;">Ativo</span>
                @else
                    <span style="background: #fef2f2; color: #ef4444; padding: 6px 12px; border-radius: 8px; font-size: 0.65rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px;">Pausado</span>
                @endif
            </div>

            <div>
                <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px;">
                    <div style="width: 52px; height: 52px; background: rgba(124, 58, 237, 0.08); color: var(--primary); border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; border: 1px solid rgba(124, 58, 237, 0.1);">
                        <i class="fas fa-plug"></i>
                    </div>
                    <div>
                        <h3 style="font-size: 1.15rem; font-weight: 900; color: var(--bg-sidebar); margin-bottom: 2px;">{{ $int->name }}</h3>
                        <div style="display: flex; align-items: center; gap: 6px;">
                             <i class="fas fa-link" style="font-size: 0.65rem; color: var(--text-muted);"></i>
                             <p style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">{{ Str::limit($int->base_url, 35) }}</p>
                        </div>
                    </div>
                </div>
                
                <div style="background: #f8fafc; padding: 14px; border-radius: 14px; margin-bottom: 20px; border: 1px solid var(--border-light);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <span style="font-size: 0.7rem; font-weight: 800; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px;">Chave de Acesso</span>
                        <code style="font-size: 0.85rem; font-weight: 800; color: var(--primary); background: #fff; padding: 2px 8px; border-radius: 6px; border: 1px solid var(--border);">{{ $int->api_key_prefix }}...</code>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div style="display: flex; align-items: center; gap: 6px;">
                            <span style="font-size: 0.7rem; font-weight: 800; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px;">Performance</span>
                            <i class="fas fa-info-circle" style="font-size: 0.6rem; color: var(--text-muted);"></i>
                        </div>
                        <span style="font-size: 1rem; font-weight: 900; color: var(--bg-sidebar);">{{ number_format($int->transactions_count ?? 0) }} <span style="font-size: 0.7rem; font-weight: 700; color: var(--text-muted);">vendas</span></span>
                    </div>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 12px;">
                <a href="{{ route('dashboard.integrations.show', $int->id) }}" class="btn" style="background: var(--primary); color: white; border: none; padding: 14px; border-radius: 12px; font-weight: 800; font-size: 0.85rem; text-decoration: none; text-align: center; transition: all 0.2s ease; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.2);">
                     DADOS DA CONEXÃO
                </a>
                <form method="POST" action="{{ route('dashboard.integrations.toggle', $int->id) }}" style="display: inline;">
                    @csrf
                    <button type="submit" style="width: 100%; background: #f1f5f9; color: #475569; border: 1px solid var(--border); padding: 14px; border-radius: 12px; font-weight: 800; font-size: 0.85rem; cursor: pointer; transition: all 0.2s ease;">
                        {{ $int->status === 'active' ? 'PAUSAR' : 'ATIVAR' }}
                    </button>
                </form>
            </div>
        </div>
    @empty
        <div class="card animate-up" style="grid-column: 1 / -1; padding: 80px 24px; text-align: center; background: #fff; border: 2px dashed var(--border);">
            <div style="width: 80px; height: 80px; background: #f8fafc; color: var(--text-muted); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; margin: 0 auto 24px; opacity: 0.5;">
                <i class="fas fa-network-wired"></i>
            </div>
            <h3 style="font-size: 1.4rem; font-weight: 900; color: var(--bg-sidebar); margin-bottom: 8px;">Nenhum sistema conectado</h3>
            <p style="font-size: 0.95rem; color: var(--text-muted); max-width: 440px; margin: 0 auto 30px;">Comece conectando sua primeira plataforma de vendas para automatizar seus recebimentos.</p>
            <button onclick="toggleDrawer('drawer-create', true)" class="btn" style="background: var(--primary); color: white; border: none; padding: 16px 32px; border-radius: 14px; font-weight: 900; font-size: 0.95rem; cursor: pointer; box-shadow: 0 10px 20px -5px rgba(124, 58, 237, 0.4);">
                CRIAR MINHA PRIMEIRA CONEXÃO
            </button>
        </div>
    @endforelse
</div>

<!-- Side Drawer Create (Premium Panel) -->
<div id="drawer-create" class="drawer-overlay" onclick="if(event.target === this) toggleDrawer('drawer-create', false)">
    <div class="drawer-content">
        <div class="drawer-header">
            <div>
                <h3>Nova Integração</h3>
                <p style="font-size: 0.75rem; opacity: 0.8; font-weight: 600;">Siga os 7 passos para conectar ao Basileia Vendas.</p>
            </div>
            <button class="drawer-close" onclick="toggleDrawer('drawer-create', false)">
                <i class="fas fa-times"></i>
            </button>
        </div>
        
        <div class="drawer-body">
            <form id="form-create-integration" method="POST" action="{{ route('dashboard.integrations.store') }}">
                @csrf
                
                <div class="integration-step-list">
                    <!-- PASSO 1 -->
                    <div class="integration-step-item">
                        <div class="step-badge">1</div>
                        <div class="step-content">
                            <h4>PASSO 1 — Gerar o secret no Basileia Vendas</h4>
                            <p>Vá nas configurações do Basileia Vendas, procure por "Integrações" ou "Checkout" e gere o Webhook Secret. Copie esse valor.</p>
                        </div>
                    </div>

                    <!-- PASSO 2 -->
                    <div class="integration-step-item">
                        <div class="step-badge">2</div>
                        <div class="step-content">
                            <h4>PASSO 2 — Chave de Segurança do Sync (Webhook Secret)</h4>
                            <p>Cole o secret gerado no Vendas. Isso permite que o Checkout <b>sincronize as vendas</b> com segurança.</p>
                            <div class="form-group-elite" style="margin-top: 12px;">
                                <div class="input-group-elite">
                                    <i class="fas fa-key input-group-icon"></i>
                                    <input type="text" name="webhook_secret" id="webhook_secret" class="input-elite" placeholder="whsec_..." required>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- PASSO 3 -->
                    <div class="integration-step-item">
                        <div class="step-badge">3</div>
                        <div class="step-content">
                            <h4>PASSO 3 — Pegar a URL do webhook do Vendas</h4>
                            <p>Ainda nas configurações do Basileia Vendas, copie a URL do endpoint de webhook (ex: vendas.com/api/webhook/checkout).</p>
                        </div>
                    </div>

                    <!-- PASSO 4 -->
                    <div class="integration-step-item">
                        <div class="step-badge">4</div>
                        <div class="step-content">
                            <h4>PASSO 4 — Destino do Sincronismo (URL de Webhook)</h4>
                            <p>Cole essa URL no campo abaixo. É para cá que o Checkout enviará as notificações de pagamento aprovado.</p>
                            <div class="form-group-elite" style="margin-top: 12px;">
                                <div class="input-group-elite">
                                    <i class="fas fa-link input-group-icon"></i>
                                    <input type="url" name="webhook_url" id="webhook_url" class="input-elite" placeholder="https://vendas.basileia.global/api/webhook/checkout" required>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- PASSO 5 -->
                    <div class="integration-step-item">
                        <div class="step-badge">5</div>
                        <div class="step-content">
                            <h4>PASSO 5 — Pegar a URL do Checkout e colocar no Vendas</h4>
                            <p>Copie a URL abaixo e cole nas configurações do Basileia Vendas no campo <b>Checkout URL</b>.</p>
                            <div class="input-group-elite" style="margin-top: 12px; background: #f1f5f9; padding: 10px; border-radius: 12px; border: 1px dashed var(--primary);">
                                <code id="checkout-url-text" style="font-size: 0.8rem; font-weight: 800; color: var(--primary);">https://secure.basileia.global</code>
                                <button type="button" onclick="copyToClipboard('https://secure.basileia.global', this)" style="background: var(--primary); color: white; border: none; padding: 5px 12px; border-radius: 8px; font-size: 0.6rem; cursor: pointer; font-weight: 900; margin-left: auto;">COPIAR</button>
                            </div>
                        </div>
                    </div>

                    <!-- PASSO 6 -->
                    <div class="integration-step-item">
                        <div class="step-badge">6</div>
                        <div class="step-content">
                            <h4>PASSO 6 — Testar a Integração</h4>
                            <p>Crie uma venda no Vendas e verifique se o link foi gerado automaticamente. Realize um pagamento e veja se o status mudou.</p>
                        </div>
                    </div>

                    <!-- PASSO 7 -->
                    <div class="integration-step-item" style="border-left: 2px solid var(--success);">
                        <div class="step-badge" style="background: var(--success);">7</div>
                        <div class="step-content">
                            <h4>PASSO 7 — Identificar e Gerar API Key</h4>
                            <p>Dê um nome para esta conexão. O sistema gerará sua <b>API KEY</b> exclusiva para autenticação.</p>
                            <div class="form-group-elite" style="margin-top: 12px;">
                                <div class="input-group-elite">
                                    <i class="fas fa-desktop input-group-icon"></i>
                                    <input type="text" name="name" id="name" class="input-elite" placeholder="Ex: Basileia Vendas - Loja Principal" required>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <input type="hidden" name="base_url" value="https://vendas.basileia.global">
            </form>
        </div>

        <div class="drawer-footer">
            <button type="button" class="btn" onclick="toggleDrawer('drawer-create', false)" style="flex: 1; height: 50px; background: #f8fafc; border: 1px solid var(--border); color: var(--text-muted); border-radius: 12px; font-weight: 800;">CANCELAR</button>
            <button type="submit" form="form-create-integration" class="btn btn-primary" style="flex: 2; height: 50px; justify-content: center; border-radius: 12px; font-weight: 900; box-shadow: 0 10px 20px -5px rgba(124, 58, 237, 0.3);">CONFIRMAR CRIAÇÃO</button>
        </div>
    </div>
</div>

<script>
    function toggleDrawer(id, show) {
        const drawer = document.getElementById(id);
        if (show) {
            drawer.classList.add('active');
            document.body.style.overflow = 'hidden';
        } else {
            drawer.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    // Copy to clipboard function
    function copyToClipboard(text, btn) {
        navigator.clipboard.writeText(text).then(() => {
            const originalText = btn.innerText;
            btn.innerText = 'COPIADO!';
            btn.style.background = '#10b981';
            setTimeout(() => {
                btn.innerText = originalText;
                btn.style.background = 'var(--primary)';
            }, 2000);
        });
    }

    // Escape to close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') toggleDrawer('drawer-create', false);
    });
</script>

<style>
    .integration-step-list {
        display: flex;
        flex-direction: column;
        gap: 0;
    }
    .integration-step-item {
        display: flex;
        gap: 20px;
        padding: 20px 0;
        border-left: 2px solid #e2e8f0;
        margin-left: 15px;
        padding-left: 25px;
        position: relative;
    }
    .step-badge {
        position: absolute;
        left: -16px;
        top: 22px;
        width: 30px;
        height: 30px;
        background: var(--primary);
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.8rem;
        font-weight: 900;
        box-shadow: 0 4px 10px rgba(124, 58, 237, 0.3);
        z-index: 2;
    }
    .step-content h4 {
        font-size: 0.85rem;
        font-weight: 900;
        color: var(--bg-sidebar);
        margin-bottom: 6px;
        text-transform: uppercase;
        letter-spacing: 0.3px;
    }
    .step-content p {
        font-size: 0.8rem;
        color: var(--text-muted);
        line-height: 1.5;
        font-weight: 600;
    }
    .integration-step-item:last-child {
        border-left: 2px solid transparent;
    }
</style>
@endsection
