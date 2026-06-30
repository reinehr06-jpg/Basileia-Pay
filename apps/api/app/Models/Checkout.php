<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Checkout extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'company_id',
        'name',
        'system_id',
        'status',
        'current_version',
        'config',
        'trust_score',
        'conversion_rate',
    ];

    protected $casts = [
        'config' => 'array',
        'trust_score' => 'float',
        'conversion_rate' => 'float',
        'current_version' => 'integer',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function versions()
    {
        return $this->hasMany(CheckoutVersion::class);
    }

    public function publications()
    {
        return $this->hasMany(CheckoutPublication::class);
    }

    public function activePublication()
    {
        return $this->hasOne(CheckoutPublication::class)->where('status', 'active');
    }
}
