<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CheckoutAuditLog extends Model
{
    protected $fillable = [
        'checkout_config_id',
        'user_id',
        'company_id',
        'config_name',
        'user_name',
        'user_email',
        'action',
        'before',
        'after',
        'diff_keys',
        'ip_address',
    ];

    protected $casts = [
        'before'    => 'array',
        'after'     => 'array',
        'diff_keys' => 'array',
    ];

    public function config()
    {
        return $this->belongsTo(CheckoutConfig::class, 'checkout_config_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}
