<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Concerns\BelongsToCompany;

class AuditLog extends Model
{
    use HasFactory, BelongsToCompany;

    public $timestamps = false; // Só created_at via DB — append-only

    protected $fillable = [
        'uuid',
        'company_id',
        'user_id',
        'event',
        'entity_type',
        'entity_id',
        'ip_address_hash',
        'user_agent',
        'metadata',
        'created_at',
    ];

    protected $casts = [
        'metadata' => 'array',
        'created_at' => 'datetime',
    ];

    protected static function booted()
    {
        static::creating(function ($log) {
            if (empty($log->uuid)) {
                $log->uuid = (string) \Illuminate\Support\Str::uuid();
            }
            if (empty($log->created_at)) {
                $log->created_at = now();
            }
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
