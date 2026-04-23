<?php
header('Content-Type: text/plain; charset=utf-8');
$report = "=== CHECKOUT SYSTEM HEALTH CHECK ===\n";
$report .= "Time: " . date('Y-m-d H:i:s') . "\n\n";

// 1. PHP Version
$report .= "1. PHP VERSION:\n";
$report .= "   " . phpversion() . "\n\n";

// 2. Check .env
$report .= "2. .ENV FILE:\n";
if (file_exists(__DIR__ . '/.env')) {
    $env = file_get_contents(__DIR__ . '/.env');
    $hasKey = strpos($env, 'ASAAS_API_KEY=') !== false ? 'FOUND' : 'MISSING';
    $report .= "   EXISTS: YES\n";
    $report .= "   ASAAS_API_KEY: {$hasKey}\n";
    $report .= "   DB_CONNECTION: " . (strpos($env, 'DB_CONNECTION=') !== false ? 'SET' : 'MISSING') . "\n";
} else {
    $report .= "   EXISTS: NO (SYSTEM WILL FAIL)\n";
}
$report .= "\n";

// 3. Check vendor
$report .= "3. VENDOR FOLDER:\n";
if (is_dir(__DIR__ . '/vendor')) {
    $report .= "   EXISTS: YES\n";
    $report .= "   Autoload: " . (file_exists(__DIR__ . '/vendor/autoload.php') ? 'YES' : 'NO') . "\n";
} else {
    $report .= "   EXISTS: NO (RUN COMPOSER INSTALL)\n";
}
$report .= "\n";

// 4. Check storage permissions
$report .= "4. STORAGE FOLDER:\n";
$storage = __DIR__ . '/storage';
if (is_dir($storage)) {
    $report .= "   EXISTS: YES\n";
    $report .= "   WRITABLE: " . (is_writable($storage) ? 'YES' : 'NO (FIX PERMISSIONS)') . "\n";
} else {
    $report .= "   EXISTS: NO\n";
}
$report .= "\n";

// 5. Check bootstrap/cache
$report .= "5. BOOTSTRAP/CACHE:\n";
$cache = __DIR__ . '/bootstrap/cache';
if (is_dir($cache)) {
    $report .= "   EXISTS: YES\n";
    $report .= "   WRITABLE: " . (is_writable($cache) ? 'YES' : 'NO') . "\n";
} else {
    $report .= "   EXISTS: NO\n";
}
$report .= "\n";

// 6. Test Laravel bootstrap
$report .= "6. LARAVEL BOOTSTRAP TEST:\n";
try {
    if (file_exists(__DIR__ . '/vendor/autoload.php')) {
        require_once __DIR__ . '/vendor/autoload.php';
        $report .= "   Autoload: OK\n";
        
        if (file_exists(__DIR__ . '/bootstrap/app.php')) {
            $app = require_once __DIR__ . '/bootstrap/app.php';
            $report .= "   App Bootstrap: OK\n";
            $report .= "   Laravel Version: " . $app->version() . "\n";
        } else {
            $report .= "   bootstrap/app.php: MISSING\n";
        }
    } else {
        $report .= "   Autoload: FAILED (vendor missing)\n";
    }
} catch (\Exception $e) {
    $report .= "   ERROR: " . $e->getMessage() . "\n";
}
$report .= "\n";

// 7. Check Asaas endpoint
$report .= "7. ASAAS API CONNECTION TEST:\n";
$envContent = file_exists(__DIR__ . '/.env') ? file_get_contents(__DIR__ . '/.env') : '';
preg_match('/ASAAS_API_KEY=(.*)/', $envContent, $matches);
$apiKey = isset($matches[1]) ? trim($matches[1]) : '';

if (!empty($apiKey) && $apiKey !== 'your_key_here') {
    $ch = curl_init('https://api.asaas.com/api/v3/customers?limit=1');
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['access_token: ' . $apiKey, 'Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    $report .= "   Status Code: {$httpCode}\n";
    if ($httpCode === 200) {
        $report .= "   ASAAS API: CONNECTED\n";
    } elseif ($httpCode === 401 || $httpCode === 403) {
        $report .= "   ASAAS API: INVALID KEY\n";
    } elseif ($httpCode === 404) {
        $report .= "   ASAAS API: ENDPOINT NOT FOUND (Check environment)\n";
    } else {
        $report .= "   ASAAS API: ERROR {$httpCode}\n";
    }
} else {
    $report .= "   ASAAS_API_KEY: NOT SET OR INVALID\n";
}
$report .= "\n";

$report .= "=== END OF REPORT ===\n";
echo $report;
