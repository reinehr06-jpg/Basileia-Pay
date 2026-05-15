<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AbTest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ABTestController extends Controller
{
    public function index(string $checkoutId): JsonResponse
    {
        $tests = AbTest::where('company_id', Auth::user()->company_id)
            ->where('checkout_experience_id', $checkoutId)
            ->with('variants')
            ->get();

        return response()->json($tests);
    }

    public function store(Request $request, string $checkoutId): JsonResponse
    {
        $test = AbTest::create([
            'uuid'                   => \Illuminate\Support\Str::uuid(),
            'company_id'             => Auth::user()->company_id,
            'checkout_experience_id' => $checkoutId,
            'name'                   => $request->name,
            'status'                 => 'draft',
            'traffic_split'          => $request->traffic_split ?? 50,
        ]);

        return response()->json($test, 201);
    }
}
