<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Company;
use Illuminate\Support\Facades\Auth;

class ReceiptController extends Controller
{
    /**
     * Show the receipt template settings page.
     */
    public function index()
    {
        $company = Auth::user()->company;
        $settings = $company->settings ?? [];
        $receipt = $settings['receipt'] ?? [
            'header_text' => 'Comprovante de Pagamento',
            'footer_text' => 'Obrigado por sua compra!',
            'show_logo' => true,
            'show_customer_data' => true,
        ];

        return view('dashboard.settings.receipt', compact('receipt'));
    }

    /**
     * Update the receipt template settings.
     */
    public function update(Request $request)
    {
        $request->validate([
            'header_text' => 'required|string|max:255',
            'footer_text' => 'required|string|max:500',
        ]);

        $company = Auth::user()->company;
        $settings = $company->settings ?? [];
        
        $settings['receipt'] = [
            'header_text' => $request->input('header_text'),
            'footer_text' => $request->input('footer_text'),
            'show_logo' => $request->has('show_logo'),
            'show_customer_data' => $request->has('show_customer_data'),
            'custom_css' => $request->input('custom_css'),
        ];

        $company->update(['settings' => $settings]);

        return redirect()->route('dashboard.settings.receipt')
            ->with('success', 'Modelo de comprovante atualizado com sucesso.');
    }
}
