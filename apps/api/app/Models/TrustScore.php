<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Concerns\BelongsToCompany;

class TrustScore extends Model
{
    use BelongsToCompany;

    protected $fillable = [
        'company_id',
        'entity_type',
        'entity_id',
        'score',
        'status',
        'breakdown',
    ];

    protected $casts = [
        'breakdown' => 'array',
        'score'     => 'integer',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}
