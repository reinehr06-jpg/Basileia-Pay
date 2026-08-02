<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class AnomalyDetection
{
    private const MAX_UA_LENGTH = 512;

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        if (!$user) {
            return $next($request);
        }

        $token = $user->currentAccessToken();
        if (!$token) {
            return $next($request);
        }

        $session = $request->attributes->get('zero_trust_session');
        if (!$session) {
            $session = DB::table('user_sessions')
                ->where('user_id', $user->id)
                ->where('token_id', $token->id)
                ->first();
        }

        if (!$session) {
            return $next($request);
        }

        $anomalies = [];

        // 1. User-Agent anomaly
        if ($session->user_agent !== $request->userAgent()) {
            $anomalies[] = 'ua_change';
            logger()->warning('AnomalyDetection: User-Agent changed', [
                'user_id' => $user->id,
                'old' => substr($session->user_agent, 0, 100),
                'new' => substr($request->userAgent(), 0, 100),
            ]);
        }

        // 2. Time anomaly (unusual hour)
        $hour = (int) now()->format('H');
        $isBusinessHours = $hour >= 6 && $hour <= 22;

        if (!$isBusinessHours && $session->last_active_at) {
            $lastHour = (int) $session->last_active_at->format('H');
            $isLastBusinessHours = $lastHour >= 6 && $lastHour <= 22;
            if ($isLastBusinessHours && !$this->isWhitelistedIp($request->ip())) {
                $anomalies[] = 'unusual_hour';
                logger()->warning('AnomalyDetection: unusual access hour', [
                    'user_id' => $user->id,
                    'hour' => $hour,
                    'ip' => $request->ip(),
                ]);
            }
        }

        // 3. Rapid requests anomaly
        if ($session->last_active_at) {
            $secondsSinceLastAction = $session->last_active_at->diffInSeconds(now());
            if ($secondsSinceLastAction < 1) {
                $anomalies[] = 'rapid_request';
            }
        }

        // If multiple anomalies, flag and potentially block
        if (count($anomalies) >= 2) {
            logger()->warning('AnomalyDetection: multiple anomalies detected', [
                'user_id' => $user->id,
                'anomalies' => $anomalies,
                'ip' => $request->ip(),
            ]);

            // Store anomaly flag for downstream use
            $request->attributes->set('anomaly_flags', $anomalies);

            if (in_array('ua_change', $anomalies) && in_array('unusual_hour', $anomalies)) {
                return response()->json([
                    'success' => false,
                    'error' => [
                        'code' => 'access_denied_anomaly',
                        'message' => 'Acesso bloqueado por segurança. Tente novamente mais tarde.',
                    ],
                ], 403);
            }
        }

        return $next($request);
    }

    private function isWhitelistedIp(string $ip): bool
    {
        $whitelist = ['127.0.0.1', '::1', '10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16'];
        foreach ($whitelist as $cidr) {
            if (str_contains($cidr, '/')) {
                if ($this->cidrMatch($ip, $cidr)) return true;
            } elseif ($ip === $cidr) {
                return true;
            }
        }
        return false;
    }

    private function cidrMatch(string $ip, string $cidr): bool
    {
        $parts = explode('/', $cidr);
        $range = $parts[0];
        $prefix = (int) ($parts[1] ?? 32);
        $ipLong = ip2long($ip);
        $rangeLong = ip2long($range);
        if ($ipLong === false || $rangeLong === false) return false;
        $mask = -1 << (32 - $prefix);
        return ($ipLong & $mask) === ($rangeLong & $mask);
    }
}
