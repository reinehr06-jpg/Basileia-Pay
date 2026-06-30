<?php

namespace App\Http\Controllers;

use App\Models\Checkout;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CheckoutController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(
            $request->user()->checkouts()->get()
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'config' => 'nullable|array',
        ]);

        $checkout = clone $request->user()->checkouts()->create([
            'name' => $validated['name'],
            'config' => $validated['config'] ?? [],
            'status' => 'draft',
            'version' => 1,
        ]);

        return response()->json($checkout, 201);
    }

    public function show(Request $request, Checkout $checkout)
    {
        if ($checkout->user_id !== $request->user()->id) {
            abort(403);
        }
        return response()->json($checkout);
    }

    public function update(Request $request, Checkout $checkout)
    {
        if ($checkout->user_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'config' => 'sometimes|array',
            'status' => 'sometimes|in:draft,published,archived',
        ]);

        $checkout->update($validated);

        return response()->json($checkout);
    }

    public function destroy(Request $request, Checkout $checkout)
    {
        if ($checkout->user_id !== $request->user()->id) {
            abort(403);
        }

        $checkout->delete();

        return response()->json(null, 204);
    }

    public function publish(Request $request, Checkout $checkout)
    {
        if ($checkout->user_id !== $request->user()->id) {
            abort(403);
        }

        $checkout->update([
            'status' => 'published',
            'system_id' => $checkout->system_id ?? Str::uuid()->toString(),
        ]);

        return response()->json($checkout);
    }
}
