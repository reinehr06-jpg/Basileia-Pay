@extends('dashboard.layouts.app')
@section('title', 'Links de Pagamento')

@section('header_actions')
    <button onclick="document.getElementById('modal-create').classList.add('show')" class="btn" style="background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.3); padding: 8px 16px; border-radius: 10px; font-weight: 800; font-size: 0.75rem; cursor: pointer; display: flex; align-items: center; gap: 8px;">
        <i class="fas fa-plus"></i> NOVO LINK / EVENTO
    </button>
@endsection

@section('content')
<!-- Metric Bar -->
<div class="kpi-grid" style="margin-bottom: 24px;">
    <div class="kpi-card animate-up" style="animation-delay: 0.1s;">
        <div class="label">Links de Pagamento</div>
        <div class="value">{{ $events->count() }}</div>
        <i class="fas fa-link kpi-icon"></i>
    </div>
    <div class="kpi-card animate-up" style="animation-delay: 0.2s; border-left: 3px solid var(--success);">
        <div class="label">Total de Vagas</div>
        <div class="value">{{ $events->sum('vagas_total') }}</div>
        <i class="fas fa-users kpi-icon"></i>
    </div>
    <div class="kpi-card animate-up" style="animation-delay: 0.3s;">
        <div class="label">Taxa de Ocupação</div>
        <div class="value">
            @php 
                $total = $events->sum('vagas_total');
                $ocupadas = $events->sum('vagas_ocupadas');
                echo ($total > 0) ? number_format(($ocupadas / $total) * 100, 1) : '0';
            @endphp%
        </div>
        <i class="fas fa-chart-pie kpi-icon"></i>
    </div>
    <div class="kpi-card animate-up" style="animation-delay: 0.4s; border-left: 3px solid var(--primary-light);">
        <div class="label">Conversão Média</div>
        <div class="value">12.5%</div>
        <i class="fas fa-bullseye kpi-icon"></i>
    </div>
</div>

<!-- Filter Bar Elite -->
<div class="card animate-up" style="padding: 12px 20px; margin-bottom: 24px; border-radius: 16px; display: flex; align-items: center; justify-content: space-between; background: #fff; border: 1px solid var(--border);">
    <div style="display: flex; align-items: center; gap: 15px;">
        <div style="font-size: 0.7rem; font-weight: 900; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Gerenciar Ofertas:</div>
        <div style="position: relative;">
            <select style="appearance: none; background: #f8fafc; border: 1px solid var(--border); padding: 8px 36px 8px 16px; border-radius: 10px; font-size: 0.8rem; font-weight: 700; color: var(--text-primary); cursor: pointer; min-width: 140px;">
                <option>Todos os Links</option>
                <option>Ativos</option>
                <option>Esgotados</option>
            </select>
            <i class="fas fa-chevron-down" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); font-size: 0.6rem; color: var(--text-muted); pointer-events: none;"></i>
        </div>
        <div style="position: relative;">
            <input type="text" placeholder="Buscar título ou slug..." style="background: #f8fafc; border: 1px solid var(--border); padding: 8px 16px; border-radius: 10px; font-size: 0.8rem; font-weight: 600; min-width: 280px;">
        </div>
    </div>
    <div style="display: flex; align-items: center; gap: 12px;">
        <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">Exibindo {{ $events->count() }} links</span>
        <button class="btn" style="background: #f1f5f9; color: #475569; border: none; padding: 10px; border-radius: 10px; cursor: pointer;"><i class="fas fa-sync-alt"></i></button>
    </div>
</div>

