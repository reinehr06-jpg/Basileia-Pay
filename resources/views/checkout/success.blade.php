<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pagamento Aprovado - Checkout</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@3.4.1/lib/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-gray-100 min-h-screen flex items-center justify-center p-4">
    <div class="w-full max-w-md text-center">
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-8">

            <!-- Success Icon -->
            <div class="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
            </div>

            <h1 class="text-2xl font-bold text-gray-900 mb-2">Pagamento Aprovado!</h1>
            <p class="text-sm text-gray-500 mb-8">Seu pagamento foi processado com sucesso.</p>

            <!-- Transaction Details -->
            <div class="bg-gray-50 rounded-lg p-4 text-left mb-6">
                <dl class="space-y-3 text-sm">
                    <div class="flex justify-between">
                        <dt class="text-gray-500">Transação</dt>
                        <dd class="font-mono text-xs text-gray-900">{{ $transaction->uuid ?? '-' }}</dd>
                    </div>
                    <div class="flex justify-between">
                        <dt class="text-gray-500">Valor Pago</dt>
                        <dd class="text-lg font-bold text-gray-900">R$ {{ number_format($transaction->amount ?? 0, 2, ',', '.') }}</dd>
                    </div>
                    <div class="flex justify-between">
                        <dt class="text-gray-500">Método</dt>
                        <dd class="text-gray-900">
                            @switch($transaction->payment_method ?? '')
                                @case('pix') PIX @break
                                @case('boleto') Boleto @break
                                @case('credit_card') Cartão de Crédito @break
                                @default {{ $transaction->payment_method ?? '-' }}
                            @endswitch
                        </dd>
                    </div>
                    <div class="flex justify-between">
                        <dt class="text-gray-500">Status</dt>
                        <dd><span class="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Aprovado</span></dd>
                    </div>
                    @if($transaction->paid_at ?? false)
                        <div class="flex justify-between">
                            <dt class="text-gray-500">Data</dt>
                            <dd class="text-gray-900">{{ $transaction->paid_at->format('d/m/Y H:i:s') }}</dd>
                        </div>
                    @endif
                </dl>
            </div>

            <p class="text-xs text-gray-400">Um comprovante foi enviado para {{ $transaction->customer_email ?? 'seu email' }}.</p>
        </div>

        <p class="text-center text-xs text-gray-400 mt-6">Powered by Checkout</p>
    </div>
</body>
</html>
