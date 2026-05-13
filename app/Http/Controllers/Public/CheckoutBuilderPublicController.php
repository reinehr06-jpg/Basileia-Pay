<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\CheckoutConfig;

class CheckoutBuilderPublicController extends Controller
{
    /**
     * Página pública do checkout criado no builder.
     */
    public function show(string $slug)
    {
        $config = CheckoutConfig::where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        return view('checkout.builder-public', compact('config'));
    }
}
