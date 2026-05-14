<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CheckoutExperienceVersion extends Model
{
    use HasFactory;

    protected $fillable = [
        'checkout_experience_id',
        'version_number',
        'status',
        'config_json',
        'published_at',
        'created_by',
    ];

    protected $casts = [
        'config_json'  => 'array',
        'published_at' => 'datetime',
    ];

    public function experience(): BelongsTo
    {
        return $this->belongsTo(CheckoutExperience::class, 'checkout_experience_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
