<?php

namespace App\Http\Controllers\Api\V1\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Alert;
use App\Services\Alerts\AlertService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AlertController extends Controller
{
    protected $alertService;

    public function __construct(AlertService $alertService)
    {
        $this->alertService = $alertService;
    }

    public function index(Request $request): JsonResponse
    {
        $query = Alert::where('company_id', $request->user()->company_id)
            ->orderBy('last_seen_at', 'desc');

        if ($request->has('severity'))    $query->where('severity', $request->input('severity'));
        if ($request->has('category'))    $query->where('category', $request->input('category'));
        if ($request->has('status'))      $query->where('status', $request->input('status'));
        if ($request->has('environment')) $query->where('environment', $request->input('environment'));

        $alerts = $query->paginate($request->input('per_page', 20));

        // Summary counts
        $summary = $this->alertService->countBySeverity($request->user()->company_id);

        return response()->json([
            'success' => true,
            'data'    => $alerts->items(),
            'summary' => $summary,
            'meta'    => [
                'current_page' => $alerts->currentPage(),
                'last_page'    => $alerts->lastPage(),
                'total'        => $alerts->total(),
            ],
        ]);
    }

    public function show(int $id, Request $request): JsonResponse
    {
        $alert = Alert::where('company_id', $request->user()->company_id)->findOrFail($id);
        return response()->json(['success' => true, 'data' => $alert]);
    }

    public function acknowledge(int $id, Request $request): JsonResponse
    {
        $alert = $this->alertService->acknowledge($id, $request->user()->company_id);
        return response()->json(['success' => true, 'data' => $alert]);
    }

    public function resolve(int $id, Request $request): JsonResponse
    {
        $alert = $this->alertService->resolve($id, $request->user()->company_id);
        return response()->json(['success' => true, 'data' => $alert]);
    }

    public function mute(int $id, Request $request): JsonResponse
    {
        $alert = $this->alertService->mute($id, $request->user()->company_id);
        return response()->json(['success' => true, 'data' => $alert]);
    }
}
