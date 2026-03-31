@extends('dashboard.layouts.app')

@section('title', 'Webhooks')

@section('content')
<div class="page-header animate-up" style="animation-delay: 0.1s;">
    <h2>Webhooks</h2>
</div>

<div class="filter-form animate-up" style="animation-delay: 0.2s;">
    <form method="GET" action="{{ route('dashboard.webhooks') }}">
        <div class="filter-row">
            <div class="filter-group">
                <label>Status</label>
                <select name="status">
                    <option value="">Todos</option>
                    <option value="delivered" {{ request('status') == 'delivered' ? 'selected' : '' }}>Entregue</option>
                    <option value="pending" {{ request('status') == 'pending' ? 'selected' : '' }}>Pendente</option>
                    <option value="failed" {{ request('status') == 'failed' ? 'selected' : '' }}>Falhou</option>
                </select>
            </div>
            <div class="filter-group">
                <label>Tipo de Evento</label>
                <input type="text" name="event_type" value="{{ request('event_type') }}" placeholder="payment.approved">
            </div>
            <div class="filter-actions">
                <button type="submit" class="btn btn-primary"><i class="fas fa-search"></i></button>
                <a href="{{ route('dashboard.webhooks') }}" class="btn btn-secondary">Limpar</a>
            </div>
        </div>
    </form>
</div>

<div class="card animate-up" style="animation-delay: 0.3s;">
    <div class="table-wrapper">
        <table>
            <thead>
                <tr>
                    <th>Evento</th>
                    <th>Integração</th>
                    <th>Status</th>
                    <th>Tentativas</th>
                    <th>Resp. Code</th>
                    <th>Data</th>
                    <th style="text-align: right;">Ações</th>
                </tr>
            </thead>
            <tbody>
                @forelse($deliveries as $d)
                    <tr>
                        <td style="font-family: monospace; font-size: 0.8rem;">{{ $d->event_type }}</td>
                        <td>{{ $d->endpoint?->integration?->name ?? '-' }}</td>
                        <td>
                            @php
                                $ws = ['delivered' => 'badge-success', 'pending' => 'badge-warning', 'failed' => 'badge-danger'];
                                $wl = ['delivered' => 'Entregue', 'pending' => 'Pendente', 'failed' => 'Falhou'];
                            @endphp
                            <span class="badge {{ $ws[$d->status] ?? 'badge-gray' }}">{{ $wl[$d->status] ?? ucfirst($d->status) }}</span>
                        </td>
                        <td>{{ $d->attempts }}/{{ $d->max_attempts }}</td>
                        <td style="font-family: monospace; font-size: 0.8rem;">{{ $d->response_code ?? '-' }}</td>
                        <td style="color: var(--text-muted);">{{ $d->created_at?->format('d/m/Y H:i') }}</td>
                        <td style="text-align: right;">
                            <a href="{{ route('dashboard.webhooks.show', $d->id) }}" class="btn btn-secondary btn-sm"><i class="fas fa-eye"></i></a>
                            @if($d->status === 'failed')
                                <form method="POST" action="{{ route('dashboard.webhooks.retry', $d->id) }}" style="display: inline;">
                                    @csrf
                                    <button type="submit" class="btn btn-primary btn-sm"><i class="fas fa-redo"></i></button>
                                </form>
                            @endif
                        </td>
                    </tr>
                @empty
                    <tr><td colspan="7" class="text-center" style="padding: 40px; color: var(--text-muted);">Nenhum webhook encontrado.</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>
</div>
@endsection
