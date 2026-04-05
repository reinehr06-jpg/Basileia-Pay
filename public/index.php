<?php

// DIRECT DIAGNOSTIC PING
if ($_SERVER['REQUEST_URI'] === '/api/ping-direct') {
    header('Content-Type: application/json');
    echo json_encode([
        'status' => 'PONG_DIRECT',
        'server' => 'CheckOut-Internal-Debug-v2',
        'timestamp' => date('Y-m-d H:i:s')
    ]);
    exit;
}

use Illuminate\Http\Request;

error_reporting(E_ALL);
ini_set('display_errors', 1);

define('LARAVEL_START', microtime(true));

// Force debug mode
$_ENV['APP_DEBUG'] = 'true';
$_SERVER['APP_DEBUG'] = 'true';
putenv('APP_DEBUG=true');

// Determine if the application is in maintenance mode...
if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

// Register the Composer autoloader...
require __DIR__.'/../vendor/autoload.php';

// Bootstrap Laravel and handle the request...
(require_once __DIR__.'/../bootstrap/app.php')
    ->handleRequest(Request::capture());
