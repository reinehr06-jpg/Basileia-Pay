<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'amount' => 'required|numeric|min:0.01',
            'payment_method' => 'required|in:pix,boleto,credit_card,debit_card',
            'customer' => 'required|array',
            'customer.name' => 'required|string|max:255',
            'customer.email' => 'nullable|email',
            'customer.document' => 'nullable|string',
            'items' => 'nullable|array',
            'items.*.name' => 'required_with:items|string',
            'items.*.quantity' => 'required_with:items|integer|min:1',
            'items.*.unit_price' => 'required_with:items|numeric|min:0',
            'installments' => 'nullable|integer|min:1|max:12',
            'metadata' => 'nullable|array',
        ];
    }

    public function messages(): array
    {
        return [
            'amount.required' => 'The amount field is required.',
            'amount.min' => 'The amount must be at least 0.01.',
            'payment_method.required' => 'The payment method is required.',
            'payment_method.in' => 'The payment method must be one of: pix, boleto, credit_card, debit_card.',
            'customer.required' => 'The customer field is required.',
            'customer.name.required' => 'The customer name is required.',
            'customer.email.email' => 'The customer email must be a valid email address.',
            'installments.max' => 'The installments cannot exceed 12.',
        ];
    }
}
