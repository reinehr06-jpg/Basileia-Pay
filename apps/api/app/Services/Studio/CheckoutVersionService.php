<?php

namespace App\Services\Studio;

use App\Models\CheckoutExperience;
use App\Models\CheckoutExperienceVersion;
use App\Models\AuditLog;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class CheckoutVersionService
{
    public function createDraft(CheckoutExperience $experience, array $configJson, int $userId, string $source = 'manual'): CheckoutExperienceVersion
    {
        $latest = CheckoutExperienceVersion::where('checkout_experience_id', $experience->id)->orderBy('version_number', 'desc')->first();
        $num = ($latest?->version_number ?? 0) + 1;

        return CheckoutExperienceVersion::create([
            'checkout_experience_id' => $experience->id,
            'version_number' => $num,
            'status' => 'draft',
            'source' => $source,
            'config_json' => $configJson,
            'created_by' => $userId,
        ]);
    }

    public function publish(CheckoutExperienceVersion $version, int $userId, ?int $score = null): CheckoutExperienceVersion
    {
        return DB::transaction(function () use ($version, $userId, $score) {
            CheckoutExperienceVersion::where('checkout_experience_id', $version->checkout_experience_id)
                ->where('status', 'published')->update(['status' => 'archived']);

            $version->update(['status' => 'published', 'published_at' => now(), 'publication_score' => $score]);
            $version->experience->update(['status' => 'published', 'published_version_id' => $version->id, 'config' => $version->config_json]);

            AuditLog::create([
                'uuid' => (string) Str::uuid(),
                'company_id' => $version->experience->company_id,
                'user_id' => $userId,
                'event' => 'checkout_version_published',
                'entity_type' => 'checkout_experience_version',
                'entity_id' => $version->id,
                'new_values' => ['version_number' => $version->version_number, 'publication_score' => $score],
            ]);
            return $version->fresh();
        });
    }

    public function archive(CheckoutExperienceVersion $v): CheckoutExperienceVersion { $v->update(['status' => 'archived']); return $v; }
    public function restore(CheckoutExperienceVersion $v, int $uid): CheckoutExperienceVersion { return $this->createDraft($v->experience, $v->config_json, $uid, 'restore'); }
    public function duplicate(CheckoutExperienceVersion $v, int $uid): CheckoutExperienceVersion { return $this->createDraft($v->experience, $v->config_json, $uid, 'duplicate'); }

    public function listVersions(int $experienceId): \Illuminate\Database\Eloquent\Collection
    {
        return CheckoutExperienceVersion::where('checkout_experience_id', $experienceId)
            ->with('creator:id,name,email')->orderBy('version_number', 'desc')->get();
    }

    public function block(CheckoutExperienceVersion $v, string $reason): CheckoutExperienceVersion
    {
        $v->update(['status' => 'blocked', 'ai_metadata' => array_merge($v->ai_metadata ?? [], ['blocked_reason' => $reason, 'blocked_at' => now()->toISOString()])]);
        return $v;
    }
}
