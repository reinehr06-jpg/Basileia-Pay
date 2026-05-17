<?php

namespace App\Http\Controllers\Api\V1\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Services\Audit\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CompanySettingsController extends Controller
{
    protected $audit;

    public function __construct(AuditService $audit)
    {
        $this->audit = $audit;
    }

    /**
     * Mostrar dados da empresa do usuário logado.
     */
    public function show(Request $request): JsonResponse
    {
        $company = $request->user()->company;

        return response()->json([
            'success' => true,
            'data'    => $company
        ]);
    }

    /**
     * Atualizar dados da empresa.
     */
    public function update(Request $request): JsonResponse
    {
        $company = $request->user()->company;

        $data = $request->validate([
            'display_name' => 'sometimes|string|max:255',
            'document'     => 'sometimes|string|max:20',
            'email'        => 'sometimes|email|max:255',
            'logo_url'     => 'sometimes|url',
            'settings'     => 'sometimes|array',
        ]);

        $before = $company->toArray();
        $company->update($data);

        // Auditoria
        $this->audit->log(
            $request->user(),
            'company_updated',
            $company,
            ['before' => $before, 'after' => $company->toArray()]
        );

        return response()->json([
            'success' => true,
            'data'    => $company
        ]);
    }
}
