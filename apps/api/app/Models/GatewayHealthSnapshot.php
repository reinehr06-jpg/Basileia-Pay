<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Concerns\BelongsToCompany;

class GatewayHealthSnapshot extends Model
{
    use BelongsToCompany;

    protected $fillable = [
        'company_id',
        'gateway_account_id',
        'approval_rate',
        'failure_rate',
        'avg_latency_ms',
        'timeout_count',
        'fallback_count',
        'total_transactions',
        'last_approved_at',
        'last_failed_at',
        'period',
    ];

    protected $casts = [
        'approval_rate'    => 'float',
        'failure_rate'     => 'float',
        'avg_latency_ms'   => 'float',
        'last_approved_at' => 'datetime',
        'last_failed_at'   => 'datetime',
    ];

    public function gatewayAccount()
    {
        return $this->belongsTo(GatewayAccount::class);
    }
}
