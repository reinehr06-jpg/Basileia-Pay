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
        'priority',
        'active',
        'conditions',
        'action',
    ];

    protected $casts = [
        'active'     => 'boolean',
        'conditions' => 'array',
        'action'     => 'array',
    ];
}
