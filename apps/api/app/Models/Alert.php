<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Alert extends Model
{
    protected $fillable = [
        'company_id',
        'environment',
        'severity',
        'category',
        'type',
        'title',
        'message',
        'status',
        'source',
        'entity_type',
        'entity_id',
        'request_id',
        'trace_id',
        'metadata',
        'recommended_action',
        'first_seen_at',
        'last_seen_at',
        'resolved_at',
    ];

    protected $casts = [
        'metadata' => 'array',
        'first_seen_at' => 'datetime',
        'last_seen_at' => 'datetime',
        'resolved_at' => 'datetime',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}
