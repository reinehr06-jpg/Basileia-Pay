<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\CustomerService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class CustomerController extends Controller
{
    public function __construct(private CustomerService $customerService)
    {
    }

    public function index(Request $request)
    {
        $request->validate([
            'search' => 'sometimes|string|max:255',
            'per_page' => 'sometimes|integer|min:1|max:100',
        ]);

        $integration = $request->attributes->get('integration');

        $customers = $this->customerService->listPaginated(
            $integration,
            $request->input('search'),
            $request->input('per_page', 15)
        );

        return response()->json($customers);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'document' => 'required|string|max:20',
            'phone' => 'sometimes|string|max:20',
            'address' => 'sometimes|array',
            'address.zipcode' => 'required_with:address|string|max:10',
            'address.street' => 'required_with:address|string|max:255',
            'address.number' => 'required_with:address|string|max:20',
            'address.complement' => 'sometimes|string|max:255',
            'address.neighborhood' => 'required_with:address|string|max:255',
            'address.city' => 'required_with:address|string|max:255',
            'address.state' => 'required_with:address|string|max:2',
        ]);

        $integration = $request->attributes->get('integration');

        $customer = $this->customerService->create($request->validated(), $integration);

        return response()->json([
            'customer' => $customer,
        ], Response::HTTP_CREATED);
    }

    public function show(Request $request, int $id)
    {
        $integration = $request->attributes->get('integration');

        $customer = $this->customerService->findById($id, $integration);

        if (!$customer) {
            return response()->json(['message' => 'Cliente não encontrado.'], Response::HTTP_NOT_FOUND);
        }

        return response()->json([
            'customer' => $customer->load('transactions'),
        ]);
    }

    public function update(Request $request, int $id)
    {
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|max:255',
            'document' => 'sometimes|string|max:20',
            'phone' => 'sometimes|string|max:20',
            'address' => 'sometimes|array',
        ]);

        $integration = $request->attributes->get('integration');

        $customer = $this->customerService->update($id, $request->validated(), $integration);

        if (!$customer) {
            return response()->json(['message' => 'Cliente não encontrado.'], Response::HTTP_NOT_FOUND);
        }

        return response()->json([
            'customer' => $customer,
        ]);
    }
}
