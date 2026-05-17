<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Concerns\BelongsToCompany;

class RoutingDecision extends Model
{
    use BelongsToCompany;

    protected $fillable = [
        'company_id',
        'method',
        'environment',
        'chosen_gateway_id',
        'fallback_gateway_id',
        'decision',
        'reason',
        'approval_rate',
        'trust_score',
        'amount',
        'checkout_id',
    ];

    protected $casts = [
        'approval_rate' => 'float',
        'trust_score'   => 'integer',
        'amount'        => 'integer',
    ];

    public function chosenGateway()
    {
        return $this->belongsTo(GatewayAccount::class, 'chosen_gateway_id');
    }

    public function fallbackGateway()
    {
        return $this->belongsTo(GatewayAccount::class, 'fallback_gateway_id');
    }
}