<div class="card animate-up" style="padding: 0; overflow: hidden; border-radius: 20px; border: 1px solid var(--border); box-shadow: var(--shadow-sm);">
    <div class="table-wrapper" style="border: none;">
        <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr style="background: #f8fafc; border-bottom: 1px solid var(--border);">
                    <th style="padding: 16px 24px; text-align: left; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; color: var(--text-muted); letter-spacing: 1px;">Título do Evento / Link</th>
                    <th style="padding: 16px 24px; text-align: left; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; color: var(--text-muted); letter-spacing: 1px;">Valor Unitário</th>
                    <th style="padding: 16px 24px; text-align: left; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; color: var(--text-muted); letter-spacing: 1px;">Ocupação (Vagas)</th>
                    <th style="padding: 16px 24px; text-align: left; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; color: var(--text-muted); letter-spacing: 1px;">Status</th>
                    <th style="padding: 16px 24px; text-align: left; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; color: var(--text-muted); letter-spacing: 1px;">Link Púbico</th>
                    <th style="padding: 16px 24px; text-align: right; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; color: var(--text-muted); letter-spacing: 1px;">Ações</th>
                </tr>
            </thead>
            <tbody>
                @forelse($events as $event)
                    <tr style="border-bottom: 1px solid var(--border-light); transition: background 0.2s ease;">
                        <td style="padding: 16px 24px;">
                            <div style="font-weight: 800; color: var(--bg-sidebar); font-size: 0.9rem;">{{ $event->titulo }}</div>
                            <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">Criado em {{ $event->created_at->format('d/m/Y') }}</div>
                        </td>
                        <td style="padding: 16px 24px;">
                            <div style="font-weight: 900; color: var(--text-main); font-size: 0.95rem;">R$ {{ number_format($event->valor, 2, ',', '.') }}</div>
                        </td>
                        <td style="padding: 16px 24px;">
                            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 4px;">
                                <div style="flex: 1; height: 8px; background: #f1f5f9; border-radius: 4px; overflow: hidden; min-width: 100px;">
                                    <div style="width: {{ $event->vagas_total > 0 ? ($event->vagas_ocupadas / $event->vagas_total * 100) : 0 }}%; height: 100%; background: {{ $event->vagas_ocupadas >= $event->vagas_total ? 'var(--danger)' : 'var(--success)' }}; border-radius: 4px;"></div>
                                </div>
                                <span style="font-size: 0.75rem; font-weight: 900; color: var(--text-secondary);">{{ $event->vagas_ocupadas }}/{{ $event->vagas_total }}</span>
                            </div>
                        </td>
                        <td style="padding: 16px 24px;">
                            @if($event->status === 'ativo')
                                <span style="background: #ecfdf5; color: #10b981; padding: 5px 12px; border-radius: 8px; font-size: 0.65rem; font-weight: 900; letter-spacing: 0.5px;">ATIVO</span>
                            @elseif($event->status === 'esgotado')
                                <span style="background: #fef2f2; color: #ef4444; padding: 5px 12px; border-radius: 8px; font-size: 0.65rem; font-weight: 900; letter-spacing: 0.5px;">ESGOTADO</span>
                            @else
                                <span style="background: #f1f5f9; color: #64748b; padding: 5px 12px; border-radius: 8px; font-size: 0.65rem; font-weight: 900; letter-spacing: 0.5px;">EXPIRADO</span>
                            @endif
                        </td>
                        <td style="padding: 16px 24px;">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <code style="font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; color: var(--primary); background: #f8fafc; padding: 4px 8px; border-radius: 6px; border: 1px solid var(--border-light); max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ url("/c/{$event->slug}") }}</code>
                                <button type="button" class="btn" style="background: #fff; border: 1px solid var(--border); padding: 5px 10px; border-radius: 6px; cursor: pointer; color: var(--text-muted);" onclick="navigator.clipboard.writeText('{{ url("/c/{$event->slug}") }}'); this.innerHTML='<i class=\'fas fa-check\'></i>'; setTimeout(() => this.innerHTML='<i class=\'fas fa-copy\'></i>', 2000);">
                                    <i class="fas fa-copy" style="font-size: 0.75rem;"></i>
                                </button>
                            </div>
                        </td>
                        <td style="padding: 16px 24px; text-align: right;">
                            <div style="display: flex; align-items: center; justify-content: flex-end; gap: 10px;">
                                <a href="#" class="btn" style="background: #fff; color: #475569; border: 1px solid var(--border); padding: 10px; border-radius: 10px; display: flex; align-items: center; justify-content: center; text-decoration: none;" title="Ver Detalhes">
                                    <i class="fas fa-eye"></i>
                                </a>
                                <form method="POST" action="{{ route('dashboard.events.destroy', $event) }}" style="display: inline;" onsubmit="return confirm('Remover link permanentemente?')">
                                    @csrf @method('DELETE')
                                    <button type="submit" class="btn" style="background: #fef2f2; color: #ef4444; border: none; padding: 10px; border-radius: 10px; cursor: pointer;">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </form>
                            </div>
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="6" style="padding: 80px 24px; text-align: center; background: #fff; border: 2px dashed var(--border);">
                             <div style="width: 80px; height: 80px; background: #f8fafc; color: var(--border); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; margin: 0 auto 24px;">
                                <i class="fas fa-link"></i>
                             </div>
                             <h3 style="font-size: 1.25rem; font-weight: 900; color: var(--bg-sidebar); margin-bottom: 8px;">Nenhum link de pagamento</h3>
                             <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 30px;">Crie links rápidos para vender seus produtos em qualquer lugar.</p>
                             <button onclick="document.getElementById('modal-create').classList.add('show')" class="btn btn-primary" style="padding: 14px 28px; border-radius: 14px;">CRIAR PRIMEIRO LINK</button>
                        </td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>
    
    @if($events->hasPages())
    <div style="padding: 20px 24px; background: #f8fafc; border-top: 1px solid var(--border); display: flex; justify-content: flex-end;">
        {{ $events->links() }}
    </div>
    @endif
