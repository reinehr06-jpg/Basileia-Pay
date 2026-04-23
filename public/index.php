<?php

/**
 * CheckOut - Entry point with recovery logic
 */

// Basic error handling
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

define('LARAVEL_START', microtime(true));

// Determine if the application is in maintenance mode...
if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

// Check for recovery mode
if (isset($_GET['_restore']) && $_GET['_restore'] === 'CHECKOUT_2026') {
    echo '<h1>CheckOut Recovery Mode</h1>';
    echo '<p>Running recovery...</p>';
    
    $base = dirname(__DIR__);
    
    // Try git pull
    if (function_exists('shell_exec')) {
        echo '<pre>'.shell_exec("cd $base && git fetch origin 2>&1 && git reset --hard origin/main 2>&1").'</pre>';
        echo '<pre>'.shell_exec("cd $base && composer install --no-dev 2>&1 | head -20").'</pre>';
    }
    
    // Check vendor
    if (!file_exists(__DIR__.'/../vendor/autoload.php')) {
        echo '<p style="color:red">ERROR: vendor/autoload.php missing!</p>';
        echo '<p>Run: composer install</p>';
        exit;
    }
    
    echo '<p style="color:green">Recovery complete. <a href="/">Go to site</a></p>';
    exit;
}

// Try to load autoloader
$autoloader = __DIR__.'/../vendor/autoload.php';
if (!file_exists($autoloader)) {
    // Vendor missing - show maintenance page
    header('HTTP/1.1 503 Service Unavailable');
    echo '<!DOCTYPE html>
    <html>
    <head><title>System Maintenance</title></head>
    <body style="font-family:Arial;display:flex;justify-content:center;align-items:center;height:100vh;margin:0;background:#f5f5f5;">
        <div style="text-align:center;padding:40px;background:white;border-radius:10px;box-shadow:0 2px 10px rgba(0,0,0,0.1);">
            <h1 style="color:#e74c3c;">⚠️ System Maintenance</h1>
            <p>We are performing scheduled maintenance.</p>
            <p>Please try again in a few minutes.</p>
            <hr>
            <p><a href="health.php">Check System Health</a> | <a href="?_restore=CHECKOUT_2026">Recovery Mode</a></p>
        </div>
    </body>
    </html>';
    error_log('CheckOut: vendor/autoload.php not found at ' . $autoloader);
    exit(1);
}

require $autoloader;

// Check for .env
$envPath = __DIR__.'/../.env';
if (!file_exists($envPath) && file_exists(__DIR__.'/../.env.example')) {
    copy(__DIR__.'/../.env.example', $envPath);
    error_log('CheckOut: Created .env from .env.example');
}

// Bootstrap Laravel
try {
    $app = require_once __DIR__.'/../bootstrap/app.php';
} catch (\Exception $e) {
    header('HTTP/1.1 500 Internal Server Error');
    echo '<h1>System Temporarily Unavailable</h1>';
    echo '<p>Please try again later.</p>';
    error_log('CheckOut Bootstrap Error: ' . $e->getMessage());
    exit(1);
}

// Handle the request
try {
    $app->handleRequest(
        Illuminate\Http\Request::capture()
    );
} catch (\Exception $e) {
    error_log('CheckOut Request Error: ' . $e->getMessage());
    header('HTTP/1.1 500 Internal Server Error');
    echo '<h1>System Temporarily Unavailable</h1>';
    echo '<p>Please try again in a few minutes.</p>';
    exit(1);
}
