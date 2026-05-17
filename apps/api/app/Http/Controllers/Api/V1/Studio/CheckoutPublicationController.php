<?php

namespace App\Http\Controllers\Api\V1\Studio;

use App\Http\Controllers\Controller;
use App\Models\CheckoutExperience;
use App\Services\Studio\CheckoutPublicationValidator;
use App\Services\Studio\CheckoutVersionService;
use App\Services\Trust\TrustLayerService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CheckoutPublicationController extends Controller
{
    protected $validator;
    protected $versionService;
    protected $trustLayer;

    public function __construct(
        CheckoutPublicationValidator $validator,
        CheckoutVersionService $versionService,
        TrustLayerService $trustLayer
    ) {
        $this->validator      = $validator;
        $this->versionService = $versionService;
        $this->trustLayer     = $trustLayer;
    }

    /**
     * Validar checkout antes de publicar.
     */
    public function validateCheckout(Request $request, string $id): JsonResponse
    {
        $experience = CheckoutExperience::where('company_id', $request->user()->company_id)
            ->where('id', $id)->firstOrFail();

        $validation = $this->validator->validate($experience);

        return response()->json([
            'success' => true,
            'data'    => $validation,
        ]);
    }

    /**
     * Publicar checkout (requer validação).
     */
    public function publish(Request $request, string $id): JsonResponse
    {
        $experience = CheckoutExperience::where('company_id', $request->user()->company_id)
            ->where('id', $id)->firstOrFail();

        // 1. Validar antes de publicar
        $validation = $this->validator->validate($experience);

        if (!$validation['can_publish']) {
            return response()->json([
                'success' => false,
                'error'   => [
                    'code'    => 'publication_blocked',
                    'message' => 'Este checkout não pode ser publicado. Resolva os erros críticos.',
                    'details' => $validation,
                ],
            ], 422);
        }

        // 2. Trust Layer check
        $trustDecision = $this->trustLayer->evaluateCheckoutPublish(
            $request->user()->company_id,
            $experience->uuid ?? (string) $experience->id
        );

        if ($trustDecision->decision === 'block_publish') {
            return response()->json([
                'success' => false,
                'error'   => [
                    'code'    => 'trust_layer_blocked',
                    'message' => $trustDecision->reason,
                    'details' => [
                        'trust_score' => $trustDecision->score,
                        'signals'     => $trustDecision->signals,
                    ],
                ],
            ], 422);
        }

        // 3. Publicar versão
        $latestVersion = \App\Models\CheckoutExperienceVersion::where('checkout_experience_id', $experience->id)
            ->where('status', 'draft')
            ->orderBy('version_number', 'desc')
            ->first();

        if (!$latestVersion) {
            $latestVersion = $this->versionService->createDraft(
                $experience,
                $experience->config ?? [],
                $request->user()->id
            );
        }

        $published = $this->versionService->publish($latestVersion, $request->user()->id, $validation['score']);

        return response()->json([
            'success' => true,
            'data'    => [
                'version'    => $published,
                'validation' => $validation,
                'trust'      => [
                    'score'    => $trustDecision->score,
                    'decision' => $trustDecision->decision,
                ],
            ],
        ]);
    }
}
