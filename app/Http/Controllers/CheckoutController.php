<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Services\Gateway\AsaasGateway;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CheckoutController extends Controller
{
    private AsaasGateway $asaas;

    public function __construct(AsaasGateway $asaas)
    {
        $this->asaas = $asaas;
    }

    /**
     * Show the payment page for a transaction.
     * GET /pay/{uuid}
     */
    public function show(string $uuid)
    {
        $transaction = Transaction::where('uuid', $uuid)->firstOrFail();

        // If transaction is already approved, show success/receipt directly
        if ($transaction->status === 'approved') {
            return view('checkout.success', compact('transaction'));
        }

        // Fetch latest data from Asaas (especially for PIX QR)
        try {
            $asaasData = $this->asaas->getPayment($transaction->asaas_payment_id);
            
            // If it's a PIX payment, we might need the QR Code
            $pixData = [];
            if ($asaasData['billingType'] === 'PIX') {
                $pixData = $this->asaas->request('get', "/payments/{$transaction->asaas_payment_id}/pixQrCode");
            }

            return view('checkout.pay', compact('transaction', 'asaasData', 'pixData'));

        } catch (\Exception $e) {
            Log::error("Error loading checkout: " . $e->getMessage());
            return view('checkout.error', ['message' => 'Erro ao carregar dados do pagamento.']);
        }
    }

    /**
     * Process a credit card payment.
     * POST /pay/{uuid}/process
     */
    public function process(Request $request, string $uuid)
    {
        $transaction = Transaction::where('uuid', $uuid)->firstOrFail();

        $request->validate([
            'holder_name' => 'required|string',
            'card_number' => 'required|string',
            'expiry_month' => 'required|string|size:2',
            'expiry_year' => 'required|string|size:4',
            'cvv' => 'required|string|min:3|max:4',
        ]);

        try {
            // Logic to pay with credit card via Asaas
            // This will use the EXISTING asaas_payment_id created by Vendas
            $response = $this->asaas->request('post', "/payments/{$transaction->asaas_payment_id}/payWithCreditCard", [
                'creditCard' => [
                    'holderName' => $request->input('holder_name'),
                    'number' => preg_replace('/\D/', '', $request->input('card_number')),
                    'expiryMonth' => $request->input('expiry_month'),
                    'expiryYear' => $request->input('expiry_year'),
                    'ccv' => $request->input('cvv'),
                ],
                'creditCardHolderInfo' => [
                    'name' => $request->input('holder_name'),
                    'email' => $transaction->customer_email,
                    'cpfCnpj' => preg_replace('/\D/', '', $transaction->customer_document ?? ''),
                    'postalCode' => preg_replace('/\D/', '', $transaction->customer_zip_code ?? '00000000'),
                    'addressNumber' => '1', // Default or from metadata
                    'phone' => preg_replace('/\D/', '', $transaction->customer_phone ?? ''),
                ],
                'remoteIp' => $request->ip(),
            ]);

            if ($response['status'] === 'CONFIRMED' || $response['status'] === 'RECEIVED') {
                $transaction->update([
                    'status' => 'approved',
                    'paid_at' => now(),
                    'gateway_response' => $response,
                ]);

                // Tokenization: Save card for auto-renewal
                if (!empty($response['creditCardToken'])) {
                    \App\Models\PaymentToken::updateOrCreate(
                        ['token' => $response['creditCardToken']],
                        [
                            'company_id' => $transaction->company_id,
                            'customer_id' => $transaction->customer_id,
                            'gateway' => 'asaas',
                            'brand' => $response['payment'] ?? 'CARTÃO', // Simplified
                            'last4' => substr($request->input('card_number'), -4),
                            'expiry_month' => $request->input('expiry_month'),
                            'expiry_year' => $request->input('expiry_year'),
                        ]
                    );
                }

                // Notify Vendas (Back-sync)
                if ($transaction->callback_url) {
                    try {
                        \Illuminate\Support\Facades\Http::post($transaction->callback_url, [
                            'event' => 'payment.approved',
                            'asaas_id' => $transaction->asaas_payment_id,
                            'transaction_uuid' => $transaction->uuid,
                            'status' => 'approved',
                            'amount' => $transaction->amount,
                        ]);
                    } catch (\Exception $e) {
                        Log::error("Failed to notify Vendas: " . $e->getMessage());
                    }
                }
                
                return response()->json(['status' => 'success', 'redirect' => route('checkout.success', $uuid)]);
            }

            return response()->json(['status' => 'error', 'message' => 'Pagamento recusado ou em análise.'], 400);

        } catch (\Exception $e) {
            Log::error("Payment processing error: " . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    /**
     * Show success page.
     */
    /**
     * Show the receipt for a transaction.
     * GET /pay/{uuid}/receipt
     */
    public function receipt(string $uuid)
    {
        $transaction = Transaction::where('uuid', $uuid)->firstOrFail();
        
        if ($transaction->status !== 'approved') {
            abort(403, 'Comprovante não disponível.');
        }

        $company = $transaction->company;
        $settings = $company->settings ?? [];
        $receipt = $settings['receipt'] ?? [
            'header_text' => 'Comprovante de Pagamento',
            'footer_text' => 'Obrigado por sua compra!',
            'show_logo' => true,
            'show_customer_data' => true,
        ];

        return view('checkout.receipt_template', compact('transaction', 'company', 'receipt'));
    }
}
