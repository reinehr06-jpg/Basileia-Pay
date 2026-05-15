<?php

namespace App\Http\Controllers\Api\V1\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Services\TenantContext;
use Illuminate\Http\Request;

class CompanyController extends Controller
{
    public function show()
    {
        $company = TenantContext::company();

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $company->id,
                'uuid' => $company->uuid,
                'name' => $company->name,
                'slug' => $company->slug,
                'settings' => $company->settings,
                'created_at' => $company->created_at->format('d/m/Y'),
            ]
        ]);
    }

    public function update(Request $request)
    {
        $company = TenantContext::company();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'settings' => 'nullable|array',
        ]);

        $company->update($validated);

        return response()->json([
            'success' => true,
            'data' => $company
        ]);
    }
}
