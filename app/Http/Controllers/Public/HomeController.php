<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\Subscription;
use Illuminate\Http\Request;

class HomeController extends Controller
{
    public function index(Request $request)
    {
        return "SINAL DE VIDA: OK. Se voce esta vendo isso, o PHP esta funcionando!";
        
        try {
            // Se vier asaas_payment_id, redireciona para o checkout da Basileia
            if ($request->has('asaas_payment_id')) {
                return redirect()->route('basileia.checkout.show', array_merge(
                    ['asaasPaymentId' => $request->get('asaas_payment_id')],
                    $request->except('asaas_payment_id')
                ));
            }

            $uuid = $request->get('uuid');
            
            if ($uuid) {
                $transaction = Transaction::where('uuid', $uuid)->first();
                $subscription = Subscription::where('uuid', $uuid)->first();
                
                if ($transaction) {
                    return redirect()->route('checkout.pay', $uuid);
                }
                
                if ($subscription) {
                    return redirect()->route('checkout.pay', $uuid);
                }
                
                return view('home', [
                    'error' => 'Checkout não encontrado. Verifique o código e tente novamente.',
                    'uuid' => $uuid
                ]);
            }
            
            return view('home');
        } catch (\Exception $e) {
            return "Erro no Home: " . $e->getMessage() . " em " . $e->getFile() . ":" . $e->getLine();
        }
    }
}
