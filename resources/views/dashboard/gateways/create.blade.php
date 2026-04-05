@extends('dashboard.layouts.app')

@section('title', 'Novo Gateway')

@section('content')
<div class="animate-up" style="max-width: 900px; margin: 0 auto;">
    <!-- Elite Header Section -->
    <div style="margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between;">
        <div>
            <a href="{{ route('dashboard.gateways.index') }}" style="text-decoration: none; color: var(--primary); font-weight: 800; font-size: 0.75rem; display: flex; align-items: center; gap: 6px; margin-bottom: 8px;">
                <i class="fas fa-arrow-left"></i> VOLTAR PARA LISTA
            </a>
            <h2 style="font-size: 1.5rem; font-weight: 900; color: var(--bg-sidebar); letter-spacing: -0.5px;">Configurar Novo Gateway</h2>
            <p style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600;">Conecte sua conta de processamento para habilitar vendas em tempo real.</p>
        </div>
        <div style="width: 64px; height: 64px; background: rgba(124, 58, 237, 0.1); color: var(--primary); border-radius: 20px; display: flex; align-items: center; justify-content: center; font-size: 1.8rem;">
            <i class="fas fa-wallet"></i>
        </div>
    </div>

    <form action="{{ route('dashboard.gateways.store') }}" method="POST">
        @csrf
        
        <div class="card" style="padding: 40px; border-radius: 28px; border: 1px solid var(--border); box-shadow: var(--shadow-lg); background: #fff;">
            
            <!-- SECTION: Identificação -->
            <div style="margin-bottom: 40px;">
                <h4 style="font-size: 0.75rem; font-weight: 900; color: var(--primary); text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 24px; display: flex; align-items: center; gap: 10px;">
                    <div style="width: 24px; height: 2px; background: var(--primary); border-radius: 2px;"></div>
                    1. Identificação do Sistema
                </h4>
                
                <div style="display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 30px;">
                    <div class="form-group">
                        <label style="display: block; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; color: var(--text-muted); margin-bottom: 10px; letter-spacing: 0.5px;">Nome Interno</label>
                        <input type="text" name="name" required placeholder="Ex: Asaas - Loja Principal" value="{{ old('name') }}" style="width: 100%; height: 52px; padding: 0 20px; border-radius: 14px; border: 1px solid var(--border); background: #f8fafc; font-size: 0.95rem; font-weight: 600; outline: none; transition: all 0.2s ease;">
                    </div>
                    <div class="form-group">
                        <label style="display: block; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; color: var(--text-muted); margin-bottom: 10px; letter-spacing: 0.5px;">Plataforma (Tipo)</label>
                        <select name="slug" id="slug" required style="width: 100%; height: 52px; padding: 0 20px; border-radius: 14px; border: 1px solid var(--border); background: #f8fafc; font-size: 0.95rem; font-weight: 600; outline: none; cursor: pointer; appearance: none;">
                            <option value="asaas">Asaas (Brasil)</option>
                            <option value="stripe">Stripe (Global)</option>
                            <option value="pagseguro">PagSeguro</option>
                            <option value="mercadopago">Mercado Pago</option>
                            <option value="paypal">PayPal</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- SECTION: Credenciais de API -->
            <div style="margin-bottom: 40px;">
                <h4 style="font-size: 0.75rem; font-weight: 900; color: var(--primary); text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 24px; display: flex; align-items: center; gap: 10px;">
                    <div style="width: 24px; height: 2px; background: var(--primary); border-radius: 2px;"></div>
                    2. Segurança de Conexão (API)
                </h4>

                <div style="display: grid; gap: 24px;">
                    <div class="form-group">
                        <label style="display: block; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; color: var(--text-muted); margin-bottom: 10px; letter-spacing: 0.5px;">API Key / Chave de Produção</label>
                        <input type="password" name="config[api_key]" required placeholder="Insira sua chave de acesso" style="width: 100%; height: 52px; padding: 0 20px; border-radius: 14px; border: 1px solid var(--border); background: #f8fafc; font-size: 0.95rem; font-weight: 600;">
                    </div>

                    <div style="display: flex; gap: 30px; align-items: center; background: #f8fafc; padding: 20px; border-radius: 18px; border: 1px solid var(--border-light);">
                        <label style="display: flex; align-items: center; gap: 12px; cursor: pointer; font-size: 0.85rem; font-weight: 700; color: var(--text-main);">
                            <input type="checkbox" name="config[sandbox]" value="1" style="width: 20px; height: 20px; accent-color: var(--primary);">
                            Modo Sandbox (Testes)
                        </label>
                        <div style="width: 1px; height: 24px; background: var(--border);"></div>
                        <label style="display: flex; align-items: center; gap: 12px; cursor: pointer; font-size: 0.85rem; font-weight: 700; color: var(--text-main);">
                            <input type="checkbox" name="is_default" value="1" style="width: 20px; height: 20px; accent-color: var(--primary);">
                            Definir como Padrão
                        </label>
                    </div>
                </div>
            </div>

            <!-- SECTION: Webhook Evolution -->
            <div id="webhook-section" style="display: none; margin-bottom: 30px;">
                <h4 style="font-size: 0.75rem; font-weight: 900; color: var(--elite-purple); text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 24px; display: flex; align-items: center; gap: 10px;">
                    <div style="width: 24px; height: 2px; background: var(--elite-purple); border-radius: 2px;"></div>
                    3. Automação / Webhook
                </h4>

                <div style="background: #0f172a; padding: 30px; border-radius: 24px; border: 1px solid rgba(255,255,255,0.05); box-shadow: var(--shadow-xl);">
                    <div style="margin-bottom: 24px;">
                        <label style="display: block; font-size: 0.65rem; font-weight: 800; text-transform: uppercase; color: #64748b; margin-bottom: 12px; letter-spacing: 1px;">Endpoint do seu Painel Asaas</label>
                        <div style="display: flex; background: rgba(255,255,255,0.03); border-radius: 14px; border: 1px solid rgba(255,255,255,0.1); overflow: hidden;">
                            <input type="text" id="webhook-url-display" readonly style="flex: 1; min-width: 0; background: transparent; border: none; color: #818cf8; padding: 16px 20px; font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; outline: none;">
                            <button type="button" onclick="copyWebhookUrl()" class="btn" style="background: var(--primary); color: white; border-radius: 0; padding: 0 24px; font-size: 0.75rem; font-weight: 900;">
                                <i class="fas fa-copy"></i> COPIAR
                            </button>
                        </div>
                        <p style="font-size: 0.75rem; color: #475569; margin-top: 10px; font-weight: 600;">
                            <i class="fas fa-info-circle"></i> Cole este endereço nas configurações de webhook da plataforma.
                        </p>
                    </div>

                    <div class="form-group">
                        <label style="display: block; font-size: 0.65rem; font-weight: 800; text-transform: uppercase; color: #64748b; margin-bottom: 12px; letter-spacing: 1px;">API Secret / Webhook Token</label>
                        <input type="password" name="config[webhook_token]" placeholder="Token de autenticidade (segredo)" style="width: 100%; height: 52px; padding: 0 20px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.03); color: white; font-size: 0.95rem; outline: none;">
                    </div>
                </div>
            </div>

            <!-- ACTIONS -->
            <div style="display: flex; gap: 15px; margin-top: 20px;">
                <button type="submit" class="btn" style="height: 60px; flex: 1; background: var(--primary); color: white; font-weight: 900; font-size: 0.95rem; border-radius: 18px; box-shadow: 0 10px 20px -5px rgba(124, 58, 237, 0.4);">
                    <i class="fas fa-save" style="font-size: 1.1rem;"></i> CONFIRMAR E SALVAR GATEWAY
                </button>
            </div>
        </div>
    </form>
</div>

@stack('scripts')
<script>
    document.addEventListener('DOMContentLoaded', function() {
        const slugSelect = document.getElementById('slug');
        const webhookSection = document.getElementById('webhook-section');
        const webhookUrlDisplay = document.getElementById('webhook-url-display');
        const baseUrl = "{{ url('/api/webhooks/gateway') }}";

        function updateWebhookSection() {
            const val = slugSelect.value;
            if (['asaas', 'stripe', 'pagseguro', 'mercadopago'].includes(val)) {
                webhookSection.style.display = 'block';
                webhookUrlDisplay.value = `${baseUrl}/${val}`;
            } else {
                webhookSection.style.display = 'none';
            }
        }

        slugSelect.addEventListener('change', updateWebhookSection);
        updateWebhookSection();
    });

    function copyWebhookUrl() {
        const display = document.getElementById('webhook-url-display');
        display.select();
        document.execCommand('copy');
        
        const btn = event.currentTarget;
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> COPIADO!';
        btn.style.background = '#10b981';
        
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = 'var(--primary)';
        }, 2000);
    }
</script>
@endsection
