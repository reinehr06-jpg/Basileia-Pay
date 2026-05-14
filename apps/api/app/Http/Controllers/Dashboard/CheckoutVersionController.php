<?php

declare(strict_types=1);

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\CheckoutConfig;
use App\Models\CheckoutVersion;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class CheckoutVersionController extends Controller
{
    /** GET /api/dashboard/checkout-configs/{id}/versions */
    public function index(int $configId): JsonResponse
    {
        $config = CheckoutConfig::where('company_id', Auth::user()->company_id)->findOrFail($configId);

        return response()->json(
            CheckoutVersion::where('checkout_config_id', $config->id)
                ->orderByDesc('created_at')
                ->limit(30)
                ->get()
        );
    }

    /** POST /api/dashboard/checkout-configs/{id}/versions/{versionId}/restore */
    public function restore(int $configId, int $versionId): JsonResponse
    {
        $config  = CheckoutConfig::where('company_id', Auth::user()->company_id)->findOrFail($configId);
        $version = CheckoutVersion::where('checkout_config_id', $config->id)->findOrFail($versionId);

        // Salva snapshot da config atual antes de restaurar
        CheckoutVersion::create([
            'checkout_config_id' => $config->id,
            'label'              => 'Antes da restauração',
            'snapshot'           => $config->config,
            'created_by'         => Auth::user()->name,
        ]);

        $config->update(['config' => $version->snapshot]);

        return response()->json(['ok' => true, 'config' => $config]);
    }
}
