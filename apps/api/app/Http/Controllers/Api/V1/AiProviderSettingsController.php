<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AiProvider;
use App\Security\Encryption\EncryptionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AiProviderSettingsController extends Controller
{
    public function __construct(private EncryptionService $encryption) {}

    public function index(): JsonResponse
    {
        $providers = AiProvider::where('company_id', Auth::user()->company_id)
            ->orWhere('available_to_clients', true)
            ->get();
            
        return response()->json($providers);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->all();
        
        if (isset($data['api_key'])) {
            $data['api_key_encrypted'] = $this->encryption->encrypt($data['api_key']);
            unset($data['api_key']);
        }

        $data['company_id'] = Auth::user()->company_id;

        $provider = AiProvider::create($data);

        return response()->json($provider, 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $provider = AiProvider::where('company_id', Auth::user()->company_id)
            ->where('id', $id)
            ->firstOrFail();

        $data = $request->all();

        if (isset($data['api_key'])) {
            $data['api_key_encrypted'] = $this->encryption->encrypt($data['api_key']);
            unset($data['api_key']);
        }

        $provider->update($data);

        return response()->json($provider);
    }

    public function destroy(string $id): JsonResponse
    {
        $provider = AiProvider::where('company_id', Auth::user()->company_id)
            ->where('id', $id)
            ->firstOrFail();

        if ($provider->is_default) {
            return response()->json(['error' => 'Não é possível remover o provedor padrão.'], 422);
        }

        $provider->delete();

        return response()->json(['status' => 'removed']);
    }
}
