<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Checkout;
use App\Models\CheckoutPublication;
use Illuminate\Http\Request;

class PublicCheckoutController extends Controller
{
    public function show(string $systemId)
    {
        $checkout = Checkout::with('company')->where('system_id', $systemId)
            ->where('status', 'published')
            ->firstOrFail();

        $publication = CheckoutPublication::with('version')->where('checkout_id', $checkout->id)
            ->where('status', 'active')
            ->firstOrFail();

        $version = $publication->version;

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $checkout->id,
                'name' => $checkout->name,
                'system_id' => $checkout->system_id,
                'config' => $version->config, // this is the published scene
                'company' => [
                    'id' => $checkout->company->id,
                    'name' => $checkout->company->name,
                    'logo_url' => $checkout->company->logo_url,
                ]
            ]
        ]);
    }
}