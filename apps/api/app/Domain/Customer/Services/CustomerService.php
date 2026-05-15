<?php

namespace App\Domain\Customer\Services;

use App\Models\Company;
use App\Models\Customer;
use Illuminate\Support\Str;

class CustomerService
{
    public function firstOrCreate(Company $company, array $data): ?Customer
    {
        if (empty($data['email']) && empty($data['document'])) {
            return null; // Can't uniquely identify without email or document
        }

        $query = Customer::where('company_id', $company->id);

        if (!empty($data['email'])) {
            $query->where('email', $data['email']);
        } elseif (!empty($data['document'])) {
            $query->where('document', $data['document']);
        }

        $customer = $query->first();

        if ($customer) {
            // Update missing fields
            $updateData = [];
            if (empty($customer->name) && !empty($data['name'])) {
                $updateData['name'] = $data['name'];
            }
            if (empty($customer->phone) && !empty($data['phone'])) {
                $updateData['phone'] = $data['phone'];
            }
            if (!empty($updateData)) {
                $customer->update($updateData);
            }
            return $customer;
        }

        return Customer::create([
            'uuid'          => Str::uuid(),
            'company_id'    => $company->id,
            'name'          => $data['name'] ?? null,
            'email'         => $data['email'] ?? null,
            'document'      => $data['document'] ?? null,
            'document_type' => $data['document_type'] ?? null,
            'phone'         => $data['phone'] ?? null,
            'metadata'      => [],
        ]);
    }
}
