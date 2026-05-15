<?php

namespace App\Services\Audit;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;
use Illuminate\Support\Facades\Log;

class AuditService
{
    /**
     * Log an audit event.
     *
     * @param string $event
     * @param object|null $entity
     * @param array $metadata
     * @return \App\Models\AuditLog
     */
    public function log(string $event, $entity = null, array $metadata = []): AuditLog
    {
        $user = Auth::user();
        $ip = Request::ip();

        return AuditLog::create([
            'uuid'              => \Illuminate\Support\Str::uuid(),
            'company_id'        => $user?->company_id ?? $entity?->company_id ?? null,
            'user_id'           => $user?->id,
            'event'             => $event,
            'entity_type'       => $entity ? get_class($entity) : null,
            'entity_id'         => $entity ? $entity->id : null,
            'ip_address_hash'   => $this->hashIp($ip),
            'user_agent'        => Request::userAgent(),
            'metadata'          => $this->maskSensitive($metadata),
            'created_at'        => now(),
        ]);
    }

    private function hashIp(string $ip): string
    {
        return hash('sha256', $ip . config('security.ip_salt', 'basileia-secret-salt'));
    }

    private function maskSensitive(array $data): array
    {
        $sensitive = ['password', 'secret', 'token', 'key', 'cvv', 'pan', 'card', 'api_key', 'credentials'];

        array_walk_recursive($data, function (&$value, $key) use ($sensitive) {
            foreach ($sensitive as $word) {
                if (stripos((string) $key, $word) !== false) {
                    $value = '[MASKED]';
                    break;
                }
            }
        });

        return $data;
    }
}
