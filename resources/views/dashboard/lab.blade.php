@extends('dashboard.layouts.app')
@section('title', '🧪 Lab - Testes & Desenvolvimento')

@section('content')
<style>
.lab-container { padding: 30px; }
.lab-header { margin-bottom: 30px; }
.lab-header h1 { font-size: 1.75rem; font-weight: 800; color: var(--text-main); margin-bottom: 8px; }
.lab-header p { color: var(--text-secondary); }

.lab-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px; }

.lab-card { background: white; border-radius: 16px; padding: 24px; border: 1px solid var(--border-light); transition: all 0.2s; }
.lab-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0,0,0,0.08); }

.lab-card-header { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
.lab-card-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; }
.lab-card-icon.builder { background: linear-gradient(135deg, #7c3aed, #6366f1); color: white; }
.lab-card-icon.pix { background: linear-gradient(135deg, #10b981, #059669); color: white; }
.lab-card-icon.card { background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; }
.lab-card-icon.boleto { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; }

.lab-card h3 { font-size: 1.1rem; font-weight: 700; color: var(--text-main); margin-bottom: 4px; }
.lab-card span { font-size: 0.85rem; color: var(--text-secondary); }

.lab-card-actions { display: flex; gap: 10px; margin-top: 16px; }
.lab-btn { flex: 1; padding: 10px 16px; border-radius: 8px; font-weight: 600; font-size: 0.85rem; text-align: center; cursor: pointer; text-decoration: none; display: inline-block; }
.lab-btn-primary { background: var(--primary); color: white; border: none; }
.lab-btn-secondary { background: var(--bg-main); color: var(--text-main); border: 1px solid var(--border-light); }
.lab-btn-warning { background: #f59e0b; color: white; border: none; }

.section-title { font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px; margin-top: 30px; }
</style>

<div class="lab-container">
    <div class="lab-header">
        <h1>🧪 Lab - Testes & Desenvolvimento</h1>
        <p>Crie checkouts customizados, teste pagamentos e publique em produção</p>
    </div>

    <div class="section-title">Checkout Builder</div>
    <div class="lab-grid">
        <div class="lab-card">
            <div class="lab-card-header">
                <div class="lab-card-icon builder">🎨</div>
                <div>
                    <h3>Checkout Builder</h3>
                    <span>Editor visual de checkout</span>
                </div>
            </div>
            <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 16px;">
                Customize cores, campos, métodos de pagamento e layout. Visualize em tempo real e publique.
            </p>
            <div class="lab-card-actions">
                <a href="{{ route('dashboard.checkout-configs') }}" class="lab-btn lab-btn-primary">
                    ➕ Novo Checkout
                </a>
            </div>
        </div>
    </div>

    <div class="section-title">Testes de Pagamento</div>
    <div class="lab-grid">
        <div class="lab-card">
            <div class="lab-card-header">
                <div class="lab-card-icon pix">📱</div>
                <div>
                    <h3>Teste PIX</h3>
                    <span>Pagamento instantâneo</span>
                </div>
            </div>
            <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 16px;">
                Crie uma transação de teste com método PIX e visualize o checkout.
            </p>
            <div class="lab-card-actions">
                <a href="{{ url('/demo-criar/pix') }}" target="_blank" class="lab-btn lab-btn-primary">
                    👁️ Visualizar
                </a>
            </div>
        </div>

        <div class="lab-card">
            <div class="lab-card-header">
                <div class="lab-card-icon card">💳</div>
                <div>
                    <h3>Teste Cartão</h3>
                    <span>Cartão de crédito/débito</span>
                </div>
            </div>
            <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 16px;">
                Crie uma transação de teste com método cartão e visualize o checkout.
            </p>
            <div class="lab-card-actions">
                <a href="{{ url('/demo-criar/cartao') }}" target="_blank" class="lab-btn lab-btn-primary">
                    👁️ Visualizar
                </a>
            </div>
        </div>

        <div class="lab-card">
            <div class="lab-card-header">
                <div class="lab-card-icon boleto">📄</div>
                <div>
                    <h3>Teste Boleto</h3>
                    <span>Boleto bancário</span>
                </div>
            </div>
            <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 16px;">
                Crie uma transação de teste com método boleto e visualize o checkout.
            </p>
            <div class="lab-card-actions">
                <a href="{{ url('/demo-criar/boleto') }}" target="_blank" class="lab-btn lab-btn-primary">
                    👁️ Visualizar
                </a>
            </div>
        </div>
    </div>

    <div class="section-title">Fluxo de Trabalho</div>
    <div class="lab-card" style="max-width: 600px;">
        <h3 style="margin-bottom: 16px;">🚀 Como usar o Lab</h3>
        <ol style="padding-left: 20px; line-height: 2; color: var(--text-secondary);">
            <li>Clique em <strong>"Novo Checkout"</strong> para criar uma configuração</li>
            <li>Use o editor visual para customizear cores, campos e métodos</li>
            <li>Visualize o resultado em tempo real no painel direito</li>
            <li>Clique em <strong>"Publicar em Produção"</strong> para ativar</li>
            <li>Use os <strong>Testes de Pagamento</strong> para validar o checkout</li>
        </ol>
    </div>
</div>
@endsection