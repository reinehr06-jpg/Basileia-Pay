<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CompanyKey extends Model
{
    protected $table = 'company_keys';
    
    // As it uses company_id as primary key
    protected $primaryKey = 'company_id';
    public $incrementing = false;

    protected $fillable = [
        'company_id',
        'key',
    ];
}
