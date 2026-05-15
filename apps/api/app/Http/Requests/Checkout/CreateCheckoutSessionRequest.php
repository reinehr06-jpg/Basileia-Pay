<?php

namespace App\Http\Requests\Checkout;

use Illuminate\Foundation\Http\FormRequest;

class CreateCheckoutSessionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'checkout_id'       => 'required|integer|exists:checkout_experiences,id',
            'amount'            => 'required|integer|min:100', // centavos
            'currency'          => 'nullable|string|size:3',
            'method'            => 'nullable|string|in:pix,credit_card,boleto',
            'external_order_id' => 'nullable|string|max:255',
            'customer'          => 'nullable|array',
            'customer.name'     => 'required_with:customer|string|max:255',
            'customer.email'    => 'required_with:customer|email|max:255',
            'customer.document' => 'nullable|string|max:20',
            'items'             => 'nullable|array',
            'discount_amount'   => 'nullable|integer|min:0',
            'metadata'          => 'nullable|array',
        ];
    }
}
