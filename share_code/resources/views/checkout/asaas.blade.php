<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pagamento - Checkout</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; padding: 20px; }
        .checkout-container { max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { font-size: 24px; margin-bottom: 20px; color: #333; }
        .amount-display { background: #f0fdf4; border: 2px solid #22c55e; border-radius: 8px; padding: 16px; text-align: center; margin-bottom: 24px; }
        .amount-display .label { font-size: 14px; color: #666; }
        .amount-display .value { font-size: 32px; font-weight: bold; color: #16a34a; }
        .form-group { margin-bottom: 16px; }
        .form-group label { display: block; font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 6px; }
        .form-group input, .form-group select { width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 16px; }
        .form-group input:focus, .form-group select:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
        .form-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
        .form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .btn-submit { width: 100%; padding: 16px; background: #22c55e; color: white; border: none; border-radius: 8px; font-size: 18px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
        .btn-submit:hover { background: #16a34a; }
        .btn-submit:disabled { background: #9ca3af; cursor: not-allowed; }
        .error-message { background: #fef2f2; border: 1px solid #ef4444; color: #dc2626; padding: 12px; border-radius: 8px; margin-bottom: 16px; }
        .prefilled-info { background: #f3f4f6; padding: 12px; border-radius: 8px; margin-bottom: 20px; }
        .prefilled-info p { font-size: 14px; color: #374151; margin-bottom: 4px; }
        .prefilled-info strong { color: #111827; }
        .secure-badge { display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 16px; font-size: 12px; color: #6b7280; }
        .secure-badge svg { width: 16px; height: 16px; }
    </style>
</head>
<body>
    <div class="checkout-container">
        <h1>Pagamento</h1>
        
        <div class="amount-display">
            <div class="label">Valor a pagar</div>
            <div class="value">R$ {{ number_format($transaction->amount, 2, ',', '.') }}</div>
        </div>

        @if($errors->any())
            <div class="error-message">
                {{ $errors->first() }}
            </div>
        @endif

        <div class="prefilled-info">
            <p><strong>Cliente:</strong> {{ $customerData['name'] }}</p>
            <p><strong>E-mail:</strong> {{ $customerData['email'] }}</p>
        </div>

        <form method="POST" action="{{ route('checkout.asaas.process', $transaction->asaas_payment_id) }}">
            @csrf
            
            <input type="hidden" name="card_email" value="{{ $customerData['email'] }}">
            <input type="hidden" name="card_phone" value="{{ $customerData['phone'] }}">
            <input type="hidden" name="card_address" value="{{ $customerData['address']['endereco'] ?? '' }}">
            <input type="hidden" name="card_address_number" value="{{ $customerData['address']['numero'] ?? '' }}">
            <input type="hidden" name="card_neighborhood" value="{{ $customerData['address']['bairro'] ?? '' }}">
            <input type="hidden" name="card_city" value="{{ $customerData['address']['cidade'] ?? '' }}">
            <input type="hidden" name="card_state" value="{{ $customerData['address']['estado'] ?? '' }}">
            <input type="hidden" name="card_cep" value="{{ $customerData['address']['cep'] ?? '' }}">

            <div class="form-group">
                <label for="card_number">Número do Cartão</label>
                <input type="text" id="card_number" name="card_number" placeholder="1234 5678 9012 3456" required maxlength="19">
            </div>

            <div class="form-group">
                <label for="card_name">Nome do Titular</label>
                <input type="text" id="card_name" name="card_name" placeholder="Nome como está no cartão" required>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label for="card_expiry">Validade</label>
                    <input type="text" id="card_expiry" name="card_expiry" placeholder="MM/AA" required>
                </div>
                <div class="form-group">
                    <label for="card_cvv">CVV</label>
                    <input type="text" id="card_cvv" name="card_cvv" placeholder="123" required maxlength="4">
                </div>
                <div class="form-group">
                    <label for="installments">Parcelas</label>
                    <select id="installments" name="installments">
                        <option value="1">1x</option>
                        <option value="2">2x</option>
                        <option value="3">3x</option>
                        <option value="4">4x</option>
                        <option value="5">5x</option>
                        <option value="6">6x</option>
                        <option value="7">7x</option>
                        <option value="8">8x</option>
                        <option value="9">9x</option>
                        <option value="10">10x</option>
                        <option value="11">11x</option>
                        <option value="12">12x</option>
                    </select>
                </div>
            </div>

            <button type="submit" class="btn-submit">Pagar Agora</button>
            
            <div class="secure-badge">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
                Pagamento seguro com criptografia SSL
            </div>
        </form>
    </div>
    
    <script>
        document.getElementById('card_number').addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            value = value.replace(/(\d{4})/g, '$1 ').trim();
            e.target.value = value;
        });
        
        document.getElementById('card_expiry').addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            e.target.value = value;
        });
        
        document.getElementById('card_cvv').addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/\D/g, '');
        });
    </script>
</body>
</html>