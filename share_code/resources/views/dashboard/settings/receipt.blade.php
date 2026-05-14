@extends('dashboard.layouts.app')
@section('title', 'Comprovante')

@section('header_actions')
    <div style="display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.15); padding: 8px 16px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.2); color: white; font-size: 0.75rem; font-weight: 800;">
        <i class="fas fa-eye"></i> MODO PREVISÃO
    </div>
@endsection

@section('content')
<div class="animate-up" style="max-width: 900px; margin: 0 auto;">
    <div class="card" style="padding: 0; overflow: hidden; border-radius: 28px; border: 1px solid var(--border); box-shadow: var(--shadow-lg); background: white;">
        <div style="background: #f8fafc; padding: 30px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between;">
             <div>
                <h2 style="font-size: 1.4rem; font-weight: 900; color: var(--bg-sidebar); margin-bottom: 4px;">Editor de Recibo Elite</h2>
                <p style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600;">Personalize a experiência pós-venda do seu cliente.</p>
             </div>
             <div style="width: 54px; height: 54px; background: rgba(124, 58, 237, 0.1); color: var(--primary); border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">
                <i class="fas fa-file-invoice"></i>
             </div>
        </div>

        <form action="{{ route('dashboard.settings.receipt.update') }}" method="POST" style="padding: 40px;">
            @csrf
            @method('PUT')

            <div style="display: grid; gap: 30px;">
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
                    <div class="form-group">
                        <label style="display: block; font-size: 0.75rem; font-weight: 900; text-transform: uppercase; color: var(--text-muted); margin-bottom: 12px; letter-spacing: 0.6px;">Título do Cabeçalho</label>
                        <input type="text" name="header_text" value="{{ $receipt['header_text'] }}" style="width: 100%; height: 52px; padding: 0 20px; border-radius: 14px; border: 2px solid #f1f5f9; background: #f8fafc; font-size: 1rem; font-weight: 600; outline: none; transition: all 0.2s ease;">
                    </div>
                    <div class="form-group">
                        <label style="display: block; font-size: 0.75rem; font-weight: 900; text-transform: uppercase; color: var(--text-muted); margin-bottom: 12px; letter-spacing: 0.6px;">Identidade Visual</label>
                        <div style="display: flex; gap: 12px; align-items: center; background: #f8fafc; padding: 12px 20px; border-radius: 14px; border: 2px dashed #e2e8f0;">
                            <i class="fas fa-image" style="color: var(--text-muted);"></i>
                            <span style="font-size: 0.75rem; font-weight: 800; color: #475569;">LOGO GLOBAL ATIVO</span>
                            <div style="margin-left: auto;">
                                <input type="checkbox" name="show_logo" {{ $receipt['show_logo'] ? 'checked' : '' }} style="width: 20px; height: 20px; accent-color: var(--primary); cursor: pointer;">
                            </div>
                        </div>
                    </div>
                </div>

                <div class="form-group">
                    <label style="display: block; font-size: 0.75rem; font-weight: 900; text-transform: uppercase; color: var(--text-muted); margin-bottom: 12px; letter-spacing: 0.6px;">Mensagem de Agradecimento (Rodapé)</label>
                    <textarea name="footer_text" rows="4" style="width: 100%; padding: 20px; border-radius: 18px; border: 2px solid #f1f5f9; background: #f8fafc; font-size: 1rem; font-weight: 600; outline: none; font-family: inherit; line-height: 1.6;">{{ $receipt['footer_text'] }}</textarea>
                </div>

                <div style="background: rgba(124, 58, 237, 0.03); padding: 24px; border-radius: 20px; border: 1px solid rgba(124, 58, 237, 0.1);">
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <div style="width: 40px; height: 40px; background: white; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: var(--primary); font-size: 1.1rem; border: 1px solid var(--border);">
                                <i class="fas fa-user-shield"></i>
                            </div>
                            <div>
                                <h4 style="font-size: 0.95rem; font-weight: 900; color: var(--bg-sidebar); margin-bottom: 2px;">Transparência de Dados</h4>
                                <p style="font-size: 0.75rem; font-weight: 600; color: var(--text-muted);">Exibir detalhes do pagador no corpo do PDF.</p>
                            </div>
                        </div>
                        <label class="switch" style="position: relative; display: inline-block; width: 50px; height: 26px;">
                            <input type="checkbox" name="show_customer_data" {{ $receipt['show_customer_data'] ? 'checked' : '' }} style="opacity: 0; width: 0; height: 0;">
                            <span class="slider round" style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #cbd5e1; transition: .4s; border-radius: 34px;"></span>
                        </label>
                    </div>
                </div>

                <div style="display: flex; gap: 15px; margin-top: 10px; justify-content: flex-end;">
                    <a href="#" class="btn" style="height: 54px; padding: 0 30px; border-radius: 16px; background: #f1f5f9; color: #475569; font-weight: 800; font-size: 0.9rem; text-decoration: none; display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-vial"></i> TESTAR ENVIO
                    </a>
                    <button type="submit" class="btn" style="height: 54px; padding: 0 40px; border-radius: 16px; background: var(--primary); color: white; border: none; font-weight: 900; font-size: 0.95rem; cursor: pointer; box-shadow: 0 10px 20px -5px rgba(124, 58, 237, 0.4);">
                        SALVAR CONFIGURAÇÕES
                    </button>
                </div>
            </div>
        </form>
    </div>
</div>

<style>
    .slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 4px; bottom: 4px; background-color: white; transition: .4s; border-radius: 50%; }
    input:checked + .slider { background-color: var(--primary); }
    input:checked + .slider:before { transform: translateX(24px); }
</style>
@endsection
