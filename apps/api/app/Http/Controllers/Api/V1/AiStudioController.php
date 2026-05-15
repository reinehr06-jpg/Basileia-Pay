<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AiStudioController extends Controller
{
    public function generate(Request $request): JsonResponse
    {
        $prompt = $request->input('prompt');
        
        Log::info("AI Generation requested: {$prompt}");

        // Mocking AI response: a draft of blocks
        $draft = [
            'blocks' => [
                ['id' => 'b1', 'type' => 'company_identity', 'content' => ['name' => 'Minha Empresa']],
                ['id' => 'b2', 'type' => 'order_summary', 'content' => ['title' => 'Resumo']],
                ['id' => 'b3', 'type' => 'payment_methods', 'content' => ['methods' => ['pix', 'card']]],
                ['id' => 'b4', 'type' => 'pay_button', 'content' => ['label' => 'Pagar agora']],
                ['id' => 'b5', 'type' => 'security_text', 'content' => ['text' => 'Ambiente 100% seguro']],
            ]
        ];

        return response()->json($draft);
    }

    public function importHtml(Request $request): JsonResponse
    {
        $html = $request->input('html');
        
        // Logic to parse HTML and map to blocks
        return response()->json(['status' => 'imported', 'blocks' => []]);
    }

    public function importUrl(Request $request): JsonResponse
    {
        $url = $request->input('url');
        
        // SSRF protection and scraping logic
        return response()->json(['status' => 'imported_from_url', 'blocks' => []]);
    }
}
