<?php

return [
    'api_key'        => env('BASILEIA_API_KEY'),
    'environment'    => env('BASILEIA_ENV', 'sandbox'),
    'base_url'       => env('BASILEIA_BASE_URL'),
    'webhook_secret' => env('BASILEIA_WEBHOOK_SECRET'),
];
