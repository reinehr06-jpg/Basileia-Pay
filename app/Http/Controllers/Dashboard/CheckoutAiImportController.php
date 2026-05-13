<?php

declare(strict_types=1);

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Services\AiCheckoutExtractorService;
use App\Services\BrowsershotService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CheckoutAiImportController extends Controller
{
    public function __construct(
        private AiCheckoutExtractorService $ai,
        private BrowsershotService         $browsershot,
    ) {}

    // ─── Modo 1: Upload de imagem ──────────────────────────────────────────────

    /** POST /api/dashboard/checkout-configs/import-image */
    public function fromImage(Request $request): JsonResponse
    {
        $request->validate([
            'image' => 'required|image|mimes:png,jpg,jpeg,webp|max:10240', // 10MB
        ]);

        $file     = $request->file('image');
        $base64   = base64_encode(file_get_contents($file->getRealPath()));
        $mimeType = $file->getMimeType();

        try {
            $result = $this->ai->fromImage($base64, $mimeType);
            return response()->json($result);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    // ─── Modo 2: HTML colado ──────────────────────────────────────────────────

    /** POST /api/dashboard/checkout-configs/import-html */
    public function fromHtml(Request $request): JsonResponse
    {
        $request->validate([
            'html' => 'required|string|min:100|max:200000',
        ]);

        try {
            $result = $this->ai->fromHtml($request->input('html'));
            return response()->json($result);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    // ─── Modo 3: URL → Screenshot → IA ───────────────────────────────────────

    /** POST /api/dashboard/checkout-configs/import-url-screenshot */
    public function fromUrlScreenshot(Request $request): JsonResponse
    {
        $request->validate([
            'url' => 'required|url|max:500',
        ]);

        try {
            $result = $this->ai->fromUrlScreenshot(
                $request->input('url'),
                $this->browsershot,
            );
            return response()->json($result);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }
}
