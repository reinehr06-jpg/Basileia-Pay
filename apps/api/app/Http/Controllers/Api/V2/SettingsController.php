<?php

namespace App\Http\Controllers\Api\V2;

use App\Http\Controllers\Controller;
use App\Models\ReceiptConfig;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SettingsController extends Controller
{
    public function receipt(): JsonResponse
    {
        $config = ReceiptConfig::where('company_id', Auth::user()->company_id)->first();

        return response()->json([
            'header_text'        => $config?->header_text ?? 'Comprovante de Pagamento',
            'footer_text'        => $config?->footer_text ?? 'Obrigado pela sua compra!',
            'show_logo'          => $config?->show_logo ?? true,
            'show_customer_data' => $config?->show_customer_data ?? true,
            'primary_color'      => $config?->primary_color ?? '#7c3aed',
        ]);
    }

    public function updateReceipt(Request $request): JsonResponse
    {
        $data = $request->validate([
            'header_text'        => 'nullable|string|max:255',
            'footer_text'        => 'nullable|string|max:1000',
            'show_logo'          => 'nullable|boolean',
            'show_customer_data' => 'nullable|boolean',
            'primary_color'      => 'nullable|string|max:7',
        ]);

        $config = ReceiptConfig::updateOrCreate(
            ['company_id' => Auth::user()->company_id],
            $data
        );

        return response()->json($config);
    }
}
