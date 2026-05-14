<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RoutingRule extends Model
{
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
