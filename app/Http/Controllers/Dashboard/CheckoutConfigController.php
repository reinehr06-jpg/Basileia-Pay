<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\CheckoutConfig;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CheckoutConfigController extends Controller
{
    public function index()
    {
        $configs = CheckoutConfig::where('company_id', auth()->user()->company_id)
            ->orderBy('is_active', 'desc')
            ->orderBy('updated_at', 'desc')
            ->get();

        return view('dashboard.checkout-configs.index', compact('configs'));
    }

    public function create()
    {
        $config = new CheckoutConfig();
        $config->config = CheckoutConfig::defaultConfig();

        return view('dashboard.checkout-configs.edit', [
            'config' => $config,
            'is_new' => true,
        ]);
    }

    public function edit(int $id)
    {
        $config = CheckoutConfig::where('company_id', auth()->user()->company_id)
            ->findOrFail($id);

        return view('dashboard.checkout-configs.edit', [
            'config' => $config,
            'is_new' => false,
        ]);
    }

    public function save(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:100',
        ]);

        $companyId = auth()->user()->company_id;

        $configData = $request->input('config', []);
        $slug = $request->input('slug') 
            ?? Str::slug($request->input('name'))
            . '-' . Str::random(4);

        $config = CheckoutConfig::updateOrCreate(
            [
                'id' => $request->input('id'),
                'company_id' => $companyId,
            ],
            [
                'name' => $request->input('name'),
                'slug' => $slug,
                'company_id' => $companyId,
                'config' => $configData,
                'description' => $request->input('description'),
            ]
        );

        return redirect()->route('dashboard.checkout-configs.index')
            ->with('success', 'Configuração salva!');
    }

    public function publish(Request $request, int $id)
    {
        $config = CheckoutConfig::where('company_id', auth()->user()->company_id)
            ->findOrFail($id);

        $config->publish();

        return back()->with('success', 'Publicado em produção!');
    }

    public function delete(int $id)
    {
        $config = CheckoutConfig::where('company_id', auth()->user()->company_id)
            ->findOrFail($id);

        $config->delete();

        return redirect()->route('dashboard.checkout-configs.index')
            ->with('success', 'Configuração excluída!');
    }

    public function duplicate(int $id)
    {
        $original = CheckoutConfig::where('company_id', auth()->user()->company_id)
            ->findOrFail($id);

        $clone = $original->replicate();
        $clone->name = $original->name . ' (cópia)';
        $clone->slug = Str::slug($clone->name) . '-' . Str::random(4);
        $clone->is_active = false;
        $clone->save();

        return redirect()->route('dashboard.checkout-configs.edit', $clone->id)
            ->with('success', 'Cópia criada! Edite e salve.');
    }

    public function preview(int $id)
    {
        $config = CheckoutConfig::findOrFail($id);

        return view('checkout.preview', [
            'config' => $config,
            'preview' => true,
        ]);
    }
}
