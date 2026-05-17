<?php

namespace App\Http\Controllers\Api\V1\Studio;

use App\Http\Controllers\Controller;
use App\Models\CheckoutExperience;
use App\Services\Studio\CheckoutPreviewService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CheckoutPreviewController extends Controller
{
    protected $previewService;

    public function __construct(CheckoutPreviewService $previewService)
    {
        $this->previewService = $previewService;
    }

    /**
     * Preview de um checkout por dispositivo.
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $experience = CheckoutExperience::where('company_id', $request->user()->company_id)
            ->where('id', $id)
            ->firstOrFail();

        $device = $request->input('device', 'desktop');
        $preview = $this->previewService->generatePreview($experience, $device);

        return response()->json([
            'success' => true,
            'data'    => $preview,
        ]);
    }

    /**
     * Obter URL de preview.
     */
    public function url(Request $request, string $id): JsonResponse
    {
        $experience = CheckoutExperience::where('company_id', $request->user()->company_id)
            ->where('id', $id)
            ->firstOrFail();

        $device = $request->input('device', 'desktop');

        return response()->json([
            'success' => true,
            'data'    => [
                'url'    => $this->previewService->getPreviewUrl($experience, $device),
                'device' => $device,
            ],
        ]);
    }
}
