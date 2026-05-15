<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Concerns\BelongsToCompany;

class CheckoutExperience extends Model
{
    use HasFactory, BelongsToCompany;

    protected $fillable = [
        'uuid',
        'company_id',
        'system_id',
        'name',
        'description',
        'status',
        'current_version_id',
        'settings',
        'created_by',
    ];

    protected $casts = [
        'settings' => 'array',
    ];

    public function system(): BelongsTo
    {
        return $this->belongsTo(ConnectedSystem::class, 'system_id');
    }
}
