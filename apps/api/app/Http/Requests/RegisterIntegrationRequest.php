<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RegisterIntegrationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'base_url' => 'required|url',
            'permissions' => 'nullable|array',
            'permissions.*' => 'string|in:transactions.create,transactions.read,transactions.update,transactions.cancel,payments.process,customers.create,customers.read',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'The integration name is required.',
            'name.max' => 'The integration name cannot exceed 255 characters.',
            'base_url.required' => 'The base URL is required.',
            'base_url.url' => 'The base URL must be a valid URL.',
            'permissions.*.in' => 'Invalid permission. Allowed: transactions.create, transactions.read, transactions.update, transactions.cancel, payments.process, customers.create, customers.read.',
        ];
    }
}
