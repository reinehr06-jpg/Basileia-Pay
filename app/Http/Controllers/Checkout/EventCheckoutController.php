<?php

namespace App\Http\Controllers\Checkout;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Services\CustomerService;
use App\Services\PaymentService;
use Illuminate\Http\Request;

class EventCheckoutController extends Controller
{
    public function show(string $slug)
    {
        $event = Event::where('slug', $slug)->firstOrFail();

        if (!$event->isDisponivel()) {
            return view('checkout.evento.esgotado', ['event' => $event]);
        }

        return view('checkout.evento.index', ['event' => $event]);
    }

    public function process(Request $request, string $slug, CustomerService $customerService, PaymentService $paymentService)
    {
        $event = Event::where('slug', $slug)->firstOrFail();

        if (!$event->isDisponivel()) {
            return back()->withErrors(['error' => 'Este evento não está mais disponível.'])->withInput();
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email',
            'document' => 'required|string|max:20',
            'phone' => 'nullable|string|max:20',
            'billing_type' => 'required|in:PIX,BOLETO,CREDIT_CARD',
        ]);

        $company = $event->company;
        $gateway = \App\Models\Gateway::where('company_id', $company->id)
            ->where('type', config('services.default_gateway', 'asaas'))
            ->firstOrFail();

        $customer = $customerService->findOrCreate([
            'company_id' => $company->id,
            'name' => $request->name,
            'email' => $request->email,
            'document' => preg_replace('/\D/', '', $request->document),
            'phone' => $request->phone,
        ]);

        $transaction = \App\Models\Transaction::create([
            'company_id' => $company->id,
            'gateway_id' => $gateway->id,
            'customer_id' => $customer->id,
            'description' => "Evento: {$event->titulo}",
            'amount' => $event->valor,
            'net_amount' => $event->valor,
            'currency' => 'BRL',
            'payment_method' => strtolower($request->billing_type),
            'status' => 'pending',
            'customer_name' => $request->name,
            'customer_email' => $request->email,
            'customer_document' => preg_replace('/\D/', '', $request->document),
        ]);

        $payment = $paymentService->processPayment($transaction, [
            'payment_method' => strtolower($request->billing_type),
            'billing_type' => $request->billing_type,
        ]);

        $event->incrementarVaga();

        if ($request->billing_type === 'PIX' && isset($payment['pixQrCode'])) {
            return view('checkout.evento.pagamento', [
                'event' => $event,
                'payment' => $payment,
                'transaction' => $transaction,
                'billing_type' => $request->billing_type,
            ]);
        }

        if ($request->billing_type === 'BOLETO' && isset($payment['bankSlipUrl'])) {
            return view('checkout.evento.pagamento', [
                'event' => $event,
                'payment' => $payment,
                'transaction' => $transaction,
                'billing_type' => $request->billing_type,
            ]);
        }

        if (isset($payment['invoiceUrl'])) {
            return redirect($payment['invoiceUrl']);
        }

        return redirect("/pay/{$transaction->uuid}/success");
    }

    public function success(string $slug)
    {
        $event = Event::where('slug', $slug)->firstOrFail();
        return view('checkout.card.front.sucesso', ['event' => $event]);
    }
}
