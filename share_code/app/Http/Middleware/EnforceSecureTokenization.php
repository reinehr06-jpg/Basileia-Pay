<?php

namespace App\Http\Middleware;

use App\Models\Transaction;
use App\Services\CheckoutService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class EnforceSecureTokenization
{
    /**
     * Validate required fields for secure tokenization redirect.
     */
    private function validateTokenizationRequest(Request $request): bool
    {
        return $request->has('asaas_payment_id')
            && $request->filled('email')
            && $request->filled('cliente')
            && $request->filled('valor')
            && is_numeric($request->get('valor'))
            && (float) $request->get('valor') > 0;
    }

    public function handle(Request $request, Closure $next): Response
    {
        try {
            // Skip for API routes - they handle tokenization themselves
            if ($request->is('api/*') || $request->is('api')) {
                return $next($request);
            }

            // Skip for webhook routes
            if ($request->is('webhooks/*') || $request->is('api/webhooks/*')) {
                return $next($request);
            }

            // Only apply to web routes with asaas_payment_id
            if ($request->has('asaas_payment_id') && !$request->routeIs('checkout.*')) {
                // Validate required fields to prevent abuse
                if (!$this->validateTokenizationRequest($request)) {
                    \Illuminate\Support\Facades\Log::warning('EnforceSecureTokenization: Invalid tokenization request', [
                        'ip' => $request->ip(),
                        'params' => $request->only(['asaas_payment_id', 'email', 'cliente', 'valor']),
                    ]);
                    return $next($request);
                }

                $asaasPaymentId = $request->get('asaas_payment_id');
                $transaction = Transaction::where('asaas_payment_id', $asaasPaymentId)->first();

                if (!$transaction) {
                    // Use CheckoutService to leverage centralized company resolution
                    $transaction = CheckoutService::createTransactionFromRedirect([
                        'asaas_payment_id' => $asaasPaymentId,
                        'url_params' => $request->all(),
                    ]);
                }

                if ($transaction) {
                    return redirect()->away(route('checkout.show', $transaction->uuid), 301);
                }
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('EnforceSecureTokenization Error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }

        return $next($request);
    }
}