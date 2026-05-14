<?php

return [
    'default' => [
        'name' => 'Default Vendor (Vendas)',
        'enabled' => true,
        'controller' => \App\Http\Controllers\Vendors\DefaultVendorController::class,
        'view' => 'checkout.premium',
        'settings' => [
            'gateway' => 'asaas',
            'payment_methods' => ['credit_card', 'pix', 'boleto'],
        ],
    ],

    'events' => [
        'name' => 'Events Vendor',
        'enabled' => true,
        'controller' => null,
        'view' => 'vendors.events.checkout',
        'settings' => [
            'gateway' => 'asaas',
            'payment_methods' => ['pix', 'credit_card'],
        ],
    ],
];