# 💻 Código Completo — Lab Editor de Checkout (Fases 1 e 2)
Este arquivo contém todo o código 100% revisado do backend Laravel e do frontend Next.js (App Router) do editor visual de checkout.

# 1. Backend Laravel

***

## 📁 `routes/api.php`

```php
<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\TransactionController;
use App\Http\Controllers\Api\V1\PaymentController;
use App\Http\Controllers\Api\V1\CustomerController;
use App\Http\Controllers\Api\V1\SubscriptionController;
use App\Http\Controllers\Api\V1\ReportController;
use App\Http\Controllers\Api\V1\CheckoutWebhookController;
use App\Http\Controllers\Api\V1\WebhookController;
use App\Http\Controllers\AsaasWebhookController;
use App\Http\Controllers\Dashboard\CheckoutConfigController;
use App\Http\Controllers\Dashboard\CheckoutVersionController;
use App\Http\Controllers\Dashboard\CheckoutAbTestController;

// ─── Lab / Checkout Editor (API REST para o frontend Next.js) ───
Route::middleware(['auth:sanctum'])->prefix('dashboard')->group(function () {
    // Checkout configs CRUD
    Route::get   ('checkout-configs',              [CheckoutConfigController::class, 'index']);
    Route::get   ('checkout-configs/{id}',         [CheckoutConfigController::class, 'show']);
    Route::post  ('checkout-configs',              [CheckoutConfigController::class, 'store']);
    Route::put   ('checkout-configs/{id}',         [CheckoutConfigController::class, 'update']);
    Route::delete('checkout-configs/{id}',         [CheckoutConfigController::class, 'destroy']);
    Route::post  ('checkout-configs/{id}/publish', [CheckoutConfigController::class, 'publish']);
    Route::post  ('upload',                        [CheckoutConfigController::class, 'upload']);

    // Histórico de versões
    Route::get ('checkout-configs/{id}/versions',                [CheckoutVersionController::class, 'index']);
    Route::post('checkout-configs/{id}/versions/{vid}/restore',  [CheckoutVersionController::class, 'restore']);

    // Link de teste temporário
    Route::post('checkout-configs/{id}/test-link',               [CheckoutConfigController::class, 'generateTestLink']);

    // A/B Test
    Route::get ('ab-test',              [CheckoutAbTestController::class, 'show']);
    Route::post('ab-test',              [CheckoutAbTestController::class, 'store']);
    Route::put ('ab-test',              [CheckoutAbTestController::class, 'update']);
    Route::post('ab-test/{id}/toggle',  [CheckoutAbTestController::class, 'toggle']);
});

// Rota pública para checkout de teste (sem auth)
Route::get('checkout/test/{token}', [CheckoutConfigController::class, 'showTestLink']);

Route::get('diag-check', function() {
    return response()->json([
        'status' => 'OK',
        'server' => 'CheckOut-Production',
        'version' => 'NUCLEAR_DIAG_999',
        'timestamp' => now()->toIso8601String(),
    ]);
});

// Webhook do Asaas (Rota pública oficial)
Route::post('webhooks/asaas', [AsaasWebhookController::class, 'handle'])->name('webhook.asaas');

Route::prefix('v1')->group(function () {
    // Ingestão de pagamentos do Vendas/Sistemas Externos
    Route::post('payments/receive', [\App\Http\Controllers\Api\PaymentApiController::class, 'receive']);

    // Auth
    Route::post('auth/login', [AuthController::class, 'login'])->middleware('throttle:5,1');
    Route::post('auth/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
    Route::post('auth/refresh', [AuthController::class, 'refresh'])->middleware('auth:sanctum');

    // Protected routes (via integration ck_live_... keys)
    Route::middleware('api.auth')->group(function () {
        // Transactions
        Route::apiResource('transactions', TransactionController::class);
        Route::post('transactions/{id}/cancel', [TransactionController::class, 'cancel']);
        Route::post('transactions/{id}/refund', [TransactionController::class, 'refund']);

        // Payments
        Route::post('payments/process', [PaymentController::class, 'process']);
        Route::get('payments/{id}/status', [PaymentController::class, 'status']);
        Route::get('payments/{id}/pix', [PaymentController::class, 'pix']);
        Route::get('payments/{id}/boleto', [PaymentController::class, 'boleto']);

        // Customers
        Route::apiResource('customers', CustomerController::class);

        // Subscriptions
        Route::apiResource('subscriptions', SubscriptionController::class);
        Route::post('subscriptions/{id}/pause', [SubscriptionController::class, 'pause']);
        Route::post('subscriptions/{id}/resume', [SubscriptionController::class, 'resume']);

        // Reports
        Route::get('reports/summary', [ReportController::class, 'summary']);
        Route::get('reports/transactions', [ReportController::class, 'transactions']);
    });
});

```

***

## 📁 `app/Models/CheckoutConfig.php`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CheckoutConfig extends Model
{
    protected $table = 'checkout_configs';

    protected $fillable = [
        'name',
        'slug',
        'company_id',
        'config',
        'is_active',
        'description',
    ];

    protected $casts = [
        'config' => 'array',
        'is_active' => 'boolean',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    // Get config value helper
    public function get(string $key, $default = null)
    {
        return $this->config[$key] ?? $default;
    }

    // Set config value helper
    public function set(string $key, $value): self
    {
        $config = $this->config ?? [];
        $config[$key] = $value;
        $this->config = $config;

        return $this;
    }

    // Save and activate
    public function publish(): self
    {
        // Deactivate all others for this company
        static::where('company_id', $this->company_id)
            ->where('id', '!=', $this->id)
            ->update(['is_active' => false]);

        $this->is_active = true;
        $this->save();

        // Clear cache
        cache()->forget('checkout_config_'.$this->company_id);

        return $this;
    }

    // Get active config for company
    public static function getActive(int $companyId): ?CheckoutConfig
    {
        return cache()->remember('checkout_config_'.$companyId, 3600, function () use ($companyId) {
            return static::where('company_id', $companyId)
                ->where('is_active', true)
                ->first();
        });
    }

    // Default config
    public static function defaultConfig(): array
    {
        return [
            // Cores
            'primary_color' => '#7c3aed',
            'secondary_color' => '#6366f1',
            'background_color' => '#ffffff',
            'background_gradient' => null,
            'text_color' => '#1e293b',
            'text_muted_color' => '#64748b',
            'border_color' => '#e2e8f0',
            'success_color' => '#10b981',
            'error_color' => '#ef4444',

            // Logo
            'logo_url' => null,
            'logo_width' => 120,
            'logo_position' => 'center', // left, center, right

            // Campos
            'show_name' => true,
            'show_email' => true,
            'show_phone' => true,
            'show_document' => true,
            'show_address' => false,
            'field_order' => ['name', 'email', 'phone', 'document'],

            // Métodos
            'methods' => [
                'pix' => true,
                'card' => true,
                'boleto' => false,
            ],
            'method_order' => ['pix', 'card'],

            // PIX
            'pix_copy_enabled' => true,
            'pix_key_type' => 'cpf', // cpf, email, phone, random
            'pix_key' => '',
            'pix_instructions' => '',

            // Cartão
            'card_installments' => 12,
            'card_discount' => 0,
            'card_min_installments' => 1,

            // Boleto
            'boleto_due_days' => 3,
            'boleto_instructions' => '',

            // Layout
            'container_width' => 480,
            'container_max_width' => 600,
            'padding' => 32,
            'border_radius' => 16,
            'shadow' => true,

            // Textos
            'title' => 'Finalize seu pagamento',
            'description' => '',
            'success_title' => 'Pagamento confirmado!',
            'success_message' => 'Obrigado pela sua confiança.',
            'button_text' => 'Pagar agora',

            // CSS Custom
            'custom_css' => '',

            // Extras
            'show_timer' => true,
            'timer_position' => 'top', // top, bottom
            'show_receipt_link' => true,
            'analytics_id' => '',
        ];
    }
}

```

***

## 📁 `app/Models/CheckoutVersion.php`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CheckoutVersion extends Model
{
    protected $fillable = [
        'checkout_config_id',
        'label',
        'snapshot',
        'created_by',
    ];

    protected $casts = [
        'snapshot' => 'array',
    ];

    public function config()
    {
        return $this->belongsTo(CheckoutConfig::class, 'checkout_config_id');
    }
}

```

***

## 📁 `app/Models/CheckoutAbTest.php`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CheckoutAbTest extends Model
{
    protected $table = 'checkout_ab_tests';

    protected $fillable = [
        'company_id',
        'config_a_id',
        'config_b_id',
        'split_percent',
        'is_active',
        'visits_a',
        'visits_b',
        'conversions_a',
        'conversions_b',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'split_percent' => 'integer',
        'visits_a' => 'integer',
        'visits_b' => 'integer',
        'conversions_a' => 'integer',
        'conversions_b' => 'integer',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function configA()
    {
        return $this->belongsTo(CheckoutConfig::class, 'config_a_id');
    }

    public function configB()
    {
        return $this->belongsTo(CheckoutConfig::class, 'config_b_id');
    }
}

```

***

## 📁 `database/migrations/2026_05_13_000001_create_checkout_versions_table.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('checkout_versions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('checkout_config_id')->constrained()->cascadeOnDelete();
            $table->string('label')->nullable();
            $table->json('snapshot');
            $table->string('created_by')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('checkout_versions');
    }
};

```

***

## 📁 `database/migrations/2026_05_13_000002_create_checkout_ab_tests_table.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('checkout_ab_tests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('config_a_id')->constrained('checkout_configs')->cascadeOnDelete();
            $table->foreignId('config_b_id')->constrained('checkout_configs')->cascadeOnDelete();
            $table->unsignedTinyInteger('split_percent')->default(50);
            $table->boolean('is_active')->default(false);
            $table->unsignedInteger('visits_a')->default(0);
            $table->unsignedInteger('visits_b')->default(0);
            $table->unsignedInteger('conversions_a')->default(0);
            $table->unsignedInteger('conversions_b')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('checkout_ab_tests');
    }
};

```

***

## 📁 `app/Http/Controllers/Dashboard/CheckoutConfigController.php`

```php
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

