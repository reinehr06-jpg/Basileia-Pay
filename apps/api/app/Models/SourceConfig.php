<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SourceConfig extends Model
{
    protected $fillable = [
        'source_name',
        'callback_url',
        'webhook_secret',
        'active',
    ];

    protected $casts = [
        'active' => 'boolean',
    ];

    public function isActive(): bool
    {
        return $this->active;
    }
}