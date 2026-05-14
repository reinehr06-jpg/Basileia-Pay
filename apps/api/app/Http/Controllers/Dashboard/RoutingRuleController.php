<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\RoutingRule;
use Illuminate\Http\Request;

class RoutingRuleController extends Controller
{
    public function index(Request $request)
    {
        $companyId = $request->user()->company_id;

        $rules = RoutingRule::where('company_id', $companyId)
            ->orderBy('priority')
            ->get();

        return response()->json($rules);
    }

    public function store(Request $request)
    {
        $companyId = $request->user()->company_id;

        $data = $request->validate([
            'name'                 => 'required|string|max:100',
            'priority'             => 'required|integer|min:1',
            'active'               => 'nullable|boolean',
            'countries'            => 'nullable|array',
            'methods'              => 'nullable|array',
            'amount_min'           => 'nullable|numeric',
            'amount_max'           => 'nullable|numeric',
            'integration_ids'      => 'nullable|array',
            'bin_prefixes'         => 'nullable|array',
            'gateway_id'           => 'required|exists:gateways,id',
            'fallback_gateway_ids' => 'nullable|array',
        ]);

        $conditions = [
            'countries'       => $data['countries'] ?? [],
            'methods'         => $data['methods'] ?? [],
            'amount_min'      => $data['amount_min'] ?? null,
            'amount_max'      => $data['amount_max'] ?? null,
            'integration_ids' => $data['integration_ids'] ?? [],
            'bin_prefixes'    => $data['bin_prefixes'] ?? [],
        ];

        $action = [
            'gateway_id'           => $data['gateway_id'],
            'fallback_gateway_ids' => $data['fallback_gateway_ids'] ?? [],
        ];

        $rule = RoutingRule::create([
            'company_id' => $companyId,
            'name'       => $data['name'],
            'priority'   => $data['priority'],
            'active'     => $request->boolean('active', true),
            'conditions' => $conditions,
            'action'     => $action,
        ]);

        return response()->json($rule, 201);
    }

    public function update(Request $request, int $id)
    {
        $companyId = $request->user()->company_id;
        $rule = RoutingRule::where('company_id', $companyId)->findOrFail($id);

        $data = $request->validate([
            'name'                 => 'nullable|string|max:100',
            'priority'             => 'nullable|integer|min:1',
            'active'               => 'nullable|boolean',
            'countries'            => 'nullable|array',
            'methods'              => 'nullable|array',
            'amount_min'           => 'nullable|numeric',
            'amount_max'           => 'nullable|numeric',
            'integration_ids'      => 'nullable|array',
            'bin_prefixes'         => 'nullable|array',
            'gateway_id'           => 'nullable|exists:gateways,id',
            'fallback_gateway_ids' => 'nullable|array',
        ]);

        if (isset($data['name'])) $rule->name = $data['name'];
        if (isset($data['priority'])) $rule->priority = $data['priority'];
        if (isset($data['active'])) $rule->active = $data['active'];

        $conditions = $rule->conditions;
        if (array_key_exists('countries', $data)) $conditions['countries'] = $data['countries'];
        if (array_key_exists('methods', $data)) $conditions['methods'] = $data['methods'];
        if (array_key_exists('amount_min', $data)) $conditions['amount_min'] = $data['amount_min'];
        if (array_key_exists('amount_max', $data)) $conditions['amount_max'] = $data['amount_max'];
        if (array_key_exists('integration_ids', $data)) $conditions['integration_ids'] = $data['integration_ids'];
        if (array_key_exists('bin_prefixes', $data)) $conditions['bin_prefixes'] = $data['bin_prefixes'];
        $rule->conditions = $conditions;

        $action = $rule->action;
        if (array_key_exists('gateway_id', $data)) $action['gateway_id'] = $data['gateway_id'];
        if (array_key_exists('fallback_gateway_ids', $data)) $action['fallback_gateway_ids'] = $data['fallback_gateway_ids'];
        $rule->action = $action;

        $rule->save();

        return response()->json($rule);
    }

    public function destroy(Request $request, int $id)
    {
        $companyId = $request->user()->company_id;
        $rule = RoutingRule::where('company_id', $companyId)->findOrFail($id);
        $rule->delete();

        return response()->json(null, 204);
    }
}
