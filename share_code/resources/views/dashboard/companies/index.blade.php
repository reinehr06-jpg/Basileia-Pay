@extends('dashboard.layouts.app')
@section('title', 'Empresas')

@section('header_actions')
    <button class="btn" style="background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.3); padding: 8px 16px; border-radius: 10px; font-weight: 800; font-size: 0.75rem; cursor: pointer; display: flex; align-items: center; gap: 8px;">
        <i class="fas fa-plus"></i> NOVA EMPRESA
    </button>
@endsection

@section('content')
<!-- Metric Bar -->
<div class="kpi-grid" style="margin-bottom: 24px;">
    <div class="kpi-card animate-up" style="animation-delay: 0.1s;">
        <div class="label">Total de Empresas</div>
        <div class="value">{{ $companies->count() }}</div>
        <i class="fas fa-building kpi-icon"></i>
    </div>
    <div class="kpi-card animate-up" style="animation-delay: 0.2s; border-left: 3px solid var(--success);">
        <div class="label">Empresas Ativas</div>
        <div class="value">{{ $companies->where('status', 'active')->count() }}</div>
        <i class="fas fa-check-circle kpi-icon"></i>
    </div>
    <div class="kpi-card animate-up" style="animation-delay: 0.3s;">
        <div class="label">Novos Cadastros (24h)</div>
        <div class="value">0</div>
        <i class="fas fa-user-plus kpi-icon"></i>
    </div>
    <div class="kpi-card animate-up" style="animation-delay: 0.4s; border-left: 3px solid var(--primary-light);">
        <div class="label">Taxa de Atividade</div>
        <div class="value">
            @php 
                $total = $companies->count();
                $active = $companies->where('status', 'active')->count();
                echo ($total > 0) ? number_format(($active / $total) * 100, 1) : '100';
            @endphp%
        </div>
        <i class="fas fa-bolt kpi-icon"></i>
    </div>
</div>

<!-- Filter Bar Elite -->
<div class="card animate-up" style="padding: 12px 20px; margin-bottom: 24px; border-radius: 16px; display: flex; align-items: center; justify-content: space-between; background: #fff; border: 1px solid var(--border);">
    <div style="display: flex; align-items: center; gap: 15px;">
        <div style="font-size: 0.7rem; font-weight: 900; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Workspace Filter:</div>
        <div style="position: relative;">
            <select style="appearance: none; background: #f8fafc; border: 1px solid var(--border); padding: 8px 36px 8px 16px; border-radius: 10px; font-size: 0.8rem; font-weight: 700; color: var(--text-primary); cursor: pointer; min-width: 140px;">
                <option>Todas Empresas</option>
                <option>Somente Ativas</option>
                <option>Bloqueadas</option>
            </select>
            <i class="fas fa-chevron-down" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); font-size: 0.6rem; color: var(--text-muted); pointer-events: none;"></i>
        </div>
        <div style="position: relative;">
            <input type="text" placeholder="Buscar por nome ou slug..." style="background: #f8fafc; border: 1px solid var(--border); padding: 8px 16px; border-radius: 10px; font-size: 0.8rem; font-weight: 600; min-width: 280px;">
        </div>
    </div>
    <div style="display: flex; align-items: center; gap: 12px;">
        <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">{{ $companies->count() }} resultados</span>
        <button class="btn" style="background: #f1f5f9; color: #475569; border: none; padding: 10px; border-radius: 10px; cursor: pointer;"><i class="fas fa-sync-alt"></i></button>
    </div>
</div>

<div class="card animate-up" style="padding: 0; overflow: hidden; border-radius: 20px; border: 1px solid var(--border); box-shadow: var(--shadow-sm);">
    <div class="table-wrapper" style="border: none;">
        <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr style="background: #f8fafc; border-bottom: 1px solid var(--border);">
                    <th style="padding: 16px 24px; text-align: left; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; color: var(--text-muted); letter-spacing: 1px;">Razão Social / Nome</th>
                    <th style="padding: 16px 24px; text-align: left; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; color: var(--text-muted); letter-spacing: 1px;">Identificação (Slug)</th>
                    <th style="padding: 16px 24px; text-align: left; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; color: var(--text-muted); letter-spacing: 1px;">Status</th>
                    <th style="padding: 16px 24px; text-align: left; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; color: var(--text-muted); letter-spacing: 1px;">Conexões</th>
                    <th style="padding: 16px 24px; text-align: left; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; color: var(--text-muted); letter-spacing: 1px;">Cadastro</th>
                    <th style="padding: 16px 24px; text-align: right; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; color: var(--text-muted); letter-spacing: 1px;">Ações</th>
                </tr>
            </thead>
            <tbody>
                @forelse($companies as $company)
                    <tr style="border-bottom: 1px solid var(--border-light); transition: background 0.2s ease;">
                        <td style="padding: 16px 24px;">
                            <div style="font-weight: 800; color: var(--bg-sidebar); font-size: 0.9rem;">{{ $company->name }}</div>
                        </td>
                        <td style="padding: 16px 24px;">
                            <code style="font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; color: var(--text-muted); background: #f8fafc; padding: 4px 8px; border-radius: 6px; border: 1px solid var(--border-light);">{{ $company->slug }}</code>
                        </td>
                        <td style="padding: 16px 24px;">
                            @if($company->status === 'active')
                                <span style="background: #ecfdf5; color: #10b981; padding: 5px 12px; border-radius: 8px; font-size: 0.65rem; font-weight: 900; letter-spacing: 0.5px;">ATIVA</span>
                            @else
                                <span style="background: #fef2f2; color: #ef4444; padding: 5px 12px; border-radius: 8px; font-size: 0.65rem; font-weight: 900; letter-spacing: 0.5px;">INATIVA</span>
                            @endif
                        </td>
                        <td style="padding: 16px 24px;">
                            <div style="font-weight: 900; color: var(--text-main); font-size: 0.85rem;">{{ number_format($company->integrations_count ?? 0) }} connections</div>
                        </td>
                        <td style="padding: 16px 24px;">
                            <div style="font-weight: 700; color: var(--text-main); font-size: 0.85rem;">{{ $company->created_at?->format('d/m/Y') }}</div>
                        </td>
                        <td style="padding: 16px 24px; text-align: right;">
                            <div style="display: flex; align-items: center; justify-content: flex-end; gap: 10px;">
                                <form method="POST" action="{{ route('dashboard.companies.toggle', $company->id) }}" style="display: inline;">
                                    @csrf
                                    <button type="submit" style="background: {{ $company->status === 'active' ? '#fef2f2' : 'rgba(124, 58, 237, 0.1)' }}; color: {{ $company->status === 'active' ? '#ef4444' : 'var(--primary)' }}; border: none; padding: 10px 16px; border-radius: 10px; font-size: 0.75rem; font-weight: 900; cursor: pointer; transition: all 0.2s ease;">
                                        {{ $company->status === 'active' ? 'BLOQUEAR' : 'DESBLOQUEAR' }}
                                    </button>
                                </form>
                            </div>
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="6" style="padding: 80px 24px; text-align: center; background: #fff; border: 2px dashed var(--border);">
                             <i class="fas fa-building" style="font-size: 2.5rem; color: var(--border); margin-bottom: 16px; display: block;"></i>
                             <h3 style="font-size: 1.25rem; font-weight: 900; color: var(--bg-sidebar); margin-bottom: 8px;">Nenhuma empresa cadastrada</h3>
                             <p style="font-size: 0.9rem; color: var(--text-muted);">Sistemas multi-inquilino aparecerão aqui.</p>
                        </td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>
</div>
@endsection
