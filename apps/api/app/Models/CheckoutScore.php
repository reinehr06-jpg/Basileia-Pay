<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CheckoutScore extends Model
{
    protected $fillable = [
        'company_id',
        'checkout_experience_id',
        'version_number',
        'conversion_rate',
        'approval_rate',
        'health_score',
        'total_sessions',
        'total_success',
    ];
}
