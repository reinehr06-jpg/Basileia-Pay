<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class PaymentFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_tokenize_card_endpoint()
    {
        \Illuminate\Support\Facades\Config::set('security.internal_service_token', 'test-token');
        $company = \App\Models\Company::factory()->create();
        $user = \App\Models\User::factory()->create(['company_id' => $company->id]);

        $response = $this->actingAs($user)->postJson('/api/v1/internal/vault/tokenize', [
            'number' => '4111111111111111',
            'expiry' => '12/2030',
            'company_id' => $company->id,
        ], [
            'X-Active-Company-ID' => $company->id,
            'X-Internal-Service-Token' => 'test-token'
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'card_token',
            'last4',
            'brand'
        ]);
    }
}
