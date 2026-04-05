@extends('dashboard.layouts.app')
@section('title', 'Integrações')

@section('content')
<div class="animate-up" style="margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between;">
    <div>
        <h2 style="font-size: 1.5rem; font-weight: 900; color: var(--bg-sidebar); letter-spacing: -0.5px;">Central de Integrações</h2>
        <p style="font-size: 0.85rem; color: var(--text-muted);">Gerencie todos os sistemas que enviam vendas para o Basileia Secure.</p>
    </div>
    <button onclick="document.getElementById('modal-create').classList.add('show')" class="btn" style="background: var(--primary); color: white; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 800; font-size: 0.85rem; cursor: pointer; display: flex; align-items: center; gap: 10px; box-shadow: 0 10px 15px -3px rgba(124, 58, 237, 0.2);">
        <i class="fas fa-plus"></i> Nova Integração
    </button>
</div>

<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 24px;">
    @forelse($integrations as $int)
        <div class="card animate-up" style="padding: 24px; border-radius: 20px; transition: all 0.3s ease; position: relative; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between; min-height: 200px;">
            <div style="position: absolute; top: 0; right: 0; padding: 16px;">
                @if($int->status === 'active')
                    <span style="background: #ecfdf5; color: #10b981; padding: 6px 12px; border-radius: 8px; font-size: 0.65rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px;">Ativo</span>
                @else
                    <span style="background: #fef2f2; color: #ef4444; padding: 6px 12px; border-radius: 8px; font-size: 0.65rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px;">Inativo</span>
                @endif
            </div>

            <div>
                <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 12px;">
                    <div style="width: 48px; height: 48px; background: rgba(124, 58, 237, 0.1); color: var(--primary); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">
                        <i class="fas fa-plug"></i>
                    </div>
                    <div>
                        <h3 style="font-size: 1.1rem; font-weight: 900; color: var(--bg-sidebar); margin-bottom: 2px;">{{ $int->name }}</h3>
                        <p style="font-size: 0.8rem; color: var(--text-muted);">{{ Str::limit($int->base_url, 40) }}</p>
                    </div>
                </div>
                
                <div style="background: #f8fafc; padding: 12px; border-radius: 12px; margin-bottom: 20px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <span style="font-size: 0.7rem; font-weight: 800; text-transform: uppercase; color: #64748b;">API Key Prefix</span>
                        <code style="font-size: 0.85rem; font-weight: 700; color: var(--primary);">{{ $int->api_key_prefix }}...</code>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: 0.7rem; font-weight: 800; text-transform: uppercase; color: #64748b;">Vendas Processadas</span>
                        <span style="font-size: 0.9rem; font-weight: 900; color: var(--bg-sidebar);">{{ number_format($int->transactions_count ?? 0) }}</span>
                    </div>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr auto; gap: 12px;">
                <a href="{{ route('dashboard.integrations.show', $int->id) }}" class="btn" style="background: var(--primary); color: white; border: none; padding: 12px; border-radius: 12px; font-weight: 800; font-size: 0.85rem; text-decoration: none; text-align: center; transition: all 0.2s ease;">
                     Configurar Sistema
                </a>
                <form method="POST" action="{{ route('dashboard.integrations.toggle', $int->id) }}" style="display: inline;">
                    @csrf
                    <button type="submit" style="background: #f1f5f9; color: #475569; border: none; padding: 12px 18px; border-radius: 12px; font-weight: 800; font-size: 0.85rem; cursor: pointer; transition: all 0.2s ease;">
                        {{ $int->status === 'active' ? 'Pausar' : 'Ativar' }}
                    </button>
                </form>
            </div>
        </div>
    @empty
        <div class="card animate-up" style="grid-column: 1 / -1; padding: 80px 24px; text-align: center;">
            <div style="width: 80px; height: 80px; background: #f8fafc; color: var(--text-muted); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; margin: 0 auto 24px; opacity: 0.5;">
                <i class="fas fa-network-wired"></i>
            </div>
            <h3 style="font-size: 1.25rem; font-weight: 900; color: var(--bg-sidebar); margin-bottom: 8px;">Comece sua jornada Elite</h3>
            <p style="font-size: 0.9rem; color: var(--text-muted); max-width: 400px; margin: 0 auto 30px;">Conecte seu primeiro sistema de vendas para começar a processar pagamentos globais com segurança.</p>
            <button onclick="document.getElementById('modal-create').classList.add('show')" class="btn" style="background: var(--primary); color: white; border: none; padding: 14px 28px; border-radius: 12px; font-weight: 800; font-size: 0.9rem; cursor: pointer;">
                Criar Minha Primeira Integração
            </button>
        </div>
    @endforelse
