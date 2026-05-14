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

    public function getValueAttribute(?string $value): string
    {
        if (empty($value)) {
            return '';
        }

        try {
            return Crypt::decryptString($value);
        } catch (\Exception $e) {
            return 'ERROR: Could not decrypt (APP_KEY may have changed)';
        }
    }

    public function setValueAttribute(string $value): void
    {
        $this->attributes['value'] = Crypt::encryptString($value);
    }

    public function getDecryptedValueAttribute(): string
    {
        $value = $this->attributes['value'] ?? '';
        
        if (empty($value)) {
            return '';
        }

        try {
            return Crypt::decryptString($value);
        } catch (\Exception $e) {
            return 'ERROR: Could not decrypt (APP_KEY may have changed)';
        }
    }
}
