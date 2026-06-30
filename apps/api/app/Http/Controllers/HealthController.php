<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;

class HealthController extends Controller
{
    public function check()
    {
        $status = 'healthy';
        $services = [];

        // Check Postgres
        try {
            DB::connection()->getPdo();
            $services['database'] = 'ok';
        } catch (\Exception $e) {
            $status = 'unhealthy';
            $services['database'] = 'error: ' . $e->getMessage();
        }

        // Check Redis
        try {
            Redis::connection()->ping();
            $services['redis'] = 'ok';
        } catch (\Exception $e) {
            $status = 'unhealthy';
            $services['redis'] = 'error: ' . $e->getMessage();
        }

        return response()->json([
            'status' => $status,
            'services' => $services,
            'timestamp' => now()->toIso8601String()
        ], $status === 'healthy' ? 200 : 503);
    }
}
