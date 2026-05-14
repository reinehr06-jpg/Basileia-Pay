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
