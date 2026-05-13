<?php

declare(strict_types=1);

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\CheckoutApproval;
use App\Models\CheckoutConfig;
use App\Services\CheckoutAuditService;
use App\Services\CheckoutNotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CheckoutApprovalController extends Controller
{
    public function __construct(
        private CheckoutAuditService        $audit,
        private CheckoutNotificationService $notify,
    ) {}

    /** POST /api/dashboard/checkout-configs/{id}/request-publish */
    public function request(Request $request, int $configId): JsonResponse
    {
        $config = CheckoutConfig::where('company_id', Auth::user()->company_id)->findOrFail($configId);
        $this->authorize('update', $config);
        
        $data   = $request->validate(['note' => 'nullable|string|max:500']);

        $approval = CheckoutApproval::create([
            'checkout_config_id' => $config->id,
            'requested_by'       => Auth::id(),
            'status'             => 'pending',
            'note'               => $data['note'] ?? null,
        ]);

        $this->audit->log($config, 'requested_publish');
        $this->notify->onApprovalRequested($approval);

        return response()->json($approval, 201);
    }

    /** GET /api/dashboard/approvals — fila pendente */
    public function queue(): JsonResponse
    {
        return response()->json(
            CheckoutApproval::with(['config:id,name', 'requestedBy:id,name,email'])
                ->whereHas('config', fn($q) => $q->where('company_id', Auth::user()->company_id))
                ->where('status', 'pending')
                ->orderByDesc('created_at')
                ->get()
        );
    }

    /** POST /api/dashboard/approvals/{id}/approve */
    public function approve(Request $request, int $id): JsonResponse
    {
        $approval = CheckoutApproval::whereHas('config', fn($q) => $q->where('company_id', Auth::user()->company_id))
            ->where('status', 'pending')
            ->findOrFail($id);
            
        $this->authorize('publish', $approval->config);

        $approval->update([
            'status'      => 'approved',
            'reviewed_by' => Auth::id(),
            'review_note' => $request->input('review_note'),
            'reviewed_at' => now(),
        ]);

        $approval->config->publish();
        $this->audit->log($approval->config, 'approved_publish');
        $this->notify->onApprovalReviewed($approval);
        $this->notify->onPublished($approval->config);

        return response()->json($approval);
    }

    /** POST /api/dashboard/approvals/{id}/reject */
    public function reject(Request $request, int $id): JsonResponse
    {
        $approval = CheckoutApproval::whereHas('config', fn($q) => $q->where('company_id', Auth::user()->company_id))
            ->where('status', 'pending')
            ->findOrFail($id);
            
        $this->authorize('publish', $approval->config);

        $approval->update([
            'status'      => 'rejected',
            'reviewed_by' => Auth::id(),
            'review_note' => $request->input('review_note'),
            'reviewed_at' => now(),
        ]);

        $this->audit->log($approval->config, 'rejected_publish');
        $this->notify->onApprovalReviewed($approval);

        return response()->json($approval);
    }
}
