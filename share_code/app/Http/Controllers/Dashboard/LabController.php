<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\CheckoutConfig;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class LabController extends Controller
{
    /**
     * @deprecated Use CheckoutConfigController@index
     */
    public function index()
    {
        return response()->json(
            CheckoutConfig::where('company_id', Auth::user()->company_id)
                ->orderByDesc('is_active')
                ->orderByDesc('updated_at')
                ->get()
        );
    }

    /**
     * @deprecated Use CheckoutConfigController@store
     */
    public function createAndEdit()
    {
        $config = new CheckoutConfig;
        $config->name = 'Novo Checkout '.date('d/m H:i');
        $config->slug = 'checkout-'.Str::random(8);
        $config->company_id = Auth::user()->company_id;
        $config->config = CheckoutConfig::defaultConfig();
        $config->save();

        return response()->json([
            'id' => $config->id,
            'redirect' => '/lab/' . $config->id
        ]);
    }
}
