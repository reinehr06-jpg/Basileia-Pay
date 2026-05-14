<?php

namespace App\Http\Controllers\Vendors;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class VendorLookupController extends Controller
{
    public function handle(Request $request, string $uuid)
    {
        $transaction = Transaction::where('uuid', $uuid)->first();
        $subscription = Subscription::where('uuid', $uuid)->first();

        $source = $transaction?->source ?? $subscription?->source ?? 'default';

        Log::info('VendorLookup: Roteando checkout', [
            'uuid' => $uuid,
            'source' => $source,
        ]);

        if ($transaction) {
            return redirect()->route('basileia.checkout.show', [
                'asaasPaymentId' => $transaction->asaas_payment_id,
            ]);
        }

        if ($subscription) {
            return redirect()->route('basileia.checkout.show', [
                'asaasPaymentId' => $subscription->gateway_subscription_id,
            ]);
        }

        return view('checkout.error', ['message' => 'Checkout não encontrado']);
    }
}