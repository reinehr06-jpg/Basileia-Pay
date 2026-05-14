<?php

namespace App\Services;

use App\Models\Company;
use App\Models\Customer;
use App\Services\Gateway\GatewayInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class CustomerService
{
    public function create(array $data, Company $company): Customer
    {
        return DB::transaction(function () use ($data, $company) {
            if (!empty($data['document'])) {
                $data['document'] = preg_replace('/\D/', '', $data['document']);
            }

            return Customer::create([
                'company_id' => $company->id,
                'name' => $data['name'],
                'email' => $data['email'] ?? null,
                'document' => $data['document'] ?? null,
                'phone' => $data['phone'] ?? null,
                'address' => $data['address'] ?? null,
                'address_number' => $data['address_number'] ?? null,
                'complement' => $data['complement'] ?? null,
                'neighborhood' => $data['neighborhood'] ?? null,
                'city' => $data['city'] ?? null,
                'state' => $data['state'] ?? null,
                'zip_code' => $data['zip_code'] ?? null,
                'metadata' => $data['metadata'] ?? null,
            ]);
        });
    }

    public function findOrCreate(array $data, Company $company): Customer
    {
        $document = !empty($data['document']) ? preg_replace('/\D/', '', $data['document']) : null;

        $customer = $company->customers()
            ->when($document, function ($query) use ($document) {
                $query->where('document', $document);
            })
            ->when(!$document && !empty($data['email']), function ($query) use ($data) {
                $query->where('email', $data['email']);
            })
            ->first();

        if ($customer) {
            return $this->update($customer, $data);
        }

        return $this->create($data, $company);
    }

    public function getById(string $id, Company $company): Customer
    {
        $customer = $company->customers()->where('uuid', $id)->first();

        if (!$customer) {
            throw new RuntimeException("Customer [{$id}] not found.");
        }

        return $customer;
    }

    public function list(Company $company, array $filters): Builder
    {
        $query = $company->customers()->orderByDesc('created_at');

        if (!empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $search = $filters['search'];
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('document', 'like', "%{$search}%")
                    ->orWhere('uuid', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['email'])) {
            $query->where('email', $filters['email']);
        }

        if (!empty($filters['document'])) {
            $query->where('document', preg_replace('/\D/', '', $filters['document']));
        }

        return $query;
    }

    public function update(Customer $customer, array $data): Customer
    {
        if (!empty($data['document'])) {
            $data['document'] = preg_replace('/\D/', '', $data['document']);
        }

        $customer->update([
            'name' => $data['name'] ?? $customer->name,
            'email' => $data['email'] ?? $customer->email,
            'document' => $data['document'] ?? $customer->document,
            'phone' => $data['phone'] ?? $customer->phone,
            'address' => $data['address'] ?? $customer->address,
            'address_number' => $data['address_number'] ?? $customer->address_number,
            'complement' => $data['complement'] ?? $customer->complement,
            'neighborhood' => $data['neighborhood'] ?? $customer->neighborhood,
            'city' => $data['city'] ?? $customer->city,
            'state' => $data['state'] ?? $customer->state,
            'zip_code' => $data['zip_code'] ?? $customer->zip_code,
            'metadata' => $data['metadata'] ?? $customer->metadata,
        ]);

        return $customer->fresh();
    }

    public function syncWithGateway(Customer $customer, GatewayInterface $gateway): void
    {
        $response = $gateway->createCustomer([
            'name' => $customer->name,
            'document' => $customer->document,
            'email' => $customer->email,
            'phone' => $customer->phone,
            'address' => $customer->address,
            'address_number' => $customer->address_number,
            'state' => $customer->state,
            'zip_code' => $customer->zip_code,
            'external_reference' => $customer->uuid,
        ]);

        $customer->update([
            'gateway_id' => $response['id'],
            'gateway_data' => $response,
        ]);
    }
}
