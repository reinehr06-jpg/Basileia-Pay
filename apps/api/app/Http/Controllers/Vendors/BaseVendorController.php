<?php

namespace App\Http\Controllers\Vendors;

use Illuminate\Http\Request;

abstract class BaseVendorController
{
    abstract public function handle(Request $request, string $identifier);

    abstract public function process(Request $request, string $identifier);

    abstract public function success(string $identifier);

    protected function validateHash(string $payload, string $signature, string $secret): bool
    {
        $expectedSignature = hash_hmac('sha256', $payload, $secret);
        return hash_equals($expectedSignature, $signature);
    }

    protected function createSecureTransaction(array $data)
    {
        return \App\Models\Transaction::create($data);
    }

    protected function getVendorConfig(string $vendorKey): ?array
    {
        return config("vendors.$vendorKey");
    }
}