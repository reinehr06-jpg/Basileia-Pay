@extends('dashboard.layouts.app')
@section('title', 'Checkout Builder')

@section('content')
<div style="padding: 30px;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
        <div>
            <h1 style="font-size: 1.75rem; font-weight: 800; color: var(--text-main);">Checkout Builder</h1>
            <p style="color: var(--text-secondary); margin-top: 4px;">Crie e personalize seus checkouts</p>
        </div>
        <a href="{{ route('dashboard.checkout-configs.create') }}" class="btn-primary" style="display: inline-flex; align-items: center; gap: 8px;">
            <i class="fas fa-plus"></i> Novo Checkout
        </a>
    </div>

    @if($configs->isEmpty())
    <div style="background: white; border-radius: 16px; padding: 60px; text-align: center;">
        <div style="font-size: 4rem; margin-bottom: 20px;">🎨</div>
        <h3 style="margin-bottom: 10px;">Nenhum checkout criado</h3>
        <p style="color: var(--text-secondary); margin-bottom: 24px;">Crie seu primeiro checkout personalizado</p>
        <a href="{{ route('dashboard.checkout-configs.create') }}" class="btn-primary">Criar Checkout</a>
    </div>
    @else
    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;">
        @foreach($configs as $config)
        <div style="background: white; border-radius: 16px; padding: 24px; border: 1px solid var(--border-light);">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 16px;">
                <div>
                    <h3 style="font-weight: 700; margin-bottom: 4px;">{{ $config->name }}</h3>
                    <span style="font-size: 0.8rem; color: var(--text-secondary);">Slug: {{ $config->slug }}</span>
                </div>
                @if($config->is_active)
                <span style="background: #10b981; color: white; padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 600;">ATIVO</span>
                @endif
            </div>
            
            <div style="display: flex; gap: 8px; margin-top: 16px;">
                <a href="{{ route('dashboard.checkout-configs.edit', $config->id) }}" class="btn" style="flex: 1; text-align: center; padding: 10px; background: var(--primary); color: white; border-radius: 8px; font-weight: 600; font-size: 0.85rem;">
                    Editar
                </a>
                <a href="{{ route('dashboard.checkout-configs.preview', $config->id) }}" target="_blank" class="btn" style="padding: 10px; background: var(--bg-main); border-radius: 8px; font-size: 0.85rem;">
                    👁️
                </a>
                @if(!$config->is_active)
                <form method="POST" action="{{ route('dashboard.checkout-configs.publish', $config->id) }}">
                    @csrf
                    <button type="submit" class="btn" style="padding: 10px 16px; background: #f59e0b; color: white; border-radius: 8px; font-weight: 600; font-size: 0.85rem;">
                        Publicar
                    </button>
                </form>
                @endif
            </div>
        </div>
        @endforeach
    </div>
    @endif
</div>
@endsection
