<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\WebhookDelivery;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class WebhookLogController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $companyId = $user->company_id;

        $request->validate([
            'status' => 'sometimes|in:pending,delivered,failed',
            'event_type' => 'sometimes|string',
        ]);

        $query = WebhookDelivery::whereHas('endpoint.integration', function ($q) use ($companyId) {
                $q->where('company_id', $companyId);
            })
            ->with(['endpoint.integration']);

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('event_type')) {
            $query->where('event_type', $request->input('event_type'));
        }

        $deliveries = $query->orderBy('created_at', 'desc')->paginate(20);

        $filters = $request->only(['status', 'event_type']);

        return view('dashboard.webhooks.index', compact('deliveries', 'filters'));
    }

    public function show(int $id)
    {
        $user = Auth::user();
        $companyId = $user->company_id;

        $delivery = WebhookDelivery::whereHas('endpoint.integration', function ($q) use ($companyId) {
                $q->where('company_id', $companyId);
            })
            ->with(['endpoint.integration'])
            ->find($id);

        if (!$delivery) {
            abort(404, 'Webhook delivery não encontrada.');
        }

        return view('dashboard.webhooks.show', compact('delivery'));
    }

    public function retry(int $id)
    {
        $user = Auth::user();
        $companyId = $user->company_id;

        $delivery = WebhookDelivery::whereHas('endpoint.integration', function ($q) use ($companyId) {
                $q->where('company_id', $companyId);
            })
            ->find($id);

        if (!$delivery) {
            abort(404, 'Webhook delivery não encontrada.');
        }

        $delivery->update([
            'status' => 'pending',
            'attempts' => $delivery->attempts + 1,
            'next_retry_at' => now(),
        ]);

        return redirect()->route('dashboard.webhooks.show', $delivery->id)
            ->with('success', 'Webhook agendado para reenvio.');
    }
}
