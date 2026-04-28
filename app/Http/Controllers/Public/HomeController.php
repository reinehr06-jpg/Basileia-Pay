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
        try {
            // Se vier asaas_payment_id, redireciona para o checkout seguro da Basileia
            if ($request->has('asaas_payment_id')) {
                $asaasPaymentId = $request->get('asaas_payment_id');
                $transaction = Transaction::where('asaas_payment_id', $asaasPaymentId)->first();

                if (!$transaction) {
                    // Criar transação silenciosamente para tokenizar o link
                    $transaction = Transaction::create([
                        'uuid' => (string) \Illuminate\Support\Str::uuid(),
                        'company_id' => 1,
                        'asaas_payment_id' => $asaasPaymentId,
                        'source' => 'basileia_vendas',
                        'amount' => $request->get('valor', 0),
                        'description' => $request->get('plano', 'Pagamento Basiléia'),
                        'payment_method' => 'credit_card',
                        'status' => 'pending',
                        'customer_name' => $request->get('cliente', ''),
                        'customer_email' => $request->get('email', ''),
                        'customer_document' => $request->get('documento', ''),
                        'customer_phone' => $request->get('whatsapp', ''),
                    ]);
                }

                return redirect()->route('checkout.show', $transaction->uuid);
            }

            $uuid = $request->get('uuid');
            
            if ($uuid) {
                $transaction = Transaction::where('uuid', $uuid)->first();
                $subscription = Subscription::where('uuid', $uuid)->first();
                
                if ($transaction) {
                    return redirect()->route('checkout.show', $uuid);
                }
                
                if ($subscription) {
                    return redirect()->route('checkout.show', $uuid);
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
