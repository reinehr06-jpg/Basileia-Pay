<?php

namespace App\Http\Controllers\Api\V1\Studio;

use App\Http\Controllers\Controller;
use App\Services\AI\AiCheckoutPromptService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AiCheckoutController extends Controller
{
    protected $aiService;

    public function __construct(AiCheckoutPromptService $aiService)
    {
        $this->aiService = $aiService;
    }

    /**
     * Gera um checkout draft a partir de um prompt.
     * IA NUNCA publica automaticamente.
     */
    public function generate(Request $request): JsonResponse
    {
        $data = $request->validate([
            'prompt'  => 'required|string|min:10|max:2000',
            'context' => 'sometimes|array',
            'context.enabled_methods' => 'sometimes|array',
            'context.language'        => 'sometimes|string',
            'context.currency'        => 'sometimes|string|size:3',
        ]);

        try {
            $result = $this->aiService->generateFromPrompt(
                $request->user()->company_id,
                $data['prompt'],
                $data['context'] ?? []
            );

            return response()->json([
                'success' => true,
                'data'    => $result,
            ]);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'error'   => [
                    'code'    => 'ai_validation_error',
                    'message' => $e->getMessage(),
                ],
            ], 422);
        }
    }

    /**
     * Salva o resultado da IA como draft.
     */
    public function saveDraft(Request $request): JsonResponse
    {
        $data = $request->validate([
            'checkout'    => 'required|array',
            'ai_metadata' => 'required|array',
            'warnings'    => 'sometimes|array',
        ]);

        $experience = $this->aiService->saveDraft(
            $request->user()->company_id,
            $request->user()->id,
            $data
        );

        return response()->json([
            'success' => true,
            'data'    => [
                'experience_id' => $experience->id,
                'uuid'          => $experience->uuid,
                'name'          => $experience->name,
                'status'        => $experience->status,
            ],
        ], 201);
    }
}
