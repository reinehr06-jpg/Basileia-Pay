@extends('dashboard.layouts.app')

@section('title', 'Gateways de Pagamento')

@section('content')
<div class="page-header animate-up" style="animation-delay: 0.1s;">
    <h2>Gateways de Pagamento</h2>
    <a href="{{ route('dashboard.gateways.create') }}" class="btn btn-primary">
        <i class="fas fa-plus"></i> Novo Gateway
    </a>
</div>

<div class="card animate-up" style="animation-delay: 0.2s;">
    <div class="table-wrapper">
        <table>
            <thead>
                <tr>
                    <th>Nome</th>
                    <th>Tipo</th>
                    <th>Status</th>
                    <th>Padrão</th>
                    <th>Criado em</th>
                    <th style="text-align: right;">Ações</th>
                </tr>
            </thead>
            <tbody>
                @forelse($gateways as $gw)
                    <tr>
                        <td style="font-weight: 600;">{{ $gw->name }}</td>
                        <td><span class="badge badge-primary">{{ ucfirst($gw->type ?? 'N/A') }}</span></td>
                        <td>
                            <span class="badge {{ $gw->status === 'active' ? 'badge-success' : 'badge-danger' }}">
                                {{ $gw->status === 'active' ? 'Ativo' : 'Inativo' }}
                            </span>
                        </td>
                        <td>
                            @if($gw->is_default)
                                <span class="badge badge-primary"><i class="fas fa-star"></i> Padrão</span>
                            @else
                                -
                            @endif
                        </td>
                        <td style="color: var(--text-muted);">{{ $gw->created_at?->format('d/m/Y') }}</td>
                        <td style="text-align: right;">
                            <a href="{{ route('dashboard.gateways.show', $gw->id) }}" class="btn btn-secondary btn-sm"><i class="fas fa-cog"></i></a>
                            <form method="POST" action="{{ route('dashboard.gateways.toggle', $gw->id) }}" style="display: inline;">
                                @csrf
                                <button type="submit" class="btn {{ $gw->status === 'active' ? 'btn-danger' : 'btn-primary' }} btn-sm">
                                    {{ $gw->status === 'active' ? 'Desativar' : 'Ativar' }}
                                </button>
                            </form>
                        </td>
                    </tr>
                @empty
                    <tr><td colspan="6" class="text-center" style="padding: 40px; color: var(--text-muted);">Nenhum gateway configurado.</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>
</div>
@endsection
