<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Crypt;

class GatewayConfig extends Model
{
    protected $fillable = [
        'gateway_id',
        'key',
        'value',
    ];

    public function gateway(): BelongsTo
    {
        return $this->belongsTo(Gateway::class);
    }

    public function getValueAttribute(string $value): string
    {
        return Crypt::decryptString($value);
    }

    public function setValueAttribute(string $value): void
    {
        $this->attributes['value'] = Crypt::encryptString($value);
    }

    public function getDecryptedValueAttribute(): string
    {
        return Crypt::decryptString($this->attributes['value']);
    }
}
