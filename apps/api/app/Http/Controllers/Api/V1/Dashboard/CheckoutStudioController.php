<?php

namespace App\Http\Controllers\Api\V1\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\CheckoutExperience;
use App\Services\Studio\ExperienceBuilderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CheckoutStudioController extends Controller
{
    protected $studio;

    public function __construct(ExperienceBuilderService $studio)
    {
        $this->studio = $studio;
    }

    /**
     * Obter a biblioteca de blocos.
     */
    public function blocks(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => $this->studio->getBlockLibrary()
        ]);
    }

    /**
     * Salvar o canvas de uma experiência.
     */
    public function saveCanvas(string $uuid, Request $request): JsonResponse
    {
        $experience = CheckoutExperience::where('company_id', $request->user()->company_id)
            ->where('uuid', $uuid)
            ->firstOrFail();

        $data = $request->validate([
            'layout' => 'required|string',
            'blocks' => 'required|array',
            'theme'  => 'sometimes|array',
        ]);

        $this->studio->saveCanvas($experience->id, $data);

        return response()->json([
            'success' => true,
            'data'    => $experience->fresh()
        ]);
    }
}
