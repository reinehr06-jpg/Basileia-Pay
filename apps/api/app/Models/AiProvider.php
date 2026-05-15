<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AiProvider extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'name',
        'type',
        'base_url',
        'api_key_encrypted',
        'model',
        'cost_input',
        'cost_output',
        'currency',
        'active',
        'is_default',
        'available_to_clients',
    ];

    protected $casts = [
        'active' => 'boolean',
        'is_default' => 'boolean',
        'available_to_clients' => 'boolean',
        'cost_input' => 'float',
        'cost_output' => 'float',
    ];
}
