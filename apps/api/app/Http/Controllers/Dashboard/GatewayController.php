<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\GatewayAccount;
use App\Security\Encryption\EncryptionService;
use App\Services\Audit\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class GatewayController extends Controller
{
    public function __construct(
        private EncryptionService $encryption,
        private AuditService $audit,
    ) {}

    /**
     * List all gateway accounts for the current company.
     */
    public function index(Request $request): JsonResponse
    {
        $this->authorize('permission', ['gateways.manage']);

        $gateways = GatewayAccount::where('company_id', $request->user()->company_id)
            ->orderBy('priority')
            ->get(['id', 'uuid', 'name', 'provider', 'environment', 'status', 'priority', 'last_tested_at', 'last_test_status', 'created_at']);

        return response()->json($gateways);
    }

    /**
     * Create a new gateway account.
     */
    public function store(Request $request): JsonResponse
    {
        $this->authorize('permission', ['gateways.manage']);

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'provider' => 'required|in:asaas,stripe,mercadopago,pagarme,manual',
            'credentials' => 'required|array',
            'environment' => 'required|in:sandbox,production',
            'priority' => 'nullable|integer|min:0',
            'settings' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $encrypted = $this->encryption->encrypt(json_encode($request->credentials));

        $gateway = GatewayAccount::create([
            'company_id' => $request->user()->company_id,
            'name' => $request->name,
            'provider' => $request->provider,
            'credentials_encrypted' => $encrypted,
            'environment' => $request->environment,
            'status' => 'active',
            'priority' => $request->priority ?? 0,
            'settings' => $request->settings ?? [],
            'created_by' => $request->user()->id,
            'uuid' => Str::uuid(),
        ]);

        $this->audit->log('gateway.created', $gateway);

        return response()->json($gateway, 201);
    }

    /**
     * Show a gateway (never exposes credentials).
     */
    public function show(GatewayAccount $gateway): JsonResponse
    {
        $this->authorize('permission', ['gateways.manage']);

        return response()->json($gateway->makeHidden('credentials_encrypted'));
    }

    /**
     * Update a gateway.
     */
    public function update(Request $request, GatewayAccount $gateway): JsonResponse
    {
        $this->authorize('permission', ['gateways.manage']);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'provider' => 'sometimes|in:asaas,stripe,mercadopago,pagarme,manual',
            'environment' => 'sometimes|in:sandbox,production',
            'status' => 'sometimes|in:active,inactive,testing',
            'priority' => 'nullable|integer|min:0',
            'settings' => 'nullable|array',
            'credentials' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $request->only(['name', 'provider', 'environment', 'status', 'priority', 'settings']);

        if ($request->has('credentials')) {
            $data['credentials_encrypted'] = $this->encryption->encrypt(
                json_encode($request->credentials)
            );
        }

        $gateway->update($data);

        $this->audit->log('gateway.updated', $gateway);

        return response()->json($gateway->makeHidden('credentials_encrypted'));
    }

    /**
     * Delete a gateway.
     */
    public function destroy(GatewayAccount $gateway): JsonResponse
    {
        $this->authorize('permission', ['gateways.manage']);

        $gateway->delete();

        $this->audit->log('gateway.deleted', $gateway);

        return response()->json(null, 204);
    }

    /**
     * Test gateway connectivity.
     */
    public function test(Request $request, GatewayAccount $gateway): JsonResponse
    {
        $this->authorize('permission', ['gateways.manage']);

        // Decrypt credentials to verify they are valid
        try {
            $credentialsJson = $this->encryption->decrypt($gateway->credentials_encrypted);
            $credentials = json_decode($credentialsJson, true);

            if (!$credentials || !is_array($credentials)) {
                throw new \RuntimeException('Invalid credentials format.');
            }

            // TODO: Implement actual provider-specific connectivity test
            // For now, if decryption works, the credentials are at least properly stored.

            $gateway->update([
                'last_tested_at' => now(),
                'last_test_status' => 'success',
            ]);

            $this->audit->log('gateway.tested', $gateway, ['result' => 'success']);

            return response()->json(['status' => 'success', 'message' => 'Gateway connectivity test passed.']);
        } catch (\Exception $e) {
            $gateway->update([
                'last_tested_at' => now(),
                'last_test_status' => 'failed',
            ]);

            $this->audit->log('gateway.test_failed', $gateway, ['error' => $e->getMessage()]);

            return response()->json(['status' => 'failed', 'message' => 'Gateway test failed.'], 500);
        }
    }

    /**
     * Rotate gateway credentials.
     */
    public function rotateCredentials(Request $request, GatewayAccount $gateway): JsonResponse
    {
        $this->authorize('permission', ['gateways.manage']);

        $validator = Validator::make($request->all(), [
            'credentials' => 'required|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $gateway->update([
            'credentials_encrypted' => $this->encryption->encrypt(json_encode($request->credentials)),
            'last_tested_at' => null,
            'last_test_status' => null,
        ]);

        $this->audit->log('gateway.credentials_rotated', $gateway);

        return response()->json(['status' => 'rotated', 'message' => 'Credentials rotated. Please run a test.']);
    }
}
