@extends('dashboard.layouts.app')
@section('title', 'Integrações')

@section('header_actions')
    <button onclick="document.getElementById('modal-create').classList.add('show')" class="btn" style="background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.3); padding: 8px 16px; border-radius: 10px; font-weight: 800; font-size: 0.75rem; cursor: pointer; display: flex; align-items: center; gap: 8px;">
        <i class="fas fa-plus"></i> NOVA CONEXÃO
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
                     CONECTAR & CONFIGURAR
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
            <p style="font-size: 0.95rem; color: var(--text-muted); max-width: 440px; margin: 0 auto 30px;">Comece conectando sua primeira plataforma de vendas (como o Basileia Vendas) para automatizar seus recebimentos.</p>
            <button onclick="document.getElementById('modal-create').classList.add('show')" class="btn" style="background: var(--primary); color: white; border: none; padding: 16px 32px; border-radius: 14px; font-weight: 900; font-size: 0.95rem; cursor: pointer; box-shadow: 0 10px 20px -5px rgba(124, 58, 237, 0.4);">
                CRIAR MINHA PRIMEIRA CONEXÃO
            </button>
        </div>
    @endforelse
</div>

<!-- Modal Create (Centered) -->
<div id="modal-create" class="modal-overlay" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.8); backdrop-filter: blur(8px); z-index: 200; align-items: center; justify-content: center;">
    <div class="modal-content animate-up" style="background: #fff; width: 100%; max-width: 500px; border-radius: 28px; padding: 0; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
        <div style="background: var(--elite-purple); padding: 30px; text-align: center; color: white;">
            <div style="width: 60px; height: 60px; background: rgba(255,255,255,0.2); border-radius: 18px; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; margin: 0 auto 20px;">
                <i class="fas fa-plus"></i>
            </div>
            <h3 style="font-size: 1.4rem; font-weight: 900; margin-bottom: 6px;">Nova Conexão Elite</h3>
            <p style="font-size: 0.85rem; opacity: 0.8;">Expanda seu ecossistema de pagamentos.</p>
        </div>
        
        <form method="POST" action="{{ route('dashboard.integrations.store') }}" style="padding: 30px;">
            @csrf
            <div style="display: grid; gap: 24px;">
                <div class="form-group">
                    <label style="display: block; font-size: 0.75rem; font-weight: 900; text-transform: uppercase; color: var(--text-muted); margin-bottom: 10px; letter-spacing: 0.5px;">Identificação do Sistema</label>
                    <input type="text" name="name" required placeholder="Ex: Basileia Vendas - Store Principal" style="width: 100%; height: 52px; padding: 0 20px; border-radius: 14px; border: 1px solid var(--border); background: #f8fafc; font-size: 0.95rem; font-weight: 600; outline: none; transition: all 0.2s ease;">
                </div>
                <div class="form-group">
                    <label style="display: block; font-size: 0.75rem; font-weight: 900; text-transform: uppercase; color: var(--text-muted); margin-bottom: 10px; letter-spacing: 0.5px;">URL Base do Sistema (API)</label>
                    <input type="url" name="base_url" placeholder="https://vendas.seusite.com" style="width: 100%; height: 52px; padding: 0 20px; border-radius: 14px; border: 1px solid var(--border); background: #f8fafc; font-size: 0.95rem; font-weight: 600; outline: none;">
                </div>
                
                <div style="background: rgba(124, 58, 237, 0.04); padding: 18px; border-radius: 16px; border: 1px solid rgba(124, 58, 237, 0.1); margin-bottom: 10px;">
                    <p style="font-size: 0.8rem; color: #6d28d9; font-weight: 700; line-height: 1.6; margin: 0; display: flex; gap: 10px;">
                        <i class="fas fa-shield-alt" style="margin-top: 2px;"></i>
                        Ao confirmar, o Basileia Secure gerará um par de chaves de alta segurança (Bearer Auth) para validar todas as requisições deste sistema.
                    </p>
                </div>

                <div style="display: flex; gap: 12px;">
                    <button type="button" class="btn" onclick="document.getElementById('modal-create').classList.remove('show')" style="flex: 1; height: 54px; background: #f8fafc; color: var(--text-muted); border: 1px solid var(--border); border-radius: 16px; font-weight: 800; font-size: 0.9rem; cursor: pointer;">Cancelar</button>
                    <button type="submit" class="btn" style="flex: 2; height: 54px; background: var(--primary); color: white; border: none; border-radius: 16px; font-weight: 900; font-size: 0.95rem; cursor: pointer; box-shadow: 0 10px 20px -5px rgba(124, 58, 237, 0.3);">CONFIRMAR CRIAÇÃO</button>
                </div>
            </div>
        </form>
    </div>
</div>

<script>
    // Toggle Modal Utility
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') document.getElementById('modal-create').classList.remove('show');
    });
    // Add show class trigger
    const modal = document.getElementById('modal-create');
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'class') {
                modal.style.display = modal.classList.contains('show') ? 'flex' : 'none';
            }
        });
    });
    observer.observe(modal, { attributes: true });
</script>
@endsection
>
</div>
@endsection
