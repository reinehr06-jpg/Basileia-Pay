<?php

namespace Tests\Unit\Services;

use Tests\TestCase;
use App\Services\Vault\VaultService;

class VaultServiceTest extends TestCase
{
    public function test_encrypt_and_decrypt(): void
    {
        config(['security.encryption_key' => 'base64:' . base64_encode(random_bytes(32))]);
        
        $vault = app(VaultService::class);
        $encrypted = $vault->encrypt('secret');
        
        $this->assertArrayHasKey('encrypted_value', $encrypted);
        $this->assertArrayHasKey('key_version', $encrypted);
        
        $decrypted = $vault->decrypt($encrypted['encrypted_value'], $encrypted['key_version']);
        $this->assertEquals('secret', $decrypted);
    }
    
    public function test_tenant_specific_encryption(): void
    {
        config(['security.encryption_key' => 'base64:' . base64_encode(random_bytes(32))]);
        
        $vault = app(VaultService::class);
        $companyId = 123;
        $encrypted = $vault->encrypt('secret', $companyId);
        
        $this->assertArrayHasKey('encrypted_value', $encrypted);
        
        $decrypted = $vault->decrypt($encrypted['encrypted_value'], $encrypted['key_version'], $companyId);
        $this->assertEquals('secret', $decrypted);
        
        // Decrypt without companyId should throw exception or return garbage (in AES-GCM it throws DecryptException)
        $this->expectException(\Illuminate\Contracts\Encryption\DecryptException::class);
        $vault->decrypt($encrypted['encrypted_value'], $encrypted['key_version']);
    }

    public function test_throws_exception_in_production_without_key(): void
    {
        $this->app['env'] = 'production';
        config(['security.encryption_key' => null]);
        
        $this->expectException(\RuntimeException::class);
        app(VaultService::class)->encrypt('test');
    }
}
