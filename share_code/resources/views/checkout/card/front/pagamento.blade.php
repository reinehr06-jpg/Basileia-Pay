{{-- resources/views/checkout/card/front/pagamento.blade.php --}}
@extends('checkout._layout')

@section('title', ($plano ?? $transaction->description ?? 'Checkout') . ' - Checkout')

@section('payment-content')
    <x-card-form 
        :action="route('checkout.process', $transaction->uuid)" 
        :transaction="$transaction"
        :customer-data="$customerData" 
        :show-installments="true" 
        :max-installments="$transaction->max_installments ?? 12"
        :amount="$transaction->amount ?? 0" 
    />
@endsection
