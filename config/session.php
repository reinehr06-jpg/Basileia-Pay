<?php

use Illuminate\Support\Str;

return [
    'driver' => env('SESSION_DRIVER', 'database'),

    'lifetime' => env('SESSION_LIFETIME', 180),

    'expire_on_close' => false,

    'encrypt' => false,

    'files' => storage_path('framework/sessions'),

    'connection' => env('SESSION_CONNECTION'),

    'table' => 'sessions',

    'store' => env('SESSION_STORE'),

    'lottery' => [2, 100],

    'cookie' => env(
        'SESSION_COOKIE',
        Str::slug(env('APP_NAME', 'checkout'), '_').'_session'
    ),

    'path' => '/',

    'domain' => null,

    'secure' => false,

    'http_only' => true,

    'same_site' => 'lax',

    'partitioned' => false,
];
