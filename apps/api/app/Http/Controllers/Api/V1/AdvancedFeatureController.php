<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\BciAnalysis;
use App\Models\SplitRule;
use App\Models\CheckoutFxConfig;
use App\Models\LivingReceipt;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AdvancedFeatureController extends Controller
{
    // BCI
    public function bciAnalyses(Request $request): JsonResponse
    {
        $analyses = BciAnalysis::where('company_id', Auth::user()->company_id)->latest()->paginate(20);
        return response()->json($analyses);
    }

    // Split
    public function splitRules(Request $request): JsonResponse
    {
        $rules = SplitRule::where('company_id', Auth::user()->company_id)->with('recipients')->get();
        return response()->json($rules);
    }

    // FX
    public function fxConfigs(Request $request): JsonResponse
    {
        $configs = CheckoutFxConfig::where('company_id', Auth::user()->company_id)->get();
        return response()->json($configs);
    }

    // Receipts
    public function receipts(Request $request): JsonResponse
    {
        $receipts = LivingReceipt::where('company_id', Auth::user()->company_id)->latest()->paginate(20);
        return response()->json($receipts);
    }
}
