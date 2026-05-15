<?php

namespace App\Http\Controllers\Api\V1\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Services\TenantContext;
use Illuminate\Http\Request;

class AuditController extends Controller
{
    public function index(Request $request)
    {
        $logs = AuditLog::where('company_id', TenantContext::companyId())
            ->with(['user'])
            ->latest()
            ->paginate($request->per_page ?? 25);

        return response()->json([
            'success' => true,
            'data' => $logs->getCollection()->map(fn($l) => [
                'id' => $l->id,
                'uuid' => $l->uuid,
                'event' => $l->event,
                'user_name' => $l->user?->name ?? 'Sistema',
                'entity_type' => $l->entity_type,
                'ip_address' => $l->ip_address,
                'metadata' => $l->metadata,
                'created_at' => $l->created_at->format('d/m/Y H:i:s'),
            ]),
            'meta' => [
                'current_page' => $logs->currentPage(),
                'last_page' => $logs->lastPage(),
                'total' => $logs->total(),
            ]
        ]);
    }
}
