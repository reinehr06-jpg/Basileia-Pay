<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Pagamento - Checkout</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@3.4.1/lib/tailwind.min.css" rel="stylesheet">
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
</head>
<body class="bg-gray-100 min-h-screen flex items-center justify-center p-4">
    <div class="w-full max-w-md" x-data="{ 
        @if($paymentMethod) method: '{{ $paymentMethod }}' @else method: 'pix' @endif 
    }">

        <!-- Transaction Summary -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4">
            <h1 class="text-lg font-semibold text-gray-800 mb-4">Resumo do Pedido</h1>
            <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                    <span class="text-gray-500">Descrição</span>
                    <span class="text-gray-900">{{ $transaction->description ?? 'Compra' }}</span>
                </div>
                <div class="flex justify-between pt-2 border-t border-gray-100">
                    <span class="text-gray-700 font-medium">
                        @if($installments > 1)
                            {{ $installments }}x de
                        @else
                            Total
                        @endif
                    </span>
                    <span class="text-xl font-bold text-gray-900">
                        R$ {{ number_format($transaction->amount / $installments, 2, ',', '.') }}
                        @if($installments > 1)
                            <span class="text-xs font-normal text-gray-500">(total: R$ {{ number_format($transaction->amount, 2, ',', '.') }})</span>
                        @endif
                    </span>
                </div>
            </div>
        </div>

        <!-- Payment Method Tabs - Only show if NOT restricted -->
        @if(!$paymentMethod)
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="flex border-b border-gray-100">
                <button @click="method = 'pix'" :class="method === 'pix' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'" class="flex-1 py-3 text-sm font-medium transition">
                    PIX
                </button>
                <button @click="method = 'boleto'" :class="method === 'boleto' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'" class="flex-1 py-3 text-sm font-medium transition">
                    Boleto
                </button>
                <button @click="method = 'card'" :class="method === 'card' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'" class="flex-1 py-3 text-sm font-medium transition">
                    Cartão
                </button>
            </div>
        @endif

            <div class="p-6">
                <!-- PIX -->
                <div x-show="method === 'pix'" x-cloak>
                    @if($transaction->pix_qr_code ?? false)
                        <div class="text-center mb-4">
                            <div class="bg-gray-50 border rounded-lg p-4 inline-block mb-3">
                                <img src="data:image/png;base64,{{ $transaction->pix_qr_code_image ?? '' }}" alt="QR Code PIX" class="w-48 h-48 mx-auto">
                            </div>
                            <p class="text-xs text-gray-500 mb-2">Escaneie o QR Code ou copie o código abaixo</p>
                            <div class="bg-gray-50 border rounded-lg p-3">
                                <code class="text-xs break-all text-gray-700 select-all">{{ $transaction->pix_copy_paste ?? '' }}</code>
                            </div>
                            <button onclick="navigator.clipboard.writeText('{{ $transaction->pix_copy_paste ?? '' }}')" class="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium">
                                Copiar código
                            </button>
                        </div>
                    @else
                        <form method="POST" action="{{ route('checkout.process', $transaction->uuid) }}">
                            @csrf
                            <input type="hidden" name="payment_method" value="pix">
                            <button type="submit" class="w-full bg-green-600 text-white py-3 rounded-lg text-sm font-semibold hover:bg-green-700 transition">
                                Gerar QR Code PIX
                            </button>
                        </form>
                    @endif
                </div>

                <!-- Boleto -->
                <div x-show="method === 'boleto'" x-cloak>
                    @if($transaction->boleto_url ?? false)
                        <div class="text-center">
                            <a href="{{ $transaction->boleto_url }}" target="_blank" class="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition">
                                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                                Visualizar Boleto
                            </a>
                            @if($transaction->boleto_expiration)
                                <p class="text-xs text-gray-500 mt-3">Vencimento: {{ $transaction->boleto_expiration }}</p>
                            @endif
                        </div>
                    @else
                        <form method="POST" action="{{ route('checkout.process', $transaction->uuid) }}">
                            @csrf
                            <input type="hidden" name="payment_method" value="boleto">
                            <button type="submit" class="w-full bg-blue-600 text-white py-3 rounded-lg text-sm font-semibold hover:bg-blue-700 transition">
                                Gerar Boleto
                            </button>
                        </form>
                    @endif
                </div>

                <!-- Credit Card -->
                <div x-show="method === 'card'" x-cloak>
                    <form method="POST" action="{{ route('checkout.process', $transaction->uuid) }}" id="card-form">
                        @csrf
                        <input type="hidden" name="payment_method" value="credit_card">
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Número do Cartão</label>
                                <input type="text" name="card_number" required maxlength="19" placeholder="0000 0000 0000 0000"
                                       class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Nome no Cartão</label>
                                <input type="text" name="card_holder_name" required placeholder="NOME COMO ESTÁ NO CARTÃO"
                                       class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm uppercase focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                            </div>
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Validade</label>
                                    <input type="text" name="card_expiry" required maxlength="5" placeholder="MM/AA"
                                           class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                                    <input type="password" name="card_cvv" required maxlength="4" placeholder="123"
                                           class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                </div>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Parcelas</label>
                                @if($installments > 1)
                                    <input type="hidden" name="installments" value="{{ $installments }}">
                                    <div class="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 text-gray-600">
                                        {{ $installments }}x de R$ {{ number_format($transaction->amount / $installments, 2, ',', '.') }} (sem juros)
                                    </div>
                                @else
                                    <select name="installments" class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                        @for($i = 1; $i <= ($transaction->max_installments ?? 12); $i++)
                                            <option value="{{ $i }}" {{ $i == 1 ? 'selected' : '' }}>
                                                {{ $i }}x de R$ {{ number_format(($transaction->amount ?? 0) / $i, 2, ',', '.') }}
                                                @if($i > 1) (sem juros) @endif
                                            </option>
                                        @endfor
                                    </select>
                                @endif
                            </div>
                        </div>
                        <button type="submit" class="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg text-sm font-semibold hover:bg-blue-700 transition">
                            @if($installments > 1)
                                Pagar {{ $installments }}x de R$ {{ number_format($transaction->amount / $installments, 2, ',', '.') }}
                            @else
                                Pagar R$ {{ number_format($transaction->amount ?? 0, 2, ',', '.') }}
                            @endif
                        </button>
                    </form>
                </div>
            </div>
        @if(!$paymentMethod)
        </div>
        @endif

        <!-- Trust Badges -->
        <div class="flex items-center justify-center gap-6 mt-6 text-gray-400">
            <div class="flex items-center gap-1.5 text-xs">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                Pagamento Seguro
            </div>
            <div class="flex items-center gap-1.5 text-xs">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                SSL Criptografado
            </div>
        </div>

        <p class="text-center text-xs text-gray-400 mt-4">Powered by Checkout</p>
    </div>
</body>
</html>
