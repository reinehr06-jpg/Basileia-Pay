<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Concerns\BelongsToCompany;

class RoutingRule extends Model
{
    use BelongsToCompany;

    protected $fillable = [
        'company_id',
        'name',
        'method',
        'environment',
        'primary_gateway_id',
        'fallback_gateway_id',
        'strategy',
        'recommended',
        'priority',
        'active',
        'conditions',
        'action',
    ];

    protected $casts = [
        'active'      => 'boolean',
        'recommended' => 'boolean',
        'conditions'  => 'array',
        'action'      => 'array',
    ];

    public function primaryGateway()
    {
        return $this->belongsTo(GatewayAccount::class, 'primary_gateway_id');
    }

    public function fallbackGateway()
    {
        return $this->belongsTo(GatewayAccount::class, 'fallback_gateway_id');
    }

    public function scopeForMethod($query, string $method)
    {
        return $query->where('method', $method);
    }

    public function scopeForEnvironment($query, string $env)
    {
        return $query->where('environment', $env);
    }
}
