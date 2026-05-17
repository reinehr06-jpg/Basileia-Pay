<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GeographicRiskSignal extends Model
{
    protected $fillable = [
        'company_id',
        'country',
        'region',
        'city',
        'total_attempts',
        'total_failed',
        'risk_index',
    ];
}
