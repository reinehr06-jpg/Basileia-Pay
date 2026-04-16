@extends('dashboard.layouts.app')
@section('title', ($is_new ? 'Novo' : 'Editar') . ' Checkout')

@php
$configData = $config->config ?? [];
$defaults = App\Models\CheckoutConfig::defaultConfig();
$configData = array_merge($defaults, $configData);
@endphp

<style>
.builder-container { display: grid; grid-template-columns: 300px 1fr; min-height: calc(100vh - 180px); }
.builder-sidebar { background: var(--bg-main); border-right: 1px solid var(--border-light); padding: 16px; overflow-y: auto; max-height: calc(100vh - 180px); }
.builder-preview { background: #f1f5f9; padding: 20px; display: flex; justify-content: center; align-items: flex-start; overflow-y: auto; }
.preview-frame { width: 100%; max-width: 420px; background: {{ $configData['background_color'] ?? '#fff' }}; border-radius: {{ $configData['border_radius'] ?? 16 }}px; box-shadow: 0 10px 40px rgba(0,0,0,0.1); padding: {{ $configData['padding'] ?? 32 }}px; min-height: 500px; }
.tab-btn { padding: 10px 12px; border: none; background: transparent; color: var(--text-secondary); cursor: pointer; border-radius: 6px; width: 100%; text-align: left; margin-bottom: 4px; font-size: 0.85rem; }
.tab-btn.active { background: var(--primary); color: white; }
.config-section { display: none; padding: 12px; background: white; border-radius: 8px; margin-bottom: 12px; }
.config-section.active { display: block; }
.form-group { margin-bottom: 12px; }
.form-label { display: block; font-size: 0.75rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 4px; }
.form-input { width: 100%; padding: 8px 10px; border: 1px solid var(--border-light); border-radius: 6px; font-size: 0.85rem; }
.color-input { width: 40px; height: 32px; border: none; border-radius: 6px; cursor: pointer; }
.toggle-group { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; }
.toggle-btn { padding: 6px; border: 1px solid var(--border-light); background: white; border-radius: 4px; cursor: pointer; font-size: 0.75rem; }
.toggle-btn.active { background: var(--primary); color: white; border-color: var(--primary); }
.btn-publish { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; border: none; padding: 10px 16px; border-radius: 8px; font-weight: 700; cursor: pointer; width: 100%; margin-top: 12px; }
.btn-save { background: var(--primary); color: white; border: none; padding: 10px 16px; border-radius: 8px; font-weight: 700; cursor: pointer; width: 100%; }
.preview-header { text-align: {{ $configData['logo_position'] ?? 'center' }}; margin-bottom: 16px; }
.preview-title { font-size: 1.25rem; font-weight: 800; color: {{ $configData['text_color'] ?? '#1e293b' }}; }
.preview-desc { font-size: 0.85rem; color: {{ $configData['text_muted_color'] ?? '#64748b' }}; margin-top: 4px; }
.preview-method { padding: 12px; border: 2px solid {{ $configData['border_color'] ?? '#e2e8f0' }}; border-radius: 10px; margin-bottom: 8px; display: flex; align-items: center; gap: 10px; }
.preview-btn { width: 100%; padding: 14px; background: {{ $configData['primary_color'] ?? '#7c3aed' }}; color: white; border: none; border-radius: {{ $configData['border_radius'] ?? 16 }}px; font-weight: 700; margin-top: 16px; }
</style>

<form method="POST" action="{{ route('dashboard.checkout-configs.save') }}">
@csrf
<input type="hidden" name="id" value="{{ $config->id ?? '' }}">
<input type="hidden" name="slug" value="{{ $config->slug ?? '' }}">

<div class="builder-container">
    <div class="builder-sidebar">
        <h4 style="margin-bottom: 16px;">Editor</h4>
        
        <button type="button" class="tab-btn active" onclick="showTab('cores')">🎨 Cores</button>
        <button type="button" class="tab-btn" onclick="showTab('logo')">🏢 Logo</button>
        <button type="button" class="tab-btn" onclick="showTab('campos')">📝 Campos</button>
        <button type="button" class="tab-btn" onclick="showTab('metodos')">💳 Métodos</button>
        <button type="button" class="tab-btn" onclick="showTab('pix')">📱 PIX</button>
        <button type="button" class="tab-btn" onclick="showTab('cartao')">💳 Cartão</button>
        <button type="button" class="tab-btn" onclick="showTab('layout')">📐 Layout</button>
        <button type="button" class="tab-btn" onclick="showTab('textos')">✏️ Textos</button>

        <div class="config-section active" id="tab-cores">
            <div class="form-group"><label class="form-label">Cor Principal</label><input type="color" name="config[primary_color]" value="{{ $configData['primary_color'] ?? '#7c3aed' }}" class="color-input"></div>
            <div class="form-group"><label class="form-label">Fundo</label><input type="color" name="config[background_color]" value="{{ $configData['background_color'] ?? '#ffffff' }}" class="color-input"></div>
            <div class="form-group"><label class="form-label">Texto</label><input type="color" name="config[text_color]" value="{{ $configData['text_color'] ?? '#1e293b' }}" class="color-input"></div>
            <div class="form-group"><label class="form-label">Texto secundário</label><input type="color" name="config[text_muted_color]" value="{{ $configData['text_muted_color'] ?? '#64748b' }}" class="color-input"></div>
            <div class="form-group"><label class="form-label">Bordas</label><input type="color" name="config[border_color]" value="{{ $configData['border_color'] ?? '#e2e8f0' }}" class="color-input"></div>
            <div class="form-group"><label class="form-label">Sucesso</label><input type="color" name="config[success_color]" value="{{ $configData['success_color'] ?? '#10b981' }}" class="color-input"></div>
        </div>

        <div class="config-section" id="tab-logo">
            <div class="form-group"><label class="form-label">URL do Logo</label><input type="text" name="config[logo_url]" value="{{ $configData['logo_url'] ?? '' }}" class="form-input" placeholder="https://..."></div>
            <div class="form-group"><label class="form-label">Largura (px)</label><input type="number" name="config[logo_width]" value="{{ $configData['logo_width'] ?? 120 }}" class="form-input"></div>
            <div class="form-group"><label class="form-label">Posição</label>
                <div class="toggle-group">
                    <button type="button" class="toggle-btn {{ ($configData['logo_position'] ?? 'center') == 'left' ? 'active' : '' }}" onclick="setVal('logo_position', 'left')">Esq</button>
                    <button type="button" class="toggle-btn {{ ($configData['logo_position'] ?? 'center') == 'center' ? 'active' : '' }}" onclick="setVal('logo_position', 'center')">Cen</button>
                    <button type="button" class="toggle-btn {{ ($configData['logo_position'] ?? 'center') == 'right' ? 'active' : '' }}" onclick="setVal('logo_position', 'right')">Dir</button>
                </div>
            </div>
        </div>

        <div class="config-section" id="tab-campos">
            <div class="form-group"><label><input type="checkbox" name="config[show_name]" {{ ($configData['show_name'] ?? true) ? 'checked' : '' }}> Nome</label></div>
            <div class="form-group"><label><input type="checkbox" name="config[show_email]" {{ ($configData['show_email'] ?? true) ? 'checked' : '' }}> Email</label></div>
            <div class="form-group"><label><input type="checkbox" name="config[show_phone]" {{ ($configData['show_phone'] ?? true) ? 'checked' : '' }}> Telefone</label></div>
            <div class="form-group"><label><input type="checkbox" name="config[show_document]" {{ ($configData['show_document'] ?? true) ? 'checked' : '' }}> CPF/CNPJ</label></div>
        </div>

        <div class="config-section" id="tab-metodos">
            <div class="form-group"><label><input type="checkbox" name="config[methods][pix]" {{ ($configData['methods']['pix'] ?? true) ? 'checked' : '' }}> PIX</label></div>
            <div class="form-group"><label><input type="checkbox" name="config[methods][card]" {{ ($configData['methods']['card'] ?? true) ? 'checked' : '' }}> Cartão</label></div>
            <div class="form-group"><label><input type="checkbox" name="config[methods][boleto]" {{ ($configData['methods']['boleto'] ?? false) ? 'checked' : '' }}> Boleto</label></div>
        </div>

        <div class="config-section" id="tab-pix">
            <div class="form-group"><label class="form-label">Chave PIX</label><input type="text" name="config[pix_key]" value="{{ $configData['pix_key'] ?? '' }}" class="form-input"></div>
            <div class="form-group"><label class="form-label">Tipo</label>
                <select name="config[pix_key_type]" class="form-input">
                    <option value="cpf" {{ ($configData['pix_key_type'] ?? 'cpf') == 'cpf' ? 'selected' : '' }}>CPF</option>
                    <option value="email" {{ ($configData['pix_key_type'] ?? 'cpf') == 'email' ? 'selected' : '' }}>Email</option>
                    <option value="phone" {{ ($configData['pix_key_type'] ?? 'cpf') == 'phone' ? 'selected' : '' }}>Telefone</option>
                    <option value="random" {{ ($configData['pix_key_type'] ?? 'cpf') == 'random' ? 'selected' : '' }}>Aleatória</option>
                </select>
            </div>
            <div class="form-group"><label><input type="checkbox" name="config[pix_copy_enabled]" {{ ($configData['pix_copy_enabled'] ?? true) ? 'checked' : '' }}> Botão copiar</label></div>
        </div>

        <div class="config-section" id="tab-cartao">
            <div class="form-group"><label class="form-label">Parcelas máx.</label><input type="number" name="config[card_installments]" value="{{ $configData['card_installments'] ?? 12 }}" class="form-input"></div>
            <div class="form-group"><label class="form-label">Desconto (%)</label><input type="number" name="config[card_discount]" value="{{ $configData['card_discount'] ?? 0 }}" class="form-input"></div>
        </div>

        <div class="config-section" id="tab-layout">
            <div class="form-group"><label class="form-label">Largura máx.</label><input type="number" name="config[container_max_width]" value="{{ $configData['container_max_width'] ?? 600 }}" class="form-input"></div>
            <div class="form-group"><label class="form-label">Padding</label><input type="number" name="config[padding]" value="{{ $configData['padding'] ?? 32 }}" class="form-input"></div>
            <div class="form-group"><label class="form-label">Border radius</label><input type="number" name="config[border_radius]" value="{{ $configData['border_radius'] ?? 16 }}" class="form-input"></div>
            <div class="form-group"><label><input type="checkbox" name="config[shadow]" {{ ($configData['shadow'] ?? true) ? 'checked' : '' }}> Sombra</label></div>
            <div class="form-group"><label><input type="checkbox" name="config[show_timer]" {{ ($configData['show_timer'] ?? true) ? 'checked' : '' }}> Timer</label></div>
        </div>

        <div class="config-section" id="tab-textos">
            <div class="form-group"><label class="form-label">Título</label><input type="text" name="config[title]" value="{{ $configData['title'] ?? 'Finalize seu pagamento' }}" class="form-input"></div>
            <div class="form-group"><label class="form-label">Descrição</label><textarea name="config[description]" class="form-input" rows="2">{{ $configData['description'] ?? '' }}</textarea></div>
            <div class="form-group"><label class="form-label">Botão</label><input type="text" name="config[button_text]" value="{{ $configData['button_text'] ?? 'Pagar agora' }}" class="form-input"></div>
        </div>

        <div style="padding-top: 16px; border-top: 1px solid var(--border-light);">
            <div class="form-group"><label class="form-label">Nome do Checkout</label><input type="text" name="name" value="{{ $config->name ?? '' }}" class="form-input" required placeholder="Meu Checkout"></div>
            <button type="submit" class="btn-save">💾 Salvar</button>
            @if(isset($config->id) && !$config->is_active)
            <button type="submit" formaction="{{ route('dashboard.checkout-configs.publish', $config->id) }}" class="btn-publish">🚀 Publicar em Produção</button>
            @endif
        </div>
    </div>

    <div class="builder-preview">
        <div class="preview-frame">
            @if(!empty($configData['logo_url']))
            <div class="preview-header"><img src="{{ $configData['logo_url'] }}" style="width: {{ $configData['logo_width'] ?? 120 }}px;"></div>
            @endif
            <div class="preview-header">
                <div class="preview-title">{{ $configData['title'] ?? 'Finalize seu pagamento' }}</div>
                <div class="preview-desc">{{ $configData['description'] ?? '' }}</div>
            </div>
            @if($configData['show_timer'] ?? true)
            <div style="text-align: center; padding: 10px; background: rgba(245,158,11,0.1); border-radius: 8px; margin-bottom: 12px; font-size: 0.85rem; color: #b45309;">⏱️ 71H 15Min restantes</div>
            @endif
            @if($configData['methods']['pix'] ?? true)<div class="preview-method"><span>📱</span> <span>PIX</span> <span style="margin-left:auto;font-size:0.75rem;color:#64748b">Instantâneo</span></div>@endif
            @if($configData['methods']['card'] ?? true)<div class="preview-method"><span>💳</span> <span>Cartão</span> <span style="margin-left:auto;font-size:0.75rem;color:#64748b">até {{ $configData['card_installments'] ?? 12 }}x</span></div>@endif
            @if($configData['methods']['boleto'] ?? false)<div class="preview-method"><span>📄</span> <span>Boleto</span></div>@endif
            <button class="preview-btn">{{ $configData['button_text'] ?? 'Pagar agora' }}</button>
        </div>
    </div>
</div>
</form>

<script>
function showTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.config-section').forEach(s => s.classList.remove('active'));
    event.target.classList.add('active');
    document.getElementById('tab-' + tab).classList.add('active');
}
function setVal(key, val) {
    document.querySelectorAll('[name="config[' + key + ']"]').forEach(el => el.value = val);
    event.target.classList.add('active');
}
</script>
@endsection