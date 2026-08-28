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
        $user = \App\Models\User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/v1/internal/vault/tokenize', [
            'card_number' => '411111111111111',
            'cvv' => '123',
            'expiry_month' => '12',
            'expiry_year' => '2030',
            'cardholder_name' => 'John Doe',
        ], [
            'X-Company-ID' => '123',
            'X-Internal-Service-Token' => 'test-token'
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'card_token',
            'last_4',
            'brand'
        ]);
    }
}
