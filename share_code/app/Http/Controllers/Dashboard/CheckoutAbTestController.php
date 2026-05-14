<?php

declare(strict_types=1);

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\CheckoutAbTest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CheckoutAbTestController extends Controller
{
    /** GET /api/dashboard/ab-test */
    public function show(): JsonResponse
    {
        $test = CheckoutAbTest::with(['configA:id,name', 'configB:id,name'])
            ->where('company_id', Auth::user()->company_id)
            ->latest()->first();

        if ($test) {
            $test->config_a_name = $test->configA->name ?? '';
            $test->config_b_name = $test->configB->name ?? '';
        }

        return response()->json($test);
    }

    /** POST /api/dashboard/ab-test */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'config_a_id'    => 'required|integer',
            'config_b_id'    => 'required|integer|different:config_a_id',
            'split_percent'  => 'required|integer|min:10|max:90',
        ]);

        $test = CheckoutAbTest::updateOrCreate(
            ['company_id' => Auth::user()->company_id],
            [
                ...$data,
                'is_active'     => false,
                'visits_a'      => 0,
                'visits_b'      => 0,
                'conversions_a' => 0,
                'conversions_b' => 0,
            ]
        );

        return response()->json($test);
    }

    /** PUT /api/dashboard/ab-test */
    public function update(Request $request): JsonResponse
    {
        $test = CheckoutAbTest::where('company_id', Auth::user()->company_id)->firstOrFail();
        $data = $request->validate([
            'config_a_id'   => 'sometimes|integer',
            'config_b_id'   => 'sometimes|integer',
            'split_percent' => 'sometimes|integer|min:10|max:90',
        ]);
        $test->update($data);
        return response()->json($test);
    }

    /** POST /api/dashboard/ab-test/{id}/toggle */
    public function toggle(int $id): JsonResponse
    {
        $test = CheckoutAbTest::where('company_id', Auth::user()->company_id)->findOrFail($id);
        $test->update(['is_active' => !$test->is_active]);
        return response()->json($test);
    }
}
