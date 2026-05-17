<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Concerns\BelongsToCompany;

class WebhookHealthSnapshot extends Model
{
    use BelongsToCompany;

    protected $fillable = [
        'company_id',
        'webhook_endpoint_id',
        'success_rate',
        'failure_rate',
        'avg_response_time_ms',
        'retry_count',
        'failure_streak',
        'last_success_at',
        'last_failure_at',
        'period',
    ];

    protected $casts = [
        'success_rate'         => 'float',
        'failure_rate'         => 'float',
        'avg_response_time_ms' => 'float',
        'last_success_at'      => 'datetime',
        'last_failure_at'      => 'datetime',
    ];

    public function webhookEndpoint()
    {
        return $this->belongsTo(WebhookEndpoint::class);
    }
}
