<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    /**
     * List audit logs for the current company.
     * Supports filtering by event, entity_type, user_id, and date range.
     */
    public function index(Request $request): JsonResponse
    {
        $this->authorize('permission', ['audit.view']);

        $query = AuditLog::where('company_id', $request->user()->company_id)
            ->orderBy('created_at', 'desc');

        // Filters
        if ($request->filled('event')) {
            $query->where('event', 'like', '%' . $request->event . '%');
        }

        if ($request->filled('entity_type')) {
            $query->where('entity_type', $request->entity_type);
        }

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->filled('from')) {
            $query->where('created_at', '>=', $request->from);
        }

        if ($request->filled('to')) {
            $query->where('created_at', '<=', $request->to);
        }

        $logs = $query->paginate($request->input('per_page', 50));

        return response()->json($logs);
    }
}
