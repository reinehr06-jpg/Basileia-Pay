<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Gateway;
use GuzzleHttp\Client;
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
                ->with('error', 'Erro ao salvar: '.$e->getMessage());
        }
    }

    public function show(int $id)
    {
        $user = Auth::user();

        $gateway = Gateway::where('company_id', $user->company_id)
            ->find($id);

        if (! $gateway) {
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

        if (! $gateway) {
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

        if (! $gateway) {
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

        if (! $gateway) {
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

        if (! $gateway) {
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

        return substr($value, 0, 4).str_repeat('*', strlen($value) - 8).substr($value, -4);
    }

    public function test(Request $request, int $id)
    {
        $user = Auth::user();
        $gateway = Gateway::where('company_id', $user->company_id)->find($id);

        if (! $gateway) {
            return response()->json(['success' => false, 'message' => 'Gateway não encontrado.']);
        }

        $apiKey = $gateway->getConfig('api_key');

        if (! $apiKey) {
            return response()->json(['success' => false, 'message' => 'API Key não configurada.']);
        }

        $results = [];
        $allPassed = true;

        try {
            $client = new Client;
            $sandboxConfig = $gateway->getConfig('sandbox');
            $environment = $sandboxConfig !== null
                ? (! $sandboxConfig ? 'production' : 'sandbox')
                : config('services.asaas.environment', env('APP_ENV', 'sandbox'));

            $baseUrl = $environment === 'sandbox'
                ? 'https://sandbox.asaas.com/api/v3'
                : 'https://api.asaas.com/api/v3';

            $headers = [
                'access_token' => $apiKey,
                'Content-Type' => 'application/json',
            ];

            // Teste 1: Validar API Key - Usando endpoint de conta
            try {
                $response = $client->get($baseUrl.'/accounts/me', ['headers' => $headers]);
                $data = json_decode($response->getBody()->getContents(), true);
                $results[] = [
                    'test' => 'API Key',
                    'status' => 'passed',
                    'message' => 'API Key válida',
                    'data' => $data['email'] ?? ($data['businessEmail'] ?? 'N/A'),
                ];
            } catch (\Exception $e) {
                // Tentar endpoint alternativo
                try {
                    $response = $client->get($baseUrl.'/my-account', ['headers' => $headers]);
                    $results[] = ['test' => 'API Key', 'status' => 'passed', 'message' => 'API Key válida (endpoint alternativo)'];
                } catch (\Exception $e2) {
                    $results[] = ['test' => 'API Key', 'status' => 'failed', 'message' => 'API Key inválida ou endpoint não encontrado'];
                    $allPassed = false;
                }
            }

            // Teste 2: Listar clientes
            try {
                $response = $client->get($baseUrl.'/customers?limit=1', ['headers' => $headers]);
                $results[] = ['test' => 'Listar Clientes', 'status' => 'passed', 'message' => 'Consulta OK'];
            } catch (\Exception $e) {
                $results[] = ['test' => 'Listar Clientes', 'status' => 'failed', 'message' => 'Erro: '.substr($e->getMessage(), 0, 50)];
                $allPassed = false;
            }

            // Teste 3: Criar cobrança teste (R$ 0,01)
            try {
                $paymentData = [
                    'customer' => 'cus_test',
                    'billingType' => 'PIX',
                    'value' => 0.01,
                    'dueDate' => date('Y-m-d', strtotime('+1 day')),
                    'description' => 'Teste de conexão - Checkout Basileia',
                ];
                $response = $client->post($baseUrl.'/payments', [
                    'headers' => $headers,
                    'json' => $paymentData,
                ]);
                $paymentDataResult = json_decode($response->getBody()->getContents(), true);
                $paymentId = $paymentDataResult['id'] ?? null;

                $results[] = ['test' => 'Criar Cobrança', 'status' => 'passed', 'message' => 'Cobrança criada: '.$paymentId];

                // Teste 4: Deletar cobrança teste
                if ($paymentId) {
                    try {
                        $client->delete($baseUrl.'/payments/'.$paymentId, ['headers' => $headers]);
                        $results[] = ['test' => 'Excluir Cobrança', 'status' => 'passed', 'message' => 'Cobrança teste removida'];
                    } catch (\Exception $e) {
                        $results[] = ['test' => 'Excluir Cobrança', 'status' => 'warning', 'message' => 'Não foi possível remover'];
                    }
                }
            } catch (\Exception $e) {
                $results[] = ['test' => 'Criar Cobrança', 'status' => 'failed', 'message' => substr($e->getMessage(), 0, 80)];
                $allPassed = false;
            }

            // Teste 5: Listar formas de pagamento
            try {
                $response = $client->get($baseUrl.'/payments', ['headers' => $headers]);
                $results[] = ['test' => 'Listar Cobranças', 'status' => 'passed', 'message' => 'Consulta OK'];
            } catch (\Exception $e) {
                $results[] = ['test' => 'Listar Cobranças', 'status' => 'failed', 'message' => 'Erro'];
                $allPassed = false;
            }

            // Teste 6: Webhook - Listar webhooks configurados
            try {
                $response = $client->get($baseUrl.'/webhooks', ['headers' => $headers]);
                $webhookData = json_decode($response->getBody()->getContents(), true);
                $webhookUrl = url('/api/webhooks/'.$gateway->slug);

                $webhookConfigured = false;
                foreach ($webhookData['data'] ?? [] as $wh) {
                    if (isset($wh['url']) && str_contains($wh['url'], $webhookUrl)) {
                        $webhookConfigured = true;
                        break;
                    }
                }

                $results[] = ['test' => 'Webhook', 'status' => $webhookConfigured ? 'passed' : 'warning', 'message' => $webhookConfigured ? 'Webhook configurado' : 'Webhook não encontrado - Configure: '.$webhookUrl];
            } catch (\Exception $e) {
                $results[] = ['test' => 'Webhook', 'status' => 'warning', 'message' => 'Não foi possível verificar'];
            }

            // Teste 7: Criar Assinatura (Subscriptions)
            try {
                $subData = [
                    'customer' => 'cus_test',
                    'installmentCount' => 1,
                    'installmentValue' => 0.01,
                    'billingType' => 'PIX',
                    'nextDueDate' => date('Y-m-d', strtotime('+1 day')),
                    'description' => 'Teste assinatura',
                ];
                $response = $client->post($baseUrl.'/subscriptions', [
                    'headers' => $headers,
                    'json' => $subData,
                ]);
                $results[] = ['test' => 'Assinaturas', 'status' => 'passed', 'message' => 'API de assinaturas OK'];
            } catch (\Exception $e) {
                $results[] = ['test' => 'Assinaturas', 'status' => 'warning', 'message' => 'API de assinaturas pode requerer plano'];
            }

            // Teste 8: Transferências (se disponível)
            try {
                $response = $client->get($baseUrl.'/transfers?limit=1', ['headers' => $headers]);
                $results[] = ['test' => 'Transferências', 'status' => 'passed', 'message' => 'API de transferências OK'];
            } catch (\Exception $e) {
                $results[] = ['test' => 'Transferências', 'status' => 'warning', 'message' => 'API não disponível para este plano'];
            }

            return response()->json([
                'success' => $allPassed,
                'message' => $allPassed ? 'Todos os testes passaram!' : 'Alguns testes falharam',
                'results' => $results,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro geral: '.$e->getMessage(),
                'results' => $results,
            ]);
        }
    }
}
