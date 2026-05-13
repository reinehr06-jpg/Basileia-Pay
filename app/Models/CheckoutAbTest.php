<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CheckoutAbTest extends Model
{
    protected $table = 'checkout_ab_tests';

    protected $fillable = [
        'company_id',
        'config_a_id',
        'config_b_id',
        'split_percent',
        'is_active',
        'visits_a',
        'visits_b',
        'conversions_a',
        'conversions_b',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'split_percent' => 'integer',
        'visits_a' => 'integer',
        'visits_b' => 'integer',
        'conversions_a' => 'integer',
        'conversions_b' => 'integer',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function configA()
    {
        return $this->belongsTo(CheckoutConfig::class, 'config_a_id');
    }

    public function configB()
    {
        return $this->belongsTo(CheckoutConfig::class, 'config_b_id');
    }
}
