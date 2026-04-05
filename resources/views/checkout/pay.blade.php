@extends('dashboard.layouts.app')
@section('title', 'Finalizar Pagamento')

<!-- Remove sidebar/topbar for a distraction-free checkout -->
@php $hideSidebar = true; $hideTopbar = true; @endphp

@section('content')
<style>
    :root { --primary: #7c3aed; --text-main: #1e293b; --bg-light: #f8fafc; }
    body { background-color: var(--bg-light); }
    .checkout-container { max-width: 1000px; margin: 40px auto; display: grid; grid-template-columns: 1fr 380px; gap: 30px; }
    .payment-card { background: white; padding: 40px; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
    .order-summary { background: white; padding: 30px; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); height: fit-content; sticky: top; }
    .step-badge { width: 24px; height: 24px; background: var(--primary); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 800; margin-right: 12px; }
    .form-control { width: 100%; padding: 14px 16px; border: 1px solid #e2e8f0; border-radius: 12px; font-size: 1rem; transition: all 0.2s; }
    .form-control:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.1); }
    .btn-pay { background: var(--primary); color: white; border: none; padding: 18px; border-radius: 14px; font-size: 1.1rem; font-weight: 800; cursor: pointer; transition: all 0.2s; width: 100%; margin-top: 20px; }
    .btn-pay:hover { background: #6d28d9; transform: translateY(-2px); }
    .pix-box { background: #f1f5f9; padding: 24px; border-radius: 16px; text-align: center; border: 2px dashed #cbd5e1; }
    .copy-btn { background: #e2e8f0; color: #475569; border: none; padding: 8px 16px; border-radius: 8px; font-size: 0.75rem; font-weight: 700; cursor: pointer; margin-top: 10px; }
    @media (max-width: 900px) { .checkout-container { grid-template-columns: 1fr; margin: 10px; } .order-summary { order: -1; } }
</style>

<div class="checkout-container animate-up">
    <!-- Form Area -->
    <div class="payment-card">
        <div style="display: flex; align-items: center; margin-bottom: 30px;">
            <div class="step-badge">1</div>
            <h2 style="font-size: 1.25rem; font-weight: 900; color: var(--text-main);">Informações de Pagamento</h2>
        </div>

        @if($asaasData['billingType'] === 'PIX')
            <!-- PIX Flow -->
            <div style="text-align: center; margin-bottom: 30px;">
                <p style="color: #64748b; margin-bottom: 20px;">Escaneie o QR Code abaixo ou utilize a Chave Copia e Cola para pagar.</p>
                
                <div class="pix-box">
                    @if(!empty($pixData['encodedImage']))
                        <img src="data:image/png;base64,{{ $pixData['encodedImage'] }}" style="max-width: 220px; border-radius: 12px; margin-bottom: 16px;">
                    @else
                        <div style="height: 220px; display: flex; align-items: center; justify-content: center; color: var(--text-muted);">QR Code gerado no Vendas</div>
                    @endif
                    
                    <div style="font-size: 0.7rem; color: #475569; margin-bottom: 10px; word-break: break-all; opacity: 0.8;">{{ $pixData['payload'] ?? 'Clique para copiar a chave' }}</div>
                    <button class="copy-btn" onclick="navigator.clipboard.writeText('{{ $pixData['payload'] ?? '' }}'); $(this).text('Copiado!')">Copiar Código PIX</button>
                </div>
            </div>
            
            <div style="padding: 20px; background: #ecfdf5; border-radius: 12px; border-left: 4px solid #10b981; display: flex; align-items: center; gap: 15px;">
                <i class="fas fa-spinner fa-spin" style="color: #10b981;"></i>
                <p style="font-size: 0.85rem; color: #065f46; font-weight: 600;">Monitorando pagamento em tempo real...</p>
            </div>
        @else
            <!-- Credit Card Flow -->
            <form id="paymentForm" action="{{ route('checkout.process', $transaction->uuid) }}" method="POST">
                @csrf
                <div style="display: grid; gap: 20px;">
                    <div class="form-group">
                        <label style="display: block; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; color: #64748b; margin-bottom: 8px;">Número do Cartão</label>
                        <input type="text" name="card_number" class="form-control" placeholder="0000 0000 0000 0000" id="card_number">
                    </div>

                    <div class="form-group">
                        <label style="display: block; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; color: #64748b; margin-bottom: 8px;">Nome no Cartão</label>
                        <input type="text" name="holder_name" class="form-control" placeholder="JOAO SILVA">
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr 100px; gap: 16px;">
                        <div class="form-group">
                            <label style="display: block; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; color: #64748b; margin-bottom: 8px;">Mês</label>
                            <input type="text" name="expiry_month" class="form-control" placeholder="MM" maxlength="2">
                        </div>
                        <div class="form-group">
                            <label style="display: block; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; color: #64748b; margin-bottom: 8px;">Ano</label>
                            <input type="text" name="expiry_year" class="form-control" placeholder="YYYY" maxlength="4">
                        </div>
                        <div class="form-group">
                            <label style="display: block; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; color: #64748b; margin-bottom: 8px;">CVV</label>
                            <input type="text" name="cvv" class="form-control" placeholder="123" maxlength="4">
                        </div>
                    </div>
                </div>

                <div style="display: flex; align-items: center; gap: 10px; margin-top: 30px; color: #64748b; font-size: 0.8rem;">
                    <i class="fas fa-lock"></i>
                    <span>Sua conexão é protegida com criptografia de ponta a ponta.</span>
                </div>

                <button type="submit" class="btn-pay" id="payBtn">Finalizar Pagamento</button>
            </form>
        @endif
    </div>

    <!-- Summary Area -->
    <div class="order-summary">
        <h3 style="font-size: 1.1rem; font-weight: 900; margin-bottom: 24px;">Resumo do Pedido</h3>
        
        <div style="display: grid; gap: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 24px; margin-bottom: 24px;">
            <div style="display: flex; justify-content: space-between;">
                <span style="color: #64748b;">Itens</span>
                <span style="font-weight: 700;">R$ {{ number_format($transaction->amount, 2, ',', '.') }}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
                <span style="color: #64748b;">Frete</span>
                <span style="color: #10b981; font-weight: 700;">Grátis</span>
            </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: flex-end;">
            <span style="font-size: 0.75rem; font-weight: 800; text-transform: uppercase; color: #64748b;">Total a Pagar</span>
            <span style="font-size: 2rem; font-weight: 900; color: var(--primary); line-height: 1;">R$ {{ number_format($transaction->amount, 2, ',', '.') }}</span>
        </div>

        @if($asaasData['installmentCount'] > 1)
            <p style="text-align: right; font-size: 0.85rem; color: #64748b; margin-top: 10px;">em {{ $asaasData['installmentCount'] }}x de R$ {{ number_format($transaction->amount / $asaasData['installmentCount'], 2, ',', '.') }}</p>
        @endif

        <div style="margin-top: 40px;">
            <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px;">
                <div style="width: 40px; height: 40px; background: #f0fdf4; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #10b981;">
                    <i class="fas fa-shield-alt"></i>
                </div>
                <div>
                    <h4 style="font-size: 0.85rem; font-weight: 800;">Compra Segura</h4>
                    <p style="font-size: 0.75rem; color: #64748b;">Garantia de 7 dias de satisfação.</p>
                </div>
            </div>
            <div style="padding: 15px; background: var(--bg-light); border-radius: 12px; text-align: center;">
                <p style="font-size: 0.75rem; color: #64748b;">Vendido por: <strong style="color: var(--text-main);">{{ $transaction->company->name }}</strong></p>
            </div>
        </div>
    </div>
</div>

<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script>
    $('#paymentForm').on('submit', function(e) {
        e.preventDefault();
        $('#payBtn').prop('disabled', true).text('Processando...');
        
        $.ajax({
            url: $(this).attr('action'),
            method: 'POST',
            data: $(this).serialize(),
            success: function(res) {
                window.location.href = res.redirect;
            },
            error: function(res) {
                alert(res.responseJSON.message || 'Erro ao processar pagamento.');
                $('#payBtn').prop('disabled', false).text('Finalizar Pagamento');
            }
        });
    });

    // Simple status polling for PIX
    @if($asaasData['billingType'] === 'PIX')
        setInterval(function() {
            $.get('{{ route("checkout.pay", $transaction->uuid) }}', function(data) {
                if (data.status === 'approved') window.location.reload();
            });
        }, 5000);
    @endif
</script>
@endsection
