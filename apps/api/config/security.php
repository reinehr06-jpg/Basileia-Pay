<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Encryption Key (AES-256-GCM for gateway credentials)
    |--------------------------------------------------------------------------
    | Must be base64-encoded 256-bit key. Generate via:
    |   php -r "echo base64_encode(random_bytes(32));"
    | Store in env SECURITY_ENCRYPTION_KEY, never commit.
    */
    'encryption_key' => env('SECURITY_ENCRYPTION_KEY'),

    /*
    |--------------------------------------------------------------------------
    | IP Hashing Salt (LGPD compliance — never store raw IPs)
    |--------------------------------------------------------------------------
    | Used to hash IPs in audit logs. Must be unique per deployment.
    */
    'ip_salt' => env('SECURITY_IP_SALT', 'change-this-salt-in-production'),

    /*
    |--------------------------------------------------------------------------
    | Password Policy
    |--------------------------------------------------------------------------
    */
    'password' => [
        'min_length' => 8,
        'max_failed_attempts' => 5,
        'lockout_minutes' => 30,
        'expiry_days' => 15,
    ],

    /*
    |--------------------------------------------------------------------------
    | Session Limits
    |--------------------------------------------------------------------------
    */
    'session' => [
        'max_active_per_user' => 5,
        'lifetime_minutes' => 480,  // 8 hours
    ],

    /*
    |--------------------------------------------------------------------------
    | Reauth Window
    |--------------------------------------------------------------------------
    | How long a reauth confirmation is valid for critical actions.
    */
    'reauth_window_minutes' => 10,

    /*
    |--------------------------------------------------------------------------
    | Master Access
    |--------------------------------------------------------------------------
    */
    'master_access' => [
        'challenge_ttl_seconds' => 30,
        'session_ttl_hours' => 1,
        'max_challenge_attempts' => 5,
    ],

    /*
    |--------------------------------------------------------------------------
    | API Key Configuration
    |--------------------------------------------------------------------------
    */
    'api_key' => [
        'prefix_live' => 'bp_live',
        'prefix_test' => 'bp_test',
        'secret_bytes' => 32,
    ],

];
