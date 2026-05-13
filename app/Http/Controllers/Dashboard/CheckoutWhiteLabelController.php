<?php

declare(strict_types=1);

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\CompanyWhiteLabel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\CheckoutConfig;

class CheckoutWhiteLabelController extends Controller
{
    /** GET /api/dashboard/white-label */
    public function show(): JsonResponse
    {
        $this->authorize('manageWhiteLabel', CheckoutConfig::class);
        
        $wl = CompanyWhiteLabel::firstOrCreate(
            ['company_id' => Auth::user()->company_id],
            [
                'company_name' => Auth::user()->company->name ?? '',
                'primary_color' => '#7c3aed',
                'lab_title' => 'Lab de Testes',
                'hide_basileia_branding' => false,
            ]
        );

        return response()->json($wl);
    }

    /** PUT /api/dashboard/white-label */
    public function update(Request $request): JsonResponse
    {
        $this->authorize('manageWhiteLabel', CheckoutConfig::class);

        $wl = CompanyWhiteLabel::where('company_id', Auth::user()->company_id)->firstOrFail();
        
        $data = $request->validate([
            'company_name' => 'nullable|string|max:255',
            'logo_url' => 'nullable|string|max:2048',
            'favicon_url' => 'nullable|string|max:2048',
            'primary_color' => 'nullable|string|max:7',
            'lab_title' => 'nullable|string|max:255',
            'support_email' => 'nullable|email|max:255',
            'custom_domain' => 'nullable|string|max:255',
            'hide_basileia_branding' => 'boolean',
        ]);

        $wl->update($data);

        return response()->json($wl);
    }
}
