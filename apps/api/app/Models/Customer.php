<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Customer extends Model
{
    protected $fillable = [
        'uuid',
        'company_id',
        'external_id',
        'name',
        'email',
        'document',
        'document_type',
        'phone',
        'address',
        'gateway_customer_id',
        'metadata',
    ];

    protected $casts = [
        'address' => 'array',
        'metadata' => 'array',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    public function scopeByDocument($query, string $document)
    {
        return $query->where('document', $document);
    }

    public function scopeByEmail($query, string $email)
    {
        return $query->where('email', $email);
    }
}
