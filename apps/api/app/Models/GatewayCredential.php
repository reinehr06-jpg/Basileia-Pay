<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Crypt;

class GatewayCredential extends Model
{
    use HasFactory;

    protected $fillable = [
        'gateway_account_id',
        'key',
        'encrypted_value',
    ];

    /**
     * Get the value as decrypted.
     */
    public function getValueAttribute()
    {
        return Crypt::decryptString($this->encrypted_value);
    }

    /**
     * Set the value as encrypted.
     */
    public function setValueAttribute($value)
    {
        $this->attributes['encrypted_value'] = Crypt::encryptString($value);
    }

    public function gatewayAccount(): BelongsTo
    {
        return $this->belongsTo(GatewayAccount::class);
    }
}
