<?php

namespace App\Http\Middleware;

use App\Models\Transaction;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CheckTransactionAccess
{
    public function handle(Request $request, Closure $next)
    {
        $uuid = $request->route('uuid') ?? $request->route('token');
        
        if (!$uuid) {
            Log::warning('Checkout access denied: missing uuid', [
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
            return $this->unauthorizedResponse('Transação não encontrada.');
        }

        $transaction = Transaction::where('uuid', $uuid)
            ->with(['integration', 'integration.company'])
            ->first();

        if (!$transaction) {
            Log::warning('Checkout access denied: transaction not found', [
                'uuid' => $uuid,
                'ip' => $request->ip(),
            ]);
            return $this->unauthorizedResponse('Transação não encontrada.');
        }

        if (!$transaction->integration) {
            Log::error('Checkout access denied: transaction without integration', [
                'transaction_id' => $transaction->id,
                'uuid' => $uuid,
            ]);
            return $this->unauthorizedResponse('Transação inválida.');
        }

        if ($transaction->integration->status !== 'active') {
            Log::warning('Checkout access denied: integration inactive', [
                'transaction_id' => $transaction->id,
                'integration_id' => $transaction->integration_id,
                'integration_status' => $transaction->integration->status,
            ]);
            return $this->unauthorizedResponse('Pagamento temporariamente indisponível.');
        }

        if ($transaction->status !== 'pending') {
            Log::info('Checkout access denied: transaction not pending', [
                'transaction_id' => $transaction->id,
                'uuid' => $uuid,
                'status' => $transaction->status,
            ]);
            
            if (in_array($transaction->status, ['approved', 'paid'])) {
                return redirect()->route('checkout.success', ['uuid' => $uuid]);
            }
            
            return $this->unauthorizedResponse('Esta transação já foi processada.');
        }

        if ($transaction->expires_at && now()->greaterThan($transaction->expires_at)) {
            Log::warning('Checkout access denied: transaction expired', [
                'transaction_id' => $transaction->id,
                'uuid' => $uuid,
                'expired_at' => $transaction->expires_at,
            ]);
            return $this->unauthorizedResponse('Link de pagamento expirado. Por favor, solicite um novo link.');
        }

        $request->merge(['transaction' => $transaction]);

        return $next($request);
    }

    private function unauthorizedResponse(string $message)
    {
        if (request()->expectsJson() || request()->is('api/*')) {
            return response()->json(['error' => $message], 403);
        }

        return view('checkout.error', ['message' => $message]);
    }
}
