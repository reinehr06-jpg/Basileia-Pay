@php
    $htmlPath = public_path('checkout-app/checkout.html');
    
    if (file_exists($htmlPath)) {
        $html = file_get_contents($htmlPath);
        
        $checkoutData = [
            'step' => $step ?? 1,
            'uuid' => $transaction->uuid ?? '',
            'csrfToken' => csrf_token(),
            'amount' => $transaction->amount ?? 0,
            'description' => $transaction->description ?? 'Plano Premium',
            'customerName' => $customerData['name'] ?? $transaction->customer_name ?? '',
            'customerEmail' => $customerData['email'] ?? $transaction->customer_email ?? '',
            'customerDocument' => $customerData['document'] ?? $transaction->customer_document ?? '',
            'customerPhone' => $customerData['phone'] ?? $transaction->customer_phone ?? ''
        ];
        
        $json = json_encode($checkoutData);
        $script = "<script>window.CHECKOUT_DATA = {$json};</script>";
        
        // Injeta o script do React antes de fechar o head
        $html = str_replace('</head>', $script . '</head>', $html);
        
        echo $html;
    } else {
        echo "<!DOCTYPE html><html lang='pt-BR'><head><title>Erro Checkout</title></head>";
        echo "<body style='font-family:sans-serif; text-align:center; padding-top: 50px;'>";
        echo "<h1>Erro: Frontend React não encontrado.</h1>";
        echo "<p>Certifique-se de ter compilado o Next.js e copiado a pasta 'out' para 'public/checkout-app'.</p>";
        echo "</body></html>";
    }
@endphp
