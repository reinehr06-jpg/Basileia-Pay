<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CompanyWhiteLabel extends Model
{
    protected $fillable = [
        'company_id',
        'company_name',
        'logo_url',
        'favicon_url',
        'primary_color',
        'lab_title',
        'support_email',
        'custom_domain',
        'hide_basileia_branding',
    ];

    protected $casts = [
        'hide_basileia_branding' => 'boolean',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}
