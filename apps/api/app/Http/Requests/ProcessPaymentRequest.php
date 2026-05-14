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
            'card_token'     => 'required_if:payment_method,credit_card,debit_card|string|uuid',
            'card_last4'     => 'nullable|string|size:4',
            'card_brand'     => 'nullable|string|max:20',
            'installments'   => 'nullable|integer|min:1|max:12',
            // Opcional: holder_name pode vir no root se for credit_card
            'card_holder_name' => 'required_if:payment_method,credit_card,debit_card|string',
        ];
    }

    public function messages(): array
    {
        return [
            'payment_method.required' => 'The payment method is required.',
            'payment_method.in' => 'The payment method must be one of: pix, boleto, credit_card, debit_card.',
            'card_token.required_if' => 'The card token is required for credit or debit card payments.',
            'card_token.uuid' => 'The card token must be a valid UUID.',
            'card_holder_name.required_if' => 'The card holder name is required for credit or debit card payments.',
            'installments.max' => 'The installments cannot exceed 12.',
        ];
    }
}
