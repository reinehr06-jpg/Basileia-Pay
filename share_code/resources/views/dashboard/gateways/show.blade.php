@extends('dashboard.layouts.app')

@section('title', 'Gateway: ' . $gateway->name)

@section('content')
<div class="animate-up" style="max-width: 900px; margin: 0 auto;">
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px;">
        <div>
            <a href="{{ route('dashboard.gateways.index') }}" style="text-decoration: none; color: var(--text-muted); font-size: 0.8rem; font-weight: 700; display: flex; align-items: center; gap: 6px; margin-bottom: 8px;">
                <i class="fas fa-arrow-left"></i> VOLTAR PARA LISTA
            </a>
            <h2 style="font-size: 1.6rem; font-weight: 900; color: var(--bg-sidebar); letter-spacing: -1px;">{{ $gateway->name }}</h2>
            <p style="font-size: 0.9rem; color: var(--text-muted);">
                @if($gateway->status === 'active')
                    <span style="background: #ecfdf5; color: #10b981; padding: 4px 10px; border-radius: 6px; font-size: 0.7rem; font-weight: 900;">ATIVO</span>
                @else
                    <span style="background: #fef2f2; color: #ef4444; padding: 4px 10px; border-radius: 6px; font-size: 0.7rem; font-weight: 900;">INATIVO</span>
                @endif
            </p>
        </div>
        <div style="display: flex; gap: 10px;">
            <button type="button" onclick="testGateway()" class="btn" style="background: #0ea5e9; color: white; border: none; padding: 12px 20px; border-radius: 12px; font-weight: 800; font-size: 0.85rem; cursor: pointer; display: flex; align-items: center; gap: 8px;">
                <i class="fas fa-plug"></i> TESTAR CONEXÃO
            </button>
            <a href="{{ route('dashboard.gateways.edit', $gateway->id) }}" class="btn" style="background: var(--primary); color: white; border: none; padding: 12px 20px; border-radius: 12px; font-weight: 800; font-size: 0.85rem; text-decoration: none; display: flex; align-items: center; gap: 8px;">
                <i class="fas fa-edit"></i> EDITAR
            </a>
        </div>
    </div>

    <div id="test-result" style="display: none; margin-bottom: 24px;"></div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
        <div class="card-premium animate-up">
            <h4 style="font-size: 1rem; font-weight: 800; color: var(--bg-sidebar); margin-bottom: 20px;">
                <i class="fas fa-info-circle" style="margin-right: 10px; color: var(--primary);"></i>
                Informações do Gateway
            </h4>
            
            <div style="display: grid; gap: 16px;">
                <div>
                    <div style="font-size: 0.7rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px;">Plataforma</div>
                    <div style="font-size: 0.95rem; font-weight: 700; color: var(--bg-sidebar);">{{ ucfirst($gateway->slug) }}</div>
                </div>
                <div>
                    <div style="font-size: 0.7rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px;">ID</div>
                    <div style="font-size: 0.95rem; font-weight: 700; color: var(--bg-sidebar);">#{{ $gateway->id }}</div>
                </div>
                <div>
                    <div style="font-size: 0.7rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px;">Criado em</div>
                    <div style="font-size: 0.95rem; font-weight: 700; color: var(--bg-sidebar);">{{ $gateway->created_at->format('d/m/Y H:i') }}</div>
                </div>
                <div>
                    <div style="font-size: 0.7rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px;">Padrão</div>
                    <div style="font-size: 0.95rem; font-weight: 700; color: {{ $gateway->is_default ? 'var(--primary)' : 'var(--text-muted)' }};">
                        <i class="fas fa-star" style="color: {{ $gateway->is_default ? 'var(--primary)' : '#cbd5e1' }};"></i>
                        {{ $gateway->is_default ? 'Sim' : 'Não' }}
                    </div>
                </div>
            </div>
        </div>

        <div class="card-premium animate-up" style="animation-delay: 0.1s;">
            <h4 style="font-size: 1rem; font-weight: 800; color: var(--bg-sidebar); margin-bottom: 20px;">
                <i class="fas fa-key" style="margin-right: 10px; color: var(--primary);"></i>
                Credenciais
            </h4>
            
            <div style="display: grid; gap: 16px;">
                @if(isset($gateway->config_masked))
                    @foreach($gateway->config_masked as $key => $value)
                        <div>
                            <div style="font-size: 0.7rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px;">
                                {{ str_replace('_', ' ', ucfirst($key)) }}
                            </div>
                            <div style="font-size: 0.9rem; font-weight: 700; color: var(--bg-sidebar); font-family: monospace;">
                                {{ $value }}
                            </div>
                        </div>
                    @endforeach
                @else
                    <div style="color: var(--text-muted); font-size: 0.85rem;">Nenhuma configuração salva.</div>
                @endif
            </div>
        </div>
    </div>

    <div class="card-premium animate-up" style="margin-top: 24px;">
        <h4 style="font-size: 1rem; font-weight: 800; color: var(--bg-sidebar); margin-bottom: 20px;">
            <i class="fas fa-link" style="margin-right: 10px; color: var(--primary);"></i>
            Webhook URL
        </h4>
        <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 12px;">Use esta URL no painel do gateway para receber notificações de pagamento:</p>
        <div style="display: flex; gap: 10px;">
            <input type="text" class="input-elite" value="{{ url('/api/webhooks/' . $gateway->slug) }}" readonly style="flex: 1; cursor: pointer;" onclick="this.select(); navigator.clipboard.writeText(this.value);">
            <button type="button" onclick="navigator.clipboard.writeText('{{ url('/api/webhooks/' . $gateway->slug) }}'); alert('URL copiada!');" class="btn" style="background: var(--primary); color: white; border: none; padding: 12px 20px; border-radius: 12px; font-weight: 800;">
                <i class="fas fa-copy"></i>
            </button>
        </div>
    </div>