class CheckoutConfigController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            CheckoutConfig::where('company_id', Auth::user()->company_id)
                ->orderByDesc('is_active')->orderByDesc('updated_at')
                ->get(['id','name','slug','is_active','description','updated_at','config'])
        );
    }

    public function show(int $id): JsonResponse
    {
        return response()->json(
            CheckoutConfig::where('company_id', Auth::user()->company_id)->findOrFail($id)
        );
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate(['name'=>'required|string|max:255','config'=>'required|array','description'=>'nullable|string|max:1000']);

        $config = CheckoutConfig::create([
            'name'        => $data['name'],
            'slug'        => Str::slug($data['name']).'-'.Str::random(6),
            'description' => $data['description'] ?? null,
            'company_id'  => Auth::user()->company_id,
            'config'      => array_merge(CheckoutConfig::defaultConfig(), $data['config']),
            'is_active'   => false,
        ]);

        if ($request->boolean('publish')) $config->publish();

        return response()->json($config, 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $config = CheckoutConfig::where('company_id', Auth::user()->company_id)->findOrFail($id);
        $data = $request->validate(['name'=>'sometimes|string|max:255','config'=>'sometimes|array','description'=>'nullable|string|max:1000']);

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

        if ($request->boolean('publish')) $config->publish();

        return response()->json($config);
    }

    public function destroy(int $id): JsonResponse
    {
        CheckoutConfig::where('company_id', Auth::user()->company_id)->findOrFail($id)->delete();
        return response()->json(['ok' => true]);
    }

    public function publish(int $id): JsonResponse
    {
        $config = CheckoutConfig::where('company_id', Auth::user()->company_id)->findOrFail($id);
        $config->publish();
        Log::info('CheckoutConfig.published', ['config_id'=>$config->id,'company_id'=>$config->company_id,'user_id'=>Auth::id()]);
        return response()->json(['ok' => true, 'config' => $config]);
    }

    public function upload(Request $request): JsonResponse
    {
        $request->validate(['file'=>'required|image|mimes:jpeg,png,gif,svg,webp|max:2048']);
        $path = $request->file('file')->store('checkout-assets/'.Auth::user()->company_id, 'public');
        return response()->json(['url' => Storage::url($path), 'path' => $path]);
    }

    /** POST /api/dashboard/checkout-configs/{id}/test-link */
    public function generateTestLink(int $id): JsonResponse
    {
        $config = CheckoutConfig::where('company_id', Auth::user()->company_id)->findOrFail($id);

        $token     = Str::random(32);
        $expiresAt = now()->addHours(24);

        // Armazena no cache por 24h — sem nova tabela necessária
        Cache::put("test_link_{$token}", [
            'config_id'  => $config->id,
            'config'     => $config->config,
            'expires_at' => $expiresAt->toISOString(),
        ], $expiresAt);

        $url = config('app.frontend_url', config('app.url')) . '/checkout/preview/' . $token;

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

```

***

## 📁 `app/Http/Controllers/Dashboard/CheckoutVersionController.php`

```php
<?php

declare(strict_types=1);

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\CheckoutConfig;
use App\Models\CheckoutVersion;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class CheckoutVersionController extends Controller
{
    /** GET /api/dashboard/checkout-configs/{id}/versions */
    public function index(int $configId): JsonResponse
    {
        $config = CheckoutConfig::where('company_id', Auth::user()->company_id)->findOrFail($configId);

        return response()->json(
            CheckoutVersion::where('checkout_config_id', $config->id)
                ->orderByDesc('created_at')
                ->limit(30)
                ->get()
        );
    }

    /** POST /api/dashboard/checkout-configs/{id}/versions/{versionId}/restore */
    public function restore(int $configId, int $versionId): JsonResponse
    {
        $config  = CheckoutConfig::where('company_id', Auth::user()->company_id)->findOrFail($configId);
        $version = CheckoutVersion::where('checkout_config_id', $config->id)->findOrFail($versionId);

        // Salva snapshot da config atual antes de restaurar
        CheckoutVersion::create([
            'checkout_config_id' => $config->id,
            'label'              => 'Antes da restauração',
            'snapshot'           => $config->config,
            'created_by'         => Auth::user()->name,
        ]);

        $config->update(['config' => $version->snapshot]);

        return response()->json(['ok' => true, 'config' => $config]);
    }
}

```

***

## 📁 `app/Http/Controllers/Dashboard/CheckoutAbTestController.php`

```php
<?php

declare(strict_types=1);

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\CheckoutAbTest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CheckoutAbTestController extends Controller
{
    /** GET /api/dashboard/ab-test */
    public function show(): JsonResponse
    {
        $test = CheckoutAbTest::with(['configA:id,name', 'configB:id,name'])
            ->where('company_id', Auth::user()->company_id)
            ->latest()->first();

        if ($test) {
            $test->config_a_name = $test->configA->name ?? '';
            $test->config_b_name = $test->configB->name ?? '';
        }

        return response()->json($test);
    }

    /** POST /api/dashboard/ab-test */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'config_a_id'    => 'required|integer',
            'config_b_id'    => 'required|integer|different:config_a_id',
            'split_percent'  => 'required|integer|min:10|max:90',
        ]);

        $test = CheckoutAbTest::updateOrCreate(
            ['company_id' => Auth::user()->company_id],
            [
                ...$data,
                'is_active'     => false,
                'visits_a'      => 0,
                'visits_b'      => 0,
                'conversions_a' => 0,
                'conversions_b' => 0,
            ]
        );

        return response()->json($test);
    }

    /** PUT /api/dashboard/ab-test */
    public function update(Request $request): JsonResponse
    {
        $test = CheckoutAbTest::where('company_id', Auth::user()->company_id)->firstOrFail();
        $data = $request->validate([
            'config_a_id'   => 'sometimes|integer',
            'config_b_id'   => 'sometimes|integer',
            'split_percent' => 'sometimes|integer|min:10|max:90',
        ]);
        $test->update($data);
        return response()->json($test);
    }

    /** POST /api/dashboard/ab-test/{id}/toggle */
    public function toggle(int $id): JsonResponse
    {
        $test = CheckoutAbTest::where('company_id', Auth::user()->company_id)->findOrFail($id);
        $test->update(['is_active' => !$test->is_active]);
        return response()->json($test);
    }
}

```

# 2. Frontend Next.js (apps/checkout-builder)

***

## 📁 `apps/checkout-builder/types/checkout-config.ts`

```typescript
export interface CheckoutMethods {
  pix: boolean
  card: boolean
  boleto: boolean
}

export interface CheckoutConfig {
  primary_color: string
  secondary_color: string
  background_color: string
  background_gradient: string | null
  text_color: string
  text_muted_color: string
  border_color: string
  success_color: string
  error_color: string
  logo_url: string | null
  logo_width: number
  logo_position: 'left' | 'center' | 'right'
  show_name: boolean
  show_email: boolean
  show_phone: boolean
  show_document: boolean
  show_address: boolean
  field_order: string[]
  methods: CheckoutMethods
  method_order: string[]
  pix_copy_enabled: boolean
  pix_key_type: 'cpf' | 'email' | 'phone' | 'random'
  pix_key: string
  pix_instructions: string
  card_installments: number
  card_discount: number
  card_min_installments: number
  boleto_due_days: number
  boleto_instructions: string
  container_width: number
  container_max_width: number
  padding: number
  border_radius: number
  shadow: boolean
  title: string
  description: string
  success_title: string
  success_message: string
  button_text: string
  custom_css: string
  show_timer: boolean
  timer_position: 'top' | 'bottom'
  show_receipt_link: boolean
  analytics_id: string
}

export const DEFAULT_CONFIG: CheckoutConfig = {
  primary_color: '#7c3aed',
  secondary_color: '#6366f1',
  background_color: '#ffffff',
  background_gradient: null,
  text_color: '#1e293b',
  text_muted_color: '#64748b',
  border_color: '#e2e8f0',
  success_color: '#10b981',
  error_color: '#ef4444',
  logo_url: null,
  logo_width: 120,
  logo_position: 'center',
  show_name: true,
  show_email: true,
  show_phone: true,
  show_document: true,
  show_address: false,
  field_order: ['name', 'email', 'phone', 'document'],
  methods: { pix: true, card: true, boleto: false },
  method_order: ['pix', 'card'],
  pix_copy_enabled: true,
  pix_key_type: 'cpf',
  pix_key: '',
  pix_instructions: '',
  card_installments: 12,
  card_discount: 0,
  card_min_installments: 1,
  boleto_due_days: 3,
  boleto_instructions: '',
  container_width: 480,
  container_max_width: 600,
  padding: 32,
  border_radius: 16,
  shadow: true,
  title: 'Finalize seu pagamento',
  description: '',
  success_title: 'Pagamento confirmado!',
  success_message: 'Obrigado pela sua confiança.',
  button_text: 'Pagar agora',
  custom_css: '',
  show_timer: true,
  timer_position: 'top',
  show_receipt_link: true,
  analytics_id: '',
}

```

***

## 📁 `apps/checkout-builder/stores/EditorContext.tsx`

```tsx
'use client'

import React, { createContext, useContext, useReducer, useCallback } from 'react'
import { CheckoutConfig, DEFAULT_CONFIG } from '@/types/checkout-config'

interface EditorState {
  config: CheckoutConfig
  isDirty: boolean
  isSaving: boolean
  activePanel: string
  configId: number | null
  configName: string
}

const INITIAL_STATE: EditorState = {
  config: { ...DEFAULT_CONFIG },
  isDirty: false,
  isSaving: false,
  activePanel: 'brand',
  configId: null,
  configName: 'Novo Checkout',
}

type Action =
  | { type: 'SET_FIELD'; key: keyof CheckoutConfig; value: unknown }
  | { type: 'SET_NESTED'; path: string; value: unknown }
  | { type: 'LOAD_CONFIG'; id: number; name: string; config: CheckoutConfig }
  | { type: 'RESET' }
  | { type: 'SET_SAVING'; value: boolean }
  | { type: 'SET_PANEL'; panel: string }
  | { type: 'SET_SAVED'; id: number }
  | { type: 'SET_NAME'; name: string }

function setNestedValue(obj: Record<string, unknown>, path: string, value: unknown): Record<string, unknown> {
  const keys = path.split('.')
  const result = { ...obj }
  let cur = result
  for (let i = 0; i < keys.length - 1; i++) {
    cur[keys[i]] = { ...(cur[keys[i]] as Record<string, unknown>) }
    cur = cur[keys[i]] as Record<string, unknown>
  }
  cur[keys[keys.length - 1]] = value
  return result
}

