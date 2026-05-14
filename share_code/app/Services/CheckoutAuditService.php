<?php

namespace App\Services;

use App\Models\CheckoutAuditLog;
use App\Models\CheckoutConfig;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

class CheckoutAuditService
{
    public function log(
        CheckoutConfig $config,
        string         $action,
        array          $before = [],
        array          $after  = [],
    ): void {
        $diffKeys = [];
        if ($before && $after) {
            foreach (array_keys(array_merge($before, $after)) as $key) {
                if (($before[$key] ?? null) !== ($after[$key] ?? null)) {
                    $diffKeys[] = $key;
                }
            }
        }

        CheckoutAuditLog::create([
            'checkout_config_id' => $config->id,
            'user_id'            => Auth::id(),
            'company_id'         => $config->company_id,
            'config_name'        => $config->name,
            'user_name'          => Auth::user()?->name,
            'user_email'         => Auth::user()?->email,
            'action'             => $action,
            'before'             => $before ?: null,
            'after'              => $after  ?: null,
            'diff_keys'          => $diffKeys ?: null,
            'ip_address'         => Request::ip(),
        ]);
    }
}
