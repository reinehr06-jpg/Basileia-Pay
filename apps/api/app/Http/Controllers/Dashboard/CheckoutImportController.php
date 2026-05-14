<?php

declare(strict_types=1);

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Services\UrlScraperService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CheckoutImportController extends Controller
{
    public function __construct(private UrlScraperService $scraper) {}

    /** POST /api/dashboard/checkout-configs/import-url */
    public function fromUrl(Request $request): JsonResponse
    {
        $data = $request->validate([
            'url' => 'required|url|max:500',
        ]);

        try {
            $extracted = $this->scraper->extract($data['url']);
            return response()->json($extracted);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Erro ao processar a URL. Tente outra.'], 500);
        }
    }
}
