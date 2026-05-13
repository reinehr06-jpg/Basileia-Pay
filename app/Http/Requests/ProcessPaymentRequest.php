<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProcessPaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Se houver UUID na rota, garantir que a transação existe e está pendente
        // O lockForUpdate será aplicado na camada de serviço dentro de DB::transaction()
        if ($uuid = $this->route('uuid')) {
            $transaction = \App\Models\Transaction::where('uuid', $uuid)
                ->first();

            if (!$transaction || $transaction->status !== 'pending') {
                return false;
            }
        }
        return true;
    }

    public function rules(): array
    {
        return [
            'payment_method' => 'required|in:pix,boleto,credit_card,debit_card',
            'card' => 'required_if:payment_method,credit_card,debit_card|array',
            'card.number' => 'required_with:card|string',
            'card.holder_name' => 'required_with:card|string',
            'card.expiry_month' => 'required_with:card|string',
            'card.expiry_year' => 'required_with:card|string',
            'card.cvv' => 'required_with:card|string',
            'installments' => 'nullable|integer|min:1|max:12',
        ];
    }

    public function messages(): array
    {
        return [
            'payment_method.required' => 'The payment method is required.',
            'payment_method.in' => 'The payment method must be one of: pix, boleto, credit_card, debit_card.',
            'card.required_if' => 'Card details are required for credit or debit card payments.',
            'card.number.required_with' => 'The card number is required.',
            'card.holder_name.required_with' => 'The card holder name is required.',
            'card.expiry_month.required_with' => 'The card expiry month is required.',
            'card.expiry_year.required_with' => 'The card expiry year is required.',
            'card.cvv.required_with' => 'The card CVV is required.',
            'installments.max' => 'The installments cannot exceed 12.',
        ];
    }
}
