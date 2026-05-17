<?php

namespace App\Services\Alerts;

use App\Models\Alert;
use App\Models\AuditLog;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class AlertService
{
    /**
     * Cria ou atualiza um alerta operacional.
     * Se já existe alerta aberto do mesmo tipo para a mesma entidade, atualiza last_seen_at.
     */
    public function trigger(array $data): Alert
    {
        // Garantir campos obrigatórios
        $data['severity'] = $data['severity'] ?? 'medium';
        $data['status']   = $data['status'] ?? 'open';

        // Verificar se já existe um alerta aberto do mesmo tipo para a mesma entidade
        $query = Alert::where('company_id', $data['company_id'])
            ->where('type', $data['type'])
            ->whereIn('status', ['open', 'acknowledged']);

        if (!empty($data['entity_id'])) {
            $query->where('entity_id', $data['entity_id']);
        }

        $alert = $query->first();

        if ($alert) {
            $alert->update([
                'last_seen_at' => now(),
                'message'      => $data['message'],
                'severity'     => $data['severity'],
                'metadata'     => array_merge($alert->metadata ?? [], $data['metadata'] ?? []),
            ]);
            return $alert;
        }

        $alert = Alert::create(array_merge($data, [
            'first_seen_at' => now(),
            'last_seen_at'  => now(),
        ]));

        // Log no canal de alertas
        Log::channel('alerts')->warning("Operational Alert [{$alert->severity}]: {$alert->title}", [
            'alert_id' => $alert->id,
            'type'     => $alert->type,
            'category' => $alert->category,
        ]);

        // Gerar audit log para alertas críticos
        if (in_array($alert->severity, ['high', 'critical'])) {
            AuditLog::create([
                'uuid'        => (string) Str::uuid(),
                'company_id'  => $alert->company_id > 0 ? $alert->company_id : null,
                'event'       => 'alert_triggered',
                'entity_type' => 'alert',
                'entity_id'   => $alert->id,
                'new_values'  => [
                    'severity' => $alert->severity,
                    'type'     => $alert->type,
                    'title'    => $alert->title,
                ],
            ]);
        }

        return $alert;
    }

    /**
     * Marca alerta como reconhecido.
     */
    public function acknowledge(int $alertId, ?int $companyId = null): Alert
    {
        $query = Alert::where('id', $alertId);
        if ($companyId) {
            $query->where('company_id', $companyId);
        }
        $alert = $query->firstOrFail();
        $alert->update(['status' => 'acknowledged']);
        return $alert;
    }

    /**
     * Resolve um alerta.
     */
    public function resolve(int $alertId, ?int $companyId = null): Alert
    {
        $query = Alert::where('id', $alertId);
        if ($companyId) {
            $query->where('company_id', $companyId);
        }
        $alert = $query->firstOrFail();
        $alert->update([
            'status'      => 'resolved',
            'resolved_at' => now(),
        ]);
        return $alert;
    }

    /**
     * Silencia um alerta (sem mais notificações).
     */
    public function mute(int $alertId, ?int $companyId = null): Alert
    {
        $query = Alert::where('id', $alertId);
        if ($companyId) {
            $query->where('company_id', $companyId);
        }
        $alert = $query->firstOrFail();
        $alert->update(['status' => 'muted']);
        return $alert;
    }

    /**
     * Obtém contagem de alertas por severidade para uma empresa.
     */
    public function countBySeverity(int $companyId): array
    {
        $counts = Alert::where('company_id', $companyId)
            ->whereIn('status', ['open', 'acknowledged'])
            ->selectRaw("severity, count(*) as total")
            ->groupBy('severity')
            ->pluck('total', 'severity')
            ->toArray();

        return [
            'critical' => $counts['critical'] ?? 0,
            'high'     => $counts['high'] ?? 0,
            'medium'   => $counts['medium'] ?? 0,
            'low'      => $counts['low'] ?? 0,
            'info'     => $counts['info'] ?? 0,
            'total'    => array_sum($counts),
        ];
    }
}
