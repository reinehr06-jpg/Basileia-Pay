<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\CheckoutExperience;
use App\Models\CheckoutVersion;
use App\Domain\Studio\Validators\CheckoutPublishValidator;
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

    public function store(Request $request): JsonResponse
    {
        $checkout = CheckoutExperience::create([
            'uuid'       => Str::uuid(),
            'company_id' => Auth::user()->company_id,
            'name'       => $request->name,
            'status'     => 'draft',
            'settings'   => [],
            'created_by' => Auth::id(),
        ]);

        return response()->json($checkout, 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $checkout = CheckoutExperience::where('company_id', Auth::user()->company_id)
            ->where('id', $id)
            ->firstOrFail();

        $checkout->update($request->only(['name', 'settings']));

        return response()->json($checkout);
    }

    public function validateCheckout(Request $request, string $id, CheckoutPublishValidator $validator): JsonResponse
    {
        $checkout = CheckoutExperience::where('company_id', Auth::user()->company_id)
            ->where('id', $id)
            ->firstOrFail();

        $result = $validator->validate($request->blocks ?? [], $checkout);

        return response()->json($result);
    }

    public function publish(Request $request, string $id, CheckoutPublishValidator $validator): JsonResponse
    {
        $checkout = CheckoutExperience::where('company_id', Auth::user()->company_id)
            ->where('id', $id)
            ->firstOrFail();

        $blocks = $request->blocks ?? [];
        $validation = $validator->validate($blocks, $checkout);

        if (!$validation['can_publish']) {
            return response()->json(['errors' => $validation['errors']], 422);
        }

        return DB::transaction(function () use ($checkout, $blocks) {
            $lastVersion = CheckoutVersion::where('checkout_id', $checkout->id)->max('version_number') ?? 0;
            
            $version = CheckoutVersion::create([
                'uuid'           => Str::uuid(),
                'checkout_id'    => $checkout->id,
                'version_number' => $lastVersion + 1,
                'snapshot'       => [
                    'blocks'   => $blocks,
                    'settings' => $checkout->settings,
                ],
            ]);

            $checkout->update([
                'status'             => 'published',
                'current_version_id' => $version->id,
            ]);

            return response()->json([
                'status'  => 'published',
                'version' => $version->version_number,
            ]);
        });
    }

    public function rollback(Request $request, string $id, string $vid): JsonResponse
    {
        $checkout = CheckoutExperience::where('company_id', Auth::user()->company_id)
            ->where('id', $id)
            ->firstOrFail();

        $version = CheckoutVersion::where('checkout_id', $checkout->id)
            ->where('id', $vid)
            ->firstOrFail();

        $checkout->update([
            'current_version_id' => $version->id,
            'settings'           => $version->snapshot['settings'] ?? $checkout->settings,
        ]);

        return response()->json(['status' => 'rolled_back', 'version' => $version->version_number]);
    }

    public function versions(string $id): JsonResponse
    {
        $versions = CheckoutVersion::where('checkout_id', $id)
            ->orderBy('version_number', 'desc')
            ->get();
            
        return response()->json($versions);
    }
}
