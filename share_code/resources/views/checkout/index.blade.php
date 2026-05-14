{{-- resources/views/checkout/index.blade.php --}}
{{-- Checkout principal — agora estende o layout compartilhado --}}
@extends('checkout._layout')

@section('title', ($plano ?? $transaction->description ?? 'Checkout') . ' - Checkout')

@section('currency-symbol')
    <span x-text="currencySymbol"></span>
@endsection

@section('features')
    <div class="info-feature">
        <div class="info-feature-check">
            <svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
                <path d="M20 6L9 17l-5-5" />
            </svg>
        </div>
        <div class="info-feature-text">
            <div class="info-feature-title">Acesso imediato ao painel</div>
            <div class="info-feature-desc">Credenciais enviadas no seu e-mail.</div>
        </div>
    </div>
    <div class="info-feature">
        <div class="info-feature-check">
            <svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
                <path d="M20 6L9 17l-5-5" />
            </svg>
        </div>
        <div class="info-feature-text">
            <div class="info-feature-title">Assistente IA no WhatsApp</div>
            <div class="info-feature-desc">Atenda membros 24h com inteligência artificial.</div>
        </div>
    </div>
    <div class="info-feature">
        <div class="info-feature-check">
            <svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
                <path d="M20 6L9 17l-5-5" />
            </svg>
        </div>
        <div class="info-feature-text">
            <div class="info-feature-title">Gestão completa de membros</div>
            <div class="info-feature-desc">Cadastros, trilha de crescimento e árvore genealógica.</div>
        </div>
    </div>
    <div class="info-feature">
        <div class="info-feature-check">
            <svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
                <path d="M20 6L9 17l-5-5" />
            </svg>
        </div>
        <div class="info-feature-text">
            <div class="info-feature-title">Renovação automática</div>
            <div class="info-feature-desc">Sem surpresas. Cancele quando quiser.</div>
        </div>
    </div>
@endsection

@section('payment-content')
    <x-card-form :action="route('checkout.process', $transaction->uuid)" :transaction="$transaction"
        :customer-data="$customerData" :show-installments="true" :max-installments="$transaction->max_installments ?? 12"
        :amount="$transaction->amount ?? 0" />
@endsection