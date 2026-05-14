<?php

declare(strict_types=1);

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\CheckoutConfig;
use App\Models\CheckoutVersion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use App\Services\CheckoutAuditService;
use App\Services\CheckoutNotificationService;

class CheckoutConfigController extends Controller
{
    public function __construct(
        private CheckoutAuditService        $audit,
        private CheckoutNotificationService $notify,
    ) {}

    public function index(): JsonResponse
    {
        $this->authorize('viewAny', CheckoutConfig::class);

        return response()->json(
            CheckoutConfig::where('company_id', Auth::user()->company_id)
                ->orderByDesc('is_active')->orderByDesc('updated_at')
                ->get(['id','name','slug','is_active','description','updated_at','config'])
        );
    }

    public function show(int $id): JsonResponse
    {
        $config = CheckoutConfig::where('company_id', Auth::user()->company_id)->findOrFail($id);
        $this->authorize('view', $config);
        
        return response()->json($config);
    }

    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', CheckoutConfig::class);
        $data = $request->validate(['name'=>'required|string|max:255','config'=>'required|array','description'=>'nullable|string|max:1000']);

        $config = CheckoutConfig::create([
            'name'        => $data['name'],
            'slug'        => Str::slug($data['name']).'-'.Str::random(6),
            'description' => $data['description'] ?? null,
            'company_id'  => Auth::user()->company_id,
            'config'      => array_merge(CheckoutConfig::defaultConfig(), $data['config']),
            'is_active'   => false,
        ]);

        $this->audit->log($config, 'created', [], $config->config);

        if ($request->boolean('publish')) {
            $this->authorize('publish', $config);
            $config->publish();
            $this->audit->log($config, 'published');
            $this->notify->onPublished($config);
        }

        return response()->json($config, 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $config = CheckoutConfig::where('company_id', Auth::user()->company_id)->findOrFail($id);
        $this->authorize('update', $config);

        $data = $request->validate(['name'=>'sometimes|string|max:255','config'=>'sometimes|array','description'=>'nullable|string|max:1000']);
        $before = $config->config;

        if (isset($data['name']))        $config->name        = $data['name'];
        if (isset($data['description'])) $config->description = $data['description'];

        // Salvar snapshot de versão antes de aplicar novas alterações
        if (isset($data['config'])) {
            CheckoutVersion::create([
                'checkout_config_id' => $config->id,
                'snapshot'           => $config->config,
                'created_by'         => Auth::user()->name,
            ]);
            $config->config = array_merge(CheckoutConfig::defaultConfig(), $data['config']);
        }

        $config->save();
        $this->audit->log($config, 'updated', $before, $config->config);

        if ($request->boolean('publish')) {
            $this->authorize('publish', $config);
            $config->publish();
            $this->audit->log($config, 'published');
            $this->notify->onPublished($config);
        }

        return response()->json($config);
    }

    public function destroy(int $id): JsonResponse
    {
        $config = CheckoutConfig::where('company_id', Auth::user()->company_id)->findOrFail($id);
        $this->authorize('delete', $config);
        
        $this->audit->log($config, 'deleted');
        $config->delete();
        
        return response()->json(['ok' => true]);
    }

    public function publish(int $id): JsonResponse
    {
        $config = CheckoutConfig::where('company_id', Auth::user()->company_id)->findOrFail($id);
        $this->authorize('publish', $config);

        $config->publish();
        $this->audit->log($config, 'published');
        $this->notify->onPublished($config);
        
        Log::info('CheckoutConfig.published', ['config_id'=>$config->id,'company_id'=>$config->company_id,'user_id'=>Auth::id()]);
        return response()->json(['ok' => true, 'config' => $config]);
    }

    public function upload(Request $request): JsonResponse
    {
        $this->authorize('create', CheckoutConfig::class);
        $request->validate(['file'=>'required|image|mimes:jpeg,png,gif,svg,webp|max:2048']);
        $path = $request->file('file')->store('checkout-assets/'.Auth::user()->company_id, 'public');
        return response()->json(['url' => Storage::url($path), 'path' => $path]);
    }

    /** POST /api/dashboard/checkout-configs/{id}/test-link */
    public function generateTestLink(int $id): JsonResponse
    {
        $config = CheckoutConfig::where('company_id', Auth::user()->company_id)->findOrFail($id);
        $this->authorize('update', $config);

        $token     = Str::random(32);
        $expiresAt = now()->addHours(24);

        // Armazena no cache por 24h — sem nova tabela necessária
        Cache::put("test_link_{$token}", [
            'config_id'  => $config->id,
            'config'     => $config->config,
            'expires_at' => $expiresAt->toISOString(),
        ], $expiresAt);

        $url = config('app.frontend_url', config('app.url')) . '/checkout/preview/' . $token;

        $this->audit->log($config, 'test_link_generated');

        return response()->json(['url' => $url, 'token' => $token, 'expires_at' => $expiresAt]);
    }

    /** GET /api/checkout/test/{token} — público */
    public function showTestLink(string $token): JsonResponse
    {
        $data = Cache::get("test_link_{$token}");
        if (!$data) {
            return response()->json(['message' => 'Link expirado ou inválido'], 410);
        }
        return response()->json($data);
    }
}
