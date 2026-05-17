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
            'url'       => 'required|url',
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
            'url'    => 'sometimes|url',
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
}
