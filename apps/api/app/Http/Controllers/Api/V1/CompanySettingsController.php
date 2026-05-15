<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Company;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CompanySettingsController extends Controller
{
    public function show(): JsonResponse
    {
        $company = Auth::user()->company;
        return response()->json($company);
    }

    public function update(Request $request): JsonResponse
    {
        $company = Auth::user()->company;
        
        $company->update($request->only([
            'name', 'display_name', 'document', 'settings'
        ]));

        return response()->json($company);
    }
}
