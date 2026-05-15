<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\CheckoutExperience;
use App\Models\CheckoutExperienceVersion;
use App\Models\BlockPreset;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class StudioController extends Controller
{
    public function index(): JsonResponse
    {
        $checkouts = CheckoutExperience::where('company_id', Auth::user()->company_id)->get();
        return response()->json($checkouts);
    }

    public function show(string $id): JsonResponse
    {
        $checkout = CheckoutExperience::where('company_id', Auth::user()->company_id)
            ->where('id', $id)
            ->firstOrFail();
        
        return response()->json($checkout);
    }

    public function presets(Request $request): JsonResponse
    {
        $niche = $request->query('niche');
        $query = BlockPreset::where(function($q) {
            $q->whereNull('company_id')->orWhere('company_id', Auth::user()->company_id);
        });

        if ($niche) {
            $query->where('niche', $niche);
        }

        return response()->json($query->get());
    }

    public function publish(Request $request, string $id): JsonResponse
    {
        $checkout = CheckoutExperience::where('company_id', Auth::user()->company_id)
            ->where('id', $id)
            ->firstOrFail();

        return DB::transaction(function () use ($checkout, $request) {
            $version = CheckoutExperienceVersion::create([
                'uuid'           => Str::uuid(),
                'checkout_experience_id'    => $checkout->id,
                'company_id'     => $checkout->company_id,
                'config_json'    => $request->config_json ?? [],
                'status'         => 'published',
            ]);

            $checkout->update([
                'published_version_id' => $version->id,
            ]);

            return response()->json($version);
        });
    }
}