</div>

<script>
function testGateway() {
    const resultDiv = document.getElementById('test-result');
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = '<div style="background: #eff6ff; border: 1px solid #bfdbfe; color: #1e40af; padding: 16px; border-radius: 12px; font-weight: 600;"><i class="fas fa-spinner fa-spin" style="margin-right: 10px;"></i> Executando testes...</div>';
    
    fetch('{{ route("dashboard.gateways.test", $gateway->id) }}', {
        method: 'POST',
        headers: {
            'X-CSRF-TOKEN': '{{ csrf_token() }}',
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        let html = '';
        if (data.results && data.results.length > 0) {
            html += '<div style="display: grid; gap: 8px; margin-top: 12px;">';
            data.results.forEach(function(item) {
                let icon = '?';
                let bg = '#f3f4f6';
                let border = '#e5e7eb';
                let color = '#374151';
                
                if (item.status === 'passed') {
                    icon = '<i class="fas fa-check-circle" style="color: #10b981;"></i>';
                    bg = '#ecfdf5';
                    border = '#a7f3d0';
                    color = '#065f46';
                } else if (item.status === 'failed') {
                    icon = '<i class="fas fa-times-circle" style="color: #ef4444;"></i>';
                    bg = '#fef2f2';
                    border = '#fecaca';
                    color = '#991b1b';
                } else if (item.status === 'warning') {
                    icon = '<i class="fas fa-exclamation-triangle" style="color: #f59e0b;"></i>';
                    bg = '#fffbeb';
                    border = '#fef3c7';
                    color = '#92400e';
                }
                
                html += '<div style="background: ' + bg + '; border: 1px solid ' + border + '; color: ' + color + '; padding: 12px 16px; border-radius: 8px; display: flex; align-items: center; gap: 10px; font-size: 0.9rem;">';
                html += icon;
                html += '<div style="flex: 1;"><strong>' + item.test + '</strong><br><small style="opacity: 0.8;">' + item.message + '</small></div>';
                html += '</div>';
            });
            html += '</div>';
        }
        
        if (data.success) {
            resultDiv.innerHTML = '<div style="background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; padding: 16px; border-radius: 12px; font-weight: 600;"><i class="fas fa-check-circle" style="margin-right: 10px;"></i> ' + data.message + '</div>' + html;
        } else {
            resultDiv.innerHTML = '<div style="background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; padding: 16px; border-radius: 12px; font-weight: 600;"><i class="fas fa-times-circle" style="margin-right: 10px;"></i> ' + data.message + '</div>' + html;
        }
    })
    .catch(error => {
        resultDiv.innerHTML = '<div style="background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; padding: 16px; border-radius: 12px; font-weight: 600;"><i class="fas fa-times-circle" style="margin-right: 10px;"></i> Erro: ' + error.message + '</div>';
    });
}
</script>
@endsection
