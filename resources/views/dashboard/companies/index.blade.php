@extends('dashboard.layouts.app')

@section('title', 'Empresas')

@section('content')
<div class="page-header animate-up" style="animation-delay: 0.1s;">
    <h2>Empresas</h2>
</div>

<div class="card animate-up" style="animation-delay: 0.2s;">
    <div class="table-wrapper">
        <table>
            <thead>
                <tr>
                    <th>Nome</th>
                    <th>Slug</th>
                    <th>Status</th>
                    <th>Integrações</th>
                    <th>Criado em</th>
                    <th style="text-align: right;">Ações</th>
                </tr>
            </thead>
            <tbody>
                @forelse($companies as $company)
                    <tr>
                        <td style="font-weight: 600;">{{ $company->name }}</td>
                        <td style="font-family: monospace; font-size: 0.8rem; color: var(--text-muted);">{{ $company->slug }}</td>
                        <td>
                            <span class="badge {{ $company->status === 'active' ? 'badge-success' : 'badge-danger' }}">
                                {{ $company->status === 'active' ? 'Ativa' : 'Inativa' }}
                            </span>
                        </td>
                        <td>{{ number_format($company->integrations_count ?? 0) }}</td>
                        <td style="color: var(--text-muted);">{{ $company->created_at?->format('d/m/Y') }}</td>
                        <td style="text-align: right;">
                            <form method="POST" action="{{ route('dashboard.companies.toggle', $company->id) }}" style="display: inline;">
                                @csrf
                                <button type="submit" class="btn {{ $company->status === 'active' ? 'btn-danger' : 'btn-primary' }} btn-sm">
                                    {{ $company->status === 'active' ? 'Desativar' : 'Ativar' }}
                                </button>
                            </form>
                        </td>
                    </tr>
                @empty
                    <tr><td colspan="6" class="text-center" style="padding: 40px; color: var(--text-muted);">Nenhuma empresa encontrada.</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>
</div>
@endsection
