<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\CheckoutConfig;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class LabController extends Controller
{
    /**
     * Lab index — lista os checkouts do usuário.
     */
    public function index()
    {
        $configs = CheckoutConfig::where('company_id', Auth::user()->company_id)
            ->orderByDesc('is_active')
            ->orderByDesc('updated_at')
            ->get();

        return view('dashboard.lab', compact('configs'));
    }

    /**
     * Cria um novo checkout em branco e redireciona para o builder.
     */
    public function createAndEdit()
    {
        $config = new CheckoutConfig;
        $config->name = 'Novo Checkout ' . date('d/m H:i');
        $config->slug = 'checkout-' . Str::random(8);
        $config->company_id = Auth::user()->company_id;
        $config->config = CheckoutConfig::defaultConfig();
        $config->canvas_elements = [];
        $config->save();

        return redirect()->route('dashboard.lab.builder', $config->id);
    }

    /**
     * Cria um checkout a partir de um template.
     */
    public function createFromTemplate(Request $request)
    {
        $request->validate([
            'template_name' => 'required|string',
            'config' => 'required|array',
            'canvas_elements' => 'required|array',
        ]);

        $config = new CheckoutConfig;
        $config->name = $request->input('template_name') . ' — ' . date('d/m H:i');
        $config->slug = 'checkout-' . Str::random(8);
        $config->company_id = Auth::user()->company_id;
        $config->config = $request->input('config');
        $config->canvas_elements = $request->input('canvas_elements');
        $config->is_active = false;
        $config->save();

        return redirect()->route('dashboard.lab.builder', $config->id);
    }

    /**
     * Duplica um checkout existente.
     */
    public function duplicate($id)
    {
        $original = CheckoutConfig::where('company_id', Auth::user()->company_id)
            ->findOrFail($id);

        $copy = $original->replicate();
        $copy->name = $original->name . ' (cópia)';
        $copy->slug = 'checkout-' . Str::random(8);
        $copy->is_active = false;
        $copy->save();

        return redirect()->route('dashboard.lab')->with('success', 'Checkout duplicado com sucesso!');
    }

    /**
     * Exclui um checkout.
     */
    public function destroy($id)
    {
        $config = CheckoutConfig::where('company_id', Auth::user()->company_id)
            ->findOrFail($id);

        $config->delete();

        return redirect()->route('dashboard.lab')->with('success', 'Checkout removido com sucesso!');
    }

    /**
     * Builder visual (Canvas Engine).
     */
    public function builder($id)
    {
        $config = CheckoutConfig::where('company_id', Auth::user()->company_id)
            ->findOrFail($id);

        return view('dashboard.lab-builder', compact('config'));
    }

    /**
     * API — retorna dados do checkout para o builder (JSON).
     */
    public function apiShow($id)
    {
        $config = CheckoutConfig::where('company_id', Auth::user()->company_id)
            ->findOrFail($id);

        return response()->json([
            'id'              => $config->id,
            'name'            => $config->name,
            'slug'            => $config->slug,
            'canvas_elements' => $config->canvas_elements ?? [],
            'config'          => $config->config,
        ]);
    }

    /**
     * API — salva canvas_elements do builder (JSON).
     */
    public function apiUpdate(Request $request, $id)
    {
        $config = CheckoutConfig::where('company_id', Auth::user()->company_id)
            ->findOrFail($id);

        $config->canvas_elements = $request->input('canvas_elements', []);
        $config->save();

        return response()->json(['success' => true]);
    }

    /**
     * API — publica ou despublica o checkout.
     */
    public function apiPublish($id)
    {
        $config = CheckoutConfig::where('company_id', Auth::user()->company_id)
            ->findOrFail($id);

        $config->is_active = !$config->is_active;
        $config->save();

        return response()->json([
            'is_active' => $config->is_active,
            'message'   => $config->is_active ? 'Checkout publicado!' : 'Checkout despublicado',
        ]);
    }
}
