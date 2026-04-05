<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Integration;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class IntegrationController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $companyId = $user->company_id;

        // Se o usuário não tem empresa, tentamos pegar a primeira ou criar uma
        if (empty($companyId)) {
            $company = \App\Models\Company::first();
            
            if (!$company) {
                try {
                    $company = new \App\Models\Company();
                    $company->name = 'Minha Empresa';
                    $company->status = 'active';
                    $company->save();
                } catch (\Exception $e) {
                    \Illuminate\Support\Facades\Log::error("Não foi possível criar empresa: " . $e->getMessage());
                }
            }
            
            if ($company && $company->id) {
                $companyId = $company->id;
                // Forçamos a atualização do usuário
                \App\Models\User::where('id', $user->id)->update(['company_id' => $companyId]);
                $user->company_id = $companyId;
            }
        }

        // Medida de segurança final: Se ainda for null, abortamos com erro amigável ao invés de crash SQL
        if (empty($companyId)) {
            abort(500, "Erro: Não foi possível carregar o contexto da sua empresa. Verifique se o banco de dados tem ao menos uma empresa cadastrada.");
        }

        $integrations = Integration::where('company_id', $companyId)
            ->withCount('transactions')
            ->get();

        return view('dashboard.integrations.index', compact('integrations'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'base_url' => 'sometimes|url',
        ]);

        $user = Auth::user();

        $apiKey = 'ck_live_' . Str::random(32);

        $integration = Integration::create([
            'company_id' => $user->company_id,
            'name' => $request->input('name'),
            'slug' => Str::slug($request->input('name')),
            'base_url' => $request->input('base_url') ?? 'https://vendas.basileia.global',
            'api_key_hash' => hash('sha256', $apiKey),
            'api_key_prefix' => substr($apiKey, 0, 8),
            'permissions' => ['all'],
            'status' => 'active',
        ]);

        return redirect()->route('dashboard.integrations.show', $integration->id)
            ->with('success', 'Integração criada com sucesso. API Key: ' . $apiKey);
    }

    public function show(int $id)
    {
        $user = Auth::user();

        $integration = Integration::where('company_id', $user->company_id)
            ->with(['webhookEndpoints'])
            ->withCount('transactions')
            ->find($id);

        if (!$integration) {
            abort(404, 'Integração não encontrada.');
        }

        $integration->api_key_prefix_display = $integration->api_key_prefix . '...';

        return view('dashboard.integrations.show', compact('integration'));
    }

    public function update(Request $request, int $id)
    {
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'sometimes|string|max:500',
            'gateway_config' => 'sometimes|array',
            'webhook_url' => 'sometimes|url',
            'webhook_events' => 'sometimes|array',
        ]);

        $user = Auth::user();

        $integration = Integration::where('company_id', $user->company_id)->find($id);

        if (!$integration) {
            abort(404, 'Integração não encontrada.');
        }

        $integration->update($request->only([
            'name', 'description', 'base_url',
            'webhook_url', 'webhook_secret',
        ]));

        return redirect()->route('dashboard.integrations.show', $integration->id)
            ->with('success', 'Integração atualizada com sucesso.');
    }

    public function destroy(int $id)
    {
        $user = Auth::user();

        $integration = Integration::where('company_id', $user->company_id)->find($id);

        if (!$integration) {
            abort(404, 'Integração não encontrada.');
        }

        $integration->update(['status' => 'inactive']);

        return redirect()->route('dashboard.integrations.index')
            ->with('success', 'Integração desativada com sucesso.');
    }

    public function toggle(int $id)
    {
        $user = Auth::user();

        $integration = Integration::where('company_id', $user->company_id)->find($id);

        if (!$integration) {
            abort(404, 'Integração não encontrada.');
        }

        $integration->update(['status' => $integration->status === 'active' ? 'inactive' : 'active']);

        return redirect()->route('dashboard.integrations.index')
            ->with('success', 'Status da integração atualizado.');
    }

    public function regenerateKey(int $id)
    {
        $user = Auth::user();

        $integration = Integration::where('company_id', $user->company_id)->find($id);

        if (!$integration) {
            abort(404, 'Integração não encontrada.');
        }

        $newApiKey = 'ck_live_' . Str::random(32);
        
        $integration->update([
            'api_key_hash' => hash('sha256', $newApiKey),
            'api_key_prefix' => substr($newApiKey, 0, 8),
        ]);

        return redirect()->route('dashboard.integrations.show', $integration->id)
            ->with('success', 'Nova API Key gerada com sucesso!')
            ->with('new_api_key', $newApiKey);
    }
}
