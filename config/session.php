<?php

use Illuminate\Support\Str;

return [
    'driver' => 'file',

    'lifetime' => 120,

    'lottery' => [2, 100],

    'cookie' => 'checkout_session',

    'path' => '/',

    'domain' => null,

    'secure' => env('SESSION_SECURE_COOKIE', true),

    'http_only' => true,

    'same_site' => 'lax',

    'partitioned' => false,
];