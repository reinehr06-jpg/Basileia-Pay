@extends('dashboard.layouts.app')

@section('title', 'Editar Gateway: ' . $gateway->name)

@section('content')
<div class="animate-up" style="max-width: 900px; margin: 0 auto;">
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px;">
        <div>
            <a href="{{ route('dashboard.gateways.index') }}" style="text-decoration: none; color: var(--text-muted); font-size: 0.8rem; font-weight: 700; display: flex; align-items: center; gap: 6px; margin-bottom: 8px;">
                <i class="fas fa-arrow-left"></i> VOLTAR PARA LISTA
            </a>
            <h2 style="font-size: 1.6rem; font-weight: 900; color: var(--bg-sidebar); letter-spacing: -1px;">Editar: {{ $gateway->name }} ⚡</h2>
            <p style="font-size: 0.9rem; color: var(--text-muted);">Atualize as credenciais ou configurações deste gateway.</p>
        </div>
        <div style="width: 60px; height: 60px; background: var(--primary-glow); color: var(--primary); border-radius: 18px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">
            <i class="fas fa-edit"></i>
        </div>
    </div>

    <form action="{{ route('dashboard.gateways.update', $gateway->id) }}" method="POST">
        @csrf
        @method('PUT')
        
        <div style="display: grid; grid-template-columns: 1fr 320px; gap: 24px; align-items: start;">
            <!-- Main Config -->
            <div class="card-premium animate-up" style="animation-delay: 0.1s;">
                <div style="margin-bottom: 30px;">
                    <h4 style="font-size: 1rem; font-weight: 800; color: var(--bg-sidebar); margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
                        <span style="width: 28px; height: 28px; background: var(--bg-sidebar); color: white; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 0.75rem;">1</span>
                        Identificação e Provedor
                    </h4>

                    <div class="form-group-elite">
                        <label for="name">Nome Interno do Gateway</label>
                        <div class="input-group-elite">
                            <i class="fas fa-tag input-group-icon"></i>
                            <input type="text" name="name" id="name" class="input-elite" placeholder="Ex: Asaas - Produção Principal" required value="{{ old('name', $gateway->name) }}">
                        </div>
                    </div>

                    <div class="form-group-elite">
                        <label for="slug">Plataforma (Somente leitura)</label>
                        <div class="input-group-elite">
                            <i class="fas fa-building-columns input-group-icon"></i>
                            <input type="text" class="input-elite" readonly value="{{ ucfirst($gateway->slug ?? 'Asaas') }}" style="background: var(--bg-main); opacity: 0.7;">
                        </div>
                        <p class="form-help-elite">A plataforma não pode ser alterada após a criação.</p>
                    </div>
                </div>

                <div style="border-top: 1px solid var(--border-light); padding-top: 30px;">
                    <h4 style="font-size: 1rem; font-weight: 800; color: var(--bg-sidebar); margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
                        <span style="width: 28px; height: 28px; background: var(--bg-sidebar); color: white; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 0.75rem;">2</span>
                        Credenciais de Acesso (API)
                    </h4>

                    <div class="form-group-elite">
                        <label for="api_key">Nova API Key (Deixe vazio para manter a atual)</label>
                        <div class="input-group-elite">
                            <i class="fas fa-key input-group-icon"></i>
                            <input type="password" name="config[api_key]" id="api_key" class="input-elite" placeholder="••••••••••••••••••••••••">
                        </div>
                    </div>

                    <div class="form-group-elite">
                        <label for="api_secret">Novo API Secret (Deixe vazio para manter o atual)</label>
                        <div class="input-group-elite">
                            <i class="fas fa-lock input-group-icon"></i>
                            <input type="password" name="config[api_secret]" id="api_secret" class="input-elite" placeholder="••••••••••••••••••••••••">
                        </div>
                    </div>

                    <div class="glass-section" style="margin-top: 20px;">
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                            <span style="font-size: 0.75rem; color: var(--text-secondary);">Ambiente global (.env): </span>
                            <span style="font-size: 0.75rem; font-weight: 700; padding: 2px 8px; border-radius: 4px; background: @if(config('services.asaas.environment') == 'production') #10b981 @else #f59e0b @endif; color: white;">
                                {{ config('services.asaas.environment') }}
                            </span>
                        </div>
                        <label class="checkbox-container" style="display: flex; align-items: center; gap: 12px; cursor: pointer;">
                            <input type="checkbox" name="config[sandbox]" value="1" {{ old('config.sandbox', $gateway->getConfig('sandbox', 2)) == 1 ? 'checked' : '' }} style="width: 18px; height: 18px; accent-color: var(--primary);">
                            <span style="font-size: 0.85rem; font-weight: 700; color: var(--text-primary);">Sobrescrever ambiente (marque para Sandbox, desmarque para Production)</span>
                        </label>
                    </div>
                </div>

                <div style="border-top: 1px solid var(--border-light); padding-top: 30px; margin-top: 30px;">
                    <h4 style="font-size: 1rem; font-weight: 800; color: var(--bg-sidebar); margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
                        <span style="width: 28px; height: 28px; background: #0ea5e9; color: white; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 0.75rem;">3</span>
                        Configuração de Webhook (Retorno)
                    </h4>

                    <div class="form-group-elite">
                        <label>URL de Callback (Para configurar no Gateway)</label>
                        <div class="input-group-elite" style="background: var(--bg-main); border-style: dashed;">
                            <i class="fas fa-link input-group-icon"></i>
                            <input type="text" class="input-elite" value="{{ url('/api/webhooks/asaas') }}" readonly style="cursor: pointer; color: var(--primary); font-weight: 700;" onclick="this.select(); navigator.clipboard.writeText(this.value); alert('URL copiada!');">
                        </div>
                        <p class="form-help-elite">Copie esta URL e cole no painel do seu provedor (Ex: Asaas > Configurações de Webhook).</p>
                    </div>

                    <div class="form-group-elite">
                        <label for="webhook_token">Novo Webhook Access Token (Deixe vazio para manter)</label>
                        <div class="input-group-elite">
                            <i class="fas fa-shield-halved input-group-icon"></i>
                            <input type="password" name="config[webhook_token]" id="webhook_token" class="input-elite" placeholder="••••••••••••••••••••••••">
                        </div>
                    </div>
                </div>
            </div>

            <!-- Sidebar Actions -->
            <div class="animate-up" style="animation-delay: 0.2s;">
                <div class="card-premium" style="padding: 24px;">
                    <h5 style="font-size: 0.75rem; font-weight: 900; text-transform: uppercase; color: var(--text-muted); margin-bottom: 16px; letter-spacing: 0.5px;">Status e Visibilidade</h5>
                    
                    <div style="margin-bottom: 16px;">
                        <label class="checkbox-container" style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                            <input type="checkbox" name="is_default" value="1" {{ old('is_default', $gateway->is_default) ? 'checked' : '' }} style="width: 18px; height: 18px; accent-color: var(--secondary);">
                            <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-primary);">Gateway Padrão</span>
                        </label>
                    </div>

                    <div style="margin-bottom: 24px;">
                        <label class="checkbox-container" style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                            <input type="checkbox" name="is_active" value="1" {{ old('is_active', $gateway->is_active ?? true) ? 'checked' : '' }} style="width: 18px; height: 18px; accent-color: var(--primary);">
                            <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-primary);">Gateway Ativo</span>
                        </label>
                    </div>

                    <button type="submit" class="btn btn-primary" style="width: 100%; height: 50px; justify-content: center; border-radius: 14px; font-size: 0.95rem;">
                        <i class="fas fa-save"></i> SALVAR ALTERAÇÕES
                    </button>
                    
                    <div style="margin-top: 20px; padding: 12px; background: #f8fafc; border-radius: 10px; border: 1px solid var(--border);">
                        <p style="font-size: 0.7rem; color: var(--text-muted); font-weight: 700; line-height: 1.4;">
                            <i class="fas fa-info-circle"></i> Criado em: {{ $gateway->created_at->format('d/m/Y H:i') }}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </form>
</div>
@endsection
