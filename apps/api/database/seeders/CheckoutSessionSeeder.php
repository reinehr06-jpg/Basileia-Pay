<?php

namespace Database\Seeders;

use App\Models\CheckoutSession;
use App\Models\Order;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CheckoutSessionSeeder extends Seeder
{
    public function run(): void
    {
        $sessionToken = 'cs_test_' . Str::random(32);
        
        $session = CheckoutSession::create([
            'company_id' => 1,
            'connected_system_id' => 1,
            'session_token' => $sessionToken,
            'amount' => 15000, // R$ 150,00
            'currency' => 'BRL',
            'status' => 'open',
            'customer' => [
                'name' => 'Comprador de Teste',
                'email' => 'teste@basileia.pay',
                'document' => '12345678909'
            ],
            'items' => [
                [
                    'name' => 'Produto de Teste #1',
                    'quantity' => 1,
                    'unit_price' => 15000
                ]
            ],
            'expires_at' => now()->addDays(1),
        ]);

        Order::create([
            'company_id' => 1,
            'connected_system_id' => 1,
            'checkout_session_id' => $session->id,
            'amount' => 15000,
            'status' => 'created',
        ]);

        // Output for manual testing
        echo "\nCheckout Teste Criado!\n";
        echo "URL: http://localhost:3001/pay/{$sessionToken}\n\n";
    }
}
