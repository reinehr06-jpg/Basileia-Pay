@extends('dashboard.layouts.app')

@section('title', 'Integração: ' . ($integration->name ?? ''))

@section('content')
<a href="{{ route('dashboard.integrations.index') }}" class="back-link animate-up">
    <i class="fas fa-arrow-left"></i> Voltar para Integrações
</a>

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
    <div class="card animate-up" style="animation-delay: 0.1s;">
        <h3 style="font-size: 1rem; font-weight: 700; margin-bottom: 16px;">Informações</h3>
        <div class="space-y-3">
            <div class="flex justify-between"><span class="detail-label">Nome</span><span class="detail-value">{{ $integration->name }}</span></div>
            <div class="flex justify-between"><span class="detail-label">Slug</span><span class="detail-value" style="font-family: monospace;">{{ $integration->slug }}</span></div>
            <div class="flex justify-between"><span class="detail-label">Status</span><span class="badge {{ $integration->status === 'active' ? 'badge-success' : 'badge-danger' }}">{{ $integration->status === 'active' ? 'Ativa' : 'Inativa' }}</span></div>
            <div class="flex justify-between"><span class="detail-label">URL Base</span><span class="detail-value" style="font-size: 0.8rem;">{{ $integration->base_url ?? '-' }}</span></div>
            <div class="flex justify-between"><span class="detail-label">Transações</span><span class="detail-value">{{ number_format($integration->transactions_count ?? 0) }}</span></div>
            <div class="flex justify-between"><span class="detail-label">Criado</span><span class="detail-value">{{ $integration->created_at?->format('d/m/Y H:i') }}</span></div>
        </div>
    </div>

    <div class="card animate-up" style="animation-delay: 0.2s;">
        <h3 style="font-size: 1rem; font-weight: 700; margin-bottom: 16px;">API Key</h3>
        <div style="background: var(--surface-hover); padding: 12px; border-radius: 8px; font-family: monospace; font-size: 0.8rem; word-break: break-all; margin-bottom: 16px;">
            {{ $integration->api_key_prefix ?? 'N/A' }}••••••••••••
        </div>
        <form method="POST" action="{{ route('dashboard.integrations.regenerate-key', $integration->id) }}" onsubmit="return confirm('Tem certeza? A chave atual será invalidada.')">
            @csrf
            <button type="submit" class="btn btn-danger btn-sm"><i class="fas fa-sync"></i> Regenerar API Key</button>
        </form>

        <h3 style="font-size: 1rem; font-weight: 700; margin: 24px 0 16px;">Atualizar</h3>
        <form method="POST" action="{{ route('dashboard.integrations.update', $integration->id) }}">
            @csrf
            @method('PUT')
            <div class="form-group">
                <label>Nome</label>
                <input type="text" name="name" value="{{ $integration->name }}">
            </div>
            <div class="form-group">
                <label>URL Base</label>
                <input type="url" name="base_url" value="{{ $integration->base_url }}">
            </div>
            <button type="submit" class="btn btn-primary btn-sm">Salvar</button>
        </form>
    </div>
</div>
@endsection
