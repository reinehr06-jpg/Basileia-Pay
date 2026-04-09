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

    public function create()
    {
        return view('dashboard.gateways.create');
    }

    public function store(Request $request)
    {
        try {
            $request->validate([
                'name' => 'required|string|max:255',
                'slug' => 'required|string|max:50|unique:gateways,slug',
                'is_default' => 'sometimes|boolean',
                'config' => 'sometimes|array',
                'config.api_key' => 'required|string',
                'config.api_secret' => 'nullable|string',
                'config.sandbox' => 'nullable|boolean',
                'config.webhook_url' => 'nullable|url',
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
                'type' => $request->input('slug'),
                'status' => 'active',
                'is_default' => $request->boolean('is_default', false),
            ]);

            if ($request->filled('config')) {
                $configData = $request->input('config', []);
                foreach ($configData as $key => $value) {
                    if ($value !== null && $value !== '') {
                        $gateway->setConfig($key, $value);
                    }
                }
            }

            return redirect()->route('dashboard.gateways.index')
                ->with('success', 'Gateway adicionado com sucesso.');
        } catch (\Exception $e) {
            return redirect()->back()
                ->withInput()
                ->with('error', 'Erro ao salvar: ' . $e->getMessage());
        }
    }

    public function show(int $id)
    {
        $user = Auth::user();

        $gateway = Gateway::where('company_id', $user->company_id)
            ->find($id);

        if (!$gateway) {
            abort(404, 'Gateway não encontrado.');
        }

        $config = [];
        foreach ($gateway->configs as $configModel) {
            $value = $configModel->decrypted_value;
            if (in_array($configModel->key, ['api_key', 'api_secret', 'webhook_token', 'token'])) {
                $value = $this->maskValue($value);
            }
            $config[$configModel->key] = $value;
        }

        $gateway->config_masked = $config;

        return view('dashboard.gateways.show', compact('gateway'));
    }

    public function edit(int $id)
    {
        $user = Auth::user();
        $gateway = Gateway::where('company_id', $user->company_id)->find($id);

        if (!$gateway) {
            abort(404, 'Gateway não encontrado.');
        }

        return view('dashboard.gateways.edit', compact('gateway'));
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

        $gateway->update($request->only(['name', 'is_default']));

        if ($request->has('config')) {
            foreach ($request->input('config') as $key => $value) {
                if ($value !== null && $value !== '') {
                    $gateway->setConfig($key, $value);
                }
            }
        }

        return redirect()->route('dashboard.gateways.index')
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

    public function test(Request $request, int $id)
    {
        $user = Auth::user();
        $gateway = Gateway::where('company_id', $user->company_id)->find($id);

        if (!$gateway) {
            return response()->json(['success' => false, 'message' => 'Gateway não encontrado.']);
        }

        $apiKey = $gateway->getConfig('api_key');
        
        if (!$apiKey) {
            return response()->json(['success' => false, 'message' => 'API Key não configurada.']);
        }

        try {
            $client = new \GuzzleHttp\Client();
            $baseUrl = $gateway->getConfig('sandbox') 
                ? 'https://sandbox.asaas.com/api/v3' 
                : 'https://api.asaas.com/api/v3';

            $response = $client->get($baseUrl . '/users/me', [
                'headers' => [
                    'access_token' => $apiKey,
                    'Content-Type' => 'application/json',
                ],
            ]);

            $data = json_decode($response->getBody()->getContents(), true);

            return response()->json([
                'success' => true,
                'message' => 'Conexão com ASAAS realizada com sucesso!',
                'data' => [
                    'email' => $data['email'] ?? 'N/A',
                    'accountId' => $data['accountId'] ?? 'N/A',
                ]
            ]);
        } catch (\GuzzleHttp\Exception\RequestException $e) {
            $statusCode = $e->getResponse()?->getStatusCode() ?? 0;
            $message = $e->getMessage();
            
            if ($statusCode === 401) {
                return response()->json(['success' => false, 'message' => 'API Key inválida ou expirada.']);
            }
            if ($statusCode === 0) {
                return response()->json(['success' => false, 'message' => 'Não foi possível conectar ao ASAAS. Verifique a API Key.']);
            }
            
            return response()->json(['success' => false, 'message' => "Erro ($statusCode): " . substr($message, 0, 100)]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Erro: ' . $e->getMessage()]);
        }
    }
}
