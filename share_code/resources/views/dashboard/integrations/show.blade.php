@extends('dashboard.layouts.app')
@section('title', 'Guia de Integração - Basileia Vendas')

@section('content')
<div class="animate-up" style="max-width: 900px; margin: 0 auto; padding-bottom: 40px;">
    
    <div style="margin-bottom: 30px; text-align: left; display: flex; align-items: center; justify-content: space-between;">
        <div>
            <h2 style="font-size: 1.5rem; font-weight: 900; color: var(--bg-sidebar); letter-spacing: -1px;">Guia de Integração Basileia Secure</h2>
            <p style="font-size: 0.9rem; color: var(--text-muted);">Siga os 6 passos abaixo para conectar o sistema <strong>{{ $integration->name }}</strong>.</p>
        </div>
        <div style="display: flex; align-items: center; gap: 12px;">
            <div style="background: {{ ($integration->webhook_url && $integration->webhook_secret) ? '#ecfdf5' : '#fef2f2' }}; padding: 10px 16px; border-radius: 12px; display: flex; align-items: center; gap: 8px; border: 1px solid {{ ($integration->webhook_url && $integration->webhook_secret) ? '#10b981' : '#f87171' }};">
                <div style="width: 8px; height: 8px; border-radius: 50%; background: {{ ($integration->webhook_url && $integration->webhook_secret) ? '#10b981' : '#ef4444' }};"></div>
                <span style="font-size: 0.75rem; font-weight: 900; color: {{ ($integration->webhook_url && $integration->webhook_secret) ? '#065f46' : '#991b1b' }}; text-transform: uppercase;">
                    Sincronismo (Sync): {{ ($integration->webhook_url && $integration->webhook_secret) ? 'ATIVO' : 'PENDENTE' }}
                </span>
            </div>
            <a href="{{ route('dashboard.integrations.index') }}" style="text-decoration: none; color: var(--text-muted); font-size: 0.85rem; font-weight: 800; display: flex; align-items: center; gap: 8px; background: #fff; padding: 10px 16px; border-radius: 12px; border: 1px solid var(--border);">
                <i class="fas fa-arrow-left"></i> Voltar para Lista
            </a>
        </div>
    </div>

    @if(session('new_api_key'))
    <div class="card animate-up" style="background: #fefce8; border: 1px solid #eab308; padding: 20px; border-radius: 16px; margin-bottom: 30px; display: flex; align-items: center; justify-content: space-between; gap: 20px; box-shadow: 0 4px 6px -1px rgba(234, 179, 8, 0.1);">
        <div style="display: flex; align-items: center; gap: 16px;">
            <div style="width: 40px; height: 40px; background: #fde047; color: #854d0e; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">
                <i class="fas fa-key"></i>
            </div>
            <div>
                <h4 style="font-size: 0.95rem; font-weight: 900; color: #854d0e; margin-bottom: 2px;">Sua Nova API Key foi Gerada!</h4>
                <p style="font-size: 0.8rem; color: #a16207;">Copie agora, ela não aparecerá novamente após recarregar a página.</p>
            </div>
        </div>
        <div style="display: flex; align-items: center; gap: 12px; background: #fff; padding: 6px 6px 6px 16px; border-radius: 12px; border: 1px solid #fef08a;">
            <code style="font-size: 1.1rem; font-weight: 800; color: #854d0e; letter-spacing: 0.5px;">{{ session('new_api_key') }}</code>
            <button onclick="navigator.clipboard.writeText('{{ session('new_api_key') }}'); alert('Chave Copiada!')" style="background: var(--primary); color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 800; font-size: 0.8rem; cursor: pointer; display: flex; align-items: center; gap: 8px;">
                <i class="far fa-copy"></i> COPIAR CHAVE
            </button>
        </div>
    </div>
    @endif

    <!-- The 6-Step Vertical Guide -->
    <div style="display: grid; gap: 24px;">
        
        <!-- STEP 1 -->
        <div class="card" style="padding: 24px; border-left: 4px solid #e2e8f0; position: relative;">
            <div style="position: absolute; left: -14px; top: 22px; width: 24px; height: 24px; background: #e2e8f0; color: #475569; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 0.75rem;">1</div>
            <h4 style="font-size: 0.9rem; font-weight: 800; color: var(--bg-sidebar); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">PASSO 1 — Gerar o secret no Basileia Vendas</h4>
            <p style="font-size: 0.85rem; color: #475569; line-height: 1.6;">Vá nas configurações do <strong>Basileia Vendas</strong>, procure por <strong>"Integrações"</strong> ou <strong>"Checkout"</strong> e gere o <strong>Webhook Secret</strong>. Copie esse valor.</p>
        </div>

        <!-- STEP 2 -->
        <div class="card" style="padding: 24px; border-left: 4px solid var(--primary); background: rgba(124, 58, 237, 0.02);">
            <div style="position: absolute; left: -14px; top: 22px; width: 24px; height: 24px; background: var(--primary); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 0.75rem;">2</div>
            <h4 style="font-size: 0.9rem; font-weight: 800; color: var(--bg-sidebar); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">PASSO 2 — Chave de Segurança do Sync (Webhook Secret)</h4>
            <p style="font-size: 0.85rem; color: #475569; line-height: 1.6; margin-bottom: 16px;">Cole o secret do seu sistema de vendas abaixo. Isso permite que o Checkout <b>sincronize os pagamentos de volta</b> com segurança.</p>
            
            <form action="{{ route('dashboard.integrations.update', $integration->id) }}" method="POST" style="display: flex; gap: 12px;">
                @csrf
                @method('PUT')
                <input type="text" name="webhook_secret" value="{{ $integration->webhook_secret }}" placeholder="Cole o whsec_... aqui" style="flex: 1; padding: 12px 16px; border-radius: 10px; border: 1px solid var(--border); background: #fff; font-family: monospace; font-size: 0.9rem;">
                <button type="submit" class="btn" style="background: var(--primary); color: white; padding: 0 20px; border-radius: 10px; font-weight: 800; border: none; cursor: pointer;">Salvar</button>
            </form>
        </div>

        <!-- STEP 3 -->
        <div class="card" style="padding: 24px; border-left: 4px solid #e2e8f0; position: relative;">
            <div style="position: absolute; left: -14px; top: 22px; width: 24px; height: 24px; background: #e2e8f0; color: #475569; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 0.75rem;">3</div>
            <h4 style="font-size: 0.9rem; font-weight: 800; color: var(--bg-sidebar); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">PASSO 3 — Pegar a URL do webhook do Vendas</h4>
            <p style="font-size: 0.85rem; color: #475569; line-height: 1.6;">Ainda nas configurações do Basileia Vendas, copie a <strong>URL do endpoint de webhook</strong>. Vai ser algo como <code>basileia-vendas.com/api/webhook/checkout</code>.</p>
        </div>

        <!-- STEP 4 -->
        <div class="card" style="padding: 24px; border-left: 4px solid var(--primary); background: rgba(124, 58, 237, 0.02);">
            <div style="position: absolute; left: -14px; top: 22px; width: 24px; height: 24px; background: var(--primary); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 0.75rem;">4</div>
            <h4 style="font-size: 0.9rem; font-weight: 800; color: var(--bg-sidebar); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">PASSO 4 — Destino do Sincronismo (URL de Webhook)</h4>
            <p style="font-size: 0.85rem; color: #475569; line-height: 1.6; margin-bottom: 16px;">Indique para onde o Checkout deve enviar os avisos de pagamento aprovado. Geralmente termina em <code>/api/webhook/checkout</code>.</p>
            
            <form action="{{ route('dashboard.integrations.update', $integration->id) }}" method="POST" style="display: flex; gap: 12px;">
                @csrf
                @method('PUT')
                <input type="url" name="webhook_url" value="{{ $integration->webhook_url }}" placeholder="https://seu-vendas.com/api/webhook/checkout" style="flex: 1; padding: 12px 16px; border-radius: 10px; border: 1px solid var(--border); background: #fff; font-size: 0.9rem;">
                <button type="submit" class="btn" style="background: var(--primary); color: white; padding: 0 20px; border-radius: 10px; font-weight: 800; border: none; cursor: pointer;">Salvar URL</button>
            </form>
        </div>

        <!-- STEP 5 -->
        <div class="card" style="padding: 24px; border-left: 4px solid var(--success-dark); background: rgba(16, 185, 129, 0.02); border-left-color: #10b981;">
            <div style="position: absolute; left: -14px; top: 22px; width: 24px; height: 24px; background: #10b981; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 0.75rem;">5</div>
            <h4 style="font-size: 0.9rem; font-weight: 800; color: var(--bg-sidebar); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">PASSO 5 — Pegar a URL do Checkout e colocar no Vendas</h4>
            <p style="font-size: 0.85rem; color: #475569; line-height: 1.6; margin-bottom: 20px;">Agora o caminho inverso. Copie os dados abaixo e cole nas configurações do <strong>Basileia Vendas</strong>.</p>
            
            <div style="display: grid; gap: 16px;">
                <div style="background: #fff; padding: 16px; border-radius: 10px; border: 1px solid var(--border);">
                    <label style="display: block; font-size: 0.65rem; font-weight: 800; text-transform: uppercase; color: var(--text-muted); margin-bottom: 6px;">Checkout URL (Cole no Vendas)</label>
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <code style="font-weight: 700; color: var(--primary); font-size: 1rem;">{{ request()->getSchemeAndHttpHost() }}</code>
                        <button onclick="navigator.clipboard.writeText('{{ request()->getSchemeAndHttpHost() }}'); alert('Copiado!')" style="background: none; border: none; color: var(--primary); cursor: pointer; font-weight: 800; font-size: 0.75rem;"><i class="far fa-copy"></i> Copiar</button>
                    </div>
                </div>

                <div style="background: #fff; padding: 16px; border-radius: 12px; border: 1px solid var(--border);">
                    <label style="display: block; font-size: 0.65rem; font-weight: 800; text-transform: uppercase; color: var(--text-muted); margin-bottom: 8px;">API Key (Bearer Auth para o Vendas)</label>
                    <div style="display: flex; align-items: center; justify-content: space-between; gap: 16px;">
                        
                        <div style="flex: 1; display: flex; align-items: center; gap: 10px;">
                            @if(session('new_api_key'))
                                <code style="font-weight: 800; color: #854d0e; font-size: 0.95rem; background: #fefce8; border: 1px dashed #eab308; padding: 10px 14px; border-radius: 10px; flex: 1;">{{ session('new_api_key') }}</code>
                                <button onclick="navigator.clipboard.writeText('{{ session('new_api_key') }}'); alert('Chave Copiada!')" style="background: var(--primary); color: white; border: none; padding: 12px 20px; border-radius: 10px; font-size: 0.75rem; font-weight: 900; cursor: pointer; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 6px -1px rgba(124, 58, 237, 0.1);">
                                    <i class="far fa-copy"></i> COPIAR
                                </button>
                            @else
                                <code style="font-weight: 700; color: var(--primary); font-size: 1.1rem; background: #f8fafc; padding: 10px 14px; border-radius: 10px; flex: 1; border: 1px solid var(--border);">{{ $integration->api_key_prefix }}••••••••••••••</code>
                            @endif
                        </div>

                        <form action="{{ route('dashboard.integrations.regenerate-key', $integration->id) }}" method="POST" style="margin: 0;">
                            @csrf
                            <button type="submit" style="background: #f1f5f9; color: #475569; border: none; padding: 12px 16px; border-radius: 10px; font-weight: 800; font-size: 0.75rem; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.2s ease;">
                                <i class="fas fa-sync-alt"></i> REGENERAR
                            </button>
                        </form>
                    </div>
                    @if(!session('new_api_key'))
                        <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 10px; display: flex; align-items: center; gap: 6px;">
                            <i class="fas fa-info-circle text-primary"></i> 
                            A chave é exibida apenas uma vez após a geração por segurança. Clique em Regenerar caso precise de uma nova.
                        </p>
                    @endif
                </div>
            </div>
        </div>

        <!-- STEP 6 -->
        <div class="card" style="padding: 24px; border-left: 4px solid #e2e8f0; position: relative;">
            <div style="position: absolute; left: -14px; top: 22px; width: 24px; height: 24px; background: #e2e8f0; color: #475569; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 0.75rem;">6</div>
            <h4 style="font-size: 0.9rem; font-weight: 800; color: var(--bg-sidebar); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">PASSO 6 — Testar a Integração</h4>
            <p style="font-size: 0.85rem; color: #475569; line-height: 1.6;">Crie uma venda no <strong>Basileia Vendas</strong> e verifique se o link foi gerado automaticamente. Verifique se a tela do Checkout abre corretamente e se o status atualiza após um pagamento de teste.</p>
            <div style="margin-top: 16px; padding: 12px; background: #f8fafc; border-radius: 8px; font-size: 0.8rem; color: #1e293b;">
                <i class="fas fa-info-circle" style="color: var(--primary); margin-right: 8px;"></i>
                Use os logs em <strong>Webhooks</strong> para monitorar as notificações enviadas.
            </div>
        </div>

    </div>
</div>
@endsection
