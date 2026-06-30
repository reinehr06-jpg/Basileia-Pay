<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Checkout;
use App\Models\CheckoutVersion;
use App\Models\CheckoutPublication;
use App\Services\TenantContext;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class CheckoutController extends Controller
{
    public function __construct(
        private readonly TenantContext $tenant
    ) {}

    public function index()
    {
        $checkouts = Checkout::where('company_id', $this->tenant->getCompanyId())
            ->where('status', '!=', 'archived')
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $checkouts
        ]);
    }

    public function show(string $id)
    {
        $checkout = Checkout::where('company_id', $this->tenant->getCompanyId())
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $checkout
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'config' => 'required|array',
            'system_id' => 'nullable|string|unique:checkouts,system_id',
        ]);

        try {
            DB::beginTransaction();

            $checkout = Checkout::create([
                'id' => (string) Str::uuid(),
                'company_id' => $this->tenant->getCompanyId(),
                'name' => $request->name,
                'system_id' => $request->system_id ?? Str::slug($request->name) . '-' . Str::random(6),
                'status' => 'draft',
                'current_version' => 1,
                'config' => $request->config,
                'trust_score' => $request->config['trust_score'] ?? null,
            ]);

            CheckoutVersion::create([
                'checkout_id' => $checkout->id,
                'version_number' => 1,
                'config' => $request->config,
                'trust_score' => $request->config['trust_score'] ?? null,
                'created_by' => auth()->id(),
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $checkout
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, string $id)
    {
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'config' => 'sometimes|array',
            'system_id' => 'nullable|string',
        ]);

        $checkout = Checkout::where('company_id', $this->tenant->getCompanyId())
            ->findOrFail($id);

        try {
            DB::beginTransaction();

            if ($request->has('system_id') && $request->system_id !== $checkout->system_id) {
                $exists = Checkout::where('system_id', $request->system_id)->where('id', '!=', $checkout->id)->exists();
                if ($exists) {
                    return response()->json(['success' => false, 'error' => 'System ID already in use'], 422);
                }
                $checkout->system_id = $request->system_id;
            }

            if ($request->has('name')) {
                $checkout->name = $request->name;
            }

            if ($request->has('config')) {
                $checkout->current_version += 1;
                $checkout->config = $request->config;
                $checkout->trust_score = $request->config['trust_score'] ?? $checkout->trust_score;

                CheckoutVersion::create([
                    'checkout_id' => $checkout->id,
                    'version_number' => $checkout->current_version,
                    'config' => $request->config,
                    'trust_score' => $request->config['trust_score'] ?? null,
                    'created_by' => auth()->id(),
                ]);
            }

            // Keep published status if it was published, otherwise draft
            // Saving new draft doesn't remove "published" status of the checkout itself unless we want to, 
            // but the `config` points to the latest draft.
            $checkout->save();

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $checkout
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function publish(string $id)
    {
        $checkout = Checkout::where('company_id', $this->tenant->getCompanyId())
            ->findOrFail($id);

        try {
            DB::beginTransaction();

            // Find the latest version we just saved
            $latestVersion = CheckoutVersion::where('checkout_id', $checkout->id)
                ->where('version_number', $checkout->current_version)
                ->firstOrFail();

            // Supersede older active publications
            CheckoutPublication::where('checkout_id', $checkout->id)
                ->where('status', 'active')
                ->update(['status' => 'superseded']);

            // Create new publication
            $publication = CheckoutPublication::create([
                'checkout_id' => $checkout->id,
                'checkout_version_id' => $latestVersion->id,
                'published_at' => now(),
                'published_by' => auth()->id(),
                'public_url' => url('/public/checkouts/' . $checkout->system_id),
                'status' => 'active',
            ]);

            $checkout->status = 'published';
            $checkout->save();

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $checkout
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function destroy(string $id)
    {
        $checkout = Checkout::where('company_id', $this->tenant->getCompanyId())
            ->findOrFail($id);

        $checkout->status = 'archived';
        $checkout->save();

        return response()->json(['success' => true]);
    }
}
