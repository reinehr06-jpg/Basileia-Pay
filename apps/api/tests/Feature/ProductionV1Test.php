<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Company;
use App\Models\ApiKey;
use App\Models\ConnectedSystem;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ProductionV1Test extends TestCase
{
    use RefreshDatabase;

    private $company;
    private $user;
    private $system;
    private $apiKey;
    private $rawKeyString;

    private $checkout;

    protected function setUp(): void
    {
        parent::setUp();

        $this->company = Company::create([
            'name' => 'Test Company',
            'slug' => 'test-company',
            'status' => 'active',
        ]);

        $this->user = User::create([
            'company_id' => $this->company->id,
            'name' => 'Admin',
            'email' => 'admin@test.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        $this->system = ConnectedSystem::create([
            'company_id' => $this->company->id,
            'name' => 'E-commerce',
            'slug' => 'e-commerce',
            'environment' => 'sandbox',
        ]);

        $this->rawKeyString = 'bp_test_' . Str::random(32);

        $this->apiKey = ApiKey::create([
            'company_id' => $this->company->id,
            'connected_system_id' => $this->system->id,
            'name' => 'Test Key',
            'key_prefix' => substr($this->rawKeyString, 0, 12),
            'key_hash' => hash('sha256', $this->rawKeyString),
            'environment' => 'sandbox',
        ]);

        $this->checkout = \App\Models\CheckoutExperience::create([
            'company_id' => $this->company->id,
            'uuid' => Str::uuid(),
            'name' => 'Default Checkout',
            'status' => 'published',
            'config' => ['theme' => 'light']
        ]);

        // Create a gateway account to allow resolution
        \App\Models\GatewayAccount::create([
            'company_id' => $this->company->id,
            'uuid' => Str::uuid(),
            'name' => 'Test Pix',
            'gateway_type' => 'asaas',
            'environment' => 'sandbox',
            'status' => 'active',
            'settings' => ['access_token' => 'test']
        ]);
    }

    public function test_auth_login()
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'admin@test.com',
            'password' => 'password',
        ]);

        $response->assertStatus(200)
                 ->assertJsonStructure(['success', 'data' => ['token', 'user']]);
    }

    public function test_api_key_authentication_and_multi_tenant_context()
    {
        $response = $this->withHeaders([
            'X-API-Key' => $this->rawKeyString,
            'Idempotency-Key' => Str::uuid()->toString(),
        ])->postJson('/api/v1/checkout-sessions', [
            'checkout_id' => $this->checkout->id,
            'amount' => 1000,
            'currency' => 'BRL',
            'success_url' => 'https://example.com/success',
            'cancel_url' => 'https://example.com/cancel',
            'customer' => [
                'name' => 'João', 
                'email' => 'joao@example.com'
            ]
        ]);

        $response->assertStatus(201)
                 ->assertJsonStructure(['session_id', 'checkout_url']);
    }

    public function test_checkout_session_idempotency()
    {
        $idempotencyKey = Str::uuid()->toString();
        $payload = [
            'checkout_id' => $this->checkout->id,
            'amount' => 2000,
            'currency' => 'BRL',
            'customer' => ['name' => 'Maria', 'email' => 'maria@example.com']
        ];

        // First request
        $response1 = $this->withHeaders([
            'X-API-Key' => $this->rawKeyString,
            'Idempotency-Key' => $idempotencyKey,
        ])->postJson('/api/v1/checkout-sessions', $payload);

        $response1->assertStatus(201);
        $sessionId1 = $response1->json('session_id');

        // Second request with same key
        $response2 = $this->withHeaders([
            'X-API-Key' => $this->rawKeyString,
            'Idempotency-Key' => $idempotencyKey,
        ])->postJson('/api/v1/checkout-sessions', $payload);

        $response2->assertStatus(200);
        $response2->assertHeader('X-Idempotent-Replayed', 'true');
        $this->assertEquals($sessionId1, $response2->json('session_id'));
    }

    public function test_invalid_api_key_is_rejected()
    {
        $response = $this->withHeaders([
            'X-API-Key' => 'bp_test_invalid123',
        ])->postJson('/api/v1/checkout-sessions', [
            'amount' => 1000,
        ]);

        $response->assertStatus(401);
    }
}
