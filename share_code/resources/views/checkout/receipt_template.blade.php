<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>{{ $receipt['header_text'] }} - {{ $transaction->uuid }}</title>
    <style>
        body { font-family: 'Inter', sans-serif; color: #1e293b; padding: 40px; background: white; max-width: 600px; margin: 0 auto; }
        .receipt-header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #7c3aed; padding-bottom: 30px; }
        .receipt-title { font-size: 1.5rem; font-weight: 900; color: #7c3aed; margin-bottom: 10px; }
        .data-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f1f5f9; font-size: 0.9rem; }
        .data-label { color: #64748b; font-weight: 600; }
        .data-value { font-weight: 800; text-align: right; }
        .barcode { text-align: center; margin-top: 40px; opacity: 0.4; font-size: 0.75rem; letter-spacing: 4px; }
        .receipt-footer { text-align: center; margin-top: 50px; font-size: 0.8rem; color: #64748b; line-height: 1.6; }
        @media print { .no-print { display: none; } body { padding: 0; } }
    </style>
</head>
<body onload="window.print()">
    <div class="no-print" style="margin-bottom: 20px; text-align: left;">
        <button onclick="window.print()" style="background: #7c3aed; color: white; border: none; padding: 8px 16px; border-radius: 8px; font-weight: 800; cursor: pointer;">Imprimir/PDF</button>
    </div>

    <div class="receipt-header">
        @if($receipt['show_logo'])
            <div style="font-size: 1.5rem; font-weight: 900; letter-spacing: -1px; margin-bottom: 10px;">Basileia <span style="color: #7c3aed;">Secure</span></div>
        @endif
        <div class="receipt-title">{{ $receipt['header_text'] }}</div>
        <div style="font-size: 0.75rem; color: #94a3b8; text-transform: uppercase;">Protocolo: {{ $transaction->uuid }}</div>
    </div>

    <div style="margin-bottom: 30px;">
        <div class="data-row">
            <span class="data-label">Data do Pagamento</span>
            <span class="data-value">{{ $transaction->paid_at?->format('d/m/Y H:i') }}</span>
        </div>
        <div class="data-row">
            <span class="data-label">Valor Total</span>
            <span class="data-value" style="color: #7c3aed; font-size: 1.1rem;">R$ {{ number_format($transaction->amount, 2, ',', '.') }}</span>
        </div>
        <div class="data-row">
            <span class="data-label">Método de Pagamento</span>
            <span class="data-value">{{ strtoupper($transaction->payment_method ?? 'CARTÃO') }}</span>
        </div>
    </div>

    @if($receipt['show_customer_data'])
        <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 30px;">
            <h5 style="margin: 0 0 16px; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8;">Dados do Comprador</h3>
            <div class="data-row" style="border-bottom: 0; padding: 4px 0;">
                <span class="data-label">Nome</span>
                <span class="data-value">{{ $transaction->customer_name }}</span>
            </div>
            <div class="data-row" style="border-bottom: 0; padding: 4px 0;">
                <span class="data-label">Documento</span>
                <span class="data-value">{{ $transaction->customer_document }}</span>
            </div>
            <div class="data-row" style="border-bottom: 0; padding: 4px 0;">
                <span class="data-label">E-mail</span>
                <span class="data-value">{{ $transaction->customer_email }}</span>
            </div>
        </div>
    @endif

    <div class="receipt-footer">
        <p>{{ $receipt['footer_text'] }}</p>
        <p style="font-size: 0.7rem; opacity: 0.6; margin-top: 20px;">Autenticação Eletrônica: {{ sha1($transaction->uuid . $transaction->paid_at) }}</p>
    </div>

    <div class="barcode">||||||||||||||| {{ $transaction->id }} |||||||||||||||</div>
</body>
</html>
