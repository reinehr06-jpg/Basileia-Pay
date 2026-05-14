<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CheckoutExperience extends Model
{
    use HasFactory;

    protected $fillable = [
        'connected_system_id',
        'name',
        'config',
        'active'
    ];

    protected $casts = [
        'config' => 'array',
        'active' => 'boolean'
    ];

    public function connectedSystem(): BelongsTo
    {
        return $this->belongsTo(ConnectedSystem::class);
    }
}
