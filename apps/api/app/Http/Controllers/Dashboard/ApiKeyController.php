<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\ApiKey;
use App\Security\ApiKey\ApiKeyGenerator;
use App\Services\Audit\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class ApiKeyController extends Controller
{
    public function __construct(
        private ApiKeyGenerator $keyGenerator,
        private AuditService $audit,
    ) {}

    /**
     * List API keys for a system.
     * Never exposes key_hash.
     */
    public function index(Request $request, $systemId): JsonResponse
    {
        $this->authorize('permission', ['api_keys.manage']);

        $keys = ApiKey::where('connected_system_id', $systemId)
            ->orderBy('created_at', 'desc')
            ->get([
                'id', 'uuid', 'name', 'key_prefix', 'scopes',
                'environment', 'last_used_at', 'expires_at',
                'revoked_at', 'created_at',
            ]);

        return response()->json($keys);
    }

    /**
     * Create a new API key for a system.
     * The full key is returned ONLY in this response — never again.
     */
    public function store(Request $request, $systemId): JsonResponse
    {
        $this->authorize('permission', ['api_keys.manage']);

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'environment' => 'required|in:sandbox,production',
            'scopes' => 'nullable|array',
            'expires_at' => 'nullable|date|after:now',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $keyData = $this->keyGenerator->generate($request->environment);

        $apiKey = ApiKey::create([
            'connected_system_id' => $systemId,
            'company_id' => $request->user()->company_id,
            'name' => $request->name,
            'key_prefix' => $keyData['key_prefix'],
            'key_hash' => $keyData['key_hash'],
            'scopes' => $request->scopes ?? [],
            'environment' => $request->environment,
            'expires_at' => $request->expires_at,
            'created_by' => $request->user()->id,
            'uuid' => Str::uuid(),
        ]);

        $this->audit->log('api_key.created', $apiKey, [
            'key_prefix' => $keyData['key_prefix'],
            'system_id' => $systemId,
        ]);

        // ⚠️ O full_key só é retornado UMA VEZ — nunca mais
        return response()->json([
            'full_key' => $keyData['full_key'],
            'key_prefix' => $keyData['key_prefix'],
            'api_key' => $apiKey->makeHidden(['key_hash']),
            'warning' => 'Esta é a ÚNICA vez que a chave completa será exibida. Salve-a em local seguro.',
        ], 201);
    }

    /**
     * Revoke an API key (soft-delete via revoked_at).
     */
    public function destroy(Request $request, $systemId, $keyId): JsonResponse
    {
        $this->authorize('permission', ['api_keys.manage']);

        $apiKey = ApiKey::where('connected_system_id', $systemId)->findOrFail($keyId);

        if ($apiKey->revoked_at) {
            return response()->json(['error' => 'already_revoked', 'message' => 'Chave já revogada.'], 409);
        }

        $apiKey->update([
            'revoked_at' => now(),
            'revoked_by' => $request->user()->id,
        ]);

        $this->audit->log('api_key.revoked', $apiKey, [
            'key_prefix' => $apiKey->key_prefix,
        ]);

        return response()->json(['message' => 'Chave revogada.']);
    }
}
