<?php

namespace Basileia\Laravel\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Basileia\Webhooks\WebhookVerifier;

class VerifyBasileiaWebhook
{
    public function handle(Request $request, Closure $next): Response
    {
        $signature = $request->header('X-Basileia-Signature');
        $timestamp = $request->header('X-Basileia-Timestamp');
        $secret    = config('basileia.webhook_secret');
        $rawBody   = $request->getContent();

        if (!$signature || !$timestamp) {
            abort(401, 'Webhook sem assinatura.');
        }

        try {
            $valid = WebhookVerifier::verify(
                $secret, $rawBody, $signature, $timestamp
            );

            if (!$valid) {
                abort(401, 'Assinatura inválida.');
            }
        } catch (\Exception $e) {
            abort(401, $e->getMessage());
        }

        return $next($request);
    }
}
