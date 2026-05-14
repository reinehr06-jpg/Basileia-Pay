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
