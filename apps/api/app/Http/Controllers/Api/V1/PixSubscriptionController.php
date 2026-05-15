<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\PixSubscription;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PixSubscriptionController extends Controller
{
    public function index(): JsonResponse
    {
        $subscriptions = PixSubscription::where('company_id', Auth::user()->company_id)->latest()->paginate(20);
        return response()->json($subscriptions);
    }

    public function show(string $uuid): JsonResponse
    {
        $subscription = PixSubscription::where('company_id', Auth::user()->company_id)
            ->where('uuid', $uuid)
            ->firstOrFail();
            
        return response()->json($subscription);
    }

    public function cancel(Request $request, string $uuid): JsonResponse
    {
        $subscription = PixSubscription::where('company_id', Auth::user()->company_id)
            ->where('uuid', $uuid)
            ->firstOrFail();

        $subscription->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
            'cancel_reason' => $request->reason ?? 'Cancelado pelo usuário',
        ]);

        return response()->json(['status' => 'cancelled']);
    }
}
