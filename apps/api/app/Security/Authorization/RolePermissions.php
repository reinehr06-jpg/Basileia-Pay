<?php

namespace App\Security\Authorization;

use App\Models\User;

class RolePermissions
{
    public const PERMISSIONS = [
        'owner' => ['*'],

        'admin' => [
            'systems.manage',
            'gateways.manage',
            'checkouts.manage',
            'orders.view',
            'payments.view',
            'webhooks.view',
            'audit.view',
        ],

        'finance' => [
            'orders.view',
            'payments.view',
            'payments.refund',   // requer reautenticação
            'reports.export',
        ],

        'developer' => [
            'api_keys.manage',
            'webhooks.manage',
            'sandbox.access',
            'docs.view',
        ],

        'support' => [
            'orders.view',
            'payments.view_masked',
            'payments.view_status',
        ],

        'auditor' => [
            'audit.view',
            'logs.view_masked',
        ],
    ];

    public static function can(User $user, string $permission): bool
    {
        $perms = self::PERMISSIONS[$user->role] ?? [];
        return in_array('*', $perms) || in_array($permission, $perms);
    }
}
