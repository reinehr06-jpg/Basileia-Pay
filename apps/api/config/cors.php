<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

    'allowed_origins' => array_values(array_filter([
        env('APP_URL'),
        env('FRONTEND_URL'),
        env('DASHBOARD_URL'),
        'https://basileia.global',
        'https://secure.basileia.global',
        'https://checkout.basileia.global',
    ])),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['Content-Type', 'X-API-Key', 'Authorization', 'X-Request-ID', 'X-Trace-ID', 'X-XSRF-TOKEN', 'Accept'],

    'exposed_headers' => [],

    'max_age' => 86400,

    'supports_credentials' => true,

];
