<?php

namespace App\Http\Controllers\Api\V1\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\WebhookEndpoint;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;

class WebhookEndpointController extends Controller
{
    /**
     * Listar todos os endpoints da empresa.
     */
    public function index(Request $request): JsonResponse
    {
        $endpoints = WebhookEndpoint::where('company_id', $request->user()->company_id)
            ->with('system')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $endpoints
        ]);
    }

    /**
     * Criar um novo endpoint.
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'url'       => ['required', 'url', function ($attribute, $value, $fail) {
                if (!$this->isUrlSafeForWebhook($value)) {
                    $fail('A URL informada é inválida ou aponta para um endereço restrito.');
                }
            }],
            'system_id' => 'required|exists:connected_systems,id',
            'events'    => 'required|array',
            'status'    => 'required|in:active,inactive',
        ]);

        $secret = 'whsec_' . Str::random(32);

        $endpoint = WebhookEndpoint::create([
            'uuid'        => (string) Str::uuid(),
            'company_id'  => $request->user()->company_id,
            'system_id'   => $data['system_id'],
            'url'         => $data['url'],
            'secret_hash' => Hash::make($secret),
            'events'      => $data['events'],
            'status'      => $data['status'],
        ]);

        return response()->json([
            'success' => true,
            'data'    => $endpoint,
            'secret'  => $secret // Retornar apenas uma vez na criação
        ], 201);
    }

    /**
     * Mostrar detalhes de um endpoint.
     */
    public function show(string $uuid, Request $request): JsonResponse
    {
        $endpoint = WebhookEndpoint::where('company_id', $request->user()->company_id)
            ->where('uuid', $uuid)
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data'    => $endpoint
        ]);
    }

    /**
     * Atualizar um endpoint.
     */
    public function update(string $uuid, Request $request): JsonResponse
    {
        $endpoint = WebhookEndpoint::where('company_id', $request->user()->company_id)
            ->where('uuid', $uuid)
            ->firstOrFail();

        $data = $request->validate([
            'url'    => ['sometimes', 'url', function ($attribute, $value, $fail) {
                if (!$this->isUrlSafeForWebhook($value)) {
                    $fail('A URL informada é inválida ou aponta para um endereço restrito.');
                }
            }],
            'events' => 'sometimes|array',
            'status' => 'sometimes|in:active,inactive',
        ]);

        $endpoint->update($data);

        return response()->json([
            'success' => true,
            'data'    => $endpoint
        ]);
    }

    /**
     * Remover um endpoint.
     */
    public function destroy(string $uuid, Request $request): JsonResponse
    {
        $endpoint = WebhookEndpoint::where('company_id', $request->user()->company_id)
            ->where('uuid', $uuid)
            ->firstOrFail();

        $endpoint->delete();

        return response()->json(['success' => true]);
    }

    /**
     * Rotacionar o segredo do webhook.
     */
    public function rotateSecret(string $uuid, Request $request): JsonResponse
    {
        $endpoint = WebhookEndpoint::where('company_id', $request->user()->company_id)
            ->where('uuid', $uuid)
            ->firstOrFail();

        $secret = 'whsec_' . Str::random(32);
        $endpoint->update(['secret_hash' => Hash::make($secret)]);

        return response()->json([
            'success' => true,
            'secret'  => $secret
        ]);
    }

    /**
     * F16: Proteção contra SSRF. Verifica se a URL resolve para um IP seguro.
     */
    private function isUrlSafeForWebhook(string $url): bool
    {
        $parsed = parse_url($url);
        $host = $parsed['host'] ?? null;
        
        if (!$host) return false;
        
        if (in_array(strtolower($parsed['scheme'] ?? ''), ['http', 'https']) === false) {
            return false;
        }

        $ip = gethostbyname($host);
        if ($ip === $host) {
            // DNS resolution failed or it's an IP already
            // Ensure it's a valid IP
            if (!filter_var($ip, FILTER_VALIDATE_IP)) return false;
        }

        // Bloquear redes privadas, loopback, link-local, multicast
        return filter_var(
            $ip, 
            FILTER_VALIDATE_IP, 
            FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE
        ) !== false;
    }
}
