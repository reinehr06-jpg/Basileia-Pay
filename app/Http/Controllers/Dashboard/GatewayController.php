<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Gateway;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class GatewayController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $companyId = $user->company_id;

        $gateways = Gateway::where('company_id', $companyId)
            ->orderBy('created_at', 'desc')
            ->get();

        return view('dashboard.gateways.index', compact('gateways'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:50|unique:gateways,slug',
            'is_default' => 'sometimes|boolean',
            'config' => 'sometimes|array',
            'config.api_key' => 'required_with:config|string',
            'config.api_secret' => 'sometimes|string',
            'config.sandbox' => 'sometimes|boolean',
            'config.webhook_url' => 'sometimes|url',
        ]);

        $user = Auth::user();

        $config = $request->input('config', []);

        if ($request->boolean('is_default')) {
            Gateway::where('company_id', $user->company_id)
                ->update(['is_default' => false]);
        }

        $gateway = Gateway::create([
            'company_id' => $user->company_id,
            'name' => $request->input('name'),
            'slug' => $request->input('slug'),
            'config' => $config,
            'is_default' => $request->boolean('is_default', false),
            'is_active' => true,
        ]);

        return redirect()->route('dashboard.gateways.show', $gateway->id)
            ->with('success', 'Gateway adicionado com sucesso.');
    }

    public function show(int $id)
    {
        $user = Auth::user();

        $gateway = Gateway::where('company_id', $user->company_id)
            ->find($id);

        if (!$gateway) {
            abort(404, 'Gateway não encontrado.');
        }

        $config = $gateway->config ?? [];

        if (isset($config['api_key'])) {
            $config['api_key'] = $this->maskValue($config['api_key']);
        }

        if (isset($config['api_secret'])) {
            $config['api_secret'] = $this->maskValue($config['api_secret']);
        }

        $gateway->config_masked = $config;

        return view('dashboard.gateways.show', compact('gateway'));
    }

    public function update(Request $request, int $id)
    {
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'is_default' => 'sometimes|boolean',
            'config' => 'sometimes|array',
            'is_active' => 'sometimes|boolean',
        ]);

        $user = Auth::user();

        $gateway = Gateway::where('company_id', $user->company_id)->find($id);

        if (!$gateway) {
            abort(404, 'Gateway não encontrado.');
        }

        if ($request->boolean('is_default')) {
            Gateway::where('company_id', $user->company_id)
                ->where('id', '!=', $id)
                ->update(['is_default' => false]);
        }

        $gateway->update($request->only(['name', 'config', 'is_default', 'is_active']));

        return redirect()->route('dashboard.gateways.show', $gateway->id)
            ->with('success', 'Gateway atualizado com sucesso.');
    }

    public function destroy(int $id)
    {
        $user = Auth::user();

        $gateway = Gateway::where('company_id', $user->company_id)->find($id);

        if (!$gateway) {
            abort(404, 'Gateway não encontrado.');
        }

        $gateway->update(['status' => 'inactive']);

        return redirect()->route('dashboard.gateways.index')
            ->with('success', 'Gateway desativado com sucesso.');
    }

    public function toggle(int $id)
    {
        $user = Auth::user();

        $gateway = Gateway::where('company_id', $user->company_id)->find($id);

        if (!$gateway) {
            abort(404, 'Gateway não encontrado.');
        }

        $gateway->update(['status' => $gateway->status === 'active' ? 'inactive' : 'active']);

        return redirect()->route('dashboard.gateways.index')
            ->with('success', 'Status do gateway atualizado.');
    }

    private function maskValue(string $value): string
    {
        if (strlen($value) <= 8) {
            return str_repeat('*', strlen($value));
        }

        return substr($value, 0, 4) . str_repeat('*', strlen($value) - 8) . substr($value, -4);
    }
}