function reducer(state: EditorState, action: Action): EditorState {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, config: { ...state.config, [action.key]: action.value }, isDirty: true }
    case 'SET_NESTED':
      return {
        ...state,
        config: setNestedValue(
          state.config as unknown as Record<string, unknown>,
          action.path,
          action.value
        ) as unknown as CheckoutConfig,
        isDirty: true,
      }
    case 'LOAD_CONFIG':
      return { ...state, configId: action.id, configName: action.name, config: { ...DEFAULT_CONFIG, ...action.config }, isDirty: false }
    case 'RESET':
      return { ...INITIAL_STATE, config: { ...DEFAULT_CONFIG } }
    case 'SET_SAVING':
      return { ...state, isSaving: action.value }
    case 'SET_PANEL':
      return { ...state, activePanel: action.panel }
    case 'SET_SAVED':
      return { ...state, isDirty: false, configId: action.id }
    case 'SET_NAME':
      return { ...state, configName: action.name, isDirty: true }
    default:
      return state
  }
}

interface EditorContextValue {
  state: EditorState
  setField: (key: keyof CheckoutConfig, value: unknown) => void
  setNested: (path: string, value: unknown) => void
  loadConfig: (id: number, name: string, config: CheckoutConfig) => void
  reset: () => void
  setSaving: (v: boolean) => void
  setPanel: (panel: string) => void
  setSaved: (id: number) => void
  setName: (name: string) => void
}

const EditorContext = createContext<EditorContextValue | null>(null)

export function EditorProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)
  const setField   = useCallback((key: keyof CheckoutConfig, value: unknown) => dispatch({ type: 'SET_FIELD', key, value }), [])
  const setNested  = useCallback((path: string, value: unknown) => dispatch({ type: 'SET_NESTED', path, value }), [])
  const loadConfig = useCallback((id: number, name: string, config: CheckoutConfig) => dispatch({ type: 'LOAD_CONFIG', id, name, config }), [])
  const reset      = useCallback(() => dispatch({ type: 'RESET' }), [])
  const setSaving  = useCallback((value: boolean) => dispatch({ type: 'SET_SAVING', value }), [])
  const setPanel   = useCallback((panel: string) => dispatch({ type: 'SET_PANEL', panel }), [])
  const setSaved   = useCallback((id: number) => dispatch({ type: 'SET_SAVED', id }), [])
  const setName    = useCallback((name: string) => dispatch({ type: 'SET_NAME', name }), [])

  return (
    <EditorContext.Provider value={{ state, setField, setNested, loadConfig, reset, setSaving, setPanel, setSaved, setName }}>
      {children}
    </EditorContext.Provider>
  )
}

export function useEditor(): EditorContextValue {
  const ctx = useContext(EditorContext)
  if (!ctx) throw new Error('useEditor must be used inside <EditorProvider>')
  return ctx
}

```

***

## 📁 `apps/checkout-builder/hooks/useCheckoutSave.ts`

```typescript
import { useCallback } from 'react'
import { useEditor } from '@/stores/EditorContext'

export function useCheckoutSave() {
  const { state, setSaving, setSaved } = useEditor()

  const save = useCallback(async (options: { publish?: boolean } = {}) => {
    const { config, configId, configName } = state
    setSaving(true)
    try {
      const url = configId ? `/api/dashboard/checkout-configs/${configId}` : '/api/dashboard/checkout-configs'
      const res = await fetch(url, {
        method: configId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: configName, config, publish: options.publish ?? false }),
      })
      if (!res.ok) { const e = await res.json().catch(()=>({})); throw new Error(e.message ?? `HTTP ${res.status}`) }
      const data = await res.json()
      setSaved(data.id)
      return data
    } finally { setSaving(false) }
  }, [state, setSaving, setSaved])

  return { save }
}

```

## 2.1 Componentes Base (Core)

***

## 📁 `apps/checkout-builder/components/lab/ThemeList.tsx`

```tsx
'use client'

import { useState, useEffect } from 'react'
import { ThemeCard } from './ThemeCard'
import { useRouter } from 'next/navigation'
import { CheckoutConfig } from '@/types/checkout-config'

interface Theme {
  id: number
  name: string
  slug: string
  is_active: boolean
  description: string | null
  updated_at: string
  config: Partial<CheckoutConfig>
}

