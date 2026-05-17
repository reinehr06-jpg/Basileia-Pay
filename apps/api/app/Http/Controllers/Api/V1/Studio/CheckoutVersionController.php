<?php

namespace App\Http\Controllers\Api\V1\Studio;

use App\Http\Controllers\Controller;
use App\Models\CheckoutExperience;
use App\Models\CheckoutExperienceVersion;
use App\Services\Studio\CheckoutVersionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CheckoutVersionController extends Controller
{
    protected $versionService;

    public function __construct(CheckoutVersionService $versionService)
    {
        $this->versionService = $versionService;
    }

    /**
     * Listar versões de um checkout.
     */
    public function index(Request $request, string $checkoutId): JsonResponse
    {
        $experience = CheckoutExperience::where('company_id', $request->user()->company_id)
            ->where('id', $checkoutId)->firstOrFail();

        $versions = $this->versionService->listVersions($experience->id);

        return response()->json([
            'success' => true,
            'data'    => $versions->map(fn($v) => [
                'id'              => $v->id,
                'version_number'  => $v->version_number,
                'status'          => $v->status,
                'source'          => $v->source,
                'publication_score' => $v->publication_score,
                'created_by'      => $v->creator?->name,
                'published_at'    => $v->published_at?->format('d/m/Y H:i'),
                'created_at'      => $v->created_at->format('d/m/Y H:i'),
            ]),
        ]);
    }

    /**
     * Criar novo draft.
     */
    public function store(Request $request, string $checkoutId): JsonResponse
    {
        $experience = CheckoutExperience::where('company_id', $request->user()->company_id)
            ->where('id', $checkoutId)->firstOrFail();

        $data = $request->validate(['config_json' => 'required|array']);

        $version = $this->versionService->createDraft($experience, $data['config_json'], $request->user()->id);

        return response()->json(['success' => true, 'data' => $version], 201);
    }

    /**
     * Restaurar uma versão anterior.
     */
    public function restore(Request $request, string $checkoutId, string $versionId): JsonResponse
    {
        $experience = CheckoutExperience::where('company_id', $request->user()->company_id)
            ->where('id', $checkoutId)->firstOrFail();

        $version = CheckoutExperienceVersion::where('checkout_experience_id', $experience->id)
            ->where('id', $versionId)->firstOrFail();

        $newDraft = $this->versionService->restore($version, $request->user()->id);

        return response()->json(['success' => true, 'data' => $newDraft], 201);
    }

    /**
     * Duplicar uma versão.
     */
    public function duplicate(Request $request, string $checkoutId, string $versionId): JsonResponse
    {
        $experience = CheckoutExperience::where('company_id', $request->user()->company_id)
            ->where('id', $checkoutId)->firstOrFail();

        $version = CheckoutExperienceVersion::where('checkout_experience_id', $experience->id)
            ->where('id', $versionId)->firstOrFail();

        $newDraft = $this->versionService->duplicate($version, $request->user()->id);

        return response()->json(['success' => true, 'data' => $newDraft], 201);
    }
}
