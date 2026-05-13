# Chunk 3: Models & Config
### Arquivo: app/Models/Subscription.php
```php
<?php

namespace App\Models;

use App\Models\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Subscription extends Model
{
    use HasUuid;

    protected $fillable = [
        'uuid',
        'integration_id',
        'company_id',
        'customer_id',
        'gateway_id',
        'plan_name',
        'amount',
        'currency',
        'billing_cycle',
        'interval',
        'status',
        'current_period_start',
        'current_period_end',
        'next_billing_date',
        'gateway_subscription_id',
        'metadata',
        'callback_url',
        'cancelled_at',
    ];

    protected $appends = ['payment_url'];

    public function getPaymentUrlAttribute(): string
    {
        return config('app.url') . '/' . $this->uuid;
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function gateway(): BelongsTo
    {
        return $this->belongsTo(Gateway::class);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeCancelled($query)
    {
        return $query->where('status', 'cancelled');
    }

    public function scopePastDue($query)
    {
        return $query->where('status', 'past_due');
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function isCancelled(): bool
    {
        return $this->status === 'cancelled';
    }

    public function cancel(): void
    {
        $this->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
        ]);
    }

    public function renew(): void
    {
        $this->update([
            'current_period_start' => $this->current_period_end,
            'current_period_end' => $this->current_period_end->addMonths($this->interval),
            'next_billing_date' => $this->current_period_end->addMonths($this->interval),
            'status' => 'active',
        ]);
    }
}
```
### Arquivo: app/Models/PaymentToken.php
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentToken extends Model
{
    protected $fillable = [
        'company_id',
        'customer_id',
        'gateway',
        'token',
        'brand',
        'last4',
        'expiry_month',
        'expiry_year',
        'is_default',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }
}
```
### Arquivo: app/Models/Transaction.php
```php
<?php

namespace App\Models;