</div>

<!-- Modal Create (Centered) -->
<div id="modal-create" class="modal-overlay" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.8); backdrop-filter: blur(8px); z-index: 200; align-items: center; justify-content: center;">
    <div class="modal-content animate-up" style="background: #fff; width: 100%; max-width: 600px; border-radius: 28px; padding: 0; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
        <div style="background: var(--elite-purple); padding: 30px; text-align: center; color: white;">
            <div style="width: 60px; height: 60px; background: rgba(255,255,255,0.2); border-radius: 18px; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; margin: 0 auto 20px;">
                <i class="fas fa-plus"></i>
            </div>
            <h3 style="font-size: 1.4rem; font-weight: 900; margin-bottom: 6px;">Novo Link de Pagamento</h3>
            <p style="font-size: 0.85rem; opacity: 0.8;">Venda produtos ou serviços com checkout rápido.</p>
        </div>
        
        <form method="POST" action="{{ route('dashboard.events.store') }}" style="padding: 30px;">
            @csrf
            <div style="display: grid; gap: 20px;">
                <div class="form-group">
                    <label style="display: block; font-size: 0.75rem; font-weight: 900; text-transform: uppercase; color: var(--text-muted); margin-bottom: 8px; letter-spacing: 0.5px;">Título da Oferta</label>
                    <input type="text" name="titulo" required placeholder="Ex: Masterclass Vendas Elite" style="width: 100%; height: 50px; padding: 0 18px; border-radius: 12px; border: 1px solid var(--border); background: #f8fafc; font-size: 0.9rem; font-weight: 600;">
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div class="form-group">
                        <label style="display: block; font-size: 0.75rem; font-weight: 900; text-transform: uppercase; color: var(--text-muted); margin-bottom: 8px; letter-spacing: 0.5px;">Valor (R$)</label>
                        <input type="number" name="valor" step="0.01" min="0.01" required placeholder="497.00" style="width: 100%; height: 50px; padding: 0 18px; border-radius: 12px; border: 1px solid var(--border); background: #f8fafc; font-size: 0.9rem; font-weight: 600;">
                    </div>
                    <div class="form-group">
                        <label style="display: block; font-size: 0.75rem; font-weight: 900; text-transform: uppercase; color: var(--text-muted); margin-bottom: 8px; letter-spacing: 0.5px;">Total de Vagas</label>
                        <input type="number" name="vagas_total" required placeholder="100" style="width: 100%; height: 50px; padding: 0 18px; border-radius: 12px; border: 1px solid var(--border); background: #f8fafc; font-size: 0.9rem; font-weight: 600;">
                    </div>
                </div>

                <div class="form-group">
                    <label style="display: block; font-size: 0.75rem; font-weight: 900; text-transform: uppercase; color: var(--text-muted); margin-bottom: 8px; letter-spacing: 0.5px;">WhatsApp Suporte</label>
                    <input type="text" name="whatsapp_vendedor" required placeholder="5511999999999" style="width: 100%; height: 50px; padding: 0 18px; border-radius: 12px; border: 1px solid var(--border); background: #f8fafc; font-size: 0.9rem; font-weight: 600;">
                </div>

                <div style="display: flex; gap: 12px; margin-top: 10px;">
                    <button type="button" class="btn" onclick="document.getElementById('modal-create').classList.remove('show')" style="flex: 1; height: 54px; background: #f8fafc; color: var(--text-muted); border: 1px solid var(--border); border-radius: 16px; font-weight: 800; font-size: 0.9rem; cursor: pointer;">Cancelar</button>
                    <button type="submit" class="btn" style="flex: 2; height: 54px; background: var(--primary); color: white; border: none; border-radius: 16px; font-weight: 900; font-size: 0.95rem; cursor: pointer; box-shadow: 0 10px 20px -5px rgba(124, 58, 237, 0.3);">CRIAR LINK AGORA</button>
                </div>
            </div>
        </form>
    </div>
</div>

<script>
    // Toggle Modal Utility
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') document.getElementById('modal-create').classList.remove('show');
    });
    // Add show class trigger
    const modal = document.getElementById('modal-create');
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'class') {
                modal.style.display = modal.classList.contains('show') ? 'flex' : 'none';
            }
        });
    });
    observer.observe(modal, { attributes: true });
</script>
@endsection
