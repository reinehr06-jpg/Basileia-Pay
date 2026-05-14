<?php

namespace App\Services\Audit;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

class AuditService
{
    /**
     * Registra uma ação de auditoria.
     */
    public function log(string $action, $entity = null, array $metadata = [], $systemId = null)
    {
        $user = Auth::user();
        
        return AuditLog::create([
            'company_id'          => $user?->company_id ?? $entity?->company_id ?? null,
            'user_id'             => $user?->id,
            'connected_system_id' => $systemId ?? $entity?->connected_system_id ?? null,
            'action'              => $action,
            'entity_type'         => $entity ? get_class($entity) : null,
            'entity_id'           => $entity ? $entity->id : null,
            'ip'                  => Request::ip(),
            'user_agent'          => Request::userAgent(),
            'metadata_masked'     => $this->maskSensitiveData($metadata),
        ]);
    }

    private function maskSensitiveData(array $data)
    {
        $sensitiveKeys = ['password', 'card_number', 'cvv', 'api_key', 'token', 'secret'];
        
        foreach ($data as $key => $value) {
            if (in_array($key, $sensitiveKeys)) {
                $data[$key] = '********';
            } elseif (is_array($value)) {
                $data[$key] = $this->maskSensitiveData($value);
            }
        }
        
        return $data;
    }
}
