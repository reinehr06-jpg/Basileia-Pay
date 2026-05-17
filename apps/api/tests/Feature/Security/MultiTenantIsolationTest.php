<?php

namespace Tests\Feature\Security;

use App\Models\Company;
use App\Models\Order;
use App\Models\User;
use App\Models\Payment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Laravel\Sanctum\Sanctum;

class MultiTenantIsolationTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function a_user_cannot_access_orders_from_another_company()
    {
        // Empresa A
        $companyA = Company::factory()->create();
        $userA = User::factory()->create(['company_id' => $companyA->id]);
        $orderA = Order::factory()->create(['company_id' => $companyA->id]);

        // Empresa B
        $companyB = Company::factory()->create();
        $orderB = Order::factory()->create(['company_id' => $companyB->id]);

        Sanctum::actingAs($userA);

        // Tentativa de acessar pedido da Empresa B via Dashboard API
        $response = $this->getJson("/api/v1/dashboard/orders/{$orderB->id}");

        $response->assertStatus(404); // Não deve encontrar o registro
    }

    /** @test */
    public function a_user_cannot_list_payments_from_another_company()
    {
        $companyA = Company::factory()->create();
        $userA = User::factory()->create(['company_id' => $companyA->id]);
        Payment::factory()->count(3)->create(['company_id' => $companyA->id]);

        $companyB = Company::factory()->create();
        Payment::factory()->count(2)->create(['company_id' => $companyB->id]);

        Sanctum::actingAs($userA);

        $response = $this->getJson("/api/v1/dashboard/payments");

        $response->assertStatus(200);
        $response->assertJsonCount(3, 'data'); // Só deve ver os 3 da sua empresa
    }

    /** @test */
    public function a_public_checkout_session_is_bound_to_its_company()
    {
        $companyA = Company::factory()->create();
        $companyB = Company::factory()->create();
        
        $sessionB = \App\Models\CheckoutSession::factory()->create([
            'company_id' => $companyB->id,
            'session_token' => 'token_b'
        ]);

        // Tentativa de acessar via API pública não deve vazar dados de contexto se token for inválido
        // Mas o isolamento real aqui é no resolve context do tenant
        $response = $this->getJson("/api/v1/public/checkout-sessions/token_b");

        $response->assertStatus(200);
        $this->assertEquals($companyB->id, $response->json('data.company_id'));
    }
}
