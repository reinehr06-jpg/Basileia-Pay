<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\PixSubscription;
use App\Models\PixSubscriptionCycle;
use App\Models\PixSubscriptionEvent;
use App\Domain\Subscriptions\Services\PixSubscriptionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PixSubscriptionController extends Controller
{
    public function __construct(protected PixSubscriptionService $service) {}

    public function index(Request $request): JsonResponse
    {
        $subscriptions = PixSubscription::where('company_id', Auth::user()->company_id)
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->latest()
            ->paginate(20);
            
        return response()->json($subscriptions);
    }

    public function store(Request $request): JsonResponse
    {
        $subscription = $this->service->create($request->all(), Auth::user()->company);
        return response()->json($subscription, 201);
    }

    public function show(string $uuid): JsonResponse
    {
        $subscription = PixSubscription::where('company_id', Auth::user()->company_id)
            ->where('uuid', $uuid)
            ->firstOrFail();
            
        return response()->json($subscription);
    }

    public function update(Request $request, string $uuid): JsonResponse
    {
        $subscription = PixSubscription::where('company_id', Auth::user()->company_id)
            ->where('uuid', $uuid)
            ->firstOrFail();

        $subscription->update($request->only(['amount', 'billing_day', 'name']));

        return response()->json($subscription);
    }

    public function pause(string $uuid): JsonResponse
    {
        $subscription = PixSubscription::where('company_id', Auth::user()->company_id)
            ->where('uuid', $uuid)
            ->firstOrFail();

        $subscription->update(['status' => 'paused']);

        return response()->json(['status' => 'paused']);
    }

    public function resume(string $uuid): JsonResponse
    {
        $subscription = PixSubscription::where('company_id', Auth::user()->company_id)
            ->where('uuid', $uuid)
            ->firstOrFail();

        $subscription->update(['status' => 'active']);

        return response()->json(['status' => 'active']);
    }

    public function cancel(Request $request, string $uuid): JsonResponse
    {
        $subscription = PixSubscription::where('company_id', Auth::user()->company_id)
            ->where('uuid', $uuid)
            ->firstOrFail();

        $subscription->update([
            'status' => 'cancelled',
            'cancel_reason' => $request->reason ?? 'user_requested',
            'cancelled_at' => now(),
        ]);

        return response()->json(['status' => 'cancelled']);
    }

    public function cycles(string $uuid): JsonResponse
    {
        $subscription = PixSubscription::where('uuid', $uuid)->firstOrFail();
        $cycles = PixSubscriptionCycle::where('subscription_id', $subscription->id)->get();
        return response()->json($cycles);
    }

    public function events(string $uuid): JsonResponse
    {
        $subscription = PixSubscription::where('uuid', $uuid)->firstOrFail();
        $events = PixSubscriptionEvent::where('subscription_id', $subscription->id)->get();
        return response()->json($events);
    }
}
