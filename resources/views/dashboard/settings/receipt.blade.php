@extends('dashboard.layouts.app')
@section('title', 'Modelo de Comprovante')

@section('content')
<div class="animate-up" style="max-width: 800px;">
    <div style="margin-bottom: 24px;">
        <h2 style="font-size: 1.25rem; font-weight: 900; color: var(--bg-sidebar);">Configurar Comprovante</h2>
        <p style="font-size: 0.8rem; color: var(--text-muted);">Defina o modelo de recibo que seus clientes receberão após o pagamento.</p>
    </div>

    <div class="card" style="padding: 30px;">
        <form action="{{ route('dashboard.settings.receipt.update') }}" method="POST">
            @csrf
            @method('PUT')

            <div style="display: grid; gap: 24px;">
                
                <!-- Header Text -->
                <div class="form-group">
                    <label style="display: block; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; color: var(--text-muted); margin-bottom: 8px;">Título do Comprovante</label>
                    <input type="text" name="header_text" class="form-control" value="{{ $receipt['header_text'] }}" style="width: 100%; box-sizing: border-box; padding: 12px 16px; border-radius: 10px; border: 1px solid var(--border); background: #f8fafc; font-size: 0.95rem;">
                </div>

                <!-- Footer Text -->
                <div class="form-group">
                    <label style="display: block; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; color: var(--text-muted); margin-bottom: 8px;">Mensagem de Rodapé (Agradecimento)</label>
                    <textarea name="footer_text" rows="3" style="width: 100%; box-sizing: border-box; padding: 12px 16px; border-radius: 10px; border: 1px solid var(--border); background: #f8fafc; font-size: 0.95rem; font-family: inherit;">{{ $receipt['footer_text'] }}</textarea>
                </div>

                <div style="display: flex; gap: 40px; border-top: 1px solid var(--border); padding-top: 24px;">
                    <label style="display: flex; align-items: center; gap: 12px; cursor: pointer; font-size: 0.85rem; font-weight: 700;">
                        <input type="checkbox" name="show_logo" {{ $receipt['show_logo'] ? 'checked' : '' }} style="width: 18px; height: 18px; accent-color: var(--primary);">
                        Exibir Logo da Empresa
                    </label>
                    <label style="display: flex; align-items: center; gap: 12px; cursor: pointer; font-size: 0.85rem; font-weight: 700;">
                        <input type="checkbox" name="show_customer_data" {{ $receipt['show_customer_data'] ? 'checked' : '' }} style="width: 18px; height: 18px; accent-color: var(--primary);">
                        Exibir Dados do Cliente
                    </label>
                </div>

                <div style="margin-top: 10px;">
                    <button type="submit" class="btn" style="background: var(--primary); color: white; border: none; padding: 14px 24px; border-radius: 10px; font-weight: 800; font-size: 0.9rem; cursor: pointer; transition: all 0.2s ease;">
                        Salvar Modelo
                    </button>
                    <a href="#" class="btn" style="background: #f1f5f9; color: #475569; border: none; padding: 14px 24px; border-radius: 10px; font-weight: 800; font-size: 0.9rem; text-decoration: none; margin-left: 12px;">Visualizar Exemplo</a>
                </div>
            </div>
        </form>
    </div>
</div>
@endsection
