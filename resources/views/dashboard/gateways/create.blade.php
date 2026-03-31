@extends('dashboard.layouts.app')

@section('title', 'Novo Gateway')

@section('content')
<a href="{{ route('dashboard.gateways.index') }}" class="back-link animate-up">
    <i class="fas fa-arrow-left"></i> Voltar para Gateways
</a>

<div class="card animate-up" style="animation-delay: 0.1s; max-width: 600px;">
    <h3 style="font-size: 1rem; font-weight: 700; margin-bottom: 20px;">Adicionar Gateway</h3>
    <form method="POST" action="{{ route('dashboard.gateways.store') }}">
        @csrf
        <div class="form-group">
            <label>Nome</label>
            <input type="text" name="name" required placeholder="Ex: Asaas Principal">
        </div>
        <div class="form-group">
            <label>Tipo</label>
            <select name="type" required>
                <option value="asaas">Asaas</option>
                <option value="stripe">Stripe</option>
                <option value="pagseguro">PagSeguro</option>
                <option value="mercadopago">Mercado Pago</option>
            </select>
        </div>
        <div class="form-group">
            <label>API Key</label>
            <input type="text" name="api_key" required placeholder="$aact_...">
        </div>
        <div class="form-group">
            <label>Ambiente</label>
            <select name="environment">
                <option value="production">Produção</option>
                <option value="sandbox">Sandbox</option>
            </select>
        </div>
        <div style="margin-top: 20px;">
            <button type="submit" class="btn btn-primary"><i class="fas fa-check"></i> Criar Gateway</button>
        </div>
    </form>
</div>
@endsection
