<?php

namespace App\Domain\Analytics\Services;

use App\Models\CheckoutExperienceVersion;
use App\Models\CheckoutScore;
use App\Models\CheckoutSessionAnalytics;

class CheckoutScoreCalculator
{
    private array $staticRules = [
        'total_above_fold'          => ['weight' => 15, 'category' => 'clarity',  'severity' => 'critical'],
        'vendor_identity_visible'   => ['weight' => 10, 'category' => 'trust',    'severity' => 'critical'],
        'cta_has_amount'            => ['weight' => 12, 'category' => 'payment',  'severity' => 'critical'],
        'security_badge_near_cta'   => ['weight' =>  8, 'category' => 'trust',    'severity' => 'warning' ],
        'mobile_sticky_button'      => ['weight' => 10, 'category' => 'mobile',   'severity' => 'critical'],
        'inputs_min_48px'           => ['weight' =>  8, 'category' => 'mobile',   'severity' => 'warning' ],
        'pix_timer_visible'         => ['weight' =>  7, 'category' => 'payment',  'severity' => 'warning' ],
        'error_messages_humanized'  => ['weight' =>  6, 'category' => 'clarity',  'severity' => 'warning' ],
        'support_link_present'      => ['weight' =>  5, 'category' => 'trust',    'severity' => 'info'    ],
        'logo_present'              => ['weight' =>  5, 'category' => 'trust',    'severity' => 'warning' ],
        'discount_visible'          => ['weight' =>  4, 'category' => 'clarity',  'severity' => 'info'    ],
        'success_headline_custom'   => ['weight' =>  4, 'category' => 'clarity',  'severity' => 'info'    ],
        'next_steps_configured'     => ['weight' =>  3, 'category' => 'clarity',  'severity' => 'info'    ],
    ];

    public function calculate(CheckoutExperienceVersion $version): CheckoutScore
    {
        $config = $version->snapshot ?? [];
        $issues = [];
        $total = 0;
        $maxScore = array_sum(array_column($this->staticRules, 'weight'));

        foreach ($this->staticRules as $rule => $meta) {
            $passed = $this->evaluateRule($rule, $config);

            if ($passed) {
                $total += $meta['weight'];
            } else {
                $issues[] = [
                    'category'         => $meta['category'],
                    'severity'         => $meta['severity'],
                    'code'             => $rule,
                    'title'            => $this->issueTitle($rule),
                    'description'      => $this->issueDescription($rule),
                    'suggestion'       => $this->issueSuggestion($rule),
                    'estimated_impact' => 2.5, // Mock value
                ];
            }
        }

        $conversionBonus = $this->conversionBonus($version);
        $total = min(100, $total + $conversionBonus);

        $subscores = $this->calculateSubscores($issues);

        return CheckoutScore::updateOrCreate(
            ['version_id' => $version->id],
            [
                'checkout_experience_id' => $version->checkout_experience_id,
                'company_id'             => $version->checkoutExperience->company_id,
                'score_overall'          => $total,
                'score_clarity'          => $subscores['clarity'],
                'score_trust'            => $subscores['trust'],
                'score_mobile'           => $subscores['mobile'],
                'score_payment'          => $subscores['payment'],
                'score_security'         => $subscores['security'],
                'score_conversion'       => $subscores['conversion'],
                'issues'                 => $issues,
                'suggestions'            => $issues,
                'calculated_at'          => now(),
            ]
        );
    }

    private function evaluateRule(string $rule, array $config): bool
    {
        $blocks = collect($config['blocks'] ?? []);
        
        return match($rule) {
            'total_above_fold'        => $blocks->where('type', 'total')->count() > 0,
            'vendor_identity_visible' => $blocks->where('type', 'vendor_header')->count() > 0,
            'cta_has_amount'          => true, // Simplified
            'security_badge_near_cta' => $blocks->where('type', 'security_badges')->count() > 0,
            'mobile_sticky_button'    => true, // Simplified
            'inputs_min_48px'         => true,
            'pix_timer_visible'       => $blocks->where('type', 'pix_qr')->count() > 0,
            'logo_present'            => true,
            'support_link_present'    => true,
            'success_headline_custom' => true,
            'next_steps_configured'   => true,
            default                   => true,
        };
    }

    private function calculateSubscores(array $issues): array
    {
        $categories = ['clarity', 'trust', 'mobile', 'payment', 'security', 'conversion'];
        $scores = [];
        foreach ($categories as $cat) {
            $catIssues = collect($issues)->where('category', $cat)->count();
            $scores[$cat] = max(0, 100 - ($catIssues * 20));
        }
        return $scores;
    }

    private function conversionBonus(CheckoutExperienceVersion $version): int
    {
        return 5; // Mock bonus
    }

    private function issueTitle($rule) { return "Problema: $rule"; }
    private function issueDescription($rule) { return "Descrição do problema $rule"; }
    private function issueSuggestion($rule) { return "Sugestão para $rule"; }
}
