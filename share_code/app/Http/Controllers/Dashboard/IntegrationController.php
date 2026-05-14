<?php

declare(strict_types=1);

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Integration;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

/**
 * [BUG-04] Company::first() sem filtro de empresa removido.
 *          Superadmin sem empresa vinculada é redirecionado para seleção explícita.
 */
class IntegrationController extends Controller
{
    public function index(): mixed
    {
        $user      = Auth::user();
        $companyId = $user->company_id;

        // [BUG-04] NUNCA usa Company::first() como fallback
        // Superadmin sem empresa → redireciona para seleção
        if (empty($companyId)) {
            return redirect()->route('dashboard.companies.index')
                ->with('warning', 'Selecione ou crie uma empresa antes de gerenciar integrações.');
        }

        $integrations = Integration::where('company_id', $companyId)
            ->withCount('transactions')
            ->get();

        $template = Integration::where('company_id', $companyId)->latest()->first();

        return view('dashboard.integrations.index', compact('integrations', 'template'));
    }

    public function store(Request $request): mixed
    {
        $request->validate([
            'name'           => 'required|string|max:255',
            'base_url'       => 'nullable|url',
            'webhook_url'    => 'nullable|url',
            'webhook_secret' => 'nullable|string|max:255',
        ]);

        $user = Auth::user();

        // Guarda segurança extra
        if (empty($user->company_id)) {
            return redirect()->route('dashboard.companies.index')
                ->with('warning', 'Selecione uma empresa antes de criar uma integração.');
        }

        $apiKey = 'cklive.' . Str::random(32);

        $integration = Integration::create([
            'company_id'     => $user->company_id,
            'name'           => $request->input('name'),
            'slug'           => Str::slug($request->input('name')),
            'base_url'       => $request->input('base_url', 'https://vendas.basileia.global'),
            'webhook_url'    => $request->input('webhook_url'),
            'webhook_secret' => $request->input('webhook_secret')
                ? trim($request->input('webhook_secret'))
                : null,
            'api_key_hash'   => hash('sha256', $apiKey),
            'api_key_prefix' => substr($apiKey, 0, 16),
            'permissions'    => 'all',
            'status'         => 'active',
        ]);

        return redirect()
            ->route('dashboard.integrations.show', $integration->id)
            ->with('success', 'Integração criada com sucesso. API Key: ' . $apiKey);
    }

    public function show(int $id): mixed
    {
        $user        = Auth::user();
        $integration = Integration::where('company_id', $user->company_id)
            ->with('webhookEndpoints')
            ->withCount('transactions')
            ->find($id);

        if (! $integration) {
            abort(404, 'Integração não encontrada.');
        }

        $integration->api_key_prefix_display = $integration->api_key_prefix . '...';

        return view('dashboard.integrations.show', compact('integration'));
    }

    public function update(Request $request, int $id): mixed
    {
        $request->validate([
            'name'           => 'sometimes|string|max:255',
            'description'    => 'sometimes|string|max:500',
            'base_url'       => 'sometimes|url',
            'webhook_url'    => 'sometimes|url',
            'webhook_events' => 'sometimes|array',
        ]);

        $user        = Auth::user();
        $integration = Integration::where('company_id', $user->company_id)->find($id);

        if (! $integration) {
            abort(404, 'Integração não encontrada.');
        }

        $integration->update(array_merge(
            $request->only(['name', 'description', 'base_url', 'webhook_url']),
            $request->has('webhook_secret')
                ? ['webhook_secret' => trim($request->input('webhook_secret'))]
                : []
        ));

        return redirect()
            ->route('dashboard.integrations.show', $integration->id)
            ->with('success', 'Integração atualizada com sucesso.');
    }

    public function destroy(int $id): mixed
    {
        $user        = Auth::user();
        $integration = Integration::where('company_id', $user->company_id)->find($id);

        if (! $integration) {
            abort(404, 'Integração não encontrada.');
        }

        $integration->update(['status' => 'inactive']);

        return redirect()
            ->route('dashboard.integrations.index')
            ->with('success', 'Integração desativada com sucesso.');
    }

    public function toggle(int $id): mixed
    {
        $user        = Auth::user();
        $integration = Integration::where('company_id', $user->company_id)->find($id);

        if (! $integration) {
            abort(404, 'Integração não encontrada.');
        }

        $integration->update([
            'status' => $integration->status === 'active' ? 'inactive' : 'active',
        ]);

        return redirect()
            ->route('dashboard.integrations.index')
            ->with('success', 'Status da integração atualizado.');
    }

    public function regenerateKey(int $id): mixed
    {
        $user        = Auth::user();
        $integration = Integration::where('company_id', $user->company_id)->find($id);

        if (! $integration) {
            abort(404, 'Integração não encontrada.');
        }

        $newApiKey = 'cklive.' . Str::random(32);

        $integration->update([
            'api_key_hash'   => hash('sha256', $newApiKey),
            'api_key_prefix' => substr($newApiKey, 0, 16),
        ]);

        return redirect()
            ->route('dashboard.integrations.show', $integration->id)
            ->with('success', 'Nova API Key gerada com sucesso!')
            ->with('new_api_key', $newApiKey);
    }
}
