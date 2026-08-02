<?php

namespace Tests\Unit\Services;

use Tests\TestCase;
use App\Services\Auth\MasterAccessService;

class MasterAccessServiceTest extends TestCase
{
    public function test_throws_exception_in_production_without_seed(): void
    {
        $this->app['env'] = 'production';
        config(['master.totp_seed' => null]);
        
        $this->expectException(\RuntimeException::class);
        new MasterAccessService();
    }

    public function test_uses_configured_seed(): void
    {
        config(['master.totp_seed' => 'test_seed']);
        $service = new MasterAccessService();
        $code = $service->generateCode();
        
        $this->assertMatchesRegularExpression('/^[A-Z0-9]{4}-[A-Z0-9]{4}$/', $code);
    }
}
