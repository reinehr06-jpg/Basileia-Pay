@extends('dashboard.layouts.app')
@section('title', 'Gateways de Pagamento')

@section('header_actions')
    <a href="{{ route('dashboard.gateways.create') }}" class="btn" style="background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.3); padding: 8px 16px; border-radius: 10px; font-weight: 800; font-size: 0.75rem; text-decoration: none; display: flex; align-items: center; gap: 8px;">
        <i class="fas fa-plus"></i> NOVO GATEWAY
    </a>
@endsection

@section('content')
<!-- Metric Bar -->
<div class="kpi-grid" style="margin-bottom: 24px;">
    <div class="kpi-card animate-up" style="animation-delay: 0.1s;">
        <div class="label">Provedores Configurados</div>
        <div class="value">{{ $gateways->count() }}</div>
        <i class="fas fa-wallet kpi-icon"></i>
    </div>
    <div class="kpi-card animate-up" style="animation-delay: 0.2s; border-left: 3px solid var(--success);">
        <div class="label">Gateways Ativos</div>
        <div class="value">{{ $gateways->where('status', 'active')->count() }}</div>
        <i class="fas fa-check-circle kpi-icon"></i>
    </div>
    <div class="kpi-card animate-up" style="animation-delay: 0.3s;">
        <div class="label">Processamento Total</div>
        <div class="value">R$ 0,00</div>
        <i class="fas fa-coins kpi-icon"></i>
    </div>
    <div class="kpi-card animate-up" style="animation-delay: 0.4s; border-left: 3px solid var(--primary-light);">
        <div class="label">Gateway Padrão</div>
        <div class="value" style="font-size: 0.9rem;">{{ $gateways->where('is_default', true)->first()->name ?? 'Nenhum' }}</div>
        <i class="fas fa-star kpi-icon"></i>
    </div>
</div>

<!-- Filter Bar Elite -->
<div class="card animate-up" style="padding: 12px 20px; margin-bottom: 24px; border-radius: 16px; display: flex; align-items: center; justify-content: space-between; background: #fff; border: 1px solid var(--border);">
    <div style="display: flex; align-items: center; gap: 15px;">
        <div style="font-size: 0.7rem; font-weight: 900; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Filtrar Provedor:</div>
        <div style="position: relative;">
            <select style="appearance: none; background: #f8fafc; border: 1px solid var(--border); padding: 8px 36px 8px 16px; border-radius: 10px; font-size: 0.8rem; font-weight: 700; color: var(--text-primary); cursor: pointer; min-width: 180px;">
                <option>Todos os Gateway</option>
                <option>Asaas (Brasil)</option>
                <option>Stripe (Global)</option>
                <option>Custom (Sistemas)</option>
            </select>
            <i class="fas fa-chevron-down" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); font-size: 0.6rem; color: var(--text-muted); pointer-events: none;"></i>
        </div>
        <div style="position: relative;">
            <select style="appearance: none; background: #f8fafc; border: 1px solid var(--border); padding: 8px 36px 8px 16px; border-radius: 10px; font-size: 0.8rem; font-weight: 700; color: var(--text-primary); cursor: pointer; min-width: 150px;">
                <option>Qualquer Status</option>
                <option>Ativos</option>
                <option>Pausados</option>
            </select>
            <i class="fas fa-chevron-down" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); font-size: 0.6rem; color: var(--text-muted); pointer-events: none;"></i>
        </div>
    </div>
    <div style="display: flex; align-items: center; gap: 12px;">
        <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">{{ $gateways->count() }} provedores</span>
        <button class="btn" style="background: #f1f5f9; color: #475569; border: none; padding: 10px; border-radius: 10px; cursor: pointer;"><i class="fas fa-sync-alt"></i></button>
    </div>
</div>

