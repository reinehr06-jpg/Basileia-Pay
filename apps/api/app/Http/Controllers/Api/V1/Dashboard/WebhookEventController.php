<?php

namespace App\Http\Controllers\Api\V1\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\GatewayWebhookEvent;
use App\Services\TenantContext;

class WebhookEventController extends Controller
{
    public function __construct(
        private readonly TenantContext $tenant
    ) {}

    public function index()
    {
        $events = GatewayWebhookEvent::where('company_id', $this->tenant->getCompanyId())
            ->latest()
            ->take(100)
            ->get();

        return response()->json(['data' => $events]);
    }
}
