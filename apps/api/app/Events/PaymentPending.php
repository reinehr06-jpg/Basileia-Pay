<?php

namespace App\Events;

use App\Models\Payment;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PaymentPending
{
    use Dispatchable, SerializesModels;

    public function __construct(public Payment $payment) {}
}