use App\Models\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Transaction extends Model
{
    use HasUuid;

    // Transaction source identifiers
    const SOURCE_CHECKOUT = 'checkout';
    const SOURCE_BASILEIA_VENDAS = 'basileia_vendas';
    const SOURCE_DEFAULT_VENDOR = 'default_vendor';
    const SOURCE_LEGACY = 'legacy';

    protected $fillable = [
        'uuid',
        'company_id',
        'integration_id',
        'gateway_id',
        'customer_id',
        'external_id',
        'reference',
        'description',
        'amount',
        'net_amount',
        'currency',
        'payment_method',
        'installments',
        'status',
        'gateway_transaction_id',
        'gateway_response',
        'metadata',
        'ip_address',
        'user_agent',
        'paid_at',
        'cancelled_at',
        'refunded_at',
        'customer_name',
        'customer_email',
        'customer_document',
        'customer_phone',
        'customer_address',
        'fraud_score',
        'fraud_risk_level',
        'fraud_flags',
        'fraud_recommendation',
        'refunded_amount',
        'status_changed_at',
        'asaas_payment_id',
        'source',
        'callback_url',
        'asaas_customer_id',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'net_amount' => 'decimal:2',
        'installments' => 'integer',
        'gateway_response' => 'array',
        'metadata' => 'array',
        'paid_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    protected $appends = ['payment_url'];

    public function getPaymentUrlAttribute(): string
    {
        return config('app.url') . '/' . $this->uuid;
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function integration(): BelongsTo
    {
        return $this->belongsTo(Integration::class);
    }

    public function gateway(): BelongsTo
    {
        return $this->belongsTo(Gateway::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(TransactionItem::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function fraudAnalysis(): HasOne
    {
        return $this->hasOne(FraudAnalysis::class);
    }

    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    public function scopeByCompany($query, int $companyId)
    {
        return $query->where('company_id', $companyId);
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isRefused(): bool
    {
        return $this->status === 'refused';
    }

    public function isRefunded(): bool
    {
        return $this->status === 'refunded';
    }

    public function isCancelled(): bool
    {
        return $this->status === 'cancelled';
    }

    public function canBeCancelled(): bool
    {
        return in_array($this->status, ['pending', 'processing']);
    }

    public function canBeRefunded(): bool
    {
        return $this->status === 'approved';
    }

    /**
     * Get the max installments attribute with a safe default.
     */
    public function getMaxInstallmentsAttribute(): int
    {
        return (int) ($this->attributes['max_installments'] ?? 12);
    }
}
```
### Arquivo: app/Models/Event.php
```php
<?php

namespace App\Models;

use App\Models\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Event extends Model
{
    use HasUuid;

    protected $fillable = [
        'company_id', 'slug', 'titulo', 'descricao', 'valor', 'moeda',
        'vagas_total', 'vagas_ocupadas', 'whatsapp_vendedor',
        'metodo_pagamento', 'data_inicio', 'data_fim', 'status',
        'gateway_transaction_id',
    ];

    protected $casts = [
        'valor' => 'decimal:2',
        'vagas_total' => 'integer',
        'vagas_ocupadas' => 'integer',
        'data_inicio' => 'datetime',
        'data_fim' => 'datetime',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function isDisponivel(): bool
    {
        if ($this->status !== 'ativo') return false;
        if ($this->data_fim && now()->gt($this->data_fim)) return false;
        if ($this->vagas_ocupadas >= $this->vagas_total) return false;
        return true;
    }

    public function vagasRestantes(): int
    {
        return max(0, $this->vagas_total - $this->vagas_ocupadas);
    }

    public function incrementarVaga(): void
    {
        $this->increment('vagas_ocupadas');
        if ($this->vagas_ocupadas >= $this->vagas_total) {
            $this->update(['status' => 'esgotado']);
        }
    }

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($event) {
            if (empty($event->slug)) {
                $event->slug = \Illuminate\Support\Str::slug($event->titulo) . '-' . \Illuminate\Support\Str::random(6);
            }
        });
    }
}
```
### Arquivo: app/Models/Traits/HasUuid.php
```php
<?php

namespace App\Models\Traits;

use Illuminate\Support\Str;

trait HasUuid
{
    protected static function bootHasUuid()
    {
        static::creating(function ($model) {
            if (empty($model->uuid)) {
                $model->uuid = Str::uuid();
            }
        });
    }
}
```
### Arquivo: app/Models/TransactionItem.php
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TransactionItem extends Model
{
    protected $fillable = [
        'transaction_id',
        'name',
        'description',
        'quantity',
        'unit_price',
        'total',
        'metadata',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'unit_price' => 'decimal:2',
        'total' => 'decimal:2',
        'metadata' => 'array',
    ];

    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class);
    }

    public function calculateTotal(): void
    {
        $this->total = $this->quantity * $this->unit_price;
    }
}
```
### Arquivo: app/Models/CheckoutConfig.php
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
### Arquivo: app/Models/User.php
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $fillable = [
        'company_id',
        'name',
        'email',
        'password',
        'role',
        'status',
        'must_change_password',
        'password_changed_at',
        'failed_login_attempts',
        'locked_until',
        'two_factor_enabled',
        'two_factor_secret',
        'two_factor_codes',
        'last_auth_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'two_factor_enabled' => 'boolean',
        'must_change_password' => 'boolean',
        'password_changed_at' => 'datetime',
        'last_auth_at' => 'datetime',
        'locked_until' => 'datetime',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function auditLogs(): HasMany
    {
        return $this->hasMany(AuditLog::class);
    }

    public function reviewedFraudAnalyses(): HasMany
    {
        return $this->hasMany(FraudAnalysis::class, 'reviewed_by');
    }

    public function isSuperAdmin(): bool
    {
        return $this->role === 'super_admin';
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isOperator(): bool
    {
        return $this->role === 'operator';
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function needsPasswordChange(): bool
    {
        if ($this->must_change_password) {
            return true;
        }

        if (!$this->password_changed_at) {
            return true;
        }

        return $this->password_changed_at->diffInDays(now()) >= 15;
    }

    public function isPasswordExpired(): bool
    {
        if (!$this->password_changed_at) {
            return true;
        }

        return $this->password_changed_at->diffInDays(now()) >= 15;
    }
}
```
### Arquivo: app/Models/WebhookDelivery.php
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WebhookDelivery extends Model
{
    protected $fillable = [
        'endpoint_id',
        'event_type',
        'payload',
        'response_code',
        'response_body',
        'attempts',
        'max_attempts',
        'status',
        'next_retry_at',
        'delivered_at',
    ];

    protected $casts = [
        'payload' => 'array',
        'attempts' => 'integer',
        'max_attempts' => 'integer',
        'next_retry_at' => 'datetime',
        'delivered_at' => 'datetime',
    ];

    public function endpoint(): BelongsTo
    {
        return $this->belongsTo(WebhookEndpoint::class, 'endpoint_id');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    public function scopeDelivered($query)
    {
        return $query->where('status', 'delivered');
    }

    public function canRetry(): bool
    {
        return $this->attempts < $this->max_attempts && $this->status !== 'delivered';
    }
}
```
### Arquivo: app/Models/Payment.php
```php
<?php

namespace App\Models;

use App\Models\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    use HasUuid;

    protected $fillable = [
        'uuid',
        'transaction_id',
        'gateway_id',
        'amount',
        'currency',
        'payment_method',
        'status',
        'gateway_response',
        'gateway_transaction_id',
        'paid_at',
        'pix_expires_at',
        'boleto_expires_at',
        'boleto_url',
        'pix_qrcode',
        'card_last_digits',
        'card_brand',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'gateway_response' => 'array',
        'paid_at' => 'datetime',
        'pix_expires_at' => 'datetime',
        'boleto_expires_at' => 'datetime',
    ];

    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class);
    }

    public function gateway(): BelongsTo
    {
        return $this->belongsTo(Gateway::class);
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isPixExpired(): bool
    {
        return $this->pix_expires_at && $this->pix_expires_at->isPast();
    }

    public function isBoletoExpired(): bool
    {
        return $this->boleto_expires_at && $this->boleto_expires_at->isPast();
    }
}
```
### Arquivo: app/Models/SourceConfig.php
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SourceConfig extends Model
{
    protected $fillable = [
        'source_name',
        'callback_url',
        'webhook_secret',
        'active',
    ];

    protected $casts = [
        'active' => 'boolean',
    ];

    public function isActive(): bool
    {
        return $this->active;
    }
}```
### Arquivo: app/Models/Customer.php
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Customer extends Model
{
    protected $fillable = [
        'company_id',
        'external_id',
        'name',
        'email',
        'document',
        'phone',
        'address',
        'gateway_customer_id',
        'metadata',
    ];

    protected $casts = [
        'address' => 'array',
        'metadata' => 'array',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    public function scopeByDocument($query, string $document)
    {
        return $query->where('document', $document);
    }

    public function scopeByEmail($query, string $email)
    {
        return $query->where('email', $email);
    }
}
```
### Arquivo: app/Models/Company.php
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Company extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'domain',
        'api_key',
        'status',
        'settings',
    ];

    protected $casts = [
        'settings' => 'array',
    ];

    protected static function booted()
    {
        static::creating(function ($company) {
            if (empty($company->slug)) {
                $company->slug = Str::slug($company->name);
            }
            if (empty($company->api_key)) {
                $company->api_key = 'ck_live_' . Str::random(32);
            }
        });
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function integrations(): HasMany
    {
        return $this->hasMany(Integration::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    public function customers(): HasMany
    {
        return $this->hasMany(Customer::class);
    }

    public function gateways(): HasMany
    {
        return $this->hasMany(Gateway::class);
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    public function splitRules(): HasMany
    {
        return $this->hasMany(SplitRule::class);
    }

    public function auditLogs(): HasMany
    {
        return $this->hasMany(AuditLog::class);
    }

    public function financialReports(): HasMany
    {
        return $this->hasMany(FinancialReport::class);
    }

    public function defaultGateway()
    {
        return $this->gateways()->where('is_default', true)->first();
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }
}
```
### Arquivo: app/Models/WebhookEndpoint.php
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WebhookEndpoint extends Model
{
    protected $fillable = [
        'integration_id',
        'url',
        'secret_hash',
        'events',
        'status',
        'retry_count',
    ];

    protected $casts = [
        'events' => 'array',
        'retry_count' => 'integer',
    ];

    public function integration(): BelongsTo
    {
        return $this->belongsTo(Integration::class);
    }

    public function deliveries(): HasMany
    {
        return $this->hasMany(WebhookDelivery::class, 'endpoint_id');
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }
}
```
### Arquivo: app/Models/Integration.php
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Integration extends Model
{
    protected $fillable = [
        'company_id',
        'name',
        'slug',
        'base_url',
        'api_key_hash',
        'api_key_prefix',
        'permissions',
        'status',
        'webhook_url',
        'webhook_secret',
    ];

    protected $casts = [
        'permissions' => 'array',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function webhookEndpoints(): HasMany
    {
        return $this->hasMany(WebhookEndpoint::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }
}
```
### Arquivo: app/Models/FinancialReport.php
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FinancialReport extends Model
{
    protected $fillable = [
        'company_id',
        'type',
        'period_start',
        'period_end',
        'total_transactions',
        'total_amount',
        'total_net_amount',
        'total_fees',
        'total_refunded',
        'currency',
        'report_data',
        'generated_at',
    ];

    protected $casts = [
        'total_transactions' => 'integer',
        'total_amount' => 'decimal:2',
        'total_net_amount' => 'decimal:2',
        'total_fees' => 'decimal:2',
        'total_refunded' => 'decimal:2',
        'report_data' => 'array',
        'period_start' => 'datetime',
        'period_end' => 'datetime',
        'generated_at' => 'datetime',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('type', $type);
    }

    public function scopeByPeriod($query, $start, $end)
    {
        return $query->where('period_start', '>=', $start)
                     ->where('period_end', '<=', $end);
    }

    public function getGrossMarginAttribute(): float
    {
        if ($this->total_amount == 0) {
            return 0;
        }

        return round(($this->total_net_amount / $this->total_amount) * 100, 2);
    }
}
```
### Arquivo: app/Models/Gateway.php
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Gateway extends Model
{
    protected $fillable = [
        'company_id',
        'name',
        'slug',
        'type',
        'status',
        'is_default',
    ];

    protected $casts = [
        'is_default' => 'boolean',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function configs(): HasMany
    {
        return $this->hasMany(GatewayConfig::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    public function splitRules(): HasMany
    {
        return $this->hasMany(SplitRule::class);
    }

    public function getConfig(string $key, mixed $default = null): mixed
    {
        $config = $this->configs()->where('key', $key)->first();

        return $config ? $config->decrypted_value : $default;
    }

    public function setConfig(string $key, mixed $value): void
    {
        $this->configs()->updateOrCreate(
            ['key' => $key],
            ['value' => $value]
        );
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeDefault($query)
    {
        return $query->where('is_default', true);
    }
}
```
### Arquivo: app/Models/WebhookEvent.php
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WebhookEvent extends Model
{
    protected $fillable = [
        'company_id',
        'integration_id',
        'transaction_id',
        'event_type',
        'idempotency_key',
        'payload',
        'processed',
        'processed_at',
    ];

    protected $casts = [
        'payload' => 'array',
        'processed' => 'boolean',
        'processed_at' => 'datetime',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function scopePending($query)
    {
        return $query->where('processed', false);
    }

    public function scopeProcessed($query)
    {
        return $query->where('processed', true);
    }
}
```
### Arquivo: app/Models/FraudAnalysis.php
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FraudAnalysis extends Model
{
    protected $fillable = [
        'transaction_id',
        'reviewed_by',
        'score',
        'status',
        'flags',
        'recommendation',
        'analyzed_at',
        'reviewed_at',
    ];

    protected $casts = [
        'score' => 'integer',
        'flags' => 'array',
        'analyzed_at' => 'datetime',
        'reviewed_at' => 'datetime',
    ];

    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class);
    }

    public function reviewedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function isHighRisk(): bool
    {
        return $this->score >= 70;
    }

    public function isLowRisk(): bool
    {
        return $this->score < 30;
    }

    public function approve(): void
    {
        $this->update([
            'status' => 'approved',
            'reviewed_at' => now(),
        ]);
    }

    public function reject(): void
    {
        $this->update([
            'status' => 'rejected',
            'reviewed_at' => now(),
        ]);
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeHighRisk($query)
    {
        return $query->where('score', '>=', 70);
    }
}
```
### Arquivo: app/Models/GatewayConfig.php
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Crypt;

class GatewayConfig extends Model
{
    protected $fillable = [
        'gateway_id',
        'key',
        'value',
    ];

    public function gateway(): BelongsTo
    {
        return $this->belongsTo(Gateway::class);
    }

    public function getValueAttribute(?string $value): string
    {
        if (empty($value)) {
            return '';
        }

        try {
            return Crypt::decryptString($value);
        } catch (\Exception $e) {
            return 'ERROR: Could not decrypt (APP_KEY may have changed)';
        }
    }

    public function setValueAttribute(string $value): void
    {
        $this->attributes['value'] = Crypt::encryptString($value);
    }

    public function getDecryptedValueAttribute(): string
    {
        $value = $this->attributes['value'] ?? '';
        
        if (empty($value)) {
            return '';
        }

        try {
            return Crypt::decryptString($value);
        } catch (\Exception $e) {
            return 'ERROR: Could not decrypt (APP_KEY may have changed)';
        }
    }
}
```
### Arquivo: app/Models/AuditLog.php
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AuditLog extends Model
{
    protected $fillable = [
        'company_id',
        'user_id',
        'action',
        'model_type',
        'model_id',
        'old_values',
        'new_values',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
        'model_id' => 'integer',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeByAction($query, string $action)
    {
        return $query->where('action', $action);
    }

    public function scopeByModel($query, string $modelType, int $modelId)
    {
        return $query->where('model_type', $modelType)
                     ->where('model_id', $modelId);
    }

    public function scopeRecent($query, int $days = 30)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }
}
```
### Arquivo: app/Models/LoginAttempt.php
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LoginAttempt extends Model
{
    protected $table = 'login_attempts';

    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'email',
        'ip_address',
        'user_agent',
        'success',
        'failure_reason',
        'created_at',
    ];

    protected $casts = [
        'success' => 'boolean',
        'created_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}```
### Arquivo: app/Models/SplitRule.php
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SplitRule extends Model
{
    protected $fillable = [
        'company_id',
        'gateway_id',
        'name',
        'recipient',
        'percentage',
        'fixed_amount',
        'priority',
        'status',
    ];

    protected $casts = [
        'percentage' => 'decimal:2',
        'fixed_amount' => 'decimal:2',
        'priority' => 'integer',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function gateway(): BelongsTo
    {
        return $this->belongsTo(Gateway::class);
    }

    public function calculateSplit(float $totalAmount): float
    {
        $split = 0.0;

        if ($this->percentage > 0) {
            $split = $totalAmount * ($this->percentage / 100);
        }

        if ($this->fixed_amount > 0) {
            $split += $this->fixed_amount;
        }

        return round($split, 2);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeByPriority($query)
    {
        return $query->orderBy('priority', 'asc');
    }
}
```
### Arquivo: config/sanctum.php
```php
<?php

return [
    'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', sprintf(
        '%s%s',
        'localhost,localhost:3000,localhost:8080,127.0.0.1,127.0.0.1:8000,::1,secure.basileia.global,basileia.global',
        env('APP_URL') ? ','.parse_url(env('APP_URL'), PHP_URL_HOST) : ''
    ))),

    'guard' => ['web'],

    'expiration' => null,

    'middleware' => [
        'verify_csrf_token' => App\Http\Middleware\VerifyCsrfToken::class,
        'encrypt_cookies' => App\Http\Middleware\EncryptCookies::class,
    ],
];
```
### Arquivo: config/basileia.php
```php
<?php

return [
    'callback_url' => env('BASILEIA_VENDAS_WEBHOOK_URL', ''),
];```
### Arquivo: config/auth.php
```php
<?php

return [
    'defaults' => [
        'guard' => 'web',
        'passwords' => 'users',
    ],

    'guards' => [
        'web' => [
            'driver' => 'session',
            'provider' => 'users',
        ],
        'sanctum' => [
            'driver' => 'sanctum',
            'provider' => 'users',
        ],
    ],

    'providers' => [
        'users' => [
            'driver' => 'eloquent',
            'model' => App\Models\User::class,
        ],
    ],

    'passwords' => [
        'users' => [
            'provider' => 'users',
            'table' => 'password_reset_tokens',
            'expire' => 60,
            'throttle' => 60,
        ],
    ],

    'password_timeout' => env('AUTH_PASSWORD_TIMEOUT', 10800),
];
```
### Arquivo: config/app.php
```php
<?php

$appKey = env('APP_KEY');
$cipher = 'AES-256-CBC';

if ($appKey) {
    $tempKey = $appKey;
    if (str_starts_with($tempKey, 'base64:')) {
        $tempKey = base64_decode(substr($tempKey, 7));
    }
    if ($tempKey && mb_strlen($tempKey, '8bit') === 16) {
        $cipher = 'AES-128-CBC';
    }
}

return [

    'name' => 'Checkout',

    'env' => 'production',

    'debug' => true,

    'url' => env('APP_URL', 'http://localhost'),

    'asset_url' => env('ASSET_URL'),

    'timezone' => 'UTC',

    'locale' => 'en',

    'fallback_locale' => 'en',

    'faker_locale' => 'en_US',

    'key' => env('APP_KEY'),

    'cipher' => $cipher,

    'maintenance' => [
        'driver' => 'file',
    ],

    'providers' => [
        Illuminate\Auth\AuthServiceProvider::class,
        Illuminate\Broadcasting\BroadcastServiceProvider::class,
        Illuminate\Bus\BusServiceProvider::class,
        Illuminate\Cache\CacheServiceProvider::class,
        Illuminate\Foundation\Providers\ConsoleSupportServiceProvider::class,
        Illuminate\Cookie\CookieServiceProvider::class,
        Illuminate\Database\DatabaseServiceProvider::class,
        Illuminate\Encryption\EncryptionServiceProvider::class,
        Illuminate\Filesystem\FilesystemServiceProvider::class,
        Illuminate\Foundation\Providers\FoundationServiceProvider::class,
        Illuminate\Hashing\HashServiceProvider::class,
        Illuminate\Mail\MailServiceProvider::class,
        Illuminate\Notifications\NotificationServiceProvider::class,
        Illuminate\Pagination\PaginationServiceProvider::class,
        Illuminate\Auth\Passwords\PasswordResetServiceProvider::class,
        Illuminate\Pipeline\PipelineServiceProvider::class,
        Illuminate\Queue\QueueServiceProvider::class,
        Illuminate\Redis\RedisServiceProvider::class,
        Illuminate\Session\SessionServiceProvider::class,
        Illuminate\Translation\TranslationServiceProvider::class,
        Illuminate\Validation\ValidationServiceProvider::class,
        Illuminate\View\ViewServiceProvider::class,

        App\Providers\AppServiceProvider::class,
    ],

    'aliases' => [
        'App' => Illuminate\Support\Facades\App::class,
        'Arr' => Illuminate\Support\Arr::class,
        'Artisan' => Illuminate\Support\Facades\Artisan::class,
        'Auth' => Illuminate\Support\Facades\Auth::class,
        'Blade' => Illuminate\Support\Facades\Blade::class,
        'Broadcast' => Illuminate\Support\Facades\Broadcast::class,
        'Bus' => Illuminate\Support\Facades\Bus::class,
        'Cache' => Illuminate\Support\Facades\Cache::class,
        'Config' => Illuminate\Support\Facades\Config::class,
        'Cookie' => Illuminate\Support\Facades\Cookie::class,
        'Crypt' => Illuminate\Support\Facades\Crypt::class,
        'Date' => Illuminate\Support\Facades\Date::class,
        'DB' => Illuminate\Support\Facades\DB::class,
        'Eloquent' => Illuminate\Database\Eloquent\Model::class,
        'Event' => Illuminate\Support\Facades\Event::class,
        'File' => Illuminate\Support\Facades\File::class,
        'Gate' => Illuminate\Support\Facades\Gate::class,
        'Hash' => Illuminate\Support\Facades\Hash::class,
        'Http' => Illuminate\Support\Facades\Http::class,
        'Lang' => Illuminate\Support\Facades\Lang::class,
        'Log' => Illuminate\Support\Facades\Log::class,
        'Mail' => Illuminate\Support\Facades\Mail::class,
        'Notification' => Illuminate\Support\Facades\Notification::class,
        'Password' => Illuminate\Support\Facades\Password::class,
        'Queue' => Illuminate\Support\Facades\Queue::class,
        'RateLimiter' => Illuminate\Support\Facades\RateLimiter::class,
        'Redirect' => Illuminate\Support\Facades\Redirect::class,
        'Request' => Illuminate\Support\Facades\Request::class,
        'Response' => Illuminate\Support\Facades\Response::class,
        'Route' => Illuminate\Support\Facades\Route::class,
        'Schedule' => Illuminate\Support\Facades\Schedule::class,
        'Schema' => Illuminate\Support\Facades\Schema::class,
        'Session' => Illuminate\Support\Facades\Session::class,
        'Storage' => Illuminate\Support\Facades\Storage::class,
        'Str' => Illuminate\Support\Str::class,
        'URL' => Illuminate\Support\Facades\URL::class,
        'Validator' => Illuminate\Support\Facades\Validator::class,
        'View' => Illuminate\Support\Facades\View::class,
    ],

];```
### Arquivo: config/services.php
```php
<?php

return [
    'asaas' => [
        'api_key' => env('ASAAS_API_KEY'),
        'environment' => env('ASAAS_ENVIRONMENT', env('APP_ENV', 'sandbox')),
        'webhook_token' => env('ASAAS_WEBHOOK_TOKEN'),
        'base_url_production' => 'https://api.asaas.com/v3',
        'base_url_sandbox' => 'https://sandbox.asaas.com/api/v3',
    ],
    'stripe' => [
        'key' => env('STRIPE_KEY'),
        'secret' => env('STRIPE_SECRET'),
        'environment' => env('APP_ENV', 'sandbox'),
    ],
    'square' => [
        'access_token' => env('SQUARE_ACCESS_TOKEN'),
        'location_id' => env('SQUARE_LOCATION_ID'),
        'environment' => env('APP_ENV', 'sandbox'),
    ],
    'mercado_pago' => [
        'access_token' => env('MERCADOPAGO_ACCESS_TOKEN'),
        'environment' => env('APP_ENV', 'sandbox'),
    ],
];
```
### Arquivo: config/database.php
```php
<?php

use Illuminate\Support\Str;

return [

    'default' => env('DB_CONNECTION', 'pgsql'),

    'connections' => [

        'sqlite' => [
            'driver' => 'sqlite',
            'url' => env('DATABASE_URL'),
            'database' => env('DB_DATABASE', database_path('database.sqlite')),
            'prefix' => '',
            'foreign_key_constraints' => env('DB_FOREIGN_KEYS', true),
        ],

        'pgsql' => [
            'driver' => 'pgsql',
            'url' => env('DATABASE_URL'),
            'host' => env('DB_HOST', 'postgres'),
            'port' => env('DB_PORT', '5432'),
            'database' => env('DB_DATABASE', 'forge'),
            'username' => env('DB_USERNAME', 'forge'),
            'password' => env('DB_PASSWORD', ''),
            'charset' => 'utf8',
            'prefix' => '',
            'prefix_indexes' => true,
            'search_path' => 'public',
            'sslmode' => 'prefer',
        ],

    ],

    'migrations' => 'migrations',

    'redis' => [

        'client' => env('REDIS_CLIENT', 'phpredis'),

        'options' => [
            'cluster' => env('REDIS_CLUSTER', 'redis'),
            'prefix' => env('REDIS_PREFIX', Str::slug(env('APP_NAME', 'laravel'), '_').'_database_'),
        ],

        'default' => [
            'url' => env('REDIS_URL'),
            'host' => env('DB_HOST', 'postgres'),
            'port' => env('REDIS_PORT', '6379'),
            'database' => env('REDIS_DB', '0'),
        ],

        'cache' => [
            'url' => env('REDIS_URL'),
            'host' => env('DB_HOST', 'postgres'),
            'port' => env('REDIS_PORT', '6379'),
            'database' => env('REDIS_CACHE_DB', '1'),
        ],

    ],

];```
### Arquivo: config/cache.php
```php
<?php

use Illuminate\Support\Str;

return [
    'default' => env('CACHE_STORE', 'array'),

    'stores' => [
        'database' => [
            'driver' => 'database',
            'table' => 'cache',
            'connection' => null,
            'lock_connection' => null,
        ],

        'file' => [
            'driver' => 'file',
            'path' => storage_path('framework/cache/data'),
        ],

        'redis' => [
            'driver' => 'redis',
            'connection' => 'cache',
            'lock_connection' => 'default',
        ],
    ],

    'prefix' => env('CACHE_PREFIX', Str::slug(env('APP_NAME', 'checkout'), '_').'_cache_'),
];
```
### Arquivo: config/session.php
```php
<?php

use Illuminate\Support\Str;

return [
    'driver' => 'file',

    'lifetime' => 120,

    'lottery' => [2, 100],

    'cookie' => 'checkout_session',

    'path' => '/',

    'domain' => null,

    'secure' => env('SESSION_SECURE_COOKIE', true),

    'http_only' => true,

    'same_site' => 'lax',

    'partitioned' => false,
];```
### Arquivo: config/vendors.php
```php
<?php

return [
    'default' => [
        'name' => 'Default Vendor (Vendas)',
        'enabled' => true,
        'controller' => \App\Http\Controllers\Vendors\DefaultVendorController::class,
        'view' => 'checkout.premium',
        'settings' => [
            'gateway' => 'asaas',
            'payment_methods' => ['credit_card', 'pix', 'boleto'],
        ],
    ],

    'events' => [
        'name' => 'Events Vendor',
        'enabled' => true,
        'controller' => null,
        'view' => 'vendors.events.checkout',
        'settings' => [
            'gateway' => 'asaas',
            'payment_methods' => ['pix', 'credit_card'],
        ],
    ],
];```
### Arquivo: config/checkout.php
```php
<?php

return [
    'default_gateway' => env('DEFAULT_GATEWAY', 'asaas'),
    'supported_currencies' => ['BRL', 'USD', 'EUR'],
    'default_currency' => 'BRL',
    'webhook_retry_max_attempts' => 5,
    'webhook_retry_backoff_seconds' => [30, 60, 300, 1800, 7200],
    'fraud_score_threshold_review' => 40,
    'fraud_score_threshold_reject' => 70,
    'max_transaction_amount' => 100000,
    'api_rate_limit_per_minute' => 60,
];
```
### Arquivo: config/webhook.php
```php
<?php

return [
    'retry_max_attempts' => env('WEBHOOK_RETRY_MAX', 5),
    'retry_backoff' => [30, 60, 300, 1800, 7200],
    'timeout_seconds' => 30,
    'signature_header' => 'X-Checkout-Signature',
    'event_types' => [
        'payment.approved',
        'payment.refused',
        'payment.pending',
        'payment.overdue',
        'payment.refunded',
        'payment.chargeback',
        'boleto.generated',
        'pix.generated',
        'subscription.created',
        'subscription.cancelled',
        'subscription.renewed',
    ],
];
```
### Arquivo: config/gateways.php
```php
<?php

return [
    'asaas' => [
        'api_key' => config('services.asaas.api_key'),
        'environment' => config('services.asaas.environment'),
        'webhook_token' => config('services.asaas.webhook_token'),
    ],
];
```
### Arquivo: bootstrap/app.php
```php
<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        then: function () {
            // Webhook API routes
            Route::middleware('api')
                ->prefix('api')
                ->group(base_path('routes/webhook.php'));

            // Dashboard routes (auth, 2FA, admin panel)
            Route::middleware('web')
                ->group(base_path('routes/dashboard.php'));

            // Checkout routes (public checkout flows)
            Route::middleware('web')
                ->group(base_path('routes/checkout.php'));

            // Demo/debug routes (loaded only in local/staging)
            if (in_array(env('APP_ENV'), ['local', 'staging'])) {
                Route::middleware('web')
                    ->group(base_path('routes/demo.php'));
            }
        },
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->statefulApi();
        
        // Only trust all proxies in local/staging if needed, or better, specify them.
        if (env('APP_ENV') === 'production') {
            // $middleware->trustProxies(at: ['IP_DO_LOAD_BALANCER']);
        } else {
            $middleware->trustProxies(at: '*');
        }
        $middleware->alias([
            'api.auth' => \App\Http\Middleware\AuthenticateApi::class,
            '2fa' => \App\Http\Middleware\RequireTwoFactorAuth::class,
            'password.expiry' => \App\Http\Middleware\CheckPasswordExpiration::class,
            'enforce.2fa' => \App\Http\Middleware\EnforceTwoFactorAuth::class,
            'csrf' => \App\Http\Middleware\VerifyCsrfToken::class,
            'secure.token' => \App\Http\Middleware\EnforceSecureTokenization::class,
        ]);
        $middleware->web(append: [
            \App\Http\Middleware\SecurityHeaders::class,
        ]);
        $middleware->prepend(\App\Http\Middleware\HandleCors::class);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->report(function (\Throwable $e) {
            Log::error('Application Exception: ' . $e->getMessage(), [
                'exception' => get_class($e),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
            ]);
        });
        $exceptions->render(function (\Illuminate\Auth\AuthenticationException $e, Request $request) {
            if ($request->expectsJson()) {
                Log::warning('AuthenticationException thrown for API request', [
                    'url' => $request->fullUrl(),
                    'method' => $request->method(),
                    'ip' => $request->ip(),
                    'headers' => $request->headers->all(),
                    'trace' => $e->getTraceAsString(),
                ]);
                return response()->json([
                    'message' => 'Unauthenticated.',
                ], Response::HTTP_UNAUTHORIZED);
            }
        });
    })->create();
```
### Arquivo: bootstrap/cache/services.php
```php
<?php return array (
  'providers' => 
  array (
    0 => 'Illuminate\\Auth\\AuthServiceProvider',
    1 => 'Illuminate\\Broadcasting\\BroadcastServiceProvider',
    2 => 'Illuminate\\Bus\\BusServiceProvider',
    3 => 'Illuminate\\Cache\\CacheServiceProvider',
    4 => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    5 => 'Illuminate\\Cookie\\CookieServiceProvider',
    6 => 'Illuminate\\Database\\DatabaseServiceProvider',
    7 => 'Illuminate\\Encryption\\EncryptionServiceProvider',
    8 => 'Illuminate\\Filesystem\\FilesystemServiceProvider',
    9 => 'Illuminate\\Foundation\\Providers\\FoundationServiceProvider',
    10 => 'Illuminate\\Hashing\\HashServiceProvider',
    11 => 'Illuminate\\Mail\\MailServiceProvider',
    12 => 'Illuminate\\Notifications\\NotificationServiceProvider',
    13 => 'Illuminate\\Pagination\\PaginationServiceProvider',
    14 => 'Illuminate\\Auth\\Passwords\\PasswordResetServiceProvider',
    15 => 'Illuminate\\Pipeline\\PipelineServiceProvider',
    16 => 'Illuminate\\Queue\\QueueServiceProvider',
    17 => 'Illuminate\\Redis\\RedisServiceProvider',
    18 => 'Illuminate\\Session\\SessionServiceProvider',
    19 => 'Illuminate\\Translation\\TranslationServiceProvider',
    20 => 'Illuminate\\Validation\\ValidationServiceProvider',
    21 => 'Illuminate\\View\\ViewServiceProvider',
    22 => 'Laravel\\Pail\\PailServiceProvider',
    23 => 'Laravel\\Sanctum\\SanctumServiceProvider',
    24 => 'Laravel\\Tinker\\TinkerServiceProvider',
    25 => 'Carbon\\Laravel\\ServiceProvider',
    26 => 'NunoMaduro\\Collision\\Adapters\\Laravel\\CollisionServiceProvider',
    27 => 'Termwind\\Laravel\\TermwindServiceProvider',
    28 => 'SimpleSoftwareIO\\QrCode\\QrCodeServiceProvider',
    29 => 'App\\Providers\\AppServiceProvider',
    30 => 'App\\Providers\\AppServiceProvider',
  ),
  'eager' => 
  array (
    0 => 'Illuminate\\Auth\\AuthServiceProvider',
    1 => 'Illuminate\\Cookie\\CookieServiceProvider',
    2 => 'Illuminate\\Database\\DatabaseServiceProvider',
    3 => 'Illuminate\\Encryption\\EncryptionServiceProvider',
    4 => 'Illuminate\\Filesystem\\FilesystemServiceProvider',
    5 => 'Illuminate\\Foundation\\Providers\\FoundationServiceProvider',
    6 => 'Illuminate\\Notifications\\NotificationServiceProvider',
    7 => 'Illuminate\\Pagination\\PaginationServiceProvider',
    8 => 'Illuminate\\Session\\SessionServiceProvider',
    9 => 'Illuminate\\View\\ViewServiceProvider',
    10 => 'Laravel\\Pail\\PailServiceProvider',
    11 => 'Laravel\\Sanctum\\SanctumServiceProvider',
    12 => 'Carbon\\Laravel\\ServiceProvider',
    13 => 'NunoMaduro\\Collision\\Adapters\\Laravel\\CollisionServiceProvider',
    14 => 'Termwind\\Laravel\\TermwindServiceProvider',
    15 => 'SimpleSoftwareIO\\QrCode\\QrCodeServiceProvider',
    16 => 'App\\Providers\\AppServiceProvider',
    17 => 'App\\Providers\\AppServiceProvider',
  ),
  'deferred' => 
  array (
    'Illuminate\\Broadcasting\\BroadcastManager' => 'Illuminate\\Broadcasting\\BroadcastServiceProvider',
    'Illuminate\\Contracts\\Broadcasting\\Factory' => 'Illuminate\\Broadcasting\\BroadcastServiceProvider',
    'Illuminate\\Contracts\\Broadcasting\\Broadcaster' => 'Illuminate\\Broadcasting\\BroadcastServiceProvider',
    'Illuminate\\Bus\\Dispatcher' => 'Illuminate\\Bus\\BusServiceProvider',
    'Illuminate\\Contracts\\Bus\\Dispatcher' => 'Illuminate\\Bus\\BusServiceProvider',
    'Illuminate\\Contracts\\Bus\\QueueingDispatcher' => 'Illuminate\\Bus\\BusServiceProvider',
    'Illuminate\\Bus\\BatchRepository' => 'Illuminate\\Bus\\BusServiceProvider',
    'Illuminate\\Bus\\DatabaseBatchRepository' => 'Illuminate\\Bus\\BusServiceProvider',
    'cache' => 'Illuminate\\Cache\\CacheServiceProvider',
    'cache.store' => 'Illuminate\\Cache\\CacheServiceProvider',
    'cache.psr6' => 'Illuminate\\Cache\\CacheServiceProvider',
    'memcached.connector' => 'Illuminate\\Cache\\CacheServiceProvider',
    'Illuminate\\Cache\\RateLimiter' => 'Illuminate\\Cache\\CacheServiceProvider',
    'Illuminate\\Foundation\\Console\\AboutCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Cache\\Console\\ClearCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Cache\\Console\\ForgetCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Foundation\\Console\\ClearCompiledCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Auth\\Console\\ClearResetsCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Foundation\\Console\\ConfigCacheCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Foundation\\Console\\ConfigClearCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Foundation\\Console\\ConfigShowCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Database\\Console\\DbCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Database\\Console\\MonitorCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Database\\Console\\PruneCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Database\\Console\\ShowCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Database\\Console\\TableCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Database\\Console\\WipeCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Foundation\\Console\\DownCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Foundation\\Console\\EnvironmentCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Foundation\\Console\\EnvironmentDecryptCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Foundation\\Console\\EnvironmentEncryptCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Foundation\\Console\\EventCacheCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Foundation\\Console\\EventClearCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Foundation\\Console\\EventListCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Concurrency\\Console\\InvokeSerializedClosureCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Foundation\\Console\\KeyGenerateCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Foundation\\Console\\OptimizeCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Foundation\\Console\\OptimizeClearCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Foundation\\Console\\PackageDiscoverCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Cache\\Console\\PruneStaleTagsCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Queue\\Console\\ClearCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Queue\\Console\\ListFailedCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Queue\\Console\\FlushFailedCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Queue\\Console\\ForgetFailedCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Queue\\Console\\ListenCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Queue\\Console\\MonitorCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Queue\\Console\\PauseCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Queue\\Console\\PruneBatchesCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Queue\\Console\\PruneFailedJobsCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Queue\\Console\\RestartCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Queue\\Console\\ResumeCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Queue\\Console\\RetryCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Queue\\Console\\RetryBatchCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Queue\\Console\\WorkCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Foundation\\Console\\ReloadCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Foundation\\Console\\RouteCacheCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Foundation\\Console\\RouteClearCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Foundation\\Console\\RouteListCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Database\\Console\\DumpCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Database\\Console\\Seeds\\SeedCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Console\\Scheduling\\ScheduleFinishCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Console\\Scheduling\\ScheduleListCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Console\\Scheduling\\ScheduleRunCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Console\\Scheduling\\ScheduleClearCacheCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Console\\Scheduling\\ScheduleTestCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Console\\Scheduling\\ScheduleWorkCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Console\\Scheduling\\ScheduleInterruptCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Database\\Console\\ShowModelCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Foundation\\Console\\StorageLinkCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Foundation\\Console\\StorageUnlinkCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Foundation\\Console\\UpCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Foundation\\Console\\ViewCacheCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Foundation\\Console\\ViewClearCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Foundation\\Console\\ApiInstallCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Foundation\\Console\\BroadcastingInstallCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Cache\\Console\\CacheTableCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Foundation\\Console\\CastMakeCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Foundation\\Console\\ChannelListCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Foundation\\Console\\ChannelMakeCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Foundation\\Console\\ClassMakeCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Foundation\\Console\\ComponentMakeCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Foundation\\Console\\ConfigMakeCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Foundation\\Console\\ConfigPublishCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Foundation\\Console\\ConsoleMakeCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Routing\\Console\\ControllerMakeCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Foundation\\Console\\DocsCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Foundation\\Console\\EnumMakeCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Foundation\\Console\\EventGenerateCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Foundation\\Console\\EventMakeCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Foundation\\Console\\ExceptionMakeCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Database\\Console\\Factories\\FactoryMakeCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Foundation\\Console\\InterfaceMakeCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Foundation\\Console\\JobMakeCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Foundation\\Console\\JobMiddlewareMakeCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Foundation\\Console\\LangPublishCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Foundation\\Console\\ListenerMakeCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Foundation\\Console\\MailMakeCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Routing\\Console\\MiddlewareMakeCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Foundation\\Console\\ModelMakeCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Foundation\\Console\\NotificationMakeCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Notifications\\Console\\NotificationTableCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Foundation\\Console\\ObserverMakeCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Foundation\\Console\\PolicyMakeCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Foundation\\Console\\ProviderMakeCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Queue\\Console\\FailedTableCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Queue\\Console\\TableCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Queue\\Console\\BatchesTableCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Foundation\\Console\\RequestMakeCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Foundation\\Console\\ResourceMakeCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Foundation\\Console\\RuleMakeCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Foundation\\Console\\ScopeMakeCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Database\\Console\\Seeds\\SeederMakeCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Session\\Console\\SessionTableCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Foundation\\Console\\ServeCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Foundation\\Console\\StubPublishCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Foundation\\Console\\TestMakeCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Foundation\\Console\\TraitMakeCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Foundation\\Console\\VendorPublishCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Foundation\\Console\\ViewMakeCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'migrator' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'migration.repository' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'migration.creator' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Database\\Migrations\\Migrator' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Database\\Console\\Migrations\\MigrateCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Database\\Console\\Migrations\\FreshCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Database\\Console\\Migrations\\InstallCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Database\\Console\\Migrations\\RefreshCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Database\\Console\\Migrations\\ResetCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Database\\Console\\Migrations\\RollbackCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Database\\Console\\Migrations\\StatusCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'Illuminate\\Database\\Console\\Migrations\\MigrateMakeCommand' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'composer' => 'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider',
    'hash' => 'Illuminate\\Hashing\\HashServiceProvider',
    'hash.driver' => 'Illuminate\\Hashing\\HashServiceProvider',
    'mail.manager' => 'Illuminate\\Mail\\MailServiceProvider',
    'mailer' => 'Illuminate\\Mail\\MailServiceProvider',
    'Illuminate\\Mail\\Markdown' => 'Illuminate\\Mail\\MailServiceProvider',
    'auth.password' => 'Illuminate\\Auth\\Passwords\\PasswordResetServiceProvider',
    'auth.password.broker' => 'Illuminate\\Auth\\Passwords\\PasswordResetServiceProvider',
    'Illuminate\\Contracts\\Pipeline\\Hub' => 'Illuminate\\Pipeline\\PipelineServiceProvider',
    'pipeline' => 'Illuminate\\Pipeline\\PipelineServiceProvider',
    'queue' => 'Illuminate\\Queue\\QueueServiceProvider',
    'queue.connection' => 'Illuminate\\Queue\\QueueServiceProvider',
    'queue.failer' => 'Illuminate\\Queue\\QueueServiceProvider',
    'queue.listener' => 'Illuminate\\Queue\\QueueServiceProvider',
    'queue.worker' => 'Illuminate\\Queue\\QueueServiceProvider',
    'redis' => 'Illuminate\\Redis\\RedisServiceProvider',
    'redis.connection' => 'Illuminate\\Redis\\RedisServiceProvider',
    'translator' => 'Illuminate\\Translation\\TranslationServiceProvider',
    'translation.loader' => 'Illuminate\\Translation\\TranslationServiceProvider',
    'validator' => 'Illuminate\\Validation\\ValidationServiceProvider',
    'validation.presence' => 'Illuminate\\Validation\\ValidationServiceProvider',
    'Illuminate\\Contracts\\Validation\\UncompromisedVerifier' => 'Illuminate\\Validation\\ValidationServiceProvider',
    'command.tinker' => 'Laravel\\Tinker\\TinkerServiceProvider',
  ),
  'when' => 
  array (
    'Illuminate\\Broadcasting\\BroadcastServiceProvider' => 
    array (
    ),
    'Illuminate\\Bus\\BusServiceProvider' => 
    array (
    ),
    'Illuminate\\Cache\\CacheServiceProvider' => 
    array (
    ),
    'Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider' => 
    array (
    ),
    'Illuminate\\Hashing\\HashServiceProvider' => 
    array (
    ),
    'Illuminate\\Mail\\MailServiceProvider' => 
    array (
    ),
    'Illuminate\\Auth\\Passwords\\PasswordResetServiceProvider' => 
    array (
    ),
    'Illuminate\\Pipeline\\PipelineServiceProvider' => 
    array (
    ),
    'Illuminate\\Queue\\QueueServiceProvider' => 
    array (
    ),
    'Illuminate\\Redis\\RedisServiceProvider' => 
    array (
    ),
    'Illuminate\\Translation\\TranslationServiceProvider' => 
    array (
    ),
    'Illuminate\\Validation\\ValidationServiceProvider' => 
    array (
    ),
    'Laravel\\Tinker\\TinkerServiceProvider' => 
    array (
    ),
  ),
);```
### Arquivo: bootstrap/cache/packages.php
```php
<?php return array (
  'laravel/pail' => 
  array (
    'providers' => 
    array (
      0 => 'Laravel\\Pail\\PailServiceProvider',
    ),
  ),
  'laravel/sanctum' => 
  array (
    'providers' => 
    array (
      0 => 'Laravel\\Sanctum\\SanctumServiceProvider',
    ),
  ),
  'laravel/tinker' => 
  array (
    'providers' => 
    array (
      0 => 'Laravel\\Tinker\\TinkerServiceProvider',
    ),
  ),
  'nesbot/carbon' => 
  array (
    'providers' => 
    array (
      0 => 'Carbon\\Laravel\\ServiceProvider',
    ),
  ),
  'nunomaduro/collision' => 
  array (
    'providers' => 
    array (
      0 => 'NunoMaduro\\Collision\\Adapters\\Laravel\\CollisionServiceProvider',
    ),
  ),
  'nunomaduro/termwind' => 
  array (
    'providers' => 
    array (
      0 => 'Termwind\\Laravel\\TermwindServiceProvider',
    ),
  ),
  'simplesoftwareio/simple-qrcode' => 
  array (
    'aliases' => 
    array (
      'QrCode' => 'SimpleSoftwareIO\\QrCode\\Facades\\QrCode',
    ),
    'providers' => 
    array (
      0 => 'SimpleSoftwareIO\\QrCode\\QrCodeServiceProvider',
    ),
  ),
);```
### Arquivo: bootstrap/providers.php
```php
<?php

return [
    App\Providers\AppServiceProvider::class,
];
```
