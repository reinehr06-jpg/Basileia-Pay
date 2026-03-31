@extends('dashboard.layouts.app')

@section('title', 'Integrações')

@section('content')
<div class="page-header animate-up" style="animation-delay: 0.1s;">
    <h2>Integrações</h2>
    <button onclick="document.getElementById('modal-create').classList.add('show')" class="btn btn-primary">
        <i class="fas fa-plus"></i> Nova Integração
    </button>
</div>

<div class="card animate-up" style="animation-delay: 0.2s;">
    <div class="table-wrapper">
        <table>
            <thead>
                <tr>
                    <th>Nome</th>
                    <th>API Key</th>
                    <th>Status</th>
                    <th>Transações</th>
                    <th>Criado em</th>
                    <th style="text-align: right;">Ações</th>
                </tr>
            </thead>
            <tbody>
                @forelse($integrations as $int)
                    <tr>
                        <td style="font-weight: 600;">{{ $int->name }}</td>
                        <td style="font-family: monospace; font-size: 0.8rem; color: var(--text-muted);">{{ $int->api_key_prefix }}...</td>
                        <td>
                            <span class="badge {{ $int->status === 'active' ? 'badge-success' : 'badge-danger' }}">
                                {{ $int->status === 'active' ? 'Ativa' : 'Inativa' }}
                            </span>
                        </td>
                        <td>{{ number_format($int->transactions_count ?? 0) }}</td>
                        <td style="color: var(--text-muted);">{{ $int->created_at?->format('d/m/Y') }}</td>
                        <td style="text-align: right;">
                            <a href="{{ route('dashboard.integrations.show', $int->id) }}" class="btn btn-secondary btn-sm">
                                <i class="fas fa-eye"></i> Ver
                            </a>
                            <form method="POST" action="{{ route('dashboard.integrations.toggle', $int->id) }}" style="display: inline;">
                                @csrf
                                <button type="submit" class="btn {{ $int->status === 'active' ? 'btn-danger' : 'btn-primary' }} btn-sm">
                                    {{ $int->status === 'active' ? 'Desativar' : 'Ativar' }}
                                </button>
                            </form>
                        </td>
                    </tr>
                @empty
                    <tr><td colspan="6" class="text-center" style="padding: 40px; color: var(--text-muted);">Nenhuma integração cadastrada.</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>
</div>

<!-- Modal Create -->
<div id="modal-create" class="modal-overlay">
    <div class="modal-content">
        <div class="modal-header">
            <h3>Nova Integração</h3>
            <button class="modal-close" onclick="document.getElementById('modal-create').classList.remove('show')">&times;</button>
        </div>
        <form method="POST" action="{{ route('dashboard.integrations.store') }}">
            @csrf
            <div class="form-group">
                <label>Nome</label>
                <input type="text" name="name" required placeholder="Ex: Basileia Vendas">
            </div>
            <div class="form-group">
                <label>URL Base</label>
                <input type="url" name="base_url" placeholder="https://seudominio.com">
            </div>
            <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 20px;">
                <button type="button" class="btn btn-secondary" onclick="document.getElementById('modal-create').classList.remove('show')">Cancelar</button>
                <button type="submit" class="btn btn-primary">Criar Integração</button>
            </div>
        </form>
    </div>
</div>
@endsection