export function ThemeList() {
  const [themes, setThemes] = useState<Theme[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/dashboard/checkout-configs', { credentials: 'include' })
      .then(r => r.json())
      .then(data => { setThemes(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const handleNew = async () => {
    const res = await fetch('/api/dashboard/checkout-configs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name: 'Novo Checkout', config: {} }),
    })
    const data = await res.json()
    router.push(`/lab/${data.id}`)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Excluir esta config?')) return
    await fetch(`/api/dashboard/checkout-configs/${id}`, { method: 'DELETE', credentials: 'include' })
    setThemes(prev => prev.filter(t => t.id !== id))
  }

  const handleDuplicate = async (theme: Theme) => {
    const res = await fetch('/api/dashboard/checkout-configs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name: theme.name + ' (cópia)', config: theme.config }),
    })
    const data = await res.json()
    setThemes(prev => [data, ...prev])
  }

  const handleImport = (config: Record<string, unknown>) => {
    fetch('/api/dashboard/checkout-configs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name: 'Importado', config }),
    }).then(r => r.json()).then(data => setThemes(prev => [data, ...prev]))
  }

  const triggerImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        try {
          const json = JSON.parse(ev.target?.result as string)
          handleImport(json.config ?? json)
        } catch { alert('JSON inválido') }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <span className="text-gray-500 text-sm animate-pulse">Carregando temas...</span>
    </div>
  )

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Lab de Testes</h1>
          <p className="text-sm text-gray-500 mt-1">Configure e publique checkouts visuais</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={triggerImport}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-xl transition border border-gray-700">
            📥 Importar JSON
          </button>
          <button onClick={() => router.push('/lab/ab-test')}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-xl transition border border-gray-700">
            ⚡ A/B Test
          </button>
          <button onClick={handleNew}
            className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold rounded-xl transition shadow-lg shadow-violet-900/30">
            + Novo Checkout
          </button>
        </div>
      </div>

      {/* Grid de temas */}
      {themes.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4 border-2 border-dashed border-gray-800 rounded-2xl">
          <span className="text-4xl">🧪</span>
          <p className="text-gray-500 text-sm">Nenhum checkout criado ainda</p>
          <button onClick={handleNew}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm rounded-xl transition">
            Criar primeiro checkout
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {themes.map(theme => (
            <ThemeCard
              key={theme.id}
              theme={theme}
              onEdit={() => router.push(`/lab/${theme.id}`)}
              onDelete={() => handleDelete(theme.id)}
              onDuplicate={() => handleDuplicate(theme)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

```

***

## 📁 `apps/checkout-builder/components/lab/ThemeCard.tsx`

```tsx
'use client'

import { useState } from 'react'
import { CheckoutConfig } from '@/types/checkout-config'

interface Theme {
  id: number; name: string; slug: string
  is_active: boolean; description: string | null
  updated_at: string; config: Partial<CheckoutConfig>
}

interface Props {
  theme: Theme
  onEdit: () => void
  onDelete: () => void
  onDuplicate: () => void
}

// Thumbnail gerada via SVG inline — zero canvas, zero lib
function ThemeThumbnail({ config }: { config: Partial<CheckoutConfig> }) {
  const bg  = config.background_color ?? '#ffffff'
  const pri = config.primary_color    ?? '#7c3aed'
  const bdr = config.border_color     ?? '#e2e8f0'
  const txt = config.text_color       ?? '#1e293b'
  const r   = Math.min(config.border_radius ?? 16, 12)

  return (
    <svg viewBox="0 0 280 160" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="280" height="160" fill="#0f0f0f" />
      <rect x="40" y="10" width="200" height="140" rx={r} fill={bg} />
      <rect x="110" y="22" width="60" height="10" rx="3" fill={pri} opacity="0.7" />
      <rect x="60" y="42" width="160" height="7" rx="3" fill={txt} opacity="0.6" />
      <rect x="56" y="58" width="168" height="10" rx="3" fill={bdr} />
      <rect x="56" y="75" width="168" height="10" rx="3" fill={bdr} />
      <rect x="56" y="92" width="168" height="10" rx="3" fill={bdr} />
      <rect x="56" y="112" width="168" height="22" rx={Math.min(r, 8)} fill={pri} />
      <rect x="100" y="119" width="80" height="7" rx="3" fill="white" opacity="0.8" />
    </svg>
  )
}

export function ThemeCard({ theme, onEdit, onDelete, onDuplicate }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)

  const exportJson = () => {
    const blob = new Blob([JSON.stringify({ name: theme.name, config: theme.config }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `${theme.slug}.json`; a.click()
    URL.revokeObjectURL(url)
  }

  const updatedAgo = (() => {
    const diff = Date.now() - new Date(theme.updated_at).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}min atrás`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h atrás`
    return `${Math.floor(hrs / 24)}d atrás`
  })()

  return (
    <div className="group relative bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden hover:border-violet-700 transition-all hover:shadow-xl hover:shadow-violet-900/20">
      {/* Thumbnail */}
      <div className="w-full aspect-video bg-gray-950 cursor-pointer overflow-hidden" onClick={onEdit}>
        <ThemeThumbnail config={theme.config} />
      </div>

      {/* Badge ativo */}
      {theme.is_active && (
        <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-emerald-500/90 backdrop-blur rounded-full px-2 py-0.5">
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          <span className="text-[10px] font-semibold text-white">Publicado</span>
        </div>
      )}

      {/* Menu de contexto */}
      <div className="absolute top-2 right-2">
        <button type="button"
          onClick={(e) => { e.stopPropagation(); setMenuOpen(v => !v) }}
          className="w-7 h-7 rounded-lg bg-gray-950/80 backdrop-blur text-gray-400 hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-lg">
          ⋯
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-8 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-20 w-44 py-1"
            onMouseLeave={() => setMenuOpen(false)}>
            {[
              { icon: '✏️', label: 'Editar',    action: onEdit },
              { icon: '📋', label: 'Duplicar',  action: () => { onDuplicate(); setMenuOpen(false) } },
              { icon: '📤', label: 'Exportar JSON', action: () => { exportJson(); setMenuOpen(false) } },
              { icon: '🔗', label: 'Link de teste', action: () => { window.open(`/checkout/preview/${theme.slug}`, '_blank'); setMenuOpen(false) } },
              { icon: '🗑️', label: 'Excluir',   action: () => { onDelete(); setMenuOpen(false) }, danger: true },
            ].map(item => (
              <button key={item.label} type="button" onClick={item.action}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs transition ${'danger' in item && item.danger ? 'text-red-400 hover:bg-red-900/20' : 'text-gray-300 hover:bg-gray-800'}`}>
                <span>{item.icon}</span>{item.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Info inferior */}
      <div className="p-3">
        <h3 className="text-sm font-semibold text-white truncate">{theme.name}</h3>
        {theme.description && <p className="text-[11px] text-gray-500 truncate mt-0.5">{theme.description}</p>}
        <p className="text-[10px] text-gray-600 mt-1.5">Atualizado {updatedAgo}</p>
      </div>

      {/* Botão editar (hover) */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition pointer-events-none">
        <button type="button" onClick={onEdit}
          className="pointer-events-auto px-5 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold rounded-xl shadow-lg transition">
          Editar
        </button>
      </div>
    </div>
  )
}

```

***

## 📁 `apps/checkout-builder/components/lab/CheckoutEditor.tsx`

```tsx
'use client'

import { useEffect, useState } from 'react'
import { EditorProvider, useEditor } from '@/stores/EditorContext'
import { useCheckoutSave } from '@/hooks/useCheckoutSave'
import { EditorSidebar }   from './EditorSidebar'
import { EditorPanel }     from './EditorPanel'
import { ConfigNameInput } from './ConfigNameInput'
import { CheckoutPreview } from './CheckoutPreview'
import { VersionHistory }  from './VersionHistory'
import { TestLinkBanner }  from './TestLinkBanner'
import { CheckoutConfig }  from '@/types/checkout-config'

function EditorInner({ initialConfigId, initialConfigName, initialConfig }: {
  initialConfigId?: number; initialConfigName?: string; initialConfig?: Partial<CheckoutConfig>
}) {
  const { state, loadConfig } = useEditor()
  const { save } = useCheckoutSave()
  const [showHistory, setShowHistory] = useState(false)
  const [showTestLink, setShowTestLink] = useState(false)

  useEffect(() => {
    if (initialConfigId && initialConfig)
      loadConfig(initialConfigId, initialConfigName ?? 'Checkout', initialConfig as CheckoutConfig)
  }, []) // eslint-disable-line

  return (
    <div className="flex h-screen overflow-hidden bg-gray-950 text-white">
      <EditorSidebar />

      {/* Painel de opções */}
      <div className="w-[300px] flex-shrink-0 border-r border-gray-800 flex flex-col overflow-hidden bg-gray-900">
        <ConfigNameInput />
        <div className="flex-1 overflow-y-auto"><EditorPanel /></div>
      </div>

      {/* Preview + topbar */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <div className="flex items-center justify-between gap-3 px-5 py-2.5 border-b border-gray-800 bg-gray-900/80 backdrop-blur flex-shrink-0 flex-wrap gap-y-2">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full inline-block ${state.isDirty ? 'bg-amber-400' : 'bg-emerald-500'}`} />
            <span className="text-xs text-gray-400">
              {state.isSaving ? 'Salvando...' : state.isDirty ? 'Alterações não salvas' : 'Salvo'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Link de teste */}
            {state.configId && (
              <button type="button" onClick={() => setShowTestLink(v => !v)}
                className={`px-3 py-1.5 text-xs rounded-lg transition border ${showTestLink ? 'border-emerald-600 text-emerald-400 bg-emerald-900/20' : 'border-gray-700 text-gray-400 hover:bg-gray-800'}`}>
                🔗 Teste
              </button>
            )}
            {/* Histórico */}
            {state.configId && (
              <button type="button" onClick={() => setShowHistory(v => !v)}
                className={`px-3 py-1.5 text-xs rounded-lg transition border ${showHistory ? 'border-violet-600 text-violet-400 bg-violet-900/20' : 'border-gray-700 text-gray-400 hover:bg-gray-800'}`}>
                🕐 Histórico
              </button>
            )}
            <button type="button" onClick={() => save()} disabled={state.isSaving || !state.isDirty}
              className="px-4 py-1.5 text-xs font-medium rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-40 transition border border-gray-700">
              Salvar rascunho
            </button>
            <button type="button" onClick={() => save({ publish: true })} disabled={state.isSaving}
              className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-50 transition">
              {state.isSaving ? 'Publicando...' : '⚡ Publicar'}
            </button>
          </div>
        </div>

        {/* Banner de link de teste */}
        {showTestLink && state.configId && (
          <div className="px-5 py-3 border-b border-gray-800">
            <TestLinkBanner configId={state.configId} />
          </div>
        )}

        {/* Área central + histórico */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-auto bg-[#0f0f0f] flex items-start justify-center p-8">
            <CheckoutPreview />
          </div>
          {showHistory && state.configId && (
            <VersionHistory
              configId={state.configId}
              onRestore={(snapshot) => loadConfig(state.configId!, state.configName, snapshot as CheckoutConfig)}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export function CheckoutEditor(props: { initialConfigId?: number; initialConfigName?: string; initialConfig?: Partial<CheckoutConfig> }) {
  return <EditorProvider><EditorInner {...props} /></EditorProvider>
}

```

***

## 📁 `apps/checkout-builder/components/lab/CheckoutPreview.tsx`

```tsx
'use client'

import { useEditor } from '@/stores/EditorContext'
import { useState } from 'react'

type Tab = 'pix' | 'card' | 'boleto'

export function CheckoutPreview() {
  const { state: { config: c } } = useEditor()
  const [tab, setTab] = useState<Tab>('pix')

  const activeMethods = (['pix','card','boleto'] as Tab[]).filter(m => c.methods[m])
  const activeTab = activeMethods.includes(tab) ? tab : activeMethods[0]

  const s = {
    card: { background: c.background_color, color: c.text_color, borderRadius: c.border_radius, padding: c.padding, width: c.container_width, maxWidth: c.container_max_width, boxShadow: c.shadow ? '0 25px 60px rgba(0,0,0,0.3)' : 'none', fontFamily: 'system-ui,sans-serif' } as React.CSSProperties,
    input: { border: `1.5px solid ${c.border_color}`, borderRadius: Math.min(c.border_radius,10), padding:'10px 12px', width:'100%', fontSize:14, background:'transparent', color:c.text_color, boxSizing:'border-box' as const, marginBottom:10, outline:'none' } as React.CSSProperties,
    btn: { background: c.primary_color, borderRadius: Math.min(c.border_radius,12), color:'#fff', width:'100%', padding:'14px', fontWeight:700, fontSize:15, border:'none', cursor:'pointer', marginTop:8 } as React.CSSProperties,
    tab: (a: boolean): React.CSSProperties => ({ flex:1, padding:'9px 4px', fontSize:13, fontWeight:500, borderRadius:Math.min(c.border_radius,8), border:`1.5px solid ${a ? c.primary_color : c.border_color}`, background: a ? c.primary_color+'18':'transparent', color: a ? c.primary_color : c.text_muted_color, cursor:'pointer' }),
    muted: { color: c.text_muted_color, fontSize:12 } as React.CSSProperties,
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-xs text-gray-600">Preview em tempo real</p>
      <div style={s.card} className="ck-card">
        {c.custom_css && <style dangerouslySetInnerHTML={{ __html: c.custom_css }} />}

        {c.show_timer && c.timer_position==='top' && (
          <div style={{...s.muted, textAlign:'center', marginBottom:12, fontSize:11}}>
            ⏱️ Sessão expira em <strong style={{color:c.primary_color}}>14:59</strong>
          </div>
        )}

        {c.logo_url && (
          <div style={{ textAlign: c.logo_position, marginBottom:20 }}>
            <img src={c.logo_url} alt="logo" style={{ width:c.logo_width, display:'inline-block', maxWidth:'100%' }} />
          </div>
        )}

        <div style={{ marginBottom:20 }}>
          <h1 style={{ fontSize:20, fontWeight:700, margin:0, color:c.text_color }}>{c.title}</h1>
          {c.description && <p style={{...s.muted, margin:'6px 0 0'}}>{c.description}</p>}
        </div>

        {activeMethods.length > 0 && (
          <div style={{ display:'flex', gap:8, marginBottom:20 }}>
            {activeMethods.map(m => (
              <button key={m} style={s.tab(activeTab===m)} onClick={() => setTab(m)}>
                {({pix:'⚡ PIX', card:'💳 Cartão', boleto:'🔖 Boleto'})[m]}
              </button>
            ))}
          </div>
        )}

        <div>
          {c.show_name     && <input style={s.input} placeholder="Nome completo" readOnly />}
          {c.show_email    && <input style={s.input} placeholder="E-mail" readOnly />}
          {c.show_phone    && <input style={s.input} placeholder="(00) 00000-0000" readOnly />}
          {c.show_document && <input style={s.input} placeholder="CPF / CNPJ" readOnly />}
          {c.show_address  && <input style={s.input} placeholder="Endereço" readOnly />}
        </div>

        {activeTab==='pix' && (
          <div style={{background:c.primary_color+'12',borderRadius:10,padding:16,marginBottom:12}}>
            <div style={{display:'flex',justifyContent:'center',marginBottom:8}}>
              <div style={{width:80,height:80,background:c.border_color,borderRadius:8}} />
            </div>
            <p style={{...s.muted,textAlign:'center',fontSize:11}}>{c.pix_instructions||'Escaneie o QR code ou copie o código PIX'}</p>
            {c.pix_copy_enabled && <button style={{...s.btn,marginTop:8,background:c.secondary_color,fontSize:13,padding:'9px'}}>Copiar código PIX</button>}
          </div>
        )}

        {activeTab==='card' && (
          <div style={{marginBottom:12}}>
            <input style={s.input} placeholder="Número do cartão" readOnly />
            <div style={{display:'flex',gap:8}}>
              <input style={{...s.input,flex:1}} placeholder="MM/AA" readOnly />
              <input style={{...s.input,flex:1}} placeholder="CVV" readOnly />
            </div>
            {c.card_installments > 1 && (
              <select style={{...s.input,cursor:'pointer'}}>
                {Array.from({length:c.card_installments},(_,i)=>(
                  <option key={i+1}>{i+1}x sem juros</option>
                ))}
              </select>
            )}
          </div>
        )}

        {activeTab==='boleto' && (
          <div style={{background:c.primary_color+'10',borderRadius:10,padding:16,marginBottom:12,textAlign:'center'}}>
            <p style={{...s.muted,fontSize:11}}>{c.boleto_instructions||`Vence em ${c.boleto_due_days} dias úteis`}</p>
          </div>
        )}

        <button style={s.btn} className="ck-btn">{c.button_text}</button>

        {c.show_timer && c.timer_position==='bottom' && (
          <div style={{...s.muted,textAlign:'center',marginTop:10,fontSize:11}}>
            ⏱️ Sessão expira em <strong style={{color:c.primary_color}}>14:59</strong>
          </div>
        )}
        <p style={{...s.muted,textAlign:'center',marginTop:14,fontSize:11}}>🔒 Ambiente seguro e criptografado</p>
        {c.show_receipt_link && <p style={{...s.muted,textAlign:'center',marginTop:4,fontSize:11}}><a href="#" style={{color:c.primary_color}}>Ver comprovante</a></p>}
      </div>
    </div>
  )
}

```

***

## 📁 `apps/checkout-builder/components/lab/ConfigNameInput.tsx`

```tsx
'use client'

import { useEditor } from '@/stores/EditorContext'

export function ConfigNameInput() {
  const { state, setName } = useEditor()
  return (
    <div className="px-4 py-3 border-b border-gray-800">
      <label className="text-[10px] text-gray-600 uppercase tracking-widest block mb-1">Nome do checkout</label>
      <input type="text" value={state.configName} onChange={e => setName(e.target.value)}
        placeholder="Ex: Checkout Principal"
        className="w-full bg-transparent text-sm text-white font-medium focus:outline-none placeholder:text-gray-700" />
    </div>
  )
}

```

***

## 📁 `apps/checkout-builder/components/lab/EditorSidebar.tsx`

```tsx
'use client'

import { useEditor } from '@/stores/EditorContext'

const PANELS = [
  { id: 'brand',   label: 'Marca',  icon: '🎨', hint: 'Cores e logo' },
  { id: 'layout',  label: 'Layout', icon: '📐', hint: 'Tamanhos e espaçamento' },
  { id: 'fields',  label: 'Campos', icon: '📝', hint: 'Campos do formulário' },
  { id: 'methods', label: 'Pagto.', icon: '💳', hint: 'Métodos de pagamento' },
  { id: 'texts',   label: 'Textos', icon: '✏️', hint: 'Títulos e mensagens' },
  { id: 'css',     label: 'CSS',    icon: '🛠️', hint: 'CSS personalizado' },
]

export function EditorSidebar() {
  const { state, setPanel } = useEditor()
  return (
    <div className="w-[72px] flex-shrink-0 bg-gray-950 border-r border-gray-800 flex flex-col items-center py-4 gap-1.5">
      {PANELS.map(p => (
        <button key={p.id} type="button" onClick={() => setPanel(p.id)} title={p.hint}
          className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-0.5 transition ${state.activePanel===p.id ? 'bg-violet-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-800 hover:text-gray-200'}`}>
          <span className="text-[18px] leading-none">{p.icon}</span>
          <span className="text-[9px] font-medium">{p.label}</span>
        </button>
      ))}
    </div>
  )
}

```

***

## 📁 `apps/checkout-builder/components/lab/EditorPanel.tsx`

```tsx
'use client'

import { useEditor } from '@/stores/EditorContext'
import { PanelBrand }   from './panels/PanelBrand'
import { PanelLayout }  from './panels/PanelLayout'
import { PanelFields }  from './panels/PanelFields'
import { PanelMethods } from './panels/PanelMethods'
import { PanelTexts }   from './panels/PanelTexts'
import { PanelCss }     from './panels/PanelCss'

const MAP: Record<string, React.FC> = {
  brand: PanelBrand, layout: PanelLayout, fields: PanelFields,
  methods: PanelMethods, texts: PanelTexts, css: PanelCss,
}

export function EditorPanel() {
  const { state } = useEditor()
  const Panel = MAP[state.activePanel] ?? PanelBrand
  return <div className="p-4 h-full overflow-y-auto"><Panel /></div>
}

```

***

## 📁 `apps/checkout-builder/components/lab/VersionHistory.tsx`

```tsx
'use client'

import { useState, useEffect } from 'react'

interface Version {
  id: number
  config_id: number
  label: string | null
  snapshot: Record<string, unknown>
  created_by: string
  created_at: string
}

interface Props {
  configId: number
  onRestore: (snapshot: Record<string, unknown>) => void
}

export function VersionHistory({ configId, onRestore }: Props) {
  const [versions, setVersions] = useState<Version[]>([])
  const [loading, setLoading] = useState(true)
  const [restoring, setRestoring] = useState<number | null>(null)

  useEffect(() => {
    fetch(`/api/dashboard/checkout-configs/${configId}/versions`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => { setVersions(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [configId])

  const handleRestore = async (v: Version) => {
    if (!confirm(`Restaurar versão "${v.label ?? formatDate(v.created_at)}"?`)) return
    setRestoring(v.id)
    try {
      await fetch(`/api/dashboard/checkout-configs/${configId}/versions/${v.id}/restore`, {
        method: 'POST', credentials: 'include',
      })
      onRestore(v.snapshot)
    } finally { setRestoring(null) }
  }

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' })
  }

  return (
    <div className="w-[280px] flex-shrink-0 border-l border-gray-800 bg-gray-950 flex flex-col">
      <div className="px-4 py-3 border-b border-gray-800">
        <h3 className="text-sm font-semibold text-white">🕐 Histórico</h3>
        <p className="text-[10px] text-gray-500 mt-0.5">Versões salvas automaticamente</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <span className="text-xs text-gray-600 animate-pulse">Carregando...</span>
          </div>
        ) : versions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 gap-2">
            <span className="text-2xl">📭</span>
            <span className="text-xs text-gray-600">Nenhuma versão salva</span>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {versions.map((v, i) => (
              <div key={v.id}
                className="group p-3 rounded-xl hover:bg-gray-800/60 transition cursor-default">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      {i === 0 && <span className="text-[9px] bg-violet-600 text-white rounded-full px-1.5 py-0.5">Atual</span>}
                      <span className="text-xs text-gray-300 truncate">
                        {v.label ?? `Versão ${versions.length - i}`}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-600 mt-0.5">{formatDate(v.created_at)}</p>
                    <p className="text-[10px] text-gray-700">{v.created_by}</p>
                  </div>
                  {i !== 0 && (
                    <button type="button"
                      onClick={() => handleRestore(v)}
                      disabled={restoring === v.id}
                      className="opacity-0 group-hover:opacity-100 transition px-2 py-1 text-[10px] bg-violet-700 hover:bg-violet-600 text-white rounded-lg disabled:opacity-50">
                      {restoring === v.id ? '...' : 'Restaurar'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

```

***

## 📁 `apps/checkout-builder/components/lab/TestLinkBanner.tsx`

```tsx
'use client'

import { useState, useCallback } from 'react'

interface Props { configId: number }

export function TestLinkBanner({ configId }: Props) {
  const [testUrl, setTestUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [expiresAt, setExpiresAt] = useState<string | null>(null)

  const generate = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/dashboard/checkout-configs/${configId}/test-link`, {
        method: 'POST', credentials: 'include',
      })
      const data = await res.json()
      setTestUrl(data.url)
      setExpiresAt(data.expires_at)
    } finally { setLoading(false) }
  }, [configId])

  const copy = useCallback(() => {
    if (!testUrl) return
    navigator.clipboard.writeText(testUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [testUrl])

  const qrUrl = testUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(testUrl)}`
    : null

  if (!testUrl) return (
    <button type="button" onClick={generate} disabled={loading}
      className="flex items-center gap-2 px-4 py-2 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition border border-gray-700 disabled:opacity-50">
      {loading ? '⏳ Gerando...' : '🔗 Gerar link de teste'}
    </button>
  )

  return (
    <div className="flex items-center gap-4 px-4 py-2.5 bg-emerald-900/20 border border-emerald-800/40 rounded-xl">
      {qrUrl && <img src={qrUrl} alt="QR" className="w-12 h-12 rounded-lg flex-shrink-0" />}
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-emerald-400 font-semibold uppercase tracking-widest">Link de teste ativo</p>
        <p className="text-xs text-gray-300 truncate font-mono mt-0.5">{testUrl}</p>
        {expiresAt && (
          <p className="text-[10px] text-gray-600 mt-0.5">
            Expira em {new Date(expiresAt).toLocaleString('pt-BR')}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <button type="button" onClick={copy}
          className={`px-3 py-1 text-[11px] rounded-lg transition ${copied ? 'bg-emerald-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}>
          {copied ? '✓ Copiado' : 'Copiar'}
        </button>
        <a href={testUrl} target="_blank" rel="noopener noreferrer"
          className="px-3 py-1 text-[11px] rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 text-center transition">
          Abrir
        </a>
      </div>
    </div>
  )
}

```

***

## 📁 `apps/checkout-builder/components/lab/AbTestPanel.tsx`

```tsx
'use client'

import { useState, useEffect } from 'react'

interface AbTest {
  id: number
  config_a_id: number
  config_b_id: number
  config_a_name: string
  config_b_name: string
  split_percent: number   // 0-100: % que vai para config A
  is_active: boolean
  visits_a: number
  visits_b: number
  conversions_a: number
  conversions_b: number
}

interface Theme { id: number; name: string }

export function AbTestPanel() {
  const [test, setTest] = useState<AbTest | null>(null)
  const [themes, setThemes] = useState<Theme[]>([])
  const [form, setForm] = useState({ config_a_id: '', config_b_id: '', split_percent: 50 })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/dashboard/checkout-configs', { credentials: 'include' }).then(r => r.json()),
      fetch('/api/dashboard/ab-test', { credentials: 'include' }).then(r => r.json()).catch(() => null),
    ]).then(([themes, abTest]) => {
      setThemes(themes)
      if (abTest?.id) {
        setTest(abTest)
        setForm({ config_a_id: String(abTest.config_a_id), config_b_id: String(abTest.config_b_id), split_percent: abTest.split_percent })
      }
      setLoading(false)
    })
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/dashboard/ab-test', {
        method: test ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      })
      const data = await res.json()
      setTest(data)
    } finally { setSaving(false) }
  }

  const handleToggle = async () => {
    if (!test) return
    const res = await fetch(`/api/dashboard/ab-test/${test.id}/toggle`, {
      method: 'POST', credentials: 'include',
    })
    const data = await res.json()
    setTest(data)
  }

  const convRateA = test && test.visits_a > 0 ? ((test.conversions_a / test.visits_a) * 100).toFixed(1) : '—'
  const convRateB = test && test.visits_b > 0 ? ((test.conversions_b / test.visits_b) * 100).toFixed(1) : '—'
  const winner = test && test.visits_a > 50 && test.visits_b > 50
    ? (parseFloat(convRateA) > parseFloat(convRateB) ? 'A' : parseFloat(convRateB) > parseFloat(convRateA) ? 'B' : null)
    : null

  if (loading) return <div className="flex items-center justify-center h-64"><span className="text-gray-500 animate-pulse text-sm">Carregando...</span></div>

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">⚡ A/B Test</h1>
        <p className="text-sm text-gray-500 mt-1">Teste dois checkouts ao mesmo tempo e veja qual converte mais</p>
      </div>

      {/* Configuração */}
      <div className="bg-gray-900 rounded-2xl p-6 space-y-5 border border-gray-800">
        <h2 className="text-sm font-semibold text-white">Configuração do Teste</h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs text-gray-400">Checkout A</label>
            <select value={form.config_a_id} onChange={e => setForm(f => ({ ...f, config_a_id: e.target.value }))}
              className="w-full bg-gray-800 text-gray-200 text-sm rounded-xl px-3 py-2.5 border border-gray-700 focus:outline-none focus:border-violet-500">
              <option value="">Selecionar...</option>
              {themes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-gray-400">Checkout B</label>
            <select value={form.config_b_id} onChange={e => setForm(f => ({ ...f, config_b_id: e.target.value }))}
              className="w-full bg-gray-800 text-gray-200 text-sm rounded-xl px-3 py-2.5 border border-gray-700 focus:outline-none focus:border-violet-500">
              <option value="">Selecionar...</option>
              {themes.filter(t => String(t.id) !== form.config_a_id).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
        </div>

        {/* Split visual */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-400">
            <span>A — {form.split_percent}%</span>
            <span>B — {100 - form.split_percent}%</span>
          </div>
          <div className="relative h-8 bg-gray-800 rounded-xl overflow-hidden">
            <div className="absolute inset-y-0 left-0 bg-violet-600 flex items-center justify-center transition-all"
              style={{ width: `${form.split_percent}%` }}>
              {form.split_percent > 20 && <span className="text-[10px] text-white font-bold">A</span>}
            </div>
            <div className="absolute inset-y-0 right-0 bg-indigo-500 flex items-center justify-center transition-all"
              style={{ width: `${100 - form.split_percent}%` }}>
              {100 - form.split_percent > 20 && <span className="text-[10px] text-white font-bold">B</span>}
            </div>
          </div>
          <input type="range" min={10} max={90} step={5} value={form.split_percent}
            onChange={e => setForm(f => ({ ...f, split_percent: Number(e.target.value) }))}
            className="w-full opacity-0 absolute cursor-pointer" style={{ marginTop: -32, height: 32, position: 'relative', zIndex: 1 }} />
        </div>

        <div className="flex items-center justify-between pt-2">
          <button type="button" onClick={handleSave} disabled={saving || !form.config_a_id || !form.config_b_id}
            className="px-5 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold rounded-xl transition disabled:opacity-40">
            {saving ? 'Salvando...' : 'Salvar configuração'}
          </button>
          {test && (
            <button type="button" onClick={handleToggle}
              className={`px-4 py-2 text-sm font-medium rounded-xl transition border ${test.is_active ? 'border-red-700 text-red-400 hover:bg-red-900/20' : 'border-emerald-700 text-emerald-400 hover:bg-emerald-900/20'}`}>
              {test.is_active ? '⏸ Pausar teste' : '▶ Ativar teste'}
            </button>
          )}
        </div>
      </div>

      {/* Resultados */}
      {test && (
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">📊 Resultados</h2>
            {winner && (
              <span className="text-xs bg-emerald-600 text-white px-3 py-1 rounded-full font-semibold">
                🏆 Checkout {winner} vencendo
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'A', name: test.config_a_name, visits: test.visits_a, conv: test.conversions_a, rate: convRateA, color: 'violet' },
              { label: 'B', name: test.config_b_name, visits: test.visits_b, conv: test.conversions_b, rate: convRateB, color: 'indigo' },
            ].map(s => (
              <div key={s.label} className={`rounded-xl p-4 border ${winner === s.label ? 'border-emerald-700 bg-emerald-900/10' : 'border-gray-700 bg-gray-800/50'}`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`w-6 h-6 rounded-lg bg-${s.color}-600 flex items-center justify-center text-white text-xs font-bold`}>{s.label}</span>
                  <span className="text-sm text-white font-medium truncate">{s.name}</span>
                  {winner === s.label && <span className="text-emerald-400 text-sm">🏆</span>}
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Visitas</span>
                    <span className="text-gray-300 font-mono">{s.visits.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Conversões</span>
                    <span className="text-gray-300 font-mono">{s.conv.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Taxa de conv.</span>
                    <span className={`font-mono font-bold ${winner === s.label ? 'text-emerald-400' : 'text-gray-300'}`}>{s.rate}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

```

## 2.2 Componentes de Controle (UI)

***

## 📁 `apps/checkout-builder/components/lab/controls/ColorPicker.tsx`

```tsx
'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface Props {
  label: string
  value: string
  onChange: (v: string) => void
}

function isValidHex(hex: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(hex)
}

function luminance(hex: string): number {
  const r = parseInt(hex.slice(1,3),16)/255
  const g = parseInt(hex.slice(3,5),16)/255
  const b = parseInt(hex.slice(5,7),16)/255
  return 0.2126*r + 0.7152*g + 0.0722*b
}

const SWATCHES = [
  '#7c3aed','#6366f1','#2563eb','#0891b2','#059669',
  '#d97706','#dc2626','#db2777','#374151','#1e293b',
  '#ffffff','#f8fafc','#e2e8f0','#94a3b8','#000000',
]

export function ColorPicker({ label, value, onChange }: Props) {
  const [hexInput, setHexInput] = useState(value)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => { setHexInput(value) }, [value])

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const handleHex = useCallback((raw: string) => {
    setHexInput(raw)
    if (isValidHex(raw)) onChange(raw)
  }, [onChange])

  const textColor = isValidHex(value) && luminance(value) > 0.4 ? '#000' : '#fff'

  return (
    <div className="relative flex items-center justify-between gap-3" ref={ref}>
      <label className="text-xs text-gray-300 flex-1 truncate">{label}</label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen(v => !v)}
          style={{ background: isValidHex(value) ? value : '#7c3aed' }}
          className="w-7 h-7 rounded-md border border-gray-600 hover:scale-110 transition"
        />
        <input
          type="text"
          value={hexInput}
          maxLength={7}
          onChange={(e) => handleHex(e.target.value)}
          className="w-[76px] bg-gray-800 text-gray-200 text-xs rounded px-2 py-1 border border-gray-700 focus:outline-none focus:border-violet-500 font-mono"
        />
      </div>

      {open && (
        <div className="absolute right-0 top-9 z-50 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl p-3 w-52">
          <div className="flex items-center gap-2 mb-3">
            <input type="color" value={isValidHex(value) ? value : '#7c3aed'}
              onChange={(e) => { onChange(e.target.value); setHexInput(e.target.value) }}
              className="w-10 h-10 rounded cursor-pointer border-0 p-0 bg-transparent" />
            <span className="text-xs text-gray-400">Escolher cor</span>
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            {SWATCHES.map(s => (
              <button key={s} type="button"
                onClick={() => { onChange(s); setHexInput(s); setOpen(false) }}
                style={{ background: s }}
                className={`w-8 h-8 rounded-lg border hover:scale-110 transition ${value===s ? 'border-violet-400 scale-110' : 'border-gray-600'}`}
              />
            ))}
          </div>
          <div style={{ background: value, color: textColor }}
            className="mt-3 rounded-lg py-1.5 text-center text-xs font-mono">
            {value}
          </div>
        </div>
      )}
    </div>
  )
}

```

***

## 📁 `apps/checkout-builder/components/lab/controls/DragList.tsx`

```tsx
'use client'

import { useState } from 'react'

interface Item { id: string; label: string }
interface Props { items: Item[]; onChange: (ordered: string[]) => void }

export function DragList({ items, onChange }: Props) {
  const [dragging, setDragging] = useState<string | null>(null)
  const [over, setOver] = useState<string | null>(null)

  const drop = (targetId: string) => {
    if (!dragging || dragging === targetId) { setDragging(null); setOver(null); return }
    const ids = items.map(i => i.id)
    const from = ids.indexOf(dragging), to = ids.indexOf(targetId)
    const next = [...ids]; next.splice(from,1); next.splice(to,0,dragging)
    onChange(next); setDragging(null); setOver(null)
  }

  return (
    <div className="space-y-1">
      {items.map(item => (
        <div key={item.id} draggable
          onDragStart={() => setDragging(item.id)}
          onDragOver={e => { e.preventDefault(); if(item.id!==dragging) setOver(item.id) }}
          onDrop={() => drop(item.id)}
          onDragEnd={() => { setDragging(null); setOver(null) }}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-gray-300 cursor-grab active:cursor-grabbing select-none transition border-t-2 ${dragging===item.id ? 'opacity-40 bg-gray-700 border-transparent' : over===item.id ? 'bg-gray-800 border-violet-500' : 'bg-gray-800 border-transparent hover:bg-gray-750'}`}>
          <span className="text-gray-600">⠿</span>
          {item.label}
        </div>
      ))}
    </div>
  )
}

```

***

## 📁 `apps/checkout-builder/components/lab/controls/ImageUpload.tsx`

```tsx
'use client'

import { useState, useRef, useCallback } from 'react'

interface Props { label: string; value: string | null; onChange: (url: string | null) => void }

export function ImageUpload({ label, value, onChange }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const uploadFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) { setError('Apenas imagens.'); return }
    if (file.size > 2*1024*1024) { setError('Máximo 2MB.'); return }
    setError(null); setLoading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/dashboard/upload', { method: 'POST', body: form, credentials: 'include' })
      if (!res.ok) throw new Error('Upload falhou')
      const { url } = await res.json()
      onChange(url)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro no upload')
    } finally { setLoading(false) }
  }, [onChange])

  return (
    <div className="space-y-2">
      <label className="text-xs text-gray-300">{label}</label>
      {value && (
        <div className="relative w-full h-20 bg-gray-800 rounded-xl border border-gray-700 flex items-center justify-center group">
          <img src={value} alt="preview" className="max-h-16 max-w-full object-contain" />
          <button type="button" onClick={() => onChange(null)}
            className="absolute top-2 right-2 w-6 h-6 bg-red-600/80 hover:bg-red-500 rounded-full text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition">✕</button>
        </div>
      )}
      <div onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if(f) uploadFile(f) }}
        className={`flex flex-col items-center justify-center gap-1.5 w-full py-4 rounded-xl border-2 border-dashed cursor-pointer select-none transition ${dragOver ? 'border-violet-400 bg-violet-900/20' : 'border-gray-700 hover:border-violet-600'} ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
        <span className="text-xl">{loading ? '⏳' : '🖼️'}</span>
        <span className="text-xs text-gray-400">{loading ? 'Enviando...' : 'Clique ou arraste uma imagem'}</span>
        <span className="text-[10px] text-gray-600">PNG, JPG, SVG — máx 2MB</span>
      </div>
      {error && <p className="text-[11px] text-red-400">{error}</p>}
      <input ref={inputRef} type="file" accept="image/*" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if(f) uploadFile(f); e.target.value='' }} />
    </div>
  )
}

```

***

## 📁 `apps/checkout-builder/components/lab/controls/NumberInput.tsx`

```tsx
'use client'

interface Props {
  label: string; value: number; onChange: (v: number) => void
  min?: number; max?: number; step?: number; unit?: string
}

export function NumberInput({ label, value, onChange, min, max, step = 1, unit }: Props) {
  const dec = () => { const n = value - step; if (min === undefined || n >= min) onChange(n) }
  const inc = () => { const n = value + step; if (max === undefined || n <= max) onChange(n) }
  return (
    <div className="flex items-center justify-between gap-3">
      <label className="text-xs text-gray-300 flex-1">{label}</label>
      <div className="flex items-center gap-1">
        <button type="button" onClick={dec}
          className="w-6 h-6 rounded-md bg-gray-700 hover:bg-gray-600 text-gray-300 flex items-center justify-center transition">−</button>
        <div className="flex items-center gap-0.5 min-w-[52px] justify-center">
          <input type="number" value={value} min={min} max={max} step={step}
            onChange={e => { const v = Number(e.target.value); if ((min===undefined||v>=min)&&(max===undefined||v<=max)) onChange(v) }}
            className="w-10 bg-transparent text-center text-xs text-gray-200 font-mono border-0 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
          {unit && <span className="text-xs text-gray-500">{unit}</span>}
        </div>
        <button type="button" onClick={inc}
          className="w-6 h-6 rounded-md bg-gray-700 hover:bg-gray-600 text-gray-300 flex items-center justify-center transition">+</button>
      </div>
    </div>
  )
}

```

***

## 📁 `apps/checkout-builder/components/lab/controls/SelectInput.tsx`

```tsx
'use client'

interface Props {
  label: string; value: string
  options: { value: string; label: string }[]
  onChange: (v: string) => void
}

export function SelectInput({ label, value, options, onChange }: Props) {
  return (
    <div className="flex items-center justify-between gap-3">
      <label className="text-xs text-gray-300 flex-1 truncate">{label}</label>
      <div className="relative">
        <select value={value} onChange={e => onChange(e.target.value)}
          className="appearance-none bg-gray-800 text-gray-200 text-xs rounded-lg pl-2 pr-6 py-1.5 border border-gray-700 focus:outline-none focus:border-violet-500 cursor-pointer">
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 text-[10px]">▼</span>
      </div>
    </div>
  )
}

```

***

## 📁 `apps/checkout-builder/components/lab/controls/SliderInput.tsx`

```tsx
'use client'

interface Props {
  label: string; min: number; max: number; step: number
  value: number; onChange: (v: number) => void; unit?: string
}

export function SliderInput({ label, min, max, step, value, onChange, unit = '' }: Props) {
  const pct = Math.round(((value - min) / (max - min)) * 100)
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between">
        <label className="text-xs text-gray-300">{label}</label>
        <span className="text-xs text-violet-400 font-mono">{value}{unit}</span>
      </div>
      <div className="relative h-5 flex items-center">
        <div className="absolute w-full h-1.5 rounded-full bg-gray-700 overflow-hidden">
          <div className="h-full rounded-full bg-violet-600 transition-all" style={{ width: `${pct}%` }} />
        </div>
        <input type="range" min={min} max={max} step={step} value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute w-full h-full opacity-0 cursor-pointer" style={{ zIndex: 1 }} />
        <div className="absolute w-4 h-4 rounded-full bg-white shadow-md border-2 border-violet-500 pointer-events-none transition-all"
          style={{ left: `calc(${pct}% - 8px)` }} />
      </div>
    </div>
  )
}

```

***

## 📁 `apps/checkout-builder/components/lab/controls/TextInput.tsx`

```tsx
'use client'

interface Props {
  label: string; value: string; onChange: (v: string) => void
  multiline?: boolean; placeholder?: string; hint?: string
}

export function TextInput({ label, value, onChange, multiline, placeholder, hint }: Props) {
  const base = "w-full bg-gray-800 text-gray-200 text-xs rounded-lg px-3 py-2 border border-gray-700 focus:outline-none focus:border-violet-500 placeholder:text-gray-600 transition"
  return (
    <div className="space-y-1">
      <label className="text-xs text-gray-300">{label}</label>
      {multiline
        ? <textarea rows={3} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={base + ' resize-none'} />
        : <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={base} />
      }
      {hint && <p className="text-[10px] text-gray-500">{hint}</p>}
    </div>
  )
}

```

***

## 📁 `apps/checkout-builder/components/lab/controls/ToggleInput.tsx`

```tsx
'use client'

interface Props {
  label: string; value: boolean; onChange: (v: boolean) => void; description?: string
}

export function ToggleInput({ label, value, onChange, description }: Props) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1">
        <span className="text-xs text-gray-300 block">{label}</span>
        {description && <span className="text-[10px] text-gray-500 block mt-0.5">{description}</span>}
      </div>
      <button type="button" role="switch" aria-checked={value} onClick={() => onChange(!value)}
        className={`relative flex-shrink-0 w-10 h-5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 ${value ? 'bg-violet-600' : 'bg-gray-700'}`}>
        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </div>
  )
}

```

## 2.3 Painéis do Editor

***

## 📁 `apps/checkout-builder/components/lab/panels/PanelBrand.tsx`

```tsx
'use client'

import { useEditor } from '@/stores/EditorContext'
import { ColorPicker } from '../controls/ColorPicker'
import { ImageUpload } from '../controls/ImageUpload'
import { SliderInput } from '../controls/SliderInput'
import { SelectInput } from '../controls/SelectInput'

function S({ t, children }: { t: string; children: React.ReactNode }) {
  return <div className="space-y-3"><h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pt-2">{t}</h3>{children}</div>
}

export function PanelBrand() {
  const { state, setField } = useEditor()
  const c = state.config
  return (
    <div className="space-y-5">
      <h2 className="text-sm font-semibold text-white">Marca</h2>
      <S t="Logo">
        <ImageUpload label="Logotipo" value={c.logo_url} onChange={v => setField('logo_url', v)} />
        <SliderInput label="Largura" min={40} max={300} step={10} value={c.logo_width} onChange={v => setField('logo_width', v)} unit="px" />
        <SelectInput label="Alinhamento" value={c.logo_position}
          options={[{value:'left',label:'Esquerda'},{value:'center',label:'Centro'},{value:'right',label:'Direita'}]}
          onChange={v => setField('logo_position', v)} />
      </S>
      <S t="Cores principais">
        <ColorPicker label="Cor principal"  value={c.primary_color}   onChange={v => setField('primary_color', v)} />
        <ColorPicker label="Cor secundária" value={c.secondary_color} onChange={v => setField('secondary_color', v)} />
      </S>
      <S t="Interface">
        <ColorPicker label="Fundo"      value={c.background_color} onChange={v => setField('background_color', v)} />
        <ColorPicker label="Texto"      value={c.text_color}       onChange={v => setField('text_color', v)} />
        <ColorPicker label="Texto suave" value={c.text_muted_color} onChange={v => setField('text_muted_color', v)} />
        <ColorPicker label="Borda"      value={c.border_color}     onChange={v => setField('border_color', v)} />
      </S>
      <S t="Feedback">
        <ColorPicker label="Sucesso" value={c.success_color} onChange={v => setField('success_color', v)} />
        <ColorPicker label="Erro"    value={c.error_color}   onChange={v => setField('error_color', v)} />
      </S>
    </div>
  )
}

```

***

## 📁 `apps/checkout-builder/components/lab/panels/PanelCss.tsx`

```tsx
'use client'

import { useEditor } from '@/stores/EditorContext'

export function PanelCss() {
  const { state, setField } = useEditor()
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-white">CSS Personalizado</h2>
      <p className="text-[11px] text-gray-500 leading-relaxed">
        CSS injetado no checkout publicado. Use <code className="text-violet-400">.ck-card</code>, <code className="text-violet-400">.ck-btn</code>, <code className="text-violet-400">.ck-input</code>.
      </p>
      <textarea value={state.config.custom_css} onChange={e => setField('custom_css', e.target.value)}
        rows={22} spellCheck={false}
        placeholder={".ck-card {\n  /* container */\n}\n\n.ck-btn {\n  /* botão pagar */\n}"}
        className="w-full bg-gray-950 text-green-400 text-xs font-mono rounded-xl p-3 border border-gray-800 focus:outline-none focus:border-violet-600 resize-none leading-relaxed" />
    </div>
  )
}

```

***

## 📁 `apps/checkout-builder/components/lab/panels/PanelFields.tsx`

```tsx
'use client'

import { useEditor } from '@/stores/EditorContext'
import { ToggleInput } from '../controls/ToggleInput'
import { DragList } from '../controls/DragList'

const LABELS: Record<string,string> = { name:'Nome completo', email:'E-mail', phone:'Telefone', document:'CPF / CNPJ', address:'Endereço' }

export function PanelFields() {
  const { state, setField } = useEditor()
  const c = state.config
  return (
    <div className="space-y-5">
      <h2 className="text-sm font-semibold text-white">Campos do Formulário</h2>
      <div className="space-y-3">
        <ToggleInput label="Nome"     value={c.show_name}     onChange={v => setField('show_name',v)} />
        <ToggleInput label="E-mail"   value={c.show_email}    onChange={v => setField('show_email',v)} />
        <ToggleInput label="Telefone" value={c.show_phone}    onChange={v => setField('show_phone',v)} />
        <ToggleInput label="CPF/CNPJ" value={c.show_document} onChange={v => setField('show_document',v)} />
        <ToggleInput label="Endereço" value={c.show_address}  onChange={v => setField('show_address',v)} />
      </div>
      <div className="space-y-2">
        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Ordem (arraste)</h3>
        <DragList items={c.field_order.map(id => ({ id, label: LABELS[id]??id }))} onChange={v => setField('field_order',v)} />
      </div>
    </div>
  )
}

```

***

## 📁 `apps/checkout-builder/components/lab/panels/PanelLayout.tsx`

```tsx
'use client'

import { useEditor } from '@/stores/EditorContext'
import { SliderInput } from '../controls/SliderInput'
import { ToggleInput } from '../controls/ToggleInput'
import { SelectInput } from '../controls/SelectInput'

export function PanelLayout() {
  const { state, setField } = useEditor()
  const c = state.config
  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-white">Layout</h2>
      <SliderInput label="Largura do cartão" min={300} max={800} step={10} value={c.container_width} onChange={v => setField('container_width',v)} unit="px" />
      <SliderInput label="Largura máxima"    min={400} max={1000} step={10} value={c.container_max_width} onChange={v => setField('container_max_width',v)} unit="px" />
      <SliderInput label="Padding interno"   min={8}   max={64}   step={4}  value={c.padding}       onChange={v => setField('padding',v)} unit="px" />
      <SliderInput label="Arredondamento"    min={0}   max={48}   step={2}  value={c.border_radius}  onChange={v => setField('border_radius',v)} unit="px" />
      <ToggleInput label="Sombra" value={c.shadow} onChange={v => setField('shadow',v)} />
      <ToggleInput label="Temporizador" description="Contador de tempo na tela de pagamento" value={c.show_timer} onChange={v => setField('show_timer',v)} />
      {c.show_timer && (
        <SelectInput label="Posição do timer" value={c.timer_position}
          options={[{value:'top',label:'Topo'},{value:'bottom',label:'Rodapé'}]}
          onChange={v => setField('timer_position',v)} />
      )}
      <ToggleInput label="Botão de comprovante" description="Link após aprovação" value={c.show_receipt_link} onChange={v => setField('show_receipt_link',v)} />
    </div>
  )
}

```

***

## 📁 `apps/checkout-builder/components/lab/panels/PanelMethods.tsx`

```tsx
'use client'

import { useEditor } from '@/stores/EditorContext'
import { ToggleInput } from '../controls/ToggleInput'
import { SliderInput } from '../controls/SliderInput'
import { SelectInput } from '../controls/SelectInput'
import { TextInput } from '../controls/TextInput'

const D = ({ t }: { t: string }) => <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pt-2">{t}</h3>

export function PanelMethods() {
  const { state, setField, setNested } = useEditor()
  const c = state.config
  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-white">Métodos de Pagamento</h2>
      <D t="Ativar" />
      <ToggleInput label="PIX"    value={c.methods.pix}    onChange={v => setNested('methods.pix',v)} />
      <ToggleInput label="Cartão" value={c.methods.card}   onChange={v => setNested('methods.card',v)} />
      <ToggleInput label="Boleto" value={c.methods.boleto} onChange={v => setNested('methods.boleto',v)} />
      {c.methods.card && <>
        <D t="Cartão de crédito" />
        <SliderInput label="Parcelas máximas" min={1} max={12} step={1} value={c.card_installments}     onChange={v => setField('card_installments',v)} unit="x" />
        <SliderInput label="Parcela mínima"   min={1} max={12} step={1} value={c.card_min_installments} onChange={v => setField('card_min_installments',v)} unit="x" />
        <SliderInput label="Desconto à vista" min={0} max={30} step={1} value={c.card_discount}         onChange={v => setField('card_discount',v)} unit="%" />
      </>}
      {c.methods.pix && <>
        <D t="PIX" />
        <ToggleInput label="Botão copiar código" value={c.pix_copy_enabled} onChange={v => setField('pix_copy_enabled',v)} />
        <SelectInput label="Tipo de chave" value={c.pix_key_type}
          options={[{value:'cpf',label:'CPF'},{value:'email',label:'E-mail'},{value:'phone',label:'Telefone'},{value:'random',label:'Aleatória'}]}
          onChange={v => setField('pix_key_type',v)} />
        <TextInput label="Instrução PIX" value={c.pix_instructions} onChange={v => setField('pix_instructions',v)} multiline />
      </>}
      {c.methods.boleto && <>
        <D t="Boleto" />
        <SliderInput label="Dias para vencer" min={1} max={30} step={1} value={c.boleto_due_days} onChange={v => setField('boleto_due_days',v)} unit="d" />
        <TextInput label="Instruções" value={c.boleto_instructions} onChange={v => setField('boleto_instructions',v)} multiline />
      </>}
    </div>
  )
}

```

***

## 📁 `apps/checkout-builder/components/lab/panels/PanelTexts.tsx`

```tsx
'use client'

import { useEditor } from '@/stores/EditorContext'
import { TextInput } from '../controls/TextInput'

export function PanelTexts() {
  const { state, setField } = useEditor()
  const c = state.config
  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-white">Textos</h2>
      <TextInput label="Título principal"    value={c.title}             onChange={v => setField('title',v)}             placeholder="Finalize seu pagamento" />
      <TextInput label="Descrição"           value={c.description}       onChange={v => setField('description',v)}       multiline placeholder="Texto opcional abaixo do título" />
      <TextInput label="Texto do botão"      value={c.button_text}       onChange={v => setField('button_text',v)}       placeholder="Pagar agora" />
      <TextInput label="Título pós-pagamento" value={c.success_title}    onChange={v => setField('success_title',v)}     placeholder="Pagamento confirmado!" />
      <TextInput label="Mensagem de sucesso" value={c.success_message}   onChange={v => setField('success_message',v)}   multiline />
      <TextInput label="Instrução PIX"       value={c.pix_instructions}  onChange={v => setField('pix_instructions',v)}  multiline />
      <TextInput label="Instrução Boleto"    value={c.boleto_instructions} onChange={v => setField('boleto_instructions',v)} multiline />
    </div>
  )
}

```

## 2.4 Páginas (App Router)

***

## 📁 `apps/checkout-builder/app/(dashboard)/lab/page.tsx`

```tsx
import { ThemeList } from '@/components/lab/ThemeList'
export const metadata = { title: 'Lab de Testes — Basileia' }
export default function LabPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      <ThemeList />
    </div>
  )
}

```

***

## 📁 `apps/checkout-builder/app/(dashboard)/lab/[id]/page.tsx`

```tsx
import { CheckoutEditor } from '@/components/lab/CheckoutEditor'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'

interface Props { params: { id: string } }

async function getConfig(id: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/checkout-configs/${id}`, {
      headers: { Cookie: cookies().toString() }, cache: 'no-store',
    })
    if (res.status === 404) return null
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return res.json()
  } catch { return null }
}

export default async function LabEditPage({ params }: Props) {
  const data = await getConfig(params.id)
  if (!data) notFound()
  return <CheckoutEditor initialConfigId={data.id} initialConfigName={data.name} initialConfig={data.config} />
}

```

***

## 📁 `apps/checkout-builder/app/(dashboard)/lab/ab-test/page.tsx`

```tsx
import { AbTestPanel } from '@/components/lab/AbTestPanel'
export const metadata = { title: 'A/B Test — Lab' }
export default function AbTestPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      <AbTestPanel />
    </div>
  )
}

```

***

## 📁 `apps/checkout-builder/app/checkout/preview/[token]/page.tsx`

```tsx
import { notFound } from 'next/navigation'

interface Props { params: { token: string } }

async function getTestConfig(token: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/checkout/test/${token}`,
      { cache: 'no-store' }
    )
    if (res.status === 404 || res.status === 410) return null
    return res.json()
  } catch { return null }
}

export default async function PreviewPage({ params }: Props) {
  const data = await getTestConfig(params.token)
  if (!data) notFound()

  // Inline CSS approach based on config (similar to CheckoutPreview component)
  const c = data.config
  const s = {
    card: { background: c.background_color, color: c.text_color, borderRadius: c.border_radius, padding: c.padding, width: c.container_width, maxWidth: c.container_max_width, boxShadow: c.shadow ? '0 25px 60px rgba(0,0,0,0.3)' : 'none', fontFamily: 'system-ui,sans-serif' } as React.CSSProperties,
    input: { border: `1.5px solid ${c.border_color}`, borderRadius: Math.min(c.border_radius,10), padding:'10px 12px', width:'100%', fontSize:14, background:'transparent', color:c.text_color, boxSizing:'border-box' as const, marginBottom:10, outline:'none' } as React.CSSProperties,
    btn: { background: c.primary_color, borderRadius: Math.min(c.border_radius,12), color:'#fff', width:'100%', padding:'14px', fontWeight:700, fontSize:15, border:'none', cursor:'pointer', marginTop:8 } as React.CSSProperties,
    tab: (a: boolean): React.CSSProperties => ({ flex:1, padding:'9px 4px', fontSize:13, fontWeight:500, borderRadius:Math.min(c.border_radius,8), border:`1.5px solid ${a ? c.primary_color : c.border_color}`, background: a ? c.primary_color+'18':'transparent', color: a ? c.primary_color : c.text_muted_color, cursor:'pointer' }),
    muted: { color: c.text_muted_color, fontSize:12 } as React.CSSProperties,
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6">
      {/* Banner de aviso */}
      <div className="mb-6 px-5 py-2.5 bg-amber-900/30 border border-amber-700/50 rounded-xl flex items-center gap-3">
        <span className="text-amber-400 text-lg">🧪</span>
        <div>
          <p className="text-sm font-semibold text-amber-300">Modo de Teste</p>
          <p className="text-xs text-amber-500">Este checkout não processa pagamentos reais</p>
        </div>
        {data.expires_at && (
          <span className="ml-4 text-xs text-amber-600">
            Expira: {new Date(data.expires_at).toLocaleString('pt-BR')}
          </span>
        )}
      </div>

      <div style={s.card} className="ck-card">
        {c.custom_css && <style dangerouslySetInnerHTML={{ __html: c.custom_css }} />}

        {c.logo_url && (
          <div style={{ textAlign: c.logo_position, marginBottom:20 }}>
            <img src={c.logo_url} alt="logo" style={{ width:c.logo_width, display:'inline-block', maxWidth:'100%' }} />
          </div>
        )}

        <div style={{ marginBottom:20 }}>
          <h1 style={{ fontSize:20, fontWeight:700, margin:0, color:c.text_color }}>{c.title}</h1>
          {c.description && <p style={{...s.muted, margin:'6px 0 0'}}>{c.description}</p>}
        </div>

        <div>
          {c.show_name     && <input style={s.input} placeholder="Nome completo" readOnly />}
          {c.show_email    && <input style={s.input} placeholder="E-mail" readOnly />}
          {c.show_document && <input style={s.input} placeholder="CPF / CNPJ" readOnly />}
        </div>

        <button style={s.btn} className="ck-btn">{c.button_text}</button>
      </div>
    </div>
  )
}

```