<div class="card animate-up" style="padding: 0; overflow: hidden; border-radius: 20px; border: 1px solid var(--border); box-shadow: var(--shadow-sm);">
    <div class="table-wrapper" style="border: none;">
        <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr style="background: #f8fafc; border-bottom: 1px solid var(--border);">
                    <th style="padding: 16px 24px; text-align: left; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; color: var(--text-muted); letter-spacing: 1px;">Identificação</th>
                    <th style="padding: 16px 24px; text-align: left; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; color: var(--text-muted); letter-spacing: 1px;">Gateway</th>
                    <th style="padding: 16px 24px; text-align: left; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; color: var(--text-muted); letter-spacing: 1px;">Status</th>
                    <th style="padding: 16px 24px; text-align: left; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; color: var(--text-muted); letter-spacing: 1px;">Prioridade</th>
                    <th style="padding: 16px 24px; text-align: right; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; color: var(--text-muted); letter-spacing: 1px;">Ações</th>
                </tr>
            </thead>
            <tbody>
                @forelse($gateways as $gw)
                    <tr style="border-bottom: 1px solid var(--border-light); transition: background 0.2s ease;">
                        <td style="padding: 16px 24px;">
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <div style="width: 36px; height: 36px; background: #fff; border: 1px solid var(--border); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 1rem; color: var(--primary);">
                                    <i class="fas fa-wallet"></i>
                                </div>
                                <div>
                                    <div style="font-weight: 800; color: var(--bg-sidebar); font-size: 0.9rem;">{{ $gw->name }}</div>
                                    <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">ID: #{{ $gw->id }}</div>
                                </div>
                            </div>
                        </td>
                        <td style="padding: 16px 24px;">
                            <span style="background: rgba(124, 58, 237, 0.08); color: var(--primary); padding: 5px 12px; border-radius: 8px; font-size: 0.65rem; font-weight: 900; text-transform: uppercase; border: 1px solid rgba(124, 58, 237, 0.1);">
                                {{ $gw->type ?? 'Asaas' }}
                            </span>
                        </td>
                        <td style="padding: 16px 24px;">
                            @if($gw->status === 'active')
                                <span style="background: #ecfdf5; color: #10b981; padding: 5px 12px; border-radius: 8px; font-size: 0.65rem; font-weight: 900; text-transform: uppercase;">ONLINE</span>
                            @else
                                <span style="background: #fef2f2; color: #ef4444; padding: 5px 12px; border-radius: 8px; font-size: 0.65rem; font-weight: 900; text-transform: uppercase;">OFFLINE</span>
                            @endif
                        </td>
                        <td style="padding: 16px 24px;">
                            @if($gw->is_default)
                                <div style="display: flex; align-items: center; gap: 6px; color: var(--primary); font-weight: 800; font-size: 0.75rem;">
                                    <i class="fas fa-star"></i> PADRÃO
                                </div>
                            @else
                                <span style="color: #cbd5e1; font-size: 0.8rem; font-weight: 600;">SECUNDÁRIO</span>
                            @endif
                        </td>
                        <td style="padding: 16px 24px; text-align: right;">
                            <div style="display: flex; align-items: center; justify-content: flex-end; gap: 10px;">
                                <a href="{{ route('dashboard.gateways.show', $gw->id) }}" class="btn" style="background: #fff; color: #475569; border: 1px solid var(--border); padding: 10px; border-radius: 10px; display: flex; align-items: center; justify-content: center; text-decoration: none;" title="Ver detalhes">
                                    <i class="fas fa-eye"></i>
                                </a>
                                <form method="POST" action="{{ route('dashboard.gateways.toggle', $gw->id) }}" style="display: inline;">
                                    @csrf
                                    <button type="submit" style="background: {{ $gw->status === 'active' ? '#fef2f2' : 'rgba(124, 58, 237, 0.1)' }}; color: {{ $gw->status === 'active' ? '#ef4444' : 'var(--primary)' }}; border: none; padding: 10px 16px; border-radius: 10px; font-size: 0.75rem; font-weight: 900; cursor: pointer; transition: all 0.2s ease;">
                                        {{ $gw->status === 'active' ? 'PAUSAR' : 'ATIVAR' }}
                                    </button>
                                </form>
                            </div>
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="5" style="padding: 80px 24px; text-align: center; color: var(--text-muted); background: #fff; border: 2px dashed var(--border);">
                            <div style="width: 80px; height: 80px; background: #f8fafc; color: var(--border); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; margin: 0 auto 24px;">
                                <i class="fas fa-wallet"></i>
                            </div>
                            <h3 style="font-size: 1.25rem; font-weight: 900; color: var(--bg-sidebar); margin-bottom: 8px;">Sem gateways ativos</h3>
                            <p style="font-size: 0.9rem; margin-bottom: 24px;">Você precisa de pelo menos um gateway configurado para receber pagamentos.</p>
                            <a href="{{ route('dashboard.gateways.create') }}" class="btn btn-primary" style="padding: 14px 28px; border-radius: 14px; text-decoration: none;">CONFIGURAR MEU PRIMEIRO GATEWAY</a>
                        </td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>
</div>
@endsection
