<?php

namespace App\Domain\Receipt\Services;

use App\Models\Payment;
use App\Models\LivingReceipt;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class LivingReceiptService
{
    public function createForPayment(Payment $payment): LivingReceipt
    {
        $receiptNumber = $this->generateReceiptNumber($payment->company_id);
        $verifyToken   = Str::random(64);

        $signedHash = hash_hmac('sha256',
            implode('|', [
                $payment->uuid,
                $payment->amount,
                $payment->approved_at?->toIso8601String(),
                $receiptNumber,
            ]),
            config('app.key')
        );

        return LivingReceipt::create([
            'uuid'           => Str::uuid(),
            'payment_id'     => $payment->id,
            'company_id'     => $payment->company_id,
            'receipt_number' => $receiptNumber,
            'verify_token'   => $verifyToken,
            'signed_hash'    => $signedHash,
            'current_status' => $payment->status,
        ]);
    }

    public function verify(string $verifyToken): array
    {
        $receipt = LivingReceipt::where('verify_token', $verifyToken)
            ->with(['payment', 'payment.company'])
            ->firstOrFail();

        $receipt->increment('total_views');
        $receipt->update(['last_viewed_at' => now()]);

        $expectedHash = hash_hmac('sha256',
            implode('|', [
                $receipt->payment->uuid,
                $receipt->payment->amount,
                $receipt->payment->approved_at?->toIso8601String(),
                $receipt->receipt_number,
            ]),
            config('app.key')
        );

        return [
            'receipt'      => $receipt,
            'is_authentic' => hash_equals($expectedHash, $receipt->signed_hash),
            'verified_at'  => now()->toIso8601String(),
        ];
    }

    private function generateReceiptNumber(int $companyId): string
    {
        $year    = now()->year;
        $seq     = LivingReceipt::where('company_id', $companyId)
                    ->whereYear('created_at', $year)
                    ->count() + 1;

        return sprintf('BP-%d-%06d', $year, $seq);
    }
}
