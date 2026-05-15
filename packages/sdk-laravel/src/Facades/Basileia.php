<?php

namespace Basileia\Laravel\Facades;

use Illuminate\Support\Facades\Facade;

class Basileia extends Facade
{
    protected static function getFacadeAccessor(): string
    {
        return 'basileia';
    }
}
