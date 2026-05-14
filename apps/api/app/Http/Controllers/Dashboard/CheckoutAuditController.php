<?php

declare(strict_types=1);

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\CheckoutAuditLog;
use App\Models\CheckoutConfig;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CheckoutAuditController extends Controller
{
    /** GET /api/dashboard/audit */
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAudit', CheckoutConfig::class);

        $logs = CheckoutAuditLog::where('company_id', Auth::user()->company_id)
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json($logs);
    }

    /** GET /api/dashboard/checkout-configs/{id}/audit */
    public function forConfig(int $configId): JsonResponse
    {
        $config = CheckoutConfig::where('company_id', Auth::user()->company_id)->findOrFail($configId);
        $this->authorize('viewAudit', $config);

        return response()->json(
            CheckoutAuditLog::where('checkout_config_id', $configId)
                ->orderByDesc('created_at')
                ->limit(50)
                ->get()
        );
    }
}