</div>

<!-- Modal Create -->
<div id="modal-create" class="modal-overlay">
    <div class="modal-content animate-up" style="max-width: 500px; border-radius: 24px;">
        <div class="modal-header" style="border-bottom: 1px solid var(--border); padding-bottom: 20px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center;">
            <h3 style="font-size: 1.2rem; font-weight: 900; color: var(--bg-sidebar); letter-spacing: -0.5px;">Nova Conexão</h3>
            <button class="modal-close" onclick="document.getElementById('modal-create').classList.remove('show')" style="background: none; border: none; font-size: 1.5rem; color: var(--text-muted); cursor: pointer;">&times;</button>
        </div>
        <form method="POST" action="{{ route('dashboard.integrations.store') }}">
            @csrf
            <div style="display: grid; gap: 24px;">
                <div class="form-group">
                    <label style="display: block; font-size: 0.75rem; font-weight: 900; text-transform: uppercase; color: var(--text-muted); margin-bottom: 10px; letter-spacing: 0.5px;">Nome da Integração</label>
                    <input type="text" name="name" required placeholder="Ex: Vendas Basileia Filial Sul" style="width: 100%; box-sizing: border-box; padding: 14px 18px; border-radius: 14px; border: 1px solid var(--border); background: #f8fafc; font-size: 0.95rem; transition: border-color 0.2s ease;">
                    <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 8px;">Dê um nome fácil para identificar no seu dashboard.</p>
                </div>
                <div class="form-group">
                    <label style="display: block; font-size: 0.75rem; font-weight: 900; text-transform: uppercase; color: var(--text-muted); margin-bottom: 10px; letter-spacing: 0.5px;">URL Base do Sistema (Opcional)</label>
                    <input type="url" name="base_url" placeholder="https://seudominio.com" style="width: 100%; box-sizing: border-box; padding: 14px 18px; border-radius: 14px; border: 1px solid var(--border); background: #f8fafc; font-size: 0.95rem;">
                </div>
                
                <div style="background: rgba(124, 58, 237, 0.05); padding: 16px; border-radius: 14px; border: 1px solid rgba(124, 58, 237, 0.1);">
                    <p style="font-size: 0.8rem; color: var(--primary); font-weight: 700; line-height: 1.5; margin: 0;">
                        <i class="fas fa-shield-alt" style="margin-right: 6px;"></i>
                        Ao criar, o sistema gerará automaticamente uma API Key de alta segurança para comunicações seguras.
                    </p>
                </div>

                <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 10px;">
                    <button type="button" class="btn" onclick="document.getElementById('modal-create').classList.remove('show')" style="background: transparent; color: var(--text-muted); border: none; padding: 14px 24px; font-weight: 800; font-size: 0.9rem; cursor: pointer;">Cancelar</button>
                    <button type="submit" class="btn" style="background: var(--primary); color: white; border: none; padding: 14px 28px; border-radius: 14px; font-weight: 800; font-size: 0.9rem; cursor: pointer; box-shadow: 0 10px 15px -3px rgba(124, 58, 237, 0.2);">Criar Integração</button>
                </div>
            </div>
        </form>
    </div>
</div>
@endsection
