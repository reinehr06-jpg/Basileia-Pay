<?php

namespace App\Services\Fraud;

use App\Models\FraudAnalysis;
use App\Models\Transaction;
use Illuminate\Support\Facades\DB;

class BasicFraudService
{
    private array $flags = [];

    private float $score = 0.0;

    public function analyze(Transaction $transaction): FraudAnalysis
    {
        $this->flags = [];
        $this->score = 0.0;

        if ($transaction->ip_address) {
            $this->tooManyFromIp($transaction->ip_address);
        }

        $this->highValue($transaction->amount);

        if ($transaction->customer_email) {
            $this->suspiciousEmail($transaction->customer_email);
        }

        $riskLevel = $this->calculateRiskLevel();
        $recommendation = $this->getRecommendation($riskLevel);

        return FraudAnalysis::create([
            'transaction_id' => $transaction->id,
            'company_id' => $transaction->company_id,
            'score' => round($this->score, 2),
            'risk_level' => $riskLevel,
            'flags' => $this->flags,
            'recommendation' => $recommendation,
            'ip_address' => $transaction->ip_address,
            'analysis_data' => [
                'flags_count' => count($this->flags),
                'amount' => $transaction->amount,
            ],
        ]);
    }

    private function tooManyFromIp(string $ip): void
    {
        $threshold = config('fraud.ip_threshold', 10);
        $timeframe = now()->subHour();

        $count = Transaction::where('ip_address', $ip)
            ->where('created_at', '>=', $timeframe)
            ->where('status', '!=', 'cancelled')
            ->count();

        if ($count >= $threshold) {
            $this->flags[] = [
                'type' => 'too_many_from_ip',
                'severity' => 'high',
                'detail' => "IP {$ip} has {$count} transactions in the last hour.",
            ];
            $this->score += 40.0;
        } elseif ($count >= $threshold * 0.7) {
            $this->flags[] = [
                'type' => 'elevated_ip_activity',
                'severity' => 'medium',
                'detail' => "IP {$ip} has {$count} transactions in the last hour.",
            ];
            $this->score += 20.0;
        }
    }

    private function highValue(float $amount): void
    {
        $threshold = config('fraud.high_value_threshold', 5000.00);

        if ($amount >= $threshold) {
            $this->flags[] = [
                'type' => 'high_value',
                'severity' => 'medium',
                'detail' => "Transaction amount R$ {$amount} exceeds threshold R$ {$threshold}.",
            ];
            $this->score += 15.0;
        }

        if ($amount >= $threshold * 2) {
            $this->flags[] = [
                'type' => 'very_high_value',
                'severity' => 'high',
                'detail' => "Transaction amount R$ {$amount} is exceptionally high.",
            ];
            $this->score += 20.0;
        }
    }

    private function cardRetryAbuse(string $cardHash): void
    {
        $threshold = config('fraud.card_retry_threshold', 5);
        $timeframe = now()->subMinutes(30);

        $count = Transaction::whereJsonContains('metadata->card_hash', $cardHash)
            ->where('created_at', '>=', $timeframe)
            ->whereIn('status', ['refused', 'pending'])
            ->count();

        if ($count >= $threshold) {
            $this->flags[] = [
                'type' => 'card_retry_abuse',
                'severity' => 'high',
                'detail' => "Card has {$count} failed attempts in the last 30 minutes.",
            ];
            $this->score += 35.0;
        }
    }

    private function suspiciousEmail(string $email): void
    {
        $domain = strtolower(substr(strrchr($email, '@'), 1) ?: '');

        if (empty($domain)) {
            $this->flags[] = [
                'type' => 'invalid_email',
                'severity' => 'medium',
                'detail' => 'Email format is invalid.',
            ];
            $this->score += 10.0;
            return;
        }

        $disposableDomains = config('fraud.disposable_domains', [
            'tempmail.com', 'throwaway.email', 'guerrillamail.com',
            'mailinator.com', 'yopmail.com', 'sharklasers.com',
            'guerrillamailblock.com', 'grr.la', 'dispostable.com',
            'trashmail.com', 'fakeinbox.com', 'temp-mail.org',
        ]);

        if (in_array($domain, $disposableDomains)) {
            $this->flags[] = [
                'type' => 'disposable_email',
                'severity' => 'high',
                'detail' => "Email domain {$domain} is a known disposable email provider.",
            ];
            $this->score += 30.0;
        }
    }

    private function calculateRiskLevel(): string
    {
        return match (true) {
            $this->score >= 70.0 => 'critical',
            $this->score >= 50.0 => 'high',
            $this->score >= 30.0 => 'medium',
            $this->score >= 15.0 => 'low',
            default => 'minimal',
        };
    }

    private function getRecommendation(string $riskLevel): string
    {
        return match ($riskLevel) {
            'critical' => 'reject',
            'high' => 'review',
            'medium' => 'review',
            default => 'approve',
        };
    }
}
