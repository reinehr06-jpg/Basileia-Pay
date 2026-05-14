@extends('dashboard.layouts.app')

@section('title', 'Webhook #' . $delivery->id)

@section('content')
<a href="{{ route('dashboard.webhooks') }}" class="back-link animate-up">
    <i class="fas fa-arrow-left"></i> Voltar para Webhooks
</a>

<div class="card animate-up" style="animation-delay: 0.1s;">
    <h3 style="font-size: 1rem; font-weight: 700; margin-bottom: 16px;">Detalhes do Webhook</h3>
    <div class="space-y-3">
        <div class="flex justify-between"><span class="detail-label">Evento</span><span class="detail-value" style="font-family: monospace;">{{ $delivery->event_type }}</span></div>
        <div class="flex justify-between"><span class="detail-label">Endpoint</span><span class="detail-value" style="font-size: 0.8rem;">{{ $delivery->endpoint?->url ?? '-' }}</span></div>
        <div class="flex justify-between"><span class="detail-label">Integração</span><span class="detail-value">{{ $delivery->endpoint?->integration?->name ?? '-' }}</span></div>
        <div class="flex justify-between"><span class="detail-label">Status</span>
            @php $ws = ['delivered'=>'badge-success','pending'=>'badge-warning','failed'=>'badge-danger']; $wl = ['delivered'=>'Entregue','pending'=>'Pendente','failed'=>'Falhou']; @endphp
            <span class="badge {{ $ws[$delivery->status] ?? 'badge-gray' }}">{{ $wl[$delivery->status] ?? ucfirst($delivery->status) }}</span>
        </div>
        <div class="flex justify-between"><span class="detail-label">Tentativas</span><span class="detail-value">{{ $delivery->attempts }} / {{ $delivery->max_attempts }}</span></div>
        <div class="flex justify-between"><span class="detail-label">Response Code</span><span class="detail-value" style="font-family: monospace;">{{ $delivery->response_code ?? '-' }}</span></div>
        <div class="flex justify-between"><span class="detail-label">Criado</span><span class="detail-value">{{ $delivery->created_at?->format('d/m/Y H:i:s') }}</span></div>
        <div class="flex justify-between"><span class="detail-label">Entregue</span><span class="detail-value">{{ $delivery->delivered_at?->format('d/m/Y H:i:s') ?? '-' }}</span></div>
    </div>
</div>

@if($delivery->payload)
<div class="card animate-up" style="animation-delay: 0.2s; margin-top: 24px;">
    <h3 style="font-size: 1rem; font-weight: 700; margin-bottom: 16px;">Payload</h3>
    <pre style="background: var(--surface-hover); padding: 16px; border-radius: 8px; font-size: 0.8rem; overflow-x: auto; max-height: 400px;">{{ json_encode($delivery->payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) }}</pre>
</div>
@endif

@if($delivery->response_body)
<div class="card animate-up" style="animation-delay: 0.3s; margin-top: 24px;">
    <h3 style="font-size: 1rem; font-weight: 700; margin-bottom: 16px;">Response</h3>
    <pre style="background: var(--surface-hover); padding: 16px; border-radius: 8px; font-size: 0.8rem; overflow-x: auto; max-height: 200px;">{{ $delivery->response_body }}</pre>
</div>
@endif

@if($delivery->status === 'failed')
<div style="margin-top: 24px;">
    <form method="POST" action="{{ route('dashboard.webhooks.retry', $delivery->id) }}">
        @csrf
        <button type="submit" class="btn btn-primary"><i class="fas fa-redo"></i> Reenviar Webhook</button>
    </form>
</div>
@endif
@endsection
