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

        $previousLog = AuditLog::latest('id')->first();
        $previousHash = $previousLog->record_hash ?? str_repeat('0', 64);

        $uuid = (string) \Illuminate\Support\Str::uuid();
        $companyId = \App\Services\TenantContext::companyId() ?? $user?->company_id ?? $entity?->company_id ?? null;
        $userId = $user?->id;
        $entityType = $entity ? get_class($entity) : null;
        $entityId = $entity ? $entity->id : null;
        $ipHash = $this->hashIp($ip);
        $userAgent = Request::userAgent();
        $maskedMetadata = $this->maskSensitive($metadata);
        $createdAt = now();

        $dataToHash = json_encode([
            'uuid' => $uuid,
            'company_id' => $companyId,
            'user_id' => $userId,
            'event' => $event,
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'ip_address_hash' => $ipHash,
            'user_agent' => $userAgent,
            'metadata' => $maskedMetadata,
            'created_at' => $createdAt->toIso8601String(),
        ]);

        $recordHash = hash('sha256', $previousHash . $dataToHash);

        return AuditLog::create([
            'uuid'              => $uuid,
            'company_id'        => $companyId,
            'user_id'           => $userId,
            'event'             => $event,
            'entity_type'       => $entityType,
            'entity_id'         => $entityId,
            'ip_address_hash'   => $ipHash,
            'user_agent'        => $userAgent,
            'metadata'          => $maskedMetadata,
            'previous_hash'     => $previousHash,
            'record_hash'       => $recordHash,
            'created_at'        => $createdAt,
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
