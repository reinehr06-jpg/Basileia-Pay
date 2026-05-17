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
        'source',
        'config_json',
        'publication_score',
        'prompt_original',
        'ai_metadata',
        'published_at',
        'created_by',
    ];

    protected $casts = [
        'config_json'   => 'array',
        'ai_metadata'   => 'array',
        'published_at'  => 'datetime',
        'publication_score' => 'integer',
    ];

    public function experience(): BelongsTo
    {
        return $this->belongsTo(CheckoutExperience::class, 'checkout_experience_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scopeDraft($query)
    {
        return $query->where('status', 'draft');
    }

    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }
}
